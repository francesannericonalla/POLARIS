"use client";

import { useState } from "react";
import Link from "next/link";

type Department = { id: string; name: string };
type College = { id: string; name: string; departments: Department[] };
type Office = { id: string; name: string };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CollegeAccordion({
  college,
  activeUnitId,
}: {
  college: College;
  activeUnitId?: string;
}) {
  const hasActive = college.departments.some((d) => d.id === activeUnitId);
  const [open, setOpen] = useState(hasActive);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 pl-4 pr-3 py-1.5 text-[11px] font-semibold text-white/40 hover:text-white/70 transition-colors min-w-0"
      >
        <span className="truncate text-left flex-1 min-w-0">{college.name}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="pb-1">
          {college.departments.map((dept) => {
            const active = activeUnitId === dept.id;
            return (
              <Link
                key={dept.id}
                href={`/repository/${dept.id}`}
                title={dept.name}
                className={`flex items-center gap-0 pl-6 pr-3 py-1.5 text-[12px] border-l-2 transition-colors min-w-0 ${
                  active
                    ? "border-gold text-white font-semibold bg-white/10"
                    : "border-transparent text-white/55 hover:text-white/85 hover:bg-white/5"
                }`}
              >
                <span className="truncate min-w-0 w-full">{dept.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SidebarTree({
  academics,
  administration,
  activeUnitId,
}: {
  academics: College[];
  administration: Office[];
  activeUnitId?: string;
}) {
  const adminHasActive = administration.some((o) => o.id === activeUnitId);
  const academicsHasActive = academics.some((c) =>
    c.departments.some((d) => d.id === activeUnitId)
  );

  const [academicsOpen, setAcademicsOpen] = useState(academicsHasActive);
  const [adminOpen, setAdminOpen] = useState(adminHasActive);

  return (
    <div className="pb-8">
      {/* Academics section */}
      <div className="pt-4">
        <button
          onClick={() => setAcademicsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 pb-1.5 text-[10px] font-bold text-gold uppercase tracking-widest hover:text-gold/80 transition-colors"
        >
          <span>Academics</span>
          <ChevronIcon open={academicsOpen} />
        </button>
        {academicsOpen && (
          <div>
            {academics.map((college) => (
              <CollegeAccordion
                key={college.id}
                college={college}
                activeUnitId={activeUnitId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Administration section */}
      <div className="pt-4">
        <button
          onClick={() => setAdminOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 pb-1.5 text-[10px] font-bold text-gold uppercase tracking-widest hover:text-gold/80 transition-colors"
        >
          <span>Administration</span>
          <ChevronIcon open={adminOpen} />
        </button>
        {adminOpen && (
          <div>
            {administration.map((office) => {
              const active = activeUnitId === office.id;
              return (
                <Link
                  key={office.id}
                  href={`/repository/${office.id}`}
                  title={office.name}
                  className={`flex items-center pl-4 pr-3 py-1.5 text-[12px] border-l-2 transition-colors min-w-0 ${
                    active
                      ? "border-gold text-white font-semibold bg-white/10"
                      : "border-transparent text-white/55 hover:text-white/85 hover:bg-white/5"
                  }`}
                >
                  <span className="truncate min-w-0 w-full">{office.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
