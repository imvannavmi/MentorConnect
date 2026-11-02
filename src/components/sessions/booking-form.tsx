"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requestSession } from "@/app/actions/sessions";
import { IndonesianDateTimePicker } from "@/components/sessions/indonesian-date-time-picker";

const bookingFormSchema = z.object({
  startsAt: z.string().min(1, "Pilih tanggal dan waktu."),
  duration: z.number().int().min(30, "Durasi minimal 30 menit.").max(120, "Durasi maksimal 120 menit."),
  topic: z.string().trim().min(3, "Topik harus terdiri dari minimal 3 karakter.").max(120, "Topik maksimal 120 karakter."),
  message: z.string().max(2000, "Catatan maksimal 2.000 karakter."),
});
type BookingValues = z.infer<typeof bookingFormSchema>;

export function BookingForm({ mentorId, hasAvailability }: { mentorId: string; hasAvailability: boolean }) {
  const [message, setMessage] = useState<{ type: "error" | "notice"; value: string } | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { startsAt: "", duration: 60, topic: "", message: "" },
  });

  async function onSubmit(values: BookingValues) {
    setMessage(null);
    setNeedsLogin(false);
    const start = new Date(values.startsAt);
    const end = new Date(start.getTime() + values.duration * 60_000);
    const result = await requestSession({ mentorId, startsAt: start.toISOString(), endsAt: end.toISOString(), topic: values.topic, message: values.message });
    if (result.error) {
      setMessage({ type: "error", value: result.error });
      setNeedsLogin(result.error.startsWith("Masuk"));
      return;
    }
    setMessage({ type: "notice", value: result.notice ?? "Permintaan sesi berhasil dikirim." });
    form.reset({ startsAt: "", duration: 60, topic: "", message: "" });
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <p className="rounded-xl bg-[#edf4ff] p-3 text-xs leading-5 text-[#315b91]">Pilih waktu yang kamu inginkan, termasuk di luar jadwal rutin mentor. Permintaan akan menunggu persetujuan mentor; mentor bisa menyetujui atau mengusulkan waktu lain.{!hasAvailability && " Mentor belum mencantumkan jadwal rutin."}</p>
    <div className="block text-xs font-semibold">Pilih tanggal dan waktu<IndonesianDateTimePicker id="waktu-sesi" value={form.watch("startsAt")} onChange={(value) => form.setValue("startsAt", value, { shouldValidate: true })} />{form.formState.errors.startsAt && <span className="mt-1 block text-xs text-red-700">Pilih tanggal dan waktu.</span>}</div>
    <label className="block text-xs font-semibold">Durasi sesi<select {...form.register("duration", { valueAsNumber: true })} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm"><option value={30}>30 menit</option><option value={60}>60 menit</option><option value={90}>90 menit</option><option value={120}>2 jam</option></select></label>
    <label className="block text-xs font-semibold">Apa yang ingin dibahas?<input {...form.register("topic")} maxLength={120} placeholder="contoh: Persiapan wawancara produk" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.topic && <span className="mt-1 block text-xs text-red-700">Topik harus berisi 3–120 karakter.</span>}</label>
    <label className="block text-xs font-semibold">Catatan untuk mentor <span className="font-normal text-[var(--muted)]">(opsional)</span><textarea rows={3} maxLength={2000} {...form.register("message")} placeholder="Tambahkan konteks atau pertanyaan yang ingin disampaikan…" className="mt-2 w-full rounded-xl border border-[var(--line)] p-3 text-sm outline-none focus:border-[var(--brand)]" /></label>
    {message && <p role={message.type === "error" ? "alert" : "status"} className={`text-xs leading-5 ${message.type === "error" ? "text-red-700" : "text-[var(--brand)]"}`}>{message.value}{needsLogin && <> <Link href="/login" className="font-bold underline">Masuk</Link> untuk melanjutkan.</>}</p>}
    <button disabled={form.formState.isSubmitting} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{form.formState.isSubmitting ? "Mengirim permintaan…" : "Ajukan sesi"}</button>
    <p className="text-[10px] leading-4 text-[var(--muted)]">Sesi dikonfirmasi setelah mentor menyetujui dan kamu mengonfirmasi. Permintaan yang bertabrakan dengan sesi lain tidak dapat disimpan.</p>
  </form>;
}
