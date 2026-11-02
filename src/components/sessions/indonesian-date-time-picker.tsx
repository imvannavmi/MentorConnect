"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parseDate = (value: string) => value ? new Date(`${value.slice(0, 10)}T00:00:00`) : new Date();

export function IndonesianDateTimePicker({ value, onChange, id }: { value: string; onChange: (value: string) => void; id: string }) {
  const [month, setMonth] = useState(() => {
    const date = parseDate(value);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const selectedDate = value.slice(0, 10);
  const selectedTime = value.slice(11, 16);
  const selectedHour = selectedTime.slice(0, 2);
  const selectedMinute = selectedTime.slice(3, 5);
  const today = dateKey(new Date());

  useEffect(() => {
    if (!selectedDate) return;
    const selected = parseDate(selectedDate);
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selectedDate]);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarCells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(month);

  function chooseDate(day: number) {
    const chosen = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
    onChange(`${chosen}T${selectedTime || "09:00"}`);
  }

  function changeTime(hour: string, minute: string) {
    onChange(`${selectedDate || today}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`);
  }

  return <div id={id} className="mt-2 rounded-xl border border-[var(--line)] bg-white p-3" lang="id">
    <div className="flex items-center justify-between gap-3">
      <button type="button" aria-label="Bulan sebelumnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid size-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:bg-[#f6f8fc]"><ChevronLeft size={16} /></button>
      <p className="text-sm font-semibold capitalize">{monthLabel}</p>
      <button type="button" aria-label="Bulan berikutnya" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid size-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--muted)] hover:bg-[#f6f8fc]"><ChevronRight size={16} /></button>
    </div>
    <div role="grid" aria-label={`Kalender ${monthLabel}`} className="mt-3 grid grid-cols-7 gap-1 text-center">
      {weekdays.map((day) => <span key={day} role="columnheader" className="py-1 text-[10px] font-semibold text-[var(--muted)]">{day}</span>)}
      {calendarCells.map((day, index) => day === null
        ? <span key={`kosong-${index}`} aria-hidden="true" />
        : <button key={day} type="button" role="gridcell" aria-pressed={selectedDate === dateKey(new Date(month.getFullYear(), month.getMonth(), day))} aria-label={new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date(month.getFullYear(), month.getMonth(), day))} disabled={dateKey(new Date(month.getFullYear(), month.getMonth(), day)) < today} onClick={() => chooseDate(day)} className={`grid aspect-square place-items-center rounded-lg text-xs transition disabled:cursor-not-allowed disabled:text-[#c5cad3] ${selectedDate === dateKey(new Date(month.getFullYear(), month.getMonth(), day)) ? "bg-[var(--brand)] font-bold text-white" : "text-[var(--ink)] hover:bg-[var(--brand-soft)]"}`}>{day}</button>)}
    </div>
    <p className="mt-4 text-xs font-semibold">Waktu mulai <span className="font-normal text-[var(--muted)]">(format 24 jam)</span></p>
    <div className="mt-2 grid grid-cols-2 gap-2">
      <label htmlFor={`${id}-hour`} className="sr-only">Jam, 00 sampai 23</label>
      <select id={`${id}-hour`} aria-label="Jam, format 24 jam" value={selectedHour} onChange={(event) => changeTime(event.target.value, selectedMinute || "00")} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm">
        {!selectedHour && <option value="">Jam</option>}{Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0")).map((hour) => <option key={hour} value={hour}>{hour}</option>)}
      </select>
      <label htmlFor={`${id}-minute`} className="sr-only">Menit, 00 sampai 59</label>
      <select id={`${id}-minute`} aria-label="Menit" value={selectedMinute} onChange={(event) => changeTime(selectedHour || "09", event.target.value)} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm">
        {!selectedMinute && <option value="">Menit</option>}{Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0")).map((minute) => <option key={minute} value={minute}>{minute}</option>)}
      </select>
    </div>
    {selectedDate && <p className="mt-2 text-[11px] text-[var(--muted)]">Dipilih: {new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(parseDate(selectedDate))}{selectedTime ? `, pukul ${selectedTime}` : ""}</p>}
  </div>;
}
