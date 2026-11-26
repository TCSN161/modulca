import { describe, it, expect, vi } from "vitest";
import { listProjectsSettled, type ProjectRecord } from "./projectService";

const rec = (id: string) => ({ id, name: id }) as unknown as ProjectRecord;

describe("listProjectsSettled (BUG-ST11)", () => {
  it("returns the first non-empty list without retrying", async () => {
    const list = vi.fn().mockResolvedValue([rec("a")]);
    expect(await listProjectsSettled("u", { list, retryDelayMs: 0 })).toHaveLength(1);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it("retries once when the first answer is empty (session still settling)", async () => {
    const list = vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([rec("a"), rec("b")]);
    expect(await listProjectsSettled("u", { list, retryDelayMs: 0 })).toHaveLength(2);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it("a truly empty account still ends with []", async () => {
    const list = vi.fn().mockResolvedValue([]);
    expect(await listProjectsSettled("u", { list, retryDelayMs: 0 })).toEqual([]);
    expect(list).toHaveBeenCalledTimes(2);
  });
});
