import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpenCheck, CalendarClock, Compass, Search, ShieldCheck, Sparkles } from "lucide-react";
import { indonesianTaxonomyLabel } from "@/lib/indonesian";

const disciplines = ["Software Engineering", "Product & Design", "Career Growth", "Leadership", "Data & AI", "Entrepreneurship"];
const features = [
  { title: "Mentor ahli", body: "Temukan mentor berdasarkan pengalaman dan keahlian yang sesuai dengan tujuanmu.", icon: Compass },
  { title: "Jadwal fleksibel", body: "Ajukan sesi pada waktu yang tersedia dan kelola perubahan jadwal dengan jelas.", icon: CalendarClock },
  { title: "Progres terarah", body: "Simpan konteks sesi dan berikan ulasan setelah pendampingan selesai.", icon: BookOpenCheck },
];

export default function HomePage() {
  return <main>
    <header className="container flex h-[76px] items-center justify-between border-b border-[var(--line)]">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Beranda MentorConnect">
        <span className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] text-white"><Compass size={19} strokeWidth={2.2} /></span>
        <span className="text-[17px] font-bold tracking-[-.04em]">mentor<span className="text-[var(--brand)]">connect</span></span>
      </Link>
      <nav className="hidden items-center gap-8 text-[13px] font-medium text-[var(--muted)] md:flex" aria-label="Navigasi utama">
        <a href="#fitur" className="transition hover:text-[var(--ink)]">Fitur</a>
        <a href="#cara-kerja" className="transition hover:text-[var(--ink)]">Cara kerja</a>
        <a href="#topik" className="transition hover:text-[var(--ink)]">Topik</a>
      </nav>
      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden text-[13px] font-semibold sm:inline">Masuk</Link>
        <Link href="/register" className="button-primary !min-h-10 !rounded-lg !px-4 !text-[12px]">Mulai sekarang <ArrowUpRight size={15} /></Link>
      </div>
    </header>

    <section className="container py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-2xl bg-[#edf4ff] px-6 py-16 text-center sm:px-12 sm:py-20">
        <div aria-hidden="true" className="absolute -right-20 -top-28 size-80 rounded-full border border-[#d7e6ff] sm:right-8 sm:-top-48 sm:size-[460px]" />
        <div aria-hidden="true" className="absolute -bottom-44 -left-24 size-80 rounded-full border border-[#d7e6ff] sm:-bottom-64 sm:left-20 sm:size-[460px]" />
        <div className="relative mx-auto max-w-[760px]">
          <p className="eyebrow mb-5 inline-flex items-center gap-2"><Sparkles size={14} /> Belajar bersama, berkembang lebih terarah</p>
          <h1 className="mx-auto max-w-[720px] text-[clamp(2.5rem,6vw,4.6rem)] font-bold leading-[1.04] tracking-[-.055em]">Perjalanan belajarmu lebih terarah <span className="text-[var(--brand)]">dengan mentor ahli.</span></h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-7 text-[var(--muted)]">Temukan bimbingan satu-satu, jadwalkan sesi yang sesuai, dan ubah tujuan profesional menjadi langkah nyata.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/mentors" className="button-primary">Cari mentor <ArrowRight size={16} /></Link>
            <Link href="/register?role=mentor" className="button-secondary">Saya ingin menjadi mentor</Link>
          </div>
          <div className="mt-7 inline-flex items-center gap-2 text-[11px] font-medium text-[#5d6f8a]"><ShieldCheck size={14} className="text-[var(--brand)]" /> Profil dan ulasan berasal dari aktivitas pendampingan di platform</div>
        </div>
      </div>
    </section>

    <section id="fitur" className="container py-14 sm:py-20">
      <div className="mx-auto max-w-[620px] text-center"><p className="eyebrow mb-3">Dukungan yang kamu butuhkan</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-4xl">Bertumbuh dengan langkah yang lebih jelas</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Semua hal penting untuk membangun hubungan pendampingan yang konsisten ada di satu tempat.</p></div>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {features.map(({ title, body, icon: Icon }) => <article key={title} className="rounded-xl border border-[var(--line)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(26,55,105,.07)]">
          <span className="grid size-10 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]"><Icon size={19} /></span>
          <h3 className="mt-5 text-[15px] font-bold">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">{body}</p>
        </article>)}
      </div>
      <form action="/mentors" className="mx-auto mt-8 flex max-w-[640px] items-center gap-3 rounded-xl border border-[var(--line)] bg-white p-2 pl-4 shadow-[0_8px_30px_rgba(26,55,105,.04)]">
        <Search size={17} className="shrink-0 text-[#8090a5]" />
        <input name="q" aria-label="Cari mentor" placeholder="Cari bidang, keterampilan, atau nama mentor" className="min-w-0 flex-1 bg-transparent py-2 text-[13px] outline-none placeholder:text-[#98a2b3]" />
        <button className="button-primary !min-h-10 !rounded-lg !px-5 !text-[12px]">Cari</button>
      </form>
    </section>

    <section id="topik" className="border-y border-[var(--line)] bg-white py-14 sm:py-16">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow mb-3">Jelajahi bidang</p><h2 className="text-2xl font-bold tracking-[-.035em] sm:text-3xl">Pilih arah yang ingin kamu kembangkan</h2></div><Link href="/mentors" className="inline-flex items-center gap-2 text-[13px] font-bold text-[var(--brand)]">Lihat semua mentor <ArrowRight size={15} /></Link></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {disciplines.map((item, index) => <Link key={item} href={`/mentors?category=${encodeURIComponent(item)}`} className="group flex min-h-[68px] items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 transition hover:border-[#b9cff4] hover:bg-[#fbfdff]"><span className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-[var(--brand-soft)] text-[11px] font-bold text-[var(--brand)]">0{index + 1}</span><span className="text-[13px] font-semibold">{indonesianTaxonomyLabel(item)}</span></span><ArrowUpRight size={16} className="text-[#98a2b3] transition group-hover:text-[var(--brand)]" /></Link>)}
        </div>
      </div>
    </section>

    <section id="cara-kerja" className="container py-16 sm:py-20">
      <div className="mx-auto max-w-[650px] text-center"><p className="eyebrow mb-3">Cara kerja</p><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-4xl">Mulai dari tujuan, lanjutkan dengan aksi</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Alur sederhana untuk membuat sesi pendampingan terasa fokus sejak awal.</p></div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {["Buat profil", "Pilih mentor", "Jadwalkan sesi"].map((title, index) => <article key={title} className="rounded-xl border border-[var(--line)] bg-white p-5"><span className="grid size-9 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">{index + 1}</span><h3 className="mt-4 text-[15px] font-bold">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">{["Ceritakan minat dan tujuan belajar agar pencarian dimulai dari kebutuhanmu.", "Bandingkan keahlian, pengalaman, ketersediaan, serta ulasan mentor.", "Pilih waktu yang tersedia, ajukan sesi, lalu lanjutkan setelah disetujui."][index]}</p></article>)}
      </div>
    </section>

    <section id="untuk-mentor" className="container pb-16 sm:pb-20">
      <div className="grid items-center gap-6 rounded-2xl bg-[#1d4f9b] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto]">
        <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#c8dcff]">Untuk mentor</p><h2 className="max-w-[600px] text-3xl font-bold leading-tight tracking-[-.04em] sm:text-4xl">Bagikan pengalamanmu. Bantu orang lain melangkah.</h2><p className="mt-3 max-w-[520px] text-[13px] leading-6 text-[#d7e5fa]">Atur ketersediaan, terima permintaan sesi, dan dukung perkembangan peserta bimbingan dengan cara yang terstruktur.</p></div>
        <Link href="/register?role=mentor" className="mentor-cta inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-lg px-5 text-[13px] font-bold transition">Daftar sebagai mentor <ArrowUpRight size={15} /></Link>
      </div>
    </section>

    <footer className="border-t border-[var(--line)] bg-white py-7">
      <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-[15px] font-bold tracking-[-.04em]">mentor<span className="text-[var(--brand)]">connect</span></Link>
        <p className="text-[11px] text-[var(--muted)]">Bimbingan yang tepat, langkah yang lebih mantap.</p>
        <div className="flex gap-5 text-[12px] font-medium text-[var(--muted)]"><Link href="/mentors">Cari mentor</Link><Link href="/register">Buat akun</Link></div>
      </div>
    </footer>
  </main>;
}
