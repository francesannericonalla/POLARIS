-- ============================================================
-- Add remaining academic colleges and their departments.
-- Run this against the live database once.
-- Colleges added:
--   2. College of Management, Business & Accountancy (CMBA)
--   3. College of Arts, Sciences & Education (CASE)
--   4. College of Nursing & Allied Health Sciences (CNAHS)
--   5. College of Computer Studies (CCS)
--   6. College of Criminal Justice (CCJ)
-- ============================================================

do $$
declare
  college_id uuid;
  dept_id    uuid;
  dept_name  text;
  i          int;

  academic_folders text[] := array[
    'BUYLO: Accomplishments & Plans',
    'Balance Scorecard',
    'Accreditation Documents',
    'SDG Aligned Projects',
    'Faculty Evaluation',
    'Research Undertakings',
    'ISO Documents'
  ];

  -- CMBA programs
  cmba_depts text[] := array[
    'BS Accountancy',
    'BS Accounting Information Systems',
    'BS Management Accounting',
    'BS Business Administration',
    'BS Hospitality Management',
    'BS Tourism Management',
    'BS Office Administration',
    'Bachelor in Public Administration'
  ];

  -- CASE programs
  case_depts text[] := array[
    'AB Communication',
    'AB English Language with Applied Linguistics',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education',
    'Bachelor of Multimedia Arts',
    'BS Biology',
    'BS Math with Applied Industrial Mathematics',
    'BS Psychology',
    'Bachelor of Special Needs Education'
  ];

  -- CNAHS programs
  cnahs_depts text[] := array[
    'BS Nursing',
    'BS Pharmacy',
    'BS Medical Technology'
  ];

  -- CCS programs
  ccs_depts text[] := array[
    'BS Information Technology',
    'BS Computer Science'
  ];

  -- CCJ programs
  ccj_depts text[] := array[
    'BS Criminology'
  ];

begin
  -- ── College of Management, Business & Accountancy (sort_order 2) ──
  insert into units (name, type, branch, sort_order)
    values ('College of Management, Business & Accountancy', 'college', 'academics', 2)
    returning id into college_id;

  i := 1;
  foreach dept_name in array cmba_depts loop
    insert into units (name, type, branch, parent_id, sort_order)
      values (dept_name, 'department', 'academics', college_id, i)
      returning id into dept_id;
    insert into folders (unit_id, name, sort_order)
      select dept_id, f, row_number() over ()
      from unnest(academic_folders) as f;
    i := i + 1;
  end loop;

  -- ── College of Arts, Sciences & Education (sort_order 3) ──
  insert into units (name, type, branch, sort_order)
    values ('College of Arts, Sciences & Education', 'college', 'academics', 3)
    returning id into college_id;

  i := 1;
  foreach dept_name in array case_depts loop
    insert into units (name, type, branch, parent_id, sort_order)
      values (dept_name, 'department', 'academics', college_id, i)
      returning id into dept_id;
    insert into folders (unit_id, name, sort_order)
      select dept_id, f, row_number() over ()
      from unnest(academic_folders) as f;
    i := i + 1;
  end loop;

  -- ── College of Nursing & Allied Health Sciences (sort_order 4) ──
  insert into units (name, type, branch, sort_order)
    values ('College of Nursing & Allied Health Sciences', 'college', 'academics', 4)
    returning id into college_id;

  i := 1;
  foreach dept_name in array cnahs_depts loop
    insert into units (name, type, branch, parent_id, sort_order)
      values (dept_name, 'department', 'academics', college_id, i)
      returning id into dept_id;
    insert into folders (unit_id, name, sort_order)
      select dept_id, f, row_number() over ()
      from unnest(academic_folders) as f;
    i := i + 1;
  end loop;

  -- ── College of Computer Studies (sort_order 5) ──
  insert into units (name, type, branch, sort_order)
    values ('College of Computer Studies', 'college', 'academics', 5)
    returning id into college_id;

  i := 1;
  foreach dept_name in array ccs_depts loop
    insert into units (name, type, branch, parent_id, sort_order)
      values (dept_name, 'department', 'academics', college_id, i)
      returning id into dept_id;
    insert into folders (unit_id, name, sort_order)
      select dept_id, f, row_number() over ()
      from unnest(academic_folders) as f;
    i := i + 1;
  end loop;

  -- ── College of Criminal Justice (sort_order 6) ──
  insert into units (name, type, branch, sort_order)
    values ('College of Criminal Justice', 'college', 'academics', 6)
    returning id into college_id;

  i := 1;
  foreach dept_name in array ccj_depts loop
    insert into units (name, type, branch, parent_id, sort_order)
      values (dept_name, 'department', 'academics', college_id, i)
      returning id into dept_id;
    insert into folders (unit_id, name, sort_order)
      select dept_id, f, row_number() over ()
      from unnest(academic_folders) as f;
    i := i + 1;
  end loop;

end $$;
