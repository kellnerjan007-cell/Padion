import Link from "next/link";
import { Trophy, Newspaper, User, CalendarDays } from "lucide-react";

const navItems = [
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/predictions", label: "Predict", icon: Trophy },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/profile", label: "Profil", icon: User },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar – Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-white/5 fixed h-full">
        <div className="px-6 py-6 border-b border-white/5">
          <span className="text-2xl font-bold text-accent">Padion</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-primary hover:bg-white/5 transition group"
            >
              <Icon className="w-5 h-5 group-hover:text-accent transition" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav – Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-white/5 flex z-50">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-muted hover:text-accent transition"
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
