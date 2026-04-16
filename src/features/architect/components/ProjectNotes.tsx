"use client";

import { useState } from "react";
import { useArchitectStore } from "../store";
import { PHASE_DEFINITIONS } from "../phases";
import type { PhaseId } from "../types";

export default function ProjectNotes() {
  const project = useArchitectStore((s) => s.project);
  const addNote = useArchitectStore((s) => s.addNote);
  const removeNote = useArchitectStore((s) => s.removeNote);
  const toggleNotePin = useArchitectStore((s) => s.toggleNotePin);

  const [content, setContent] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<PhaseId | "all">("all");
  const [notePhase, setNotePhase] = useState<PhaseId | "">("");

  if (!project) return null;

  const handleAdd = () => {
    if (!content.trim()) return;
    addNote(content.trim(), notePhase || undefined);
    setContent("");
  };

  const filtered = project.notes
    .filter((n) => phaseFilter === "all" || n.phaseId === phaseFilter)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-brand-teal-800">Project Notes</h2>

      {/* Add note */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleAdd()}
          placeholder="Add a note... (Ctrl+Enter to save)"
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-300 focus:border-brand-teal-400 focus:outline-none focus:ring-1 focus:ring-brand-teal-400"
        />
        <div className="flex items-center gap-2">
          <select
            value={notePhase}
            onChange={(e) => setNotePhase(e.target.value as PhaseId | "")}
            className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600 focus:outline-none"
          >
            <option value="">No phase</option>
            {PHASE_DEFINITIONS.map((d) => (
              <option key={d.id} value={d.id}>{d.number}. {d.label}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!content.trim()}
            className="rounded-lg bg-brand-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-teal-700 disabled:opacity-40"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] font-bold text-gray-500 uppercase mr-1">Filter:</span>
        <button
          onClick={() => setPhaseFilter("all")}
          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${phaseFilter === "all" ? "bg-brand-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          All ({project.notes.length})
        </button>
        {PHASE_DEFINITIONS.map((d) => {
          const count = project.notes.filter((n) => n.phaseId === d.id).length;
          if (count === 0) return null;
          return (
            <button
              key={d.id}
              onClick={() => setPhaseFilter(phaseFilter === d.id ? "all" : d.id)}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${phaseFilter === d.id ? "bg-brand-teal-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {d.number}. {d.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">No notes yet</p>
            <p className="mt-1 text-xs text-gray-300">Add meeting notes, decisions, reminders</p>
          </div>
        ) : (
          filtered.map((note) => {
            const phase = note.phaseId
              ? PHASE_DEFINITIONS.find((d) => d.id === note.phaseId)
              : null;
            return (
              <div
                key={note.id}
                className={`rounded-lg border bg-white px-4 py-3 group ${
                  note.pinned ? "border-amber-300 bg-amber-50/50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {phase && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500">
                          {phase.number}. {phase.label}
                        </span>
                      )}
                      {note.pinned && (
                        <span className="text-[9px] text-amber-600 font-bold">Pinned</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleNotePin(note.id)}
                      className={`rounded p-1 text-[10px] ${note.pinned ? "text-amber-500 hover:text-amber-600" : "text-gray-400 hover:text-amber-500"}`}
                      title={note.pinned ? "Unpin" : "Pin"}
                    >
                      {note.pinned ? "📌" : "📍"}
                    </button>
                    <button
                      onClick={() => removeNote(note.id)}
                      className="rounded p-1 text-[10px] text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
