import Link from "next/link";
import { Search } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardBrand } from "@/components/dashboard-brand";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <header className="border-b border-[var(--line)] bg-white">
      <div className="container flex h-[70px] items-center justify-between">
        <DashboardBrand />
        <div className="flex items-center gap-3">
          <Link href="/mentors" className="hidden items-center gap-2 text-xs font-semibold text-[var(--muted)] sm:inline-flex"><Search size={14} /> Jelajahi mentor</Link>
          <form action={signOut}><button className="button-secondary !min-h-9 !px-4 !text-xs">Keluar</button></form>
        </div>
      </div>
    </header>
    <div className="dashboard-shell">
      <DashboardNav />
      <div className="dashboard-main">{children}</div>
    </div>
  </>;
}
