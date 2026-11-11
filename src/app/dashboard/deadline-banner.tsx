"use client";

import { CalendarDays, AlertTriangle, Clock } from "lucide-react";

type DeadlineItem = {
  semester: "1st" | "2nd" | "Summer";
  deadline_date: string;
  label: string | null;
};

type Props = {
  deadlines: DeadlineItem[];
  schoolYear: string;
};

const SEM_LABEL: Record<string, string> = {
  "1st": "1st Semester",
  "2nd": "2nd Semester",
  "Summer": "Summer",
};

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export function DeadlineBanner({ deadlines, schoolYear }: Props) {
  if (deadlines.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--ou-card-border)" }}>
      {deadlines.map((d, i) => {
        const days = daysLeft(d.deadline_date);
        const overdue = days < 0;
        const urgent = !overdue && days <= 7;

        const bg = overdue ? "rgba(220,38,38,0.06)" : urgent ? "rgba(217,119,6,0.06)" : "rgba(21,128,61,0.06)";
        const color = overdue ? "#dc2626" : urgent ? "#d97706" : "#15803d";
        const Icon = overdue ? AlertTriangle : urgent ? Clock : CalendarDays;

        const dateLabel = new Date(d.deadline_date).toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric",
        });
        const countdownText = overdue
          ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`
          : days === 0 ? "Due today!"
          : `${days} day${days !== 1 ? "s" : ""} remaining`;

        return (
          <div
            key={d.semester}
            className="flex items-center gap-4 px-5 py-3.5"
            style={{
              background: bg,
              borderBottom: i < deadlines.length - 1 ? "1px solid var(--ou-divider)" : undefined,
            }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold" style={{ color }}>
                {d.label ?? `${SEM_LABEL[d.semester]} Deadline`}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color }}>
                {dateLabel}
              </p>
            </div>
            <div
              className="shrink-0 px-3 py-1 rounded-xl text-[12px] font-bold"
              style={{ background: color, color: "#fff" }}
            >
              {overdue ? "Overdue" : days === 0 ? "Today" : countdownText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
