"use client";

import { useState } from "react";
import Link from "next/link";

const GOLD = "#c9a84c";

type Department = { id: string; name: string };
type College = { id: string; name: string; departments: Department[] };
type Office = { id: string; name: string };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CollegeAccordion({
  college,
  activeUnitId,
  linkPrefix,
}: {
  college: College;
  activeUnitId?: string;
  linkPrefix: string;
}) {
  const hasActive = college.departments.some((d) => d.id === activeUnitId);
  const [open, setOpen] = useState(hasActive);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 transition-colors text-left hover:bg-white/[0.05]"
        style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, fontWeight: 500 }}
      >
        <span className="truncate flex-1 min-w-0">{college.name}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div>
          {college.departments.map((dept) => {
            const active = activeUnitId === dept.id;
            return (
              <Link
                key={dept.id}
                href={`${linkPrefix}/${dept.id}`}
                title={dept.name}
                className={`flex items-center pl-8 pr-4 py-2 w-full transition-colors text-[12.5px] truncate ${
                  active
                    ? "text-white font-bold bg-white/[0.13]"
                    : "text-white/60 hover:text-white/85 hover:bg-white/[0.05]"
                }`}
                style={{ borderLeft: active ? `2px solid ${GOLD}` : "2px solid transparent" }}
              >
                <span className="truncate">{dept.name}</span>
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
  linkPrefix = "/repository",
}: {
  academics: College[];
  administration: Office[];
  activeUnitId?: string;
  linkPrefix?: string;
}) {
  const adminHasActive = administration.some((o) => o.id === activeUnitId);

  const [academicsOpen, setAcademicsOpen] = useState<boolean>(true);
  const [adminOpen, setAdminOpen] = useState<boolean>(adminHasActive);

  return (
    <div className="pb-8">

      {/* ── Academics ── */}
      <button
        onClick={() => setAcademicsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 transition-colors hover:bg-white/[0.04]"
        style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}
      >
        <span>Academics</span>
        <ChevronIcon open={academicsOpen} />
      </button>

      {academicsOpen && (
        <div className="mb-2">
          {academics.map((college) => (
            <CollegeAccordion
              key={college.id}
              college={college}
              activeUnitId={activeUnitId}
              linkPrefix={linkPrefix}
            />
          ))}
        </div>
      )}

      {/* ── Administration ── */}
      <button
        onClick={() => setAdminOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2 transition-colors hover:bg-white/[0.04]"
        style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}
      >
        <span>Administration</span>
        <ChevronIcon open={adminOpen} />
      </button>

      {adminOpen && (
        <div className="mb-2">
          {administration.map((office) => {
            const active = activeUnitId === office.id;
            return (
              <Link
                key={office.id}
                href={`${linkPrefix}/${office.id}`}
                title={office.name}
                className={`flex items-center pl-8 pr-4 py-2 w-full transition-colors text-[12.5px] ${
                  active
                    ? "text-white font-bold bg-white/[0.13]"
                    : "text-white/60 hover:text-white/85 hover:bg-white/[0.05]"
                }`}
                style={{ borderLeft: active ? `2px solid ${GOLD}` : "2px solid transparent" }}
              >
                <span className="truncate">{office.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
