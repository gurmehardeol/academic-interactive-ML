import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import DecisionTreeExplorer from "@/components/decision-trees/DecisionTreeExplorer";

export default function DecisionTreesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-72 pt-20 flex flex-col min-h-screen">
        <div className="flex-1 p-8 lg:p-12">
          <DecisionTreeExplorer />
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low flex justify-around py-4 z-50 shadow-2xl">
          {[
            { icon: "explore", label: "Theory", active: false },
            { icon: "account_tree", label: "Canvas", active: true },
            { icon: "school", label: "Resources", active: false },
          ].map(({ icon, label, active }) => (
            <button
              key={label}
              className={`flex flex-col items-center gap-1 ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{icon}</span>
              <span className="font-label text-[9px] font-bold">{label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
