"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Building2 } from "lucide-react";

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
  light = false,
}: {
  college: College;
  activeUnitId?: string;
  linkPrefix: string;
  light?: boolean;
}) {
  const hasActive = college.departments.some((d) => d.id === activeUnitId);
  const [open, setOpen] = useState(hasActive);

  const collegeLabelStyle = light
    ? { color: "#64748b", fontSize: 12.5, fontWeight: 500 }
    : { color: "rgba(255,255,255,0.55)", fontSize: 12.5, fontWeight: 500 };
  const collegeHover = light ? "hover:bg-slate-50" : "hover:bg-white/[0.05]";
  const deptActive = light
    ? "text-[#7A1330] font-semibold bg-[rgba(122,19,48,0.07)]"
    : "text-white font-bold bg-white/[0.13]";
  const deptInactive = light
    ? "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
    : "text-white/60 hover:text-white/85 hover:bg-white/[0.05]";
  const activeBorder = light ? "#7A1330" : GOLD;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-2 transition-colors text-left ${collegeHover}`}
        style={collegeLabelStyle}
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
                  active ? deptActive : deptInactive
                }`}
                style={{ borderLeft: active ? `2px solid ${activeBorder}` : "2px solid transparent" }}
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
  light = false,
}: {
  academics: College[];
  administration: Office[];
  activeUnitId?: string;
  linkPrefix?: string;
  light?: boolean;
}) {
  const adminHasActive = administration.some((o) => o.id === activeUnitId);
  const academicsHasActive = academics.some((c) => c.departments.some((d) => d.id === activeUnitId));

  const [academicsOpen, setAcademicsOpen] = useState<boolean>(academicsHasActive);
  const [adminOpen, setAdminOpen] = useState<boolean>(adminHasActive);

  const sectionLabelStyle = light
    ? { color: "#94a3b8", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em" }
    : { color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" };

  const sectionHover = light ? "hover:bg-slate-50" : "hover:bg-white/[0.04]";
  const deptActive = light
    ? "text-[#7A1330] font-semibold bg-[rgba(122,19,48,0.07)]"
    : "text-white font-bold bg-white/[0.13]";
  const deptInactive = light
    ? "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
    : "text-white/60 hover:text-white/85 hover:bg-white/[0.05]";
  const activeBorder = light ? "#7A1330" : GOLD;

  return (
    <div className="pb-8">

      {/* ── Academics ── */}
      <button
        onClick={() => setAcademicsOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-2 transition-colors text-left ${sectionHover}`}
        style={sectionLabelStyle}
      >
        <span className="flex items-center gap-2">
          <GraduationCap className="w-[15px] h-[15px] shrink-0 opacity-75" />
          <span>Academics</span>
        </span>
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
              light={light}
            />
          ))}
        </div>
      )}

      {/* ── Administration ── */}
      <button
        onClick={() => setAdminOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-2 transition-colors text-left ${sectionHover}`}
        style={sectionLabelStyle}
      >
        <span className="flex items-center gap-2">
          <Building2 className="w-[15px] h-[15px] shrink-0 opacity-75" />
          <span>Administration</span>
        </span>
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
                  active ? deptActive : deptInactive
                }`}
                style={{ borderLeft: active ? `2px solid ${activeBorder}` : "2px solid transparent" }}
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
