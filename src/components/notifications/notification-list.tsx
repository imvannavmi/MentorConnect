"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { markNotificationRead } from "@/app/actions/sessions";

type NotificationItem = { id: string; title: string; body: string; type: string; read_at: string | null; created_at: string };

function localizedNotification(item: NotificationItem) {
  const titles: Record<string, string> = {
    session_requested: "Permintaan sesi baru",
    session_approved: "Sesi disetujui",
    session_rejected: "Permintaan sesi ditolak",
    reschedule_requested: "Usulan waktu baru",
    session_confirmed: "Sesi dikonfirmasi",
    session_cancelled: "Sesi dibatalkan",
    session_completed: "Sesi selesai",
    review_received: "Ulasan sesi baru",
  };
  const bodies: Record<string, string> = {
    session_approved: "Permintaan pendampinganmu telah disetujui.",
    session_rejected: "Permintaan pendampinganmu telah ditolak.",
    reschedule_requested: "Mentor mengusulkan waktu baru untuk sesi ini.",
    session_confirmed: "Waktu sesi telah dikonfirmasi.",
    session_cancelled: "Sesi telah dibatalkan.",
    session_completed: "Sesi pendampingan telah ditandai selesai.",
    review_received: "Mentee mengirimkan ulasan setelah sesi selesai.",
  };
  const requestedTopic = item.body.match(/about “(.+?)”/)?.[1];
  return {
    title: titles[item.type] ?? item.title,
    body: item.type === "session_requested" && requestedTopic
      ? `Peserta bimbingan mengajukan sesi tentang “${requestedTopic}”.`
      : bodies[item.type] ?? item.body,
  };
}

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function markRead(id: string) {
    setBusy(id); setError("");
    const result = await markNotificationRead({ id });
    setBusy(null);
    if (result.error) { setError(result.error); return; }
    router.refresh();
  }

  return <section className="rounded-xl border border-[var(--line)] bg-white p-5">
    <div className="flex items-center gap-2"><Bell size={15} className="text-[var(--brand)]" /><h2 className="text-sm font-bold">Notifikasi</h2></div>
    {notifications.length ? <div className="mt-4 divide-y divide-[var(--line)]">{notifications.map((item) => { const text = localizedNotification(item); return <article key={item.id} className={`py-3 first:pt-0 last:pb-0 ${item.read_at ? "opacity-60" : ""}`}><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold">{text.title}</p><p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{text.body}</p><time className="mt-1 block text-[10px] text-[#8c9994]">{new Date(item.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</time></div>{!item.read_at && <button aria-label="Tandai notifikasi sudah dibaca" disabled={busy === item.id} onClick={() => void markRead(item.id)} className="grid size-7 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[var(--brand)] disabled:opacity-50"><Check size={14} /></button>}</div></article>; })}</div>
      : <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Pembaruan sesi akan muncul di sini.</p>}
    {error && <p role="alert" className="mt-3 text-[11px] text-red-700">{error}</p>}
  </section>;
}
