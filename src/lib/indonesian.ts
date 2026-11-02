const taxonomyTranslations: Record<string, string> = {
  "Software Engineering": "Rekayasa Perangkat Lunak",
  "Product & Design": "Produk & Desain",
  "Career Growth": "Pengembangan Karier",
  Leadership: "Kepemimpinan",
  "Data & AI": "Data & Kecerdasan Buatan",
  Entrepreneurship: "Kewirausahaan",
  "Backend Engineering": "Rekayasa Backend",
  "System Design": "Desain Sistem",
  "Product Strategy": "Strategi Produk",
  "UX Research": "Riset Pengalaman Pengguna",
  "Interaction Design": "Desain Interaksi",
  "Portfolio Reviews": "Tinjauan Portofolio",
  "Interview Preparation": "Persiapan Wawancara",
  "Career Transitions": "Transisi Karier",
  "Public Speaking": "Berbicara di Depan Umum",
  "Team Leadership": "Kepemimpinan Tim",
  "Data Analysis": "Analisis Data",
  "Machine Learning": "Pembelajaran Mesin",
  "Business Planning": "Perencanaan Bisnis",
};

export function indonesianTaxonomyLabel(value: string) {
  return taxonomyTranslations[value] ?? value;
}

const timezoneTranslations: Record<string, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
  "Asia/Singapore": "Waktu Singapura",
  "Europe/London": "Waktu London",
  "America/New_York": "Waktu New York",
  UTC: "UTC",
};

export function indonesianTimezoneLabel(value: string) {
  return timezoneTranslations[value] ?? value;
}
