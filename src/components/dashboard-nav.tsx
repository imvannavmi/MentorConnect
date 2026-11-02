"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, Compass, LayoutDashboard, Search, UserRound } from "lucide-react";

const menu = {
  mentee: [
    { label: "Dasbor", href: "/dashboard/mentee", icon: LayoutDashboard },
    { label: "Cari mentor", href: "/mentors", icon: Search },
    { label: "Profil saya", href: "/dashboard/mentee/profile", icon: UserRound },
  ],
  mentor: [
    { label: "Dasbor", href: "/dashboard/mentor", icon: LayoutDashboard },
    { label: "Jadwal tersedia", href: "/dashboard/mentor/availability", icon: CalendarClock },
    { label: "Profil saya", href: "/dashboard/mentor/profile", icon: UserRound },
  ],
  admin: [{ label: "Dasbor admin", href: "/dashboard/admin", icon: LayoutDashboard }],
};

export function DashboardNav() {
  const pathname = usePathname();
  const role = pathname.includes("/mentor") ? "mentor" : pathname.includes("/admin") ? "admin" : "mentee";
  const items = menu[role];
  const title = role === "mentor" ? "Ruang Mentor" : role === "admin" ? "Administrasi" : "Ruang Peserta";
  return <aside className="dashboard-sidebar">
    <div className="hidden px-5 py-6 md:block">
      <div className="mb-5 flex items-center gap-3 border-b border-[var(--line)] pb-5">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">MC</span>
        <div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-[11px] text-[var(--muted)]">MentorConnect</p></div>
      </div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#98a2b3]">Menu utama</p>
    </div>
    <nav aria-label="Navigasi dashboard" className="flex gap-1 overflow-x-auto px-4 py-3 md:block md:px-3 md:py-0">
      {items.map(({ label, href, icon: Icon }) => {
        const active = href === "/mentors" ? pathname === href : href === "/dashboard/mentor" || href === "/dashboard/mentee" ? pathname === href : pathname === href;
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-[#f7f9fc] hover:text-[var(--ink)]"}`}>
          <Icon size={16} strokeWidth={1.9} /><span>{label}</span>
        </Link>;
      })}
    </nav>
    <div className="hidden px-5 pt-8 md:block"><div className="rounded-xl bg-[#f6f8fc] p-4"><span className="grid size-8 place-items-center rounded-lg bg-white text-[var(--brand)]"><Compass size={16} /></span><p className="mt-3 text-xs font-bold">Tumbuh selangkah demi selangkah</p><p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">Sesi yang bermakna dimulai dengan tujuan yang jelas.</p></div></div>
  </aside>;
}
