import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { MentorSummary } from "@/lib/data/mentors";
import { indonesianTaxonomyLabel } from "@/lib/indonesian";

export function MentorCard({ mentor }: { mentor: MentorSummary }) {
  return <article className="group flex min-h-[290px] flex-col rounded-[22px] border border-[var(--line)] bg-white p-6 transition hover:-translate-y-1 hover:border-[#aec7bd] hover:shadow-[0_16px_40px_rgba(21,42,40,.07)]">
    <div className="flex items-start justify-between">
      <div className="grid size-12 place-items-center rounded-2xl bg-[#edf4ff] text-sm font-bold text-[var(--brand)]">{mentor.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>
      {mentor.rating !== null && <span className="inline-flex items-center gap-1 text-xs font-semibold"><Star size={13} fill="#d3a84d" stroke="#d3a84d" />{mentor.rating.toFixed(1)} <span className="font-normal text-[var(--muted)]">({mentor.reviewCount} ulasan)</span></span>}
    </div>
    <div className="mt-5"><h2 className="text-[17px] font-bold tracking-[-.02em]">{mentor.name}</h2><p className="mt-1 text-xs text-[var(--muted)]">{mentor.title || "Mentor"}</p></div>
    <p className="mt-4 line-clamp-3 text-[13px] leading-6 text-[var(--muted)]">{mentor.bio || "Siap berbagi pengalaman dan mendukung perkembanganmu."}</p>
    <div className="mt-4 flex flex-wrap gap-1.5">{[...mentor.skills, ...mentor.categories].slice(0, 3).map((label) => <span key={label} className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[10px] font-semibold text-[#345a94]">{indonesianTaxonomyLabel(label)}</span>)}</div>
    <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-4 mt-5">
      <p className="text-[11px] text-[var(--muted)]">{mentor.hourlyRate !== null ? `${mentor.currency} ${mentor.hourlyRate.toFixed(0)} / jam` : mentor.experienceYears ? `${mentor.experienceYears}+ tahun pengalaman` : "Bimbingan satu-satu"}</p>
      <Link href={`/mentors/${mentor.id}`} aria-label={`View ${mentor.name}'s profile`} className="grid size-9 place-items-center rounded-full bg-[var(--brand)] text-white transition group-hover:bg-[var(--brand-dark)]"><ArrowUpRight size={16} /></Link>
    </div>
  </article>;
}
