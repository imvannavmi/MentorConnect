import { z } from "zod";

export const emailSchema = z.string().trim().email("Masukkan alamat email yang valid.").max(254, "Alamat email terlalu panjang.");
export const passwordSchema = z.string().min(10, "Kata sandi harus terdiri dari minimal 10 karakter.").max(128, "Kata sandi maksimal 128 karakter.");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Nama harus terdiri dari minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["mentee", "mentor"]),
});

export const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Kata sandi tidak sama.",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Kata sandi wajib diisi.").max(128, "Kata sandi maksimal 128 karakter.") });
export const forgotPasswordSchema = z.object({ email: emailSchema });

export const sessionRequestSchema = z.object({
  mentorId: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  topic: z.string().trim().min(3, "Topik harus terdiri dari minimal 3 karakter.").max(120, "Topik maksimal 120 karakter."),
  message: z.string().trim().max(2000, "Catatan maksimal 2.000 karakter.").optional(),
}).refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), {
  message: "Waktu selesai harus setelah waktu mulai.",
  path: ["endsAt"],
});

export const sessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.enum(["approve", "reject", "reschedule"]),
  responseNote: z.string().trim().max(1000, "Catatan maksimal 1.000 karakter.").optional(),
  proposedStartsAt: z.string().datetime({ offset: true }).optional(),
  meetingUrl: z.union([z.string().url("Masukkan tautan yang valid.").refine((value) => value.startsWith("https://"), "Tautan harus menggunakan HTTPS."), z.literal("")]).optional(),
  materialUrl: z.union([z.string().url("Masukkan tautan yang valid.").refine((value) => value.startsWith("https://"), "Tautan harus menggunakan HTTPS."), z.literal("")]).optional(),
}).refine((value) => value.action !== "reject" || Boolean(value.responseNote?.length), {
  message: "Tuliskan alasan singkat saat menolak permintaan.",
  path: ["responseNote"],
}).refine((value) => value.action !== "reschedule" || Boolean(value.proposedStartsAt), {
  message: "Pilih waktu usulan.",
  path: ["proposedStartsAt"],
});

export const sessionDecisionSchema = z.object({
  sessionId: z.string().uuid(),
  action: z.enum(["confirm", "cancel"]),
});

export const reviewSchema = z.object({
  sessionId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(3).max(2000),
});

export const notificationReadSchema = z.object({ id: z.string().uuid() });

export const mentorProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Nama harus terdiri dari minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
  professionalTitle: z.string().trim().min(3, "Jabatan harus terdiri dari minimal 3 karakter.").max(140, "Jabatan maksimal 140 karakter."),
  bio: z.string().trim().min(20, "Bio harus terdiri dari minimal 20 karakter.").max(5000, "Bio maksimal 5.000 karakter."),
  experienceYears: z.number().int("Masukkan jumlah tahun dalam angka bulat.").min(0, "Pengalaman tidak boleh negatif.").max(80, "Pengalaman maksimal 80 tahun.").nullable(),
  portfolioUrl: z.union([z.string().url("Masukkan tautan portofolio yang valid."), z.literal("")]),
  hourlyRate: z.number().min(0, "Tarif tidak boleh negatif.").max(100000, "Tarif maksimal 100.000.").nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  isPublished: z.boolean(),
  skillIds: z.array(z.string().uuid()).max(20),
  categoryIds: z.array(z.string().uuid()).max(8),
}).refine((value) => !value.isPublished || (value.bio.length >= 60 && value.skillIds.length > 0 && value.categoryIds.length > 0), {
  message: "Lengkapi bio, pilih minimal satu keahlian dan satu kategori sebelum menerbitkan profil.",
  path: ["isPublished"],
});

export const menteeProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(3000, "Bio maksimal 3.000 karakter."),
  learningInterests: z.array(z.string().trim().min(1, "Minat belajar tidak boleh kosong.").max(60, "Setiap minat maksimal 60 karakter.")).max(20, "Pilih maksimal 20 minat belajar."),
  socialLinks: z.object({
    linkedin: z.union([z.string().url("Masukkan tautan LinkedIn yang valid."), z.literal("")]),
    github: z.union([z.string().url("Masukkan tautan GitHub yang valid."), z.literal("")]),
    website: z.union([z.string().url("Masukkan tautan situs web yang valid."), z.literal("")]),
  }),
});

export const availabilitySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startsAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Masukkan waktu mulai yang valid."),
  endsAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Masukkan waktu selesai yang valid."),
  timezone: z.string().min(1).max(80),
}).refine((value) => value.endsAt > value.startsAt, { message: "Waktu selesai harus setelah waktu mulai.", path: ["endsAt"] });

export const availabilityIdSchema = z.object({ id: z.string().uuid() });
