import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, MessageCircle, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMentor } from "@/lib/data/mentors";
import { BookingForm } from "@/components/sessions/booking-form";
import { indonesianTaxonomyLabel, indonesianTimezoneLabel } from "@/lib/indonesian";

const weekdays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function MentorDetailPage({ params }: { params: Promise<{ mentorId: string }> }) {
  const { mentorId } = await params;
  let mentor;
  let availability: Array<{ weekday: number; starts_at: string; ends_at: string; timezone: string }> = [];
  let reviews: Array<{ rating: number; body: string; created_at: string }> = [];
  let configured = true;
  try {
    mentor = await getMentor(mentorId);
    if (!mentor) notFound();
    const supabase = await createClient();
    const [slots, feedback] = await Promise.all([
      supabase.from("mentor_availability").select("weekday, starts_at, ends_at, timezone").eq("mentor_id", mentorId).eq("is_active", true).order("weekday"),
      supabase.from("reviews").select("rating, body, created_at").eq("mentor_id", mentorId).order("created_at", { ascending: false }).limit(8),
    ]);
    availability = slots.data ?? [];
    reviews = feedback.data ?? [];
  } catch {
    configured = false;
  }

  if (!configured) return <main className="container min-h-screen py-8 sm:py-12"><Link href="/mentors" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Semua mentor</Link><div className="mt-12 rounded-xl border border-dashed border-[#c5d2e6] bg-white p-8 text-sm leading-6 text-[var(--muted)]">Profil mentor membutuhkan koneksi Supabase dan skema database. Isi nilai proyek di <code>.env.local</code> untuk melihat profil.</div></main>;
  if (!mentor) notFound();

  const initial = mentor.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <main className="container min-h-screen py-8 sm:py-12">
    <Link href="/mentors" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Semua mentor</Link>
    <div className="mt-9 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <section className="rounded-[24px] border border-[var(--line)] bg-white p-7 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-[#edf4ff] text-xl font-bold text-[var(--brand)]">{initial}</div>
            <div><p className="eyebrow">Profil mentor</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">{mentor.name}</h1><p className="mt-2 text-sm text-[var(--muted)]">{mentor.title || "Mentor"}</p></div>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[var(--line)] py-4 text-xs text-[var(--muted)]">
            {mentor.rating !== null && <span className="inline-flex items-center gap-1 font-semibold text-[var(--ink)]"><Star size={14} fill="#d3a84d" stroke="#d3a84d" /> {mentor.rating.toFixed(1)} <span className="font-normal text-[var(--muted)]">({mentor.reviewCount} ulasan)</span></span>}
            {mentor.experienceYears !== null && <span>{mentor.experienceYears} tahun pengalaman</span>}
            {mentor.hourlyRate !== null && <span>{mentor.currency} {mentor.hourlyRate.toFixed(0)} / jam</span>}
          </div>
          <h2 className="mt-7 text-sm font-bold">Tentang mentor</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{mentor.bio || "Mentor ini siap berbagi pengalaman dan mendukung langkahmu berikutnya."}</p>
          {!!mentor.skills.length && <><h2 className="mt-7 text-sm font-bold">Keahlian</h2><div className="mt-3 flex flex-wrap gap-2">{mentor.skills.map((skill) => <span key={skill} className="rounded-full bg-[#edf4ff] px-3 py-1.5 text-xs font-semibold text-[#345a94]">{indonesianTaxonomyLabel(skill)}</span>)}</div></>}
          {!!mentor.categories.length && <><h2 className="mt-7 text-sm font-bold">Bidang pendampingan</h2><div className="mt-3 flex flex-wrap gap-2">{mentor.categories.map((category) => <span key={category} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">{indonesianTaxonomyLabel(category)}</span>)}</div></>}
        </section>

        <section className="mt-7 rounded-[24px] border border-[var(--line)] bg-white p-7 sm:p-9">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Ulasan peserta</h2><MessageCircle size={18} className="text-[var(--brand)]" /></div>
          {reviews.length ? <div className="mt-6 divide-y divide-[var(--line)]">{reviews.map((review, index) => <article key={`${review.created_at}-${index}`} className="py-5 first:pt-0 last:pb-0"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-1 text-xs font-semibold"><Star size={13} fill="#d3a84d" stroke="#d3a84d" /> {review.rating} / 5</span><span className="text-[10px] text-[var(--muted)]">Sesi terverifikasi</span></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{review.body}</p></article>)}</div>
            : <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Belum ada ulasan sesi. Ulasan terverifikasi dapat ditulis setelah sesi selesai.</p>}
        </section>
      </div>

      <aside className="sticky top-6 rounded-xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_35px_rgba(26,55,105,.04)]">
        <div className="flex items-center justify-between"><h2 className="text-[15px] font-bold">Ajukan sesi</h2><CalendarDays size={17} className="text-[var(--brand)]" /></div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Pilih waktu yang kamu inginkan. Permintaan menunggu persetujuan mentor.</p>
        {availability.length > 0 && <div className="my-5 rounded-xl bg-[#edf4ff] p-3"><p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]"><Clock3 size={12} /> Jadwal tersedia</p><div className="space-y-1.5">{availability.map((slot, index) => <p key={`${slot.weekday}-${slot.starts_at}-${index}`} className="flex justify-between gap-2 text-[10px] text-[var(--muted)]"><span>{weekdays[slot.weekday]}</span><span className="text-right">{slot.starts_at.slice(0, 5)}–{slot.ends_at.slice(0, 5)} <span className="text-[9px]">{indonesianTimezoneLabel(slot.timezone)}</span></span></p>)}</div></div>}
        <BookingForm mentorId={mentor.id} hasAvailability={availability.length > 0} />
      </aside>
    </div>
    <Link href="/login" className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand)]">Sudah punya akun? Masuk <ArrowUpRight size={14} /></Link>
  </main>;
}
