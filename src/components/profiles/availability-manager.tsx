"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { addAvailability, removeAvailability } from "@/app/actions/profiles";
import { availabilitySchema } from "@/lib/validation/auth";
import type { z } from "zod";
import { indonesianTimezoneLabel } from "@/lib/indonesian";

type AvailabilityValues = z.infer<typeof availabilitySchema>;
type Slot = AvailabilityValues & { id: string; is_active: boolean };
const weekdays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const zones = [
  { value: "Asia/Jakarta", label: "Waktu Indonesia Barat (WIB)" },
  { value: "Asia/Makassar", label: "Waktu Indonesia Tengah (WITA)" },
  { value: "Asia/Jayapura", label: "Waktu Indonesia Timur (WIT)" },
  { value: "Asia/Singapore", label: "Singapura" },
  { value: "Europe/London", label: "London" },
  { value: "America/New_York", label: "New York" },
  { value: "UTC", label: "Waktu Universal Terkoordinasi (UTC)" },
];

export function AvailabilityManager({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [result, setResult] = useState<{ error?: string; notice?: string } | null>(null);
  const [busyId, setBusyId] = useState("");
  const form = useForm<AvailabilityValues>({ resolver: zodResolver(availabilitySchema), defaultValues: { weekday: 1, startsAt: "09:00", endsAt: "12:00", timezone: "Asia/Jakarta" } });

  async function onSubmit(values: AvailabilityValues) {
    setResult(null);
    const response = await addAvailability(values);
    setResult(response);
    if (!response.error) { form.reset({ ...values, startsAt: "09:00", endsAt: "12:00" }); router.refresh(); }
  }

  async function remove(id: string) {
    setBusyId(id); setResult(null);
    const response = await removeAvailability({ id });
    setBusyId(""); setResult(response);
    if (!response.error) router.refresh();
  }

  const sortedSlots = [...slots].sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt));
  return <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="text-sm font-bold">Tambah waktu mingguan</h2><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Pilih zona waktu lokal yang sesuai dengan jadwalmu.</p>
      <label className="mt-5 block text-xs font-semibold">Hari<select {...form.register("weekday", { valueAsNumber: true })} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm">{weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
      <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs font-semibold">Mulai<input type="time" {...form.register("startsAt")} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" /></label><label className="text-xs font-semibold">Selesai<input type="time" {...form.register("endsAt")} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" /></label></div>
      {form.formState.errors.endsAt && <p className="mt-2 text-xs text-red-700">Waktu selesai harus setelah waktu mulai.</p>}
      <label className="mt-4 block text-xs font-semibold">Zona waktu<select {...form.register("timezone")} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm">{zones.map((zone) => <option key={zone.value} value={zone.value}>{zone.label}</option>)}</select></label>
      <button disabled={form.formState.isSubmitting} className="button-primary mt-5 w-full !text-xs disabled:opacity-50">{form.formState.isSubmitting ? "Menambahkan…" : "Tambah ketersediaan"}</button>
    </form>
    <section className="rounded-xl border border-[var(--line)] bg-white p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">Jadwal mingguan</h2><span className="text-[10px] text-[var(--muted)]">{slots.length} waktu</span></div>
      {sortedSlots.length ? <div className="mt-4 divide-y divide-[var(--line)]">{sortedSlots.map((slot) => <div key={slot.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-xs font-semibold">{weekdays[slot.weekday]}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{slot.startsAt.slice(0, 5)}–{slot.endsAt.slice(0, 5)} · {indonesianTimezoneLabel(slot.timezone)}</p></div><button aria-label={`Hapus ketersediaan hari ${weekdays[slot.weekday]}`} disabled={busyId === slot.id} onClick={() => void remove(slot.id)} className="grid size-8 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-red-200 hover:text-red-700 disabled:opacity-50"><Trash2 size={14} /></button></div>)}</div> : <p className="mt-4 rounded-xl bg-[#f6f8fc] p-4 text-xs leading-5 text-[var(--muted)]">Belum ada jadwal rutin. Tambahkan ketersediaan agar peserta bimbingan dapat mengajukan sesi.</p>}
      {result?.error && <p role="alert" className="mt-4 text-xs text-red-700">{result.error}</p>}{result?.notice && <p role="status" className="mt-4 text-xs text-[var(--brand)]">{result.notice}</p>}
    </section>
  </div>;
}
