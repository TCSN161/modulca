import { describe, it, expect } from "vitest";
import { appConfig } from "./index";

describe("appConfig", () => {
  it("should have correct app name", () => {
    expect(appConfig.name).toBe("ModulCA");
  });

  it("should default to production URL", () => {
    expect(appConfig.url).toBe("https://www.modulca.eu");
  });

  it("supabase config should be strings", () => {
    expect(typeof appConfig.supabase.url).toBe("string");
    expect(typeof appConfig.supabase.anonKey).toBe("string");
  });
});
