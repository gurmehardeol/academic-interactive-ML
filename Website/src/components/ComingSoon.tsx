import Link from "next/link";
import TopNavBar from "@/components/layout/TopNavBar";
import SideNavBar from "@/components/layout/SideNavBar";

export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen">
      <TopNavBar />
      <SideNavBar />
      <main className="lg:ml-72 pt-24 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-primary/30 mb-6 block">
            construction
          </span>
          <h1 className="font-headline text-4xl text-on-surface mb-4">{title}</h1>
          <p className="text-on-surface-variant mb-8 font-body">
            This module is coming soon. Check back as the curriculum expands.
          </p>
          <Link
            href="/"
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Back to Curriculum
          </Link>
        </div>
      </main>
    </div>
  );
}
