import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock3, GraduationCap, Search, Sparkles } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { SessionCard } from "@/components/sessions/session-card";
import { NotificationList } from "@/components/notifications/notification-list";

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof CalendarCheck }) {
  return <article className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs text-[var(--muted)]">{label}</span><Icon size={16} className="text-[var(--brand)]" /></div><p className="mt-4 text-3xl font-semibold tracking-[-.05em]">{value}</p></article>;
}

export default async function MenteeDashboardPage() {
  const data = await getDashboardData("mentee");
  if (!data) return <main className="container min-h-screen py-16"><h1 className="text-3xl font-bold">Ruang peserta bimbingan</h1><p className="mt-3 text-sm text-[var(--muted)]">Masuk untuk melihat sesi dan perkembangan belajarmu.</p><Link href="/login" className="button-primary mt-6">Masuk</Link></main>;
  const learningHours = data.completed.reduce((total, session) => total + (new Date(session.ends_at).getTime() - new Date(session.starts_at).getTime()) / 3_600_000, 0);
  const history = data.sessions.filter((session) => ["completed", "rejected", "cancelled"].includes(session.status)).slice(-5).reverse();
  const now = new Date().toISOString();

  return <main className="container min-h-screen py-7 sm:py-10">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Dasbor peserta bimbingan</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Selamat datang, {data.user.full_name.split(" ")[0]}!</h1><p className="mt-2 text-sm text-[var(--muted)]">Pantau sesi pendampingan dan langkah belajarmu berikutnya.</p></div><div className="flex gap-2"><Link href="/dashboard/mentee/profile" className="button-secondary !min-h-10 !text-xs">Ubah profil</Link><Link href="/mentors" className="button-primary !min-h-10 !text-xs"><Search size={15} /> Cari mentor</Link></div></div>
    {data.loadError && <p role="alert" className="mt-6 rounded-xl bg-[#fff0ec] p-4 text-sm text-[#9a3929]">Data sesi belum dapat dimuat. Coba muat ulang halaman.</p>}
    <div className="mt-7 grid gap-3 sm:grid-cols-3"><Stat label="Sesi mendatang" value={data.upcoming.length} icon={CalendarCheck} /><Stat label="Permintaan diproses" value={data.pending.length} icon={Clock3} /><Stat label="Jam belajar" value={learningHours.toFixed(1)} icon={GraduationCap} /></div>
    <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-[15px] font-bold">Sesi mendatang</h2><Link href="/mentors" className="text-xs font-semibold text-[var(--brand)]">Cari mentor lain <ArrowRight size={13} className="inline" /></Link></div>{data.upcoming.length ? <div className="space-y-3">{data.upcoming.map((session) => <SessionCard key={session.id} session={session} role="mentee" now={now} />)}</div> : <div className="rounded-xl border border-dashed border-[#c5d2e6] bg-white p-6"><p className="text-sm font-semibold">Belum ada sesi terjadwal</p><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Temukan mentor dan ajukan waktu yang cocok untukmu.</p><Link href="/mentors" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--brand)]">Jelajahi mentor <ArrowRight size={14} /></Link></div>}</section>
        <section><h2 className="mb-4 text-[15px] font-bold">Permintaan sesi</h2>{data.pending.length ? <div className="space-y-3">{data.pending.map((session) => <SessionCard key={session.id} session={session} role="mentee" now={now} />)}</div> : <p className="rounded-xl border border-[var(--line)] bg-white p-5 text-xs text-[var(--muted)]">Permintaan yang menunggu tanggapan akan muncul di sini.</p>}</section>
        <section><div className="mb-4 flex items-center gap-2"><Sparkles size={15} className="text-[var(--brand)]" /><h2 className="text-[15px] font-bold">Riwayat sesi</h2></div>{history.length ? <div className="space-y-3">{history.map((session) => <SessionCard key={session.id} session={session} role="mentee" now={now} />)}</div> : <p className="rounded-xl border border-[var(--line)] bg-white p-5 text-xs text-[var(--muted)]">Sesi yang selesai dan ulasanmu akan tercatat di sini.</p>}</section>
      </div>
      <div className="space-y-5"><NotificationList notifications={data.notifications} /><section className="rounded-xl bg-[#1d4f9b] p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#c8dcff]">Langkah berikutnya</p><h2 className="mt-3 text-xl font-bold">Siapkan satu pertanyaan.</h2><p className="mt-2 text-xs leading-5 text-[#d7e5fa]">Tujuan yang fokus membantu sesi mentoring terasa lebih bermanfaat.</p><Link href="/mentors" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white">Jelajahi mentor <ArrowRight size={14} /></Link></section></div>
    </div>
  </main>;
}
