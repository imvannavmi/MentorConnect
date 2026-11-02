"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menteeProfileSchema } from "@/lib/validation/auth";
import { saveMenteeProfile } from "@/app/actions/profiles";
import type { z } from "zod";

type MenteeValues = z.infer<typeof menteeProfileSchema>;

export function MenteeProfileForm({ initial }: { initial: MenteeValues }) {
  const [result, setResult] = useState<{ error?: string; notice?: string } | null>(null);
  const form = useForm<MenteeValues>({ resolver: zodResolver(menteeProfileSchema), defaultValues: initial });
  const interests = useWatch({ control: form.control, name: "learningInterests" });

  async function onSubmit(values: MenteeValues) {
    setResult(null);
    setResult(await saveMenteeProfile(values));
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
    <label className="block text-xs font-semibold">Nama lengkap<input {...form.register("fullName")} maxLength={100} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" />{form.formState.errors.fullName && <span className="mt-1 block text-xs text-red-700">Nama harus berisi 2–100 karakter.</span>}</label>
    <label className="block text-xs font-semibold">Tentang dirimu<textarea {...form.register("bio")} rows={5} maxLength={3000} placeholder="Apa yang sedang kamu pelajari dan dukungan seperti apa yang kamu butuhkan?" className="mt-2 w-full rounded-xl border border-[var(--line)] p-3 text-sm leading-6" /></label>
    <label className="block text-xs font-semibold">Minat belajar <span className="font-normal text-[var(--muted)]">(pisahkan dengan koma)</span><input value={(interests ?? []).join(", ")} onChange={(event) => form.setValue("learningInterests", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Strategi produk, berbicara di depan umum" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" /></label>
    <fieldset className="grid gap-4 sm:grid-cols-3"><legend className="mb-3 text-xs font-semibold">Tautan sosial <span className="font-normal text-[var(--muted)]">(opsional)</span></legend>{(["linkedin", "github", "website"] as const).map((key) => <label key={key} className="text-xs font-semibold capitalize">{key}<input type="url" {...form.register(`socialLinks.${key}`)} placeholder="https://" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" />{form.formState.errors.socialLinks?.[key] && <span className="mt-1 block text-[10px] text-red-700">Masukkan alamat lengkap.</span>}</label>)}</fieldset>
    {result?.error && <p role="alert" className="text-xs text-red-700">{result.error}</p>}{result?.notice && <p role="status" className="text-xs text-[var(--brand)]">{result.notice}</p>}
    <button disabled={form.formState.isSubmitting} className="button-primary disabled:opacity-50">{form.formState.isSubmitting ? "Menyimpan…" : "Simpan profil"}</button>
  </form>;
}
