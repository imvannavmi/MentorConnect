"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Check, Clock3, Star, X } from "lucide-react";
import { completeSession, decideSession, respondToSession, submitReview } from "@/app/actions/sessions";
import type { DashboardSession } from "@/lib/data/dashboard";
import { IndonesianDateTimePicker } from "@/components/sessions/indonesian-date-time-picker";

export function SessionCard({ session, role, now }: { session: DashboardSession; role: "mentee" | "mentor"; now: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState("5");
  const [proposedTime, setProposedTime] = useState("");

  async function run(action: () => Promise<{ error?: string; notice?: string }>) {
    setBusy(true); setError(""); setNotice("");
    const result = await action();
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    setNotice(result.notice ?? "Perubahan tersimpan.");
    router.refresh();
  }

  const isPending = session.status === "pending";
  const start = session.status === "reschedule_requested" && session.proposed_starts_at ? session.proposed_starts_at : session.starts_at;
  const end = session.status === "reschedule_requested" && session.proposed_ends_at ? session.proposed_ends_at : session.ends_at;
  const canComplete = session.status === "confirmed" && Date.parse(session.ends_at) <= Date.parse(now);
  const statusLabels: Record<string, string> = { pending: "menunggu", approved: "disetujui", confirmed: "terkonfirmasi", rejected: "ditolak", cancelled: "dibatalkan", completed: "selesai", reschedule_requested: "usulan jadwal baru" };

  return <article className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><span className="rounded-full bg-[#edf4ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--brand)]">{statusLabels[session.status] ?? session.status.replaceAll("_", " ")}</span><h3 className="mt-3 text-[15px] font-bold">{session.topic}</h3><p className="mt-1 text-xs text-[var(--muted)]">{role === "mentor" ? "Peserta bimbingan" : "Mentor"}: {session.counterpartName}</p></div>
      <div className="text-right text-[11px] text-[var(--muted)]"><p className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {new Date(start).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p><p className="mt-1 inline-flex items-center gap-1.5"><Clock3 size={13} /> {new Date(start).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}–{new Date(end).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })}</p></div>
    </div>
    {session.message && <p className="mt-4 rounded-xl bg-[#f6f8fc] p-3 text-xs leading-5 text-[var(--muted)]">{session.message}</p>}
    {session.response_note && <p className="mt-3 text-xs leading-5 text-[var(--muted)]"><strong>Catatan mentor:</strong> {session.response_note}</p>}
    {(session.meeting_url || session.material_url) && <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">{session.meeting_url && <a href={session.meeting_url} target="_blank" rel="noreferrer" className="text-[var(--brand)] underline">Buka sesi</a>}{session.material_url && <a href={session.material_url} target="_blank" rel="noreferrer" className="text-[var(--brand)] underline">Materi sesi</a>}</div>}
    {role === "mentor" && isPending && <div className="mt-5 grid gap-3 border-t border-[var(--line)] pt-4">
      <form onSubmit={(event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); void run(() => respondToSession({ sessionId: session.id, action: "approve", meetingUrl: String(formData.get("meetingUrl") ?? ""), materialUrl: String(formData.get("materialUrl") ?? "") })); }} className="grid gap-2 sm:grid-cols-2">
        <input type="url" name="meetingUrl" placeholder="Tautan pertemuan (opsional)" className="min-h-10 rounded-xl border border-[var(--line)] px-3 text-xs outline-none focus:border-[var(--brand)]" />
        <input type="url" name="materialUrl" placeholder="Tautan materi (opsional)" className="min-h-10 rounded-xl border border-[var(--line)] px-3 text-xs outline-none focus:border-[var(--brand)]" />
        <button disabled={busy} className="sm:col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-xs font-bold text-white disabled:opacity-50"><Check size={14} /> Setujui permintaan</button>
      </form>
      <form onSubmit={(event) => { event.preventDefault(); const note = new FormData(event.currentTarget).get("reason"); void run(() => respondToSession({ sessionId: session.id, action: "reject", responseNote: String(note ?? "") })); }} className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input name="reason" required maxLength={1000} placeholder="Alasan menolak permintaan" className="min-h-10 rounded-xl border border-[var(--line)] px-3 text-xs outline-none focus:border-[var(--brand)]" />
        <button disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-4 text-xs font-bold text-[var(--muted)] disabled:opacity-50"><X size={14} /> Tolak</button>
      </form>
      <form onSubmit={(event) => { event.preventDefault(); if (!proposedTime) return; void run(() => respondToSession({ sessionId: session.id, action: "reschedule", proposedStartsAt: new Date(proposedTime).toISOString() })); }} className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="text-xs font-semibold">Pilih waktu usulan<IndonesianDateTimePicker id={`usulan-${session.id}`} value={proposedTime} onChange={setProposedTime} /></div>
        <button disabled={busy || !proposedTime} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--line)] px-4 text-xs font-bold text-[var(--muted)] disabled:opacity-50">Usulkan waktu lain</button>
      </form>
    </div>}
    {role === "mentee" && (session.status === "approved" || session.status === "reschedule_requested") && <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4"><button disabled={busy} onClick={() => run(() => decideSession({ sessionId: session.id, action: "confirm" }))} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-xs font-bold text-white disabled:opacity-50"><Check size={14} /> Konfirmasi waktu</button><button disabled={busy} onClick={() => run(() => decideSession({ sessionId: session.id, action: "cancel" }))} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--line)] px-4 text-xs font-bold text-[var(--muted)] disabled:opacity-50"><X size={14} /> Batalkan</button></div>}
    {role === "mentee" && session.status === "pending" && <div className="mt-5 border-t border-[var(--line)] pt-4"><button disabled={busy} onClick={() => run(() => decideSession({ sessionId: session.id, action: "cancel" }))} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--line)] px-4 text-xs font-bold text-[var(--muted)] disabled:opacity-50"><X size={14} /> Batalkan permintaan</button></div>}
    {canComplete && <div className="mt-5 border-t border-[var(--line)] pt-4"><button disabled={busy} onClick={() => run(() => completeSession(session.id))} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#edf4ff] px-4 text-xs font-bold text-[var(--brand)] disabled:opacity-50"><Check size={14} /> Tandai sesi selesai</button></div>}
    {role === "mentee" && session.status === "completed" && !session.hasReview && <form onSubmit={(event) => { event.preventDefault(); const body = new FormData(event.currentTarget).get("review"); void run(() => submitReview({ sessionId: session.id, rating, body: String(body ?? "") })); }} className="mt-5 grid gap-3 border-t border-[var(--line)] pt-4">
      <label className="text-xs font-semibold">Bagaimana sesi tadi?<span className="mt-2 flex items-center gap-1.5 text-[var(--muted)]"><Star size={14} fill="#d3a84d" stroke="#d3a84d" /><select value={rating} onChange={(event) => setRating(event.target.value)} className="rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-xs text-[var(--ink)]">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></span></label>
      <textarea name="review" required minLength={3} maxLength={2000} rows={3} placeholder="Tulis ulasan yang bermanfaat dan sopan…" className="rounded-xl border border-[var(--line)] p-3 text-xs outline-none focus:border-[var(--brand)]" />
      <button disabled={busy} className="button-primary !min-h-10 !text-xs disabled:opacity-50">Kirim ulasan terverifikasi</button>
    </form>}
    {role === "mentee" && session.status === "completed" && session.hasReview && <p className="mt-5 border-t border-[var(--line)] pt-4 text-xs font-semibold text-[var(--brand)]">Ulasan terverifikasimu sudah dikirim.</p>}
    {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}{notice && <p role="status" className="mt-3 text-xs text-[var(--brand)]">{notice}</p>}
  </article>;
}
