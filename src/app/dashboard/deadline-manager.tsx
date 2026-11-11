"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Pencil, Trash2, X, Check } from "lucide-react";
import { upsertDeadline, deleteDeadline } from "@/lib/actions/deadline-actions";

type Semester = "1st" | "2nd" | "Summer";

type DeadlineEntry = {
  deadline_date: string;
  label: string | null;
} | null;

type Props = {
  schoolYear: string;
  deadlines: Record<Semester, DeadlineEntry>;
};

const SEMESTERS: Semester[] = ["1st", "2nd", "Summer"];
const SEM_LABEL: Record<Semester, string> = {
  "1st": "1st Semester",
  "2nd": "2nd Semester",
  "Summer": "Summer",
};

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function urgencyColor(days: number) {
  if (days < 0) return "#dc2626";
  if (days <= 7) return "#d97706";
  return "#16a34a";
}

function SemRow({
  sem,
  schoolYear,
  entry,
}: {
  sem: Semester;
  schoolYear: string;
  entry: DeadlineEntry;
}) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(entry?.deadline_date ?? "");
  const [label, setLabel] = useState(entry?.label ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openEdit() {
    setDate(entry?.deadline_date ?? "");
    setLabel(entry?.label ?? "");
    setError("");
    setEditing(true);
  }

  function handleSave() {
    if (!date) { setError("Please pick a date."); return; }
    setError("");
    startTransition(async () => {
      try {
        await upsertDeadline(schoolYear, sem, date, label || null);
        setEditing(false);
      } catch {
        setError("Failed to save. Try again.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteDeadline(schoolYear, sem);
        setEditing(false);
        setDate("");
        setLabel("");
      } catch {
        setError("Failed to delete.");
      }
    });
  }

  const days = entry ? daysLeft(entry.deadline_date) : null;
  const color = days !== null ? urgencyColor(days) : "#9ca3af";

  return (
    <div className="py-3.5 border-b last:border-0" style={{ borderColor: "var(--ou-divider)" }}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold w-28 shrink-0" style={{ color: "var(--ou-heading)" }}>{SEM_LABEL[sem]}</span>

        {!editing && !entry && (
          <span className="flex-1 text-[12px]" style={{ color: "var(--ou-muted)" }}>No deadline set</span>
        )}
        {!editing && entry && (
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <span className="text-[13px] font-semibold" style={{ color }}>
              {new Date(entry.deadline_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {entry.label && (
              <span className="text-[11.5px] truncate" style={{ color: "var(--ou-muted)" }}>{entry.label}</span>
            )}
            <span className="text-[12px] font-medium shrink-0" style={{ color }}>
              {days === null ? "" : days < 0 ? "Overdue" : days === 0 ? "Today" : `${days}d left`}
            </span>
          </div>
        )}

        {editing && (
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 px-3 py-1.5 text-[13px] rounded-lg border focus:outline-none focus:ring-2 focus:ring-[rgba(122,19,48,0.15)]"
                style={{ borderColor: "var(--ou-card-border)", background: "var(--ou-input-bg, var(--ou-card-bg))", color: "var(--ou-heading)" }}
              />
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional)"
                className="flex-1 px-3 py-1.5 text-[13px] rounded-lg border focus:outline-none focus:ring-2 focus:ring-[rgba(122,19,48,0.15)]"
                style={{ borderColor: "var(--ou-card-border)", background: "var(--ou-input-bg, var(--ou-card-bg))", color: "var(--ou-heading)" }}
              />
            </div>
            {error && <p className="text-[12px] text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-white rounded-lg disabled:opacity-60"
                style={{ background: "#7A1330" }}
              >
                <Check size={12} />{isPending ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors dark:hover:bg-white/10"
                style={{ borderColor: "var(--ou-card-border)", color: "var(--ou-subtext)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={openEdit} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--ou-row-hover)]" title="Set / edit">
              <Pencil size={12} style={{ color: "#64748b" }} />
            </button>
            {entry && (
              <button onClick={handleDelete} disabled={isPending} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Remove">
                <Trash2 size={12} style={{ color: "#ef4444" }} />
              </button>
            )}
          </div>
        )}
        {editing && (
          <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--ou-row-hover)] shrink-0">
            <X size={12} style={{ color: "#64748b" }} />
          </button>
        )}
      </div>
    </div>
  );
}

export function DeadlineManager({ schoolYear, deadlines }: Props) {
  return (
    <div className="ou-card rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={16} style={{ color: "var(--ou-accent)" }} />
        <h3 className="text-[14px] font-bold" style={{ color: "var(--ou-heading)" }}>Submission Deadlines</h3>
        <span className="text-[12px]" style={{ color: "var(--ou-muted)" }}>SY {schoolYear}</span>
      </div>
      <div>
        {SEMESTERS.map((sem) => (
          <SemRow key={sem} sem={sem} schoolYear={schoolYear} entry={deadlines[sem]} />
        ))}
      </div>
    </div>
  );
}
