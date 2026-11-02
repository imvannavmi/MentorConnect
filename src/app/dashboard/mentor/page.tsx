import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock3, Star, UsersRound } from "lucide-react";
import { getDashboardData } from "@/lib/data/dashboard";
import { SessionCard } from "@/components/sessions/session-card";
import { NotificationList } from "@/components/notifications/notification-list";

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof CalendarCheck }) {
  return <article className="rounded-2xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs text-[var(--muted)]">{label}</span><Icon size={16} className="text-[var(--brand)]" /></div><p className="mt-4 text-3xl font-semibold tracking-[-.05em]">{value}</p></article>;
}

export default async function MentorDashboardPage() {
  const data = await getDashboardData("mentor");
  if (!data) return <main className="container min-h-screen py-16"><h1 className="text-3xl font-bold">Ruang mentor</h1><p className="mt-3 text-sm text-[var(--muted)]">Masuk sebagai mentor untuk mengelola permintaan dan sesi.</p><Link href="/login" className="button-primary mt-6">Masuk</Link></main>;
  const reviewItems = data.reviews as Array<{ id: string; rating: number; body: string; created_at: string }>;
  const now = new Date().toISOString();

  return <main className="container min-h-screen py-7 sm:py-10">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Dasbor mentor</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Selamat datang, {data.user.full_name.split(" ")[0]}!</h1><p className="mt-2 text-sm text-[var(--muted)]">Kelola waktu dan dukung perkembangan peserta bimbinganmu.</p></div><Link href="/dashboard/mentor/profile" className="button-secondary !min-h-10 !text-xs">Kelola profil <ArrowRight size={14} /></Link></div>
    {data.loadError && <p role="alert" className="mt-6 rounded-xl bg-[#fff0ec] p-4 text-sm text-[#9a3929]">Data sesi belum dapat dimuat. Coba muat ulang halaman.</p>}
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Permintaan ditinjau" value={data.pending.length} icon={Clock3} /><Stat label="Sesi mendatang" value={data.upcoming.length} icon={CalendarCheck} /><Stat label="Mentee aktif" value={data.stats.activeMentees} icon={UsersRound} /><Stat label="Rata-rata ulasan" value={data.stats.averageRating ? data.stats.averageRating.toFixed(1) : "—"} icon={Star} /></div>
    <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-[15px] font-bold">Permintaan sesi</h2><span className="text-xs text-[var(--muted)]">{data.pending.length} menunggu</span></div>{data.pending.length ? <div className="space-y-3">{data.pending.map((session) => <SessionCard key={session.id} session={session} role="mentor" now={now} />)}</div> : <p className="rounded-xl border border-[var(--line)] bg-white p-5 text-xs text-[var(--muted)]">Permintaan dari peserta bimbingan akan muncul di sini.</p>}</section>
        <section><h2 className="mb-4 text-[15px] font-bold">Sesi mendatang</h2>{data.upcoming.length ? <div className="space-y-3">{data.upcoming.map((session) => <SessionCard key={session.id} session={session} role="mentor" now={now} />)}</div> : <p className="rounded-xl border border-[var(--line)] bg-white p-5 text-xs text-[var(--muted)]">Sesi yang sudah dikonfirmasi akan muncul di sini.</p>}</section>
        <section><h2 className="mb-4 text-[15px] font-bold">Ulasan terbaru</h2>{reviewItems.length ? <div className="space-y-3">{reviewItems.map((review) => <article key={review.id} className="rounded-xl border border-[var(--line)] bg-white p-5"><p className="flex items-center gap-1 text-xs font-bold"><Star size={13} fill="#d3a84d" stroke="#d3a84d" /> {review.rating} / 5</p><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{review.body}</p><time className="mt-2 block text-[10px] text-[#8c9994]">{new Date(review.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</time></article>)}</div> : <p className="rounded-xl border border-[var(--line)] bg-white p-5 text-xs text-[var(--muted)]">Ulasan terverifikasi akan tampil setelah sesi selesai.</p>}</section>
      </div>
      <div className="space-y-5"><NotificationList notifications={data.notifications} /><section className="rounded-xl border border-[var(--line)] bg-white p-5"><p className="eyebrow">Ketersediaan</p><h2 className="mt-3 text-sm font-bold">Atur waktu untuk sesi</h2><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Tentukan jadwal mingguan agar peserta bimbingan dapat mengajukan waktu yang cocok.</p><Link href="/dashboard/mentor/availability" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--brand)]">Atur ketersediaan <ArrowRight size={14} /></Link></section></div>
    </div>
  </main>;
}
