"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mentorProfileSchema } from "@/lib/validation/auth";
import { saveMentorProfile } from "@/app/actions/profiles";
import { indonesianTaxonomyLabel } from "@/lib/indonesian";
import type { z } from "zod";

type MentorProfileValues = z.infer<typeof mentorProfileSchema>;
type Option = { id: string; name: string };

export function MentorProfileForm({
  initial,
  skills,
  categories,
}: {
  initial: MentorProfileValues;
  skills: Option[];
  categories: Option[];
}) {
  const [result, setResult] = useState<{ error?: string; notice?: string } | null>(null);
  const form = useForm<MentorProfileValues>({ resolver: zodResolver(mentorProfileSchema), defaultValues: initial });

  async function onSubmit(values: MentorProfileValues) {
    setResult(null);
    setResult(await saveMentorProfile(values));
  }

  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <section className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-semibold">Nama lengkap<input {...form.register("fullName")} maxLength={100} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.fullName && <span className="mt-1 block text-xs text-red-700">Nama harus berisi 2–100 karakter.</span>}</label>
      <label className="text-xs font-semibold">Jabatan profesional<input {...form.register("professionalTitle")} maxLength={140} placeholder="contoh: Lead Product Designer" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm outline-none focus:border-[var(--brand)]" />{form.formState.errors.professionalTitle && <span className="mt-1 block text-xs text-red-700">Jabatan minimal 3 karakter.</span>}</label>
    </section>
    <label className="block text-xs font-semibold">Tentang dirimu<textarea {...form.register("bio")} maxLength={5000} rows={6} placeholder="Ceritakan pengalaman, cara kamu membimbing, dan siapa yang bisa kamu bantu…" className="mt-2 w-full rounded-xl border border-[var(--line)] p-3 text-sm leading-6 outline-none focus:border-[var(--brand)]" />{form.formState.errors.bio && <span className="mt-1 block text-xs text-red-700">Tulis minimal 20 karakter. Profil publik membutuhkan minimal 60 karakter.</span>}</label>
    <section className="grid gap-4 sm:grid-cols-3">
      <label className="text-xs font-semibold">Pengalaman (tahun)<input type="number" min={0} max={80} {...form.register("experienceYears", { setValueAs: (value: string) => value === "" ? null : Number(value) })} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" /></label>
      <label className="text-xs font-semibold">Tarif sesi <span className="font-normal text-[var(--muted)]">(opsional)</span><input type="number" min={0} max={100000} step="0.01" {...form.register("hourlyRate", { setValueAs: (value: string) => value === "" ? null : Number(value) })} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" /></label>
      <label className="text-xs font-semibold">Mata uang<select {...form.register("currency")} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm"><option value="USD">USD</option><option value="IDR">IDR</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></label>
    </section>
    <label className="block text-xs font-semibold">Portofolio atau situs web <span className="font-normal text-[var(--muted)]">(opsional)</span><input type="url" {...form.register("portfolioUrl")} placeholder="https://situsmu.id" className="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm" />{form.formState.errors.portfolioUrl && <span className="mt-1 block text-xs text-red-700">Masukkan alamat lengkap yang diawali https://.</span>}</label>
    <fieldset><legend className="text-xs font-semibold">Keahlian <span className="font-normal text-[var(--muted)]">Pilih maksimal 20</span></legend>{skills.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{skills.map((skill) => <label key={skill.id} className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-3 text-xs"><input type="checkbox" value={skill.id} {...form.register("skillIds")} />{indonesianTaxonomyLabel(skill.name)}</label>)}</div> : <p className="mt-3 rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#7c5b16]">Daftar keahlian belum tersedia. Jalankan <code>supabase/seed.sql</code> melalui Editor SQL Supabase setelah migrasi database selesai.</p>}</fieldset>
    <fieldset><legend className="text-xs font-semibold">Bidang pendampingan <span className="font-normal text-[var(--muted)]">Pilih maksimal 8</span></legend>{categories.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-3 text-xs"><input type="checkbox" value={category.id} {...form.register("categoryIds")} />{indonesianTaxonomyLabel(category.name)}</label>)}</div> : <p className="mt-3 rounded-xl bg-[#fff6df] p-3 text-xs leading-5 text-[#7c5b16]">Bidang pendampingan belum tersedia. Jalankan <code>supabase/seed.sql</code> melalui Editor SQL Supabase setelah migrasi database selesai.</p>}</fieldset>
    <label className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-white p-4"><input type="checkbox" {...form.register("isPublished")} className="mt-0.5" /><span><span className="block text-xs font-bold">Tampilkan profil di pencarian mentor</span><span className="mt-1 block text-[11px] leading-5 text-[var(--muted)]">Publikasi membutuhkan bio minimal 60 karakter, satu keahlian, dan satu kategori.</span></span></label>
    {form.formState.errors.isPublished && <p className="text-xs text-red-700">{form.formState.errors.isPublished.message}</p>}
    {result?.error && <p role="alert" className="text-xs text-red-700">{result.error}</p>}{result?.notice && <p role="status" className="text-xs text-[var(--brand)]">{result.notice}</p>}
    <button disabled={form.formState.isSubmitting} className="button-primary disabled:opacity-50">{form.formState.isSubmitting ? "Menyimpan…" : "Simpan profil mentor"}</button>
  </form>;
}
