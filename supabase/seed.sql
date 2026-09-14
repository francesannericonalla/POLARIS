-- ============================================================
-- POLARIS seed data
-- Run AFTER schema.sql. Populates the units/folders that are
-- already confirmed. Only "College of Engineering and
-- Architecture" is finalized on the Academics side -- add the
-- remaining colleges the same way once Sir Hanz confirms them.
-- ============================================================

-- ---------- Standard folder set (used for every department/office) ----------
-- Academics wording
do $$
declare
  cea_id uuid;
  dept_id uuid;
  dept_name text;
  dept_names text[] := array[
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
  i int;
begin
  -- ===================== ACADEMICS =====================
  insert into units (name, type, branch, sort_order)
    values ('College of Engineering and Architecture', 'college', 'academics', 1)
    returning id into cea_id;

  i := 1;
  foreach dept_name in array dept_names loop
    insert into units (name, type, branch, parent_id, sort_order)
      values (dept_name, 'department', 'academics', cea_id, i)
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
