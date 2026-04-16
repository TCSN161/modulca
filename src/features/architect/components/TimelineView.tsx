"use client";

import { useArchitectStore } from "../store";
import { PHASE_DEFINITIONS } from "../phases";

export default function TimelineView() {
  const project = useArchitectStore((s) => s.project);
  const updateMilestone = useArchitectStore((s) => s.updateMilestone);
  const toggleMilestoneComplete = useArchitectStore((s) => s.toggleMilestoneComplete);

  if (!project) return null;

  // Group milestones by phase
  const phases = PHASE_DEFINITIONS.map((def) => ({
    def,
    milestones: project.milestones.filter((m) => m.phaseId === def.id),
  }));

  const completedCount = project.milestones.filter((m) => m.completed).length;
  const totalCount = project.milestones.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-teal-800">Project Timeline</h2>
          <p className="text-xs text-gray-400">
            Track key milestones across all project phases
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-brand-teal-700">
            {completedCount}/{totalCount} milestones
          </div>
          <div className="text-[10px] text-gray-400">
            {totalCount - completedCount} remaining
          </div>
        </div>
      </div>

      {/* Visual timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {phases.map(({ def, milestones }) => {
            if (milestones.length === 0) return null;
            const phase = project.phases[def.id];
            const isActive = phase.status === "in-progress";

            return (
              <div key={def.id}>
                {/* Phase header */}
                <div className="flex items-center gap-3 mb-2 relative">
                  <div className={`z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${
                    phase.status === "completed" ? "bg-green-500" :
                    isActive ? "bg-blue-500" : "bg-gray-300"
                  }`}>
                    {def.number}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-700">{def.label}</span>
                    <span className="ml-2 text-[10px] text-gray-400">{def.ribaStage}</span>
                  </div>
                </div>

                {/* Milestones */}
                <div className="ml-9 pl-5 border-l-2 border-transparent space-y-2">
                  {milestones.map((ms) => (
                    <div
                      key={ms.id}
                      className={`relative flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        ms.completed
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-white hover:border-brand-teal-200"
                      }`}
                    >
                      {/* Dot on timeline */}
                      <div className={`absolute -left-[25px] h-3 w-3 rounded-full border-2 ${
                        ms.completed
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300 bg-white"
                      }`} />

                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={ms.completed}
                        onChange={() => toggleMilestoneComplete(ms.id)}
                        className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${ms.completed ? "text-green-700 line-through" : "text-gray-800"}`}>
                          {ms.label}
                        </div>
                        {ms.description && (
                          <div className="text-[10px] text-gray-500">{ms.description}</div>
                        )}
                      </div>

                      {/* Date input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={ms.date}
                          onChange={(e) => updateMilestone(ms.id, { date: e.target.value })}
                          className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 focus:outline-none focus:border-brand-teal-400"
                        />
                        {ms.completed && ms.actualDate && ms.date && ms.actualDate !== ms.date && (
                          <span className={`text-[9px] font-bold ${
                            new Date(ms.actualDate) > new Date(ms.date) ? "text-red-500" : "text-green-600"
                          }`}>
                            {new Date(ms.actualDate) > new Date(ms.date) ? "Late" : "Early"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
