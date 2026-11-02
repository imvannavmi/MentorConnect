import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { getMentors } from "@/lib/data/mentors";
import type { MentorSummary } from "@/lib/data/mentors";
import { MentorCard } from "@/components/mentors/mentor-card";
import { createClient } from "@/lib/supabase/server";
import { indonesianTaxonomyLabel } from "@/lib/indonesian";

export default async function MentorsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; maxRate?: string; currency?: string; available?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const category = params.category?.trim().toLocaleLowerCase() ?? "";
  const maxRate = params.maxRate ? Number(params.maxRate) : null;
  const currency = (params.currency ?? "USD").toUpperCase();
  let mentors: MentorSummary[] = [];
  let configured = true;
  try { mentors = await getMentors(); } catch { configured = false; }
  let homeHref = "/";
  let homeLabel = "Beranda";
  if (configured) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (profile?.role === "mentor" || profile?.role === "mentee") {
          homeHref = `/dashboard/${profile.role}`;
          homeLabel = "Dasbor saya";
        }
      }
    } catch {
      // Keep the public landing page as the fallback destination.
    }
  }
  const filtered = mentors.filter((mentor) => {
    const matchesQuery = !query || [mentor.name, mentor.title, mentor.bio, ...mentor.skills, ...mentor.categories, ...mentor.skills.map(indonesianTaxonomyLabel), ...mentor.categories.map(indonesianTaxonomyLabel)].join(" ").toLocaleLowerCase().includes(query);
    const matchesCategory = !category || [...mentor.categories, ...mentor.skills].some((item) => item.toLocaleLowerCase() === category || indonesianTaxonomyLabel(item).toLocaleLowerCase() === category);
    const matchesRate = maxRate === null || !Number.isFinite(maxRate) || (mentor.currency === currency && mentor.hourlyRate !== null && mentor.hourlyRate <= maxRate);
    const matchesAvailability = params.available !== "true" || mentor.hasAvailability;
    return matchesQuery && matchesCategory && matchesRate && matchesAvailability;
  });
  if (params.sort === "rating") filtered.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  else if (params.sort === "experience") filtered.sort((a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0));
  else if (params.sort === "price") filtered.sort((a, b) => (a.hourlyRate ?? Number.MAX_SAFE_INTEGER) - (b.hourlyRate ?? Number.MAX_SAFE_INTEGER));
  else filtered.sort((a, b) => a.name.localeCompare(b.name));
  return <main className="container min-h-screen py-8 sm:py-12">
    <Link href={homeHref} className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> {homeLabel}</Link>
    <div className="mt-12 flex items-end justify-between gap-5"><div><p className="eyebrow">Temukan mentor</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Cari bimbingan yang tepat.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">Jelajahi mentor berdasarkan pengalaman dan bidang yang ingin kamu kembangkan.</p></div><span className="hidden items-center gap-2 text-xs text-[var(--muted)] sm:flex"><SlidersHorizontal size={14} /> {filtered.length} mentor</span></div>
    <form action="/mentors" className="mt-7 rounded-xl border border-[var(--line)] bg-white p-3 sm:p-4">
      <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] px-4"><Search size={17} className="shrink-0 text-[#8090a5]" /><input name="q" defaultValue={params.q} aria-label="Cari mentor" placeholder="Cari nama, keahlian, atau tujuan" className="min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /><button className="button-primary !min-h-9 !px-4 !text-xs">Cari</button></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <select name="category" defaultValue={params.category ?? ""} aria-label="Filter berdasarkan bidang" className="min-h-10 rounded-xl border border-[var(--line)] bg-white px-3 text-xs"><option value="">Semua bidang</option>{["Software Engineering", "Product & Design", "Career Growth", "Leadership", "Data & AI", "Entrepreneurship"].map((name) => <option key={name} value={name}>{indonesianTaxonomyLabel(name)}</option>)}</select>
        <select name="maxRate" defaultValue={params.maxRate ?? ""} aria-label="Filter tarif maksimum" className="min-h-10 rounded-xl border border-[var(--line)] bg-white px-3 text-xs"><option value="">Semua tarif</option><option value="0">Gratis</option><option value="25">Hingga 25</option><option value="50">Hingga 50</option><option value="100">Hingga 100</option></select>
        <select name="currency" defaultValue={currency} aria-label="Mata uang untuk filter tarif" className="min-h-10 rounded-xl border border-[var(--line)] bg-white px-3 text-xs"><option>USD</option><option>IDR</option><option>EUR</option><option>GBP</option></select>
        <select name="sort" defaultValue={params.sort ?? "name"} aria-label="Urutkan mentor" className="min-h-10 rounded-xl border border-[var(--line)] bg-white px-3 text-xs"><option value="name">Urutkan: nama</option><option value="rating">Ulasan tertinggi</option><option value="experience">Pengalaman terbanyak</option><option value="price">Tarif terendah</option></select>
        <label className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--line)] px-3 text-xs"><input type="checkbox" name="available" value="true" defaultChecked={params.available === "true"} />Ada jadwal</label>
      </div>
    </form>
    {category && <p className="mt-4 text-xs text-[var(--muted)]">Bidang: <strong className="text-[var(--ink)]">{indonesianTaxonomyLabel(params.category ?? "")}</strong> <Link href="/mentors" className="ml-2 font-semibold text-[var(--brand)]">Hapus filter</Link></p>}
    {!configured ? <div className="mt-10 rounded-xl border border-dashed border-[#c5d2e6] bg-white/70 p-8 text-sm leading-6 text-[var(--muted)]">Direktori membutuhkan koneksi ke Supabase. Isi nilai proyek di <code>.env.local</code>, lalu jalankan skema di <code>supabase/migrations</code>.</div>
      : filtered.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}</div>
      : <div className="mt-10 rounded-xl border border-dashed border-[#c5d2e6] bg-white/70 p-8 text-sm text-[var(--muted)]">{mentors.length ? "Belum ada mentor yang cocok. Coba kata kunci atau bidang lain." : "Belum ada profil mentor yang dipublikasikan."}</div>}
  </main>;
}
