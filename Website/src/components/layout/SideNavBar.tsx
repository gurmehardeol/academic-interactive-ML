"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/probability/basic",
    icon: "calculate",
    label: "Basic Probability",
  },
  {
    href: "/probability/expectation",
    icon: "trending_up",
    label: "Expectation",
  },
  {
    href: "/probability/distributions",
    icon: "bar_chart",
    label: "Distributions",
  },
  {
    href: "/ml/regression",
    icon: "timeline",
    label: "Regression",
  },
  {
    href: "/ml/classification",
    icon: "polyline",
    label: "Classification",
  },
  {
    href: "/ml/decision-trees",
    icon: "account_tree",
    label: "Decision Trees",
  },
  {
    href: "/ml/neural-networks",
    icon: "psychology",
    label: "Neural Networks",
  },
];

export default function SideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-[#e6e9ed] pt-20 flex flex-col z-40 hidden lg:flex">
      <div className="px-8 mb-8 mt-4">
        <h2 className="font-headline text-lg text-[#1a1d23]">Curriculum</h2>
        <p className="font-sans uppercase text-[10px] tracking-[0.05em] font-bold text-[#1a1d23]/50">
          The Digital Atheneum
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-8 py-3 transition-all ${
                isActive
                  ? "bg-primary/[0.08] text-primary border-l-4 border-primary"
                  : "text-[#1a1d23]/50 hover:bg-[#f5f7f9] border-l-4 border-transparent"
              }`}
            >
              <span className="material-symbols-outlined text-[1.1rem]">
                {item.icon}
              </span>
              <span className="font-sans uppercase text-[10px] tracking-[0.05em] font-bold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 mt-auto border-t border-outline-variant/20">
        <Link
          href="/ml/neural-networks"
          className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-3 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          Open Sandbox
        </Link>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href="#"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            Glossary
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              library_books
            </span>
            References
          </a>
        </div>
      </div>
    </aside>
  );
}
