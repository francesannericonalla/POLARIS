-- ============================================================
-- POLARIS seed data  (complete — all confirmed colleges)
-- Run AFTER schema.sql.
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
  admin_folders text[] := array[
    'BUYLO: Accomplishments & Plans',
    'Balance Scorecard',
    'Accreditation Documents',
    'SDG Aligned Projects',
    'Office Evaluation',
    'Research Undertaking',
    'ISO Documents'
  ];
  qao_exclusive_folders text[] := array[
    'Gear Up',
    'Blitz Kaizen',
    'USWAG',
    'Ranking: THE Impact Ratings',
    'Ranking: UI GreenMetric',
    'Ranking: WURI',
    'Customer Satisfaction Result',
    'ISO 21001 Internal Audit'
  ];

  -- CEA programs
  cea_depts text[] := array[
    'Architecture Department',
    'Civil Engineering Department',
    'Chemical Engineering Department',
    'Computer Engineering Department',
    'Electrical Engineering Department',
    'Electronics Engineering Department',
    'Industrial Engineering Department',
    'Mechanical Engineering Department',
    'Mining Engineering Department'
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

  admin_office_names text[] := array[
    'AI FAB Lab',
    'Alumni Affairs Office',
    'Athletics Office',
    'Center for E-Learning and Technology Education',
    'Central Visayas Food Innovation Center',
    'Enrollment Technical Office / Information Systems Development',
    'Expanded Tertiary Education Equivalency and Accreditation Program',
    'Finance and Accounting Office',
    'Guidance Center',
    'Human Resource Department',
    'Innovation and Technology Support Office',
    'Instructional Materials and Publication Office',
    'Knowledge & Technology Transfer Office',
    'Learning Resource and Activity Center',
    'Legal and Corporate Attorney''s Office',
    'Management Information System Office',
    'Marketing Office',
    'Medical & Dental Clinic',
    'Multimedia Solutions & Digitalization Office',
    'Network & External University Support Services',
    'Networking & Linkages Office',
    'Office of Admissions & Scholarships',
    'Office of the Community Extension Services & NSTP',
    'Office of the Property Custodian',
    'Quality Assurance Office for Academics',
    'Research & Development Coordinating Office',
    'Safety and Security Department',
    'Student Success Office',
    'Technical Support Group',
    'University Registrar''s Office - College',
    'Wildcat Innovation Labs'
  ];
  office_id uuid;
  office_name text;
  qao_admin_id uuid;
begin
  -- ===================== ACADEMICS =====================

  -- 1. College of Engineering and Architecture
  insert into units (name, type, branch, sort_order)
    values ('College of Engineering and Architecture', 'college', 'academics', 1)
    returning id into college_id;
  i := 1;
  foreach dept_name in array cea_depts loop
    insert into units (name, type, branch, parent_id, sort_order)
      values (dept_name, 'department', 'academics', college_id, i)
      returning id into dept_id;
    insert into folders (unit_id, name, sort_order)
      select dept_id, f, row_number() over ()
      from unnest(academic_folders) as f;
    i := i + 1;
  end loop;

  -- 2. College of Management, Business & Accountancy
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

  -- 3. College of Arts, Sciences & Education
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

  -- 4. College of Nursing & Allied Health Sciences
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

  -- 5. College of Computer Studies
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

  -- 6. College of Criminal Justice
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

  -- ===================== ADMINISTRATION =====================
  i := 1;
  foreach office_name in array admin_office_names loop
    insert into units (name, type, branch, sort_order)
      values (office_name, 'office', 'administration', i)
      returning id into office_id;

    insert into folders (unit_id, name, sort_order)
      select office_id, f, row_number() over ()
      from unnest(admin_folders) as f;

    i := i + 1;
  end loop;

  -- QAO for Administration: gets the standard set PLUS its own
  -- exclusive folders, and is flagged is_qao so the app knows this
  -- is the QAO team's own submission repository.
  insert into units (name, type, branch, is_qao, sort_order)
    values ('Quality Assurance Office for Administration', 'office', 'administration', true, i)
    returning id into qao_admin_id;

  insert into folders (unit_id, name, sort_order)
    select qao_admin_id, f, row_number() over ()
    from unnest(admin_folders) as f;

  insert into folders (unit_id, name, is_qao_exclusive, sort_order)
    select qao_admin_id, f, true, row_number() over () + 100
    from unnest(qao_exclusive_folders) as f;
end $$;
