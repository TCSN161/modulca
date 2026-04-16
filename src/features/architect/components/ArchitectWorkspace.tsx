"use client";

import { useArchitectStore } from "../store";
import PhaseTracker from "./PhaseTracker";
import ClientBrief from "./ClientBrief";
import FeeTracker from "./FeeTracker";
import ChangeOrders from "./ChangeOrders";
import DfmaChecklist from "./DfmaChecklist";
import TimelineView from "./TimelineView";
import ProjectNotes from "./ProjectNotes";
import OverviewDashboard from "./OverviewDashboard";

type TabId = "overview" | "phases" | "client" | "fees" | "changes" | "dfma" | "timeline" | "notes";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "phases", label: "Phases", icon: "🔄" },
  { id: "client", label: "Client", icon: "👤" },
  { id: "fees", label: "Fees & Time", icon: "💰" },
  { id: "changes", label: "Changes", icon: "📝" },
  { id: "dfma", label: "DfMA", icon: "🏭" },
  { id: "timeline", label: "Timeline", icon: "📅" },
  { id: "notes", label: "Notes", icon: "📌" },
];

export default function ArchitectWorkspace() {
  const activeTab = useArchitectStore((s) => s.activeTab);
  const setActiveTab = useArchitectStore((s) => s.setActiveTab);
  const project = useArchitectStore((s) => s.project);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Tab navigation */}
      <nav className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-gray-200 pb-px scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-brand-teal-600 bg-white text-brand-teal-700"
                : "text-gray-500 hover:text-brand-teal-600 hover:bg-gray-50"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="min-h-[500px]">
        {activeTab === "overview" && <OverviewDashboard />}
        {activeTab === "phases" && <PhaseTracker />}
        {activeTab === "client" && <ClientBrief />}
        {activeTab === "fees" && <FeeTracker />}
        {activeTab === "changes" && <ChangeOrders />}
        {activeTab === "dfma" && <DfmaChecklist />}
        {activeTab === "timeline" && <TimelineView />}
        {activeTab === "notes" && <ProjectNotes />}
      </div>
    </div>
  );
}
