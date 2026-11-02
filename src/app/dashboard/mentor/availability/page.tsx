import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityManager } from "@/components/profiles/availability-manager";

export default async function MentorAvailabilityPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return <main className="container min-h-screen py-16"><p className="text-sm text-[var(--muted)]">Hubungkan Supabase melalui <code>.env.local</code> untuk mengelola ketersediaan mingguan.</p></main>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="container py-16"><Link href="/login">Masuk untuk melanjutkan</Link></main>;
  const { data: slots } = await supabase.from("mentor_availability")
    .select("id, weekday, starts_at, ends_at, timezone, is_active")
    .eq("mentor_id", user.id).order("weekday");
  const formSlots = (slots ?? []).map((slot) => ({
    id: slot.id,
    weekday: slot.weekday,
    startsAt: slot.starts_at.slice(0, 5),
    endsAt: slot.ends_at.slice(0, 5),
    timezone: slot.timezone,
    is_active: slot.is_active,
  }));
  return <main className="container min-h-screen py-8 sm:py-12">
    <Link href="/dashboard/mentor" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]"><ArrowLeft size={14} /> Dasbor mentor</Link>
    <div className="mt-8 max-w-3xl"><p className="eyebrow">Jadwal mentor</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] sm:text-4xl">Atur waktu untuk sesi pendampingan.</h1><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Tambahkan jadwal rutin agar peserta bimbingan mengetahui waktu yang biasanya tersedia.</p></div>
    <div className="mt-7"><AvailabilityManager slots={formSlots} /></div>
  </main>;
}
