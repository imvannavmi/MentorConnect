"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";

export function DashboardBrand() {
  const pathname = usePathname();
  const role = pathname.includes("/dashboard/mentor") ? "mentor" : pathname.includes("/dashboard/admin") ? "admin" : "mentee";
  return <Link href={`/dashboard/${role}`} className="flex items-center gap-2.5" aria-label="Kembali ke dasbor">
    <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] text-white"><Compass size={19} /></span>
    <span className="text-[16px] font-bold tracking-[-.04em]">mentor<span className="text-[var(--brand)]">connect</span></span>
  </Link>;
}
