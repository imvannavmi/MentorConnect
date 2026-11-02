"use client";

import { useState } from "react";
import { resendSignupConfirmation } from "@/app/actions/auth";

export function ResendConfirmationForm({ setupRequired = false }: { setupRequired?: boolean }) {
  const [result, setResult] = useState<{ error?: string; notice?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setResult(await resendSignupConfirmation({ email: formData.get("email"), role: formData.get("role") }));
    setBusy(false);
  }

  return <form action={submit} className="mt-7 space-y-4">
    {setupRequired && <p role="status" className="rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#7c5b16]">Hubungkan Supabase melalui <code>.env.local</code> untuk mengirim email konfirmasi.</p>}
    <label className="block text-xs font-semibold">Alamat email<input type="email" name="email" required autoComplete="email" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] px-4 text-sm outline-none focus:border-[var(--brand)]" /></label>
    <label className="block text-xs font-semibold">Daftar sebagai<select name="role" defaultValue="mentee" className="mt-2 min-h-12 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm"><option value="mentee">Peserta bimbingan</option><option value="mentor">Mentor</option></select></label>
    {result?.error && <p role="alert" className="text-xs text-red-700">{result.error}</p>}
    {result?.notice && <p role="status" className="rounded-xl bg-[#edf4ff] p-3 text-xs leading-5 text-[var(--brand)]">{result.notice}</p>}
    <button disabled={busy || setupRequired} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Mengirim…" : "Kirim ulang email"}</button>
  </form>;
}
