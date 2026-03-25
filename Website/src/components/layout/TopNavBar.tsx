"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNavBar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/probability/basic", label: "Probability" },
    { href: "/ml/regression", label: "Machine Learning" },
    { href: "/ml/neural-networks", label: "Playground" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full bg-[#fdf8ff] flex justify-between items-center px-8 py-4 border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="font-headline text-2xl italic font-bold text-[#3C3946]"
        >
          The Academic Interactive
        </Link>
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href.split("/")[1] ? `/${link.href.split("/")[1]}` : link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-sm tracking-wide transition-colors ${
                  isActive
                    ? "text-primary font-bold border-b-2 border-secondary pb-0.5"
                    : "text-[#3C3946]/70 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm">
            search
          </span>
          <input
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-secondary w-64"
            placeholder="Search concepts..."
            type="text"
          />
        </div>
        <button className="text-primary hover:text-primary/70 transition-colors">
          <span className="material-symbols-outlined text-2xl">account_circle</span>
        </button>
        <button className="text-primary hover:text-primary/70 transition-colors">
          <span className="material-symbols-outlined text-2xl">settings</span>
        </button>
      </div>
    </header>
  );
}
