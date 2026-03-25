import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";
import RegressionControls from "@/components/regression/RegressionControls";

export default function LinearRegressionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <SideNavBar />

      <main className="lg:ml-72 pt-20 flex flex-col min-h-screen">
        <div className="p-10 lg:p-12 flex-1 flex flex-col gap-8">
          <RegressionControls />
        </div>

        <footer className="w-full py-10 px-12 flex justify-between items-center bg-[#fdf8ff] border-t border-[#bfc7d1]/15">
          <div className="font-body text-[10px] uppercase tracking-[0.1em] text-[#3C3946]/60">
            © 2024 The Digital Atheneum. Designed for Intellectual Discovery.
          </div>
          <nav className="flex gap-8">
            {["Privacy Policy", "Institutional Access", "Cite This Work"].map(
              (l) => (
                <a
                  key={l}
                  href="#"
                  className="font-body text-[10px] uppercase tracking-[0.1em] text-[#3C3946]/60 hover:text-primary transition-colors"
                >
                  {l}
                </a>
              )
            )}
          </nav>
        </footer>
      </main>

      {/* FAB */}
      <button className="fixed bottom-12 right-12 w-16 h-16 bg-gradient-to-br from-secondary to-on-secondary-container rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50">
        <span className="material-symbols-outlined text-2xl">play_arrow</span>
      </button>
    </div>
  );
}
