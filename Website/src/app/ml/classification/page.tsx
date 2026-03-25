import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import ClassificationCanvas from "@/components/classification/ClassificationCanvas";

export default function ClassificationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-72 pt-20 flex flex-1 flex-col">
        <div className="flex-1 p-10 lg:p-12">
          <ClassificationCanvas />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low flex justify-around items-center py-4 border-t border-outline-variant/10 z-50">
          {[
            { icon: "menu_book", label: "Theory" },
            { icon: "dataset", label: "Canvas", active: true },
            { icon: "settings_suggest", label: "Hyper" },
            { icon: "person", label: "Profile" },
          ].map(({ icon, label, active }) => (
            <button
              key={label}
              className={`flex flex-col items-center gap-1 ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{icon}</span>
              <span className="font-label text-[9px] uppercase tracking-tighter">
                {label}
              </span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
