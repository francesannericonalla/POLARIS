# POLARIS — Presentation Guide
**Audience:** QAO Staff
**System:** Performance and Organization Leadership Analytics, Reporting, and Institutional Stewardship

---

## Before You Start

- Have the live site open in a browser tab: your Vercel production URL
- Open a second tab for the admin/approvals page (logged in as system_admin)
- Have a test office_user account ready (approved, with a unit assigned)
- Have your QAO account ready
- Optionally: have a sample PDF or Word file ready for the upload demo

---

## Presentation Flow Overview

```
1. What is POLARIS? (2 min)
2. Signup & Account Approval Flow (5 min)
3. Office User Experience (8 min)
   └─ Dashboard → Repository → Upload → Version → Archive
4. QAO Experience (8 min)
   └─ University Dashboard → Per-Office Dashboard → Repository
5. System Administrator (2 min)
6. Key Design Decisions (3 min)
7. Q&A
```

---

## 1. Opening — What is POLARIS?

> "POLARIS stands for Performance and Organization Leadership Analytics, Reporting, and Institutional Stewardship. It's CIT-U's centralized document submission and compliance tracking system built specifically for the Quality Assurance Office."

> "Before POLARIS, documents were submitted over email or stored in shared drives — there was no single source of truth for which offices had filed their required documents, which versions were current, or which hadn't submitted at all. POLARIS solves that."

**Key points to emphasize:**
- Every college, department, and administration office has its own repository
- QAO can see all offices at once; offices can only see their own
- The system tracks compliance automatically — no spreadsheet needed
- Nothing is ever deleted — every file and every version is preserved

---

## 2. Signup & Account Approval Flow

### 2a. Signup — Office Staff Perspective

> "Let's start from the beginning — how an office staff member gets access."

**Navigate to `/signup`**

Point out the form fields:
- Full name, ID number, email, password
- **Office/Unit dropdown** — this is populated from the database. Every college, department, and administration office is already listed. The staff member selects the office they represent.

> "When they submit, their account is created immediately — but they can't access anything yet. They land on a waiting screen."

**Show the `/pending` page**

> "This page tells them their account is under review. They can't proceed until a QAO staff member approves them."

---

### 2b. Account Approval — System Administrator Perspective

> "Now let's look at it from the administrator's side."

**Log in as system_admin → Navigate to `/admin/approvals`**

- Show the list of pending accounts
- Point out the name, email, and unit of the pending user
- Click **Approve**

> "The moment an account is approved, that staff member can log in and access their dashboard and repository. If an account is rejected, they're notified and cannot proceed."

**Navigate to `/admin/accounts`**

> "This page gives the System Administrator a read-only view of all accounts in the system — their role, unit, and approval status. The System Administrator cannot access any document contents — that's intentional. Their role is purely account management."

---

## 3. Office User Experience

> "Now let's walk through what an office staff member sees after they're approved."

**Log in as the office_user test account**

---

### 3a. Navigation

> "Office users have a clean top navigation bar — no sidebar. Just two links: Dashboard and Repository. Everything they need is accessible from here."

Point out:
- POLARIS logo on the left
- Dashboard and Repository links in the center/right
- Their name and unit in the profile dropdown (top right)

---

### 3b. Office Dashboard (`/dashboard`)

> "The first thing an office staff member sees after logging in is their dashboard. Everything here is specific to their office only — they cannot see any other office's data."

---

#### School Year Filter

> "At the top right, there's a school year selector. By default, it shows the current school year. Changing this updates every number and every status on the entire dashboard — so staff can look back at any previous year's submission record. This is useful if they need to verify what they submitted last year, or compare progress across years."

---

#### KPI Cards — The Three-Number Summary

> "These three cards at the top give an at-a-glance answer to the most important question: are we on track for this school year?"

**Card 1 — Total Documents**

> "This number is the total count of all active documents this office has ever submitted across all folders and all school years — not counting archived ones. Think of it as the size of the office's entire active document library in POLARIS."

> "It's useful as a baseline. If this number is zero, the office hasn't submitted anything at all yet. If it's high but the next card is low, it means they have a lot of older submissions but haven't updated for the current year."

**Card 2 — Submitted SY [Current Year]**

> "This is the number that matters most for compliance. It counts only documents that were filed with the current school year selected — so even if an office has 50 files total, if none of them are tagged to this SY, this card shows zero."

> "Below the number, it shows when the last upload happened — for example, 'Last upload 3 days ago' or 'Last upload Today'. If nothing has been uploaded yet, it says 'No uploads yet this SY'. This lets staff know immediately whether their recent activity is being captured."

**Card 3 — Folders Complete**

> "This card shows X out of Y — for example, '4/7 folders'. Each office has 7 required submission folders. A folder counts as 'complete' if it has at least one document filed for the current school year."

> "The color of the icon on this card changes based on how complete they are: green means all folders are submitted, amber means they're partway there, red means very few or none have been submitted. This is the single fastest way to know if the office is behind on submissions."

---

#### Folder Submission Status Panel (left, larger)

> "This panel is the detailed breakdown behind that third card. Each row is one of the office's required folders."

> "Each folder shows a progress bar, a short description of where it stands, and a colored pill badge."

- **Green bar + 'Done' badge** — this folder has at least one document filed for the current school year. The office is compliant on this one.
- **Amber bar + 'Update' badge** — this folder has documents, but they were filed in a previous school year. The content exists but it's outdated for the current SY. The office needs to submit a new or updated document.
- **Gray bar + 'Empty' badge** — no documents have ever been filed in this folder. This is the most urgent status.

> "The bar itself shows the proportion of documents filed this SY versus all-time. So if a folder has 5 documents total and 3 are from this year, the bar fills to about 60%. A folder with nothing this year gets a shorter amber bar regardless."

> "Clicking any folder row takes the office directly to that folder in the repository — so if they see something is overdue, they can go file it immediately without navigating manually."

> "At the bottom of this panel, there's a legend and an overall completion percentage — for example, '57% complete'. This is the same number as the Folders Complete card, just expressed as a percentage."

---

#### Recent Activity Panel (right, narrower)

> "This panel shows the last 6 document actions in this office — the most recently uploaded or revised documents."

> "Each item shows the document title, which folder it belongs to, and how long ago it was uploaded — for example, 'Today', 'Yesterday', or '3 days ago'."

- **Green circle with a plus icon** — a brand new document was added to that folder
- **Gold circle with a refresh icon** — an existing document was updated with a new version

> "This is helpful for staff who want a quick 'what did we recently do?' check before a meeting. If they uploaded something yesterday and the QAO asks about it, they can confirm it's in the system here."

> "At the bottom, 'View all in repository →' links directly to the office's full repository if they want to see everything, not just the last 6."

---

#### Document Breakdown Table (bottom)

> "The table at the bottom is the most detailed view on the dashboard. It lists every folder in one place with all the relevant numbers side by side."

| Column | What it tells you |
|---|---|
| **Folder** | The name of the folder — clicking it goes directly to that folder in the repository |
| **This SY** | How many documents were filed specifically for the currently selected school year |
| **All-Time** | Total documents ever filed in this folder across all school years |
| **Last Upload** | How long ago the most recent document in this folder was uploaded |
| **Status** | Green Submitted, Amber Needs update, or Gray No files |
| **Action** | "Upload →" if the folder has no submission this SY, "View →" if it does |

> "This table is useful when preparing a full compliance report. You can read across each row: 'Faculty Evaluation — 0 this SY, 3 all-time, last uploaded 8 months ago — Needs update.' That tells you exactly what needs attention and how far behind it is."

> "The Action column is a shortcut. If a folder says 'Upload →', clicking it takes you straight to that folder so you can file immediately. If it says 'View →', clicking opens the folder to review what's already there."

---

### 3c. Repository Landing Page (`/repository/[unitId]`)

> "Now let's go to the repository — accessible from the top nav or the dashboard."

**Show the folder grid**

Point out:
- Each card represents a required submission folder (BUYLO, Balance Scorecard, Accreditation Documents, SDG Aligned Projects, Faculty Evaluation, Research Undertakings, ISO Documents)
- Each card has a **status badge** in the top right corner:
  - Green **Submitted** — filed this SY
  - Amber **Pending this SY** — has older docs but nothing current
  - Gray **No files** — nothing filed yet
- The header shows a summary: "X/Y folders submitted" for the current SY

> "This is the compliance view at a glance. The office knows immediately what's done and what's missing, without opening anything."

---

### 3d. Folder View — Uploading a Document

**Click into a folder**

> "Inside a folder, we see the Active and Archived tabs. Active is the default — these are all live, non-archived documents."

**Show the Active tab and document list**

Point out per document:
- Document title (bold), school year · semester badge, version pill (v1, v2 · Updated)
- Filename, uploader name, date uploaded
- Three action buttons: **Download**, **New Version**, **Archive**

**Click "Upload File"**

Walk through the upload modal:
- Choose a file (PDF, Word, Excel, JPG, PNG — up to 50 MB)
- Enter a short title for the document
- Select the school year and semester
- Click Upload

> "The file is stored securely. The office never gets a direct link to the file — instead, the system generates a short-lived signed URL each time someone clicks Download. This ensures unauthorized users can never access files even if they somehow get a URL."

---

### 3e. Versioning — Uploading a New Version

> "What if the office needs to revise a document they already submitted?"

**On an existing document row, click "New Version"**

> "This opens the same upload modal, but it's pre-linked to the existing document. When submitted, the new file replaces the current one as the latest version — but the old version is never deleted."

**Show the version history by clicking the expand arrow on a document with multiple versions**

Point out the version history table:
- Each row: version number, who uploaded it, date, Download button
- Current version is highlighted
- All previous versions are fully downloadable

> "Every version is preserved. If QAO ever needs to audit what was submitted in a previous semester, every file is still here."

---

### 3f. Archiving a Document

> "What if a document was submitted by mistake, or needs to be hidden?"

**Click "Archive" on a document**

> "The document disappears from the Active tab. It's not deleted — it moves to the Archived tab."

**Click the "Archived" tab**

> "Here's the archived document, with a gray 'Archived' badge. The office can restore it at any time by clicking Restore."

> "No document in POLARIS is ever permanently deleted. This is a deliberate design choice — the QAO always has a full, unalterable record."

---

## 4. QAO Experience

> "Now let's switch to the QAO account — the main audience for this system."

**Log in as QAO account**

---

### 4a. Navigation

> "QAO has a sidebar — the main navigation for moving between offices, branches, and the repository. The top bar is clean: just the POLARIS logo and the profile menu."

---

### 4b. University Dashboard (`/dashboard`)

> "This is the QAO's command center. Everything on this page is university-wide — it aggregates data from every single office and college in one place. This is what you'd open at the start of a submission period to know immediately where the university stands."

---

#### Filters (top right)

> "Before anything else — the filters. There are three: School Year, Branch, and Search."

- **School Year** — switches the entire dashboard to show data for a different academic year. All cards, the chart, and the table update together. Use this to compare this year's compliance against last year.
- **Branch** — filters to show only Academics or only Administration offices. Useful when you're doing a review meeting with just the academic colleges, or just the administrative offices.
- **Search** — type any part of an office name to filter the units table on the right. Useful when you want to quickly jump to a specific department without scrolling.

---

#### KPI Card 1 — Submission Rate (Ring Chart)

> "This is the most important number on the entire dashboard. The ring chart shows the percentage of offices university-wide that have submitted at least one document for the selected school year."

> "The ring fills up as more offices submit. The color tells you immediately how serious the situation is:"
- **Green ring** — 80% or more of offices have submitted. Things are on track.
- **Amber ring** — 50–79% have submitted. Some follow-up needed.
- **Red ring** — below 50%. More than half the offices haven't submitted yet. Urgent attention required.

> "Below the ring, it says — for example — '28 of 41 units submitted this SY'. So you know not just the percentage but the exact count. If there are 13 offices that haven't submitted, you know follow-up needs to reach exactly those 13."

---

#### KPI Card 2 — Documents This SY

> "This card counts the total number of individual documents submitted across all offices for the selected school year."

> "Below that number, there are two sub-counts:"
- **Maroon dot — Academics** — how many documents came from academic colleges and departments
- **Gold dot — Administration** — how many came from administration offices

> "This is useful for understanding submission volume by branch. If Academics has 120 documents and Administration has 8, that's a signal that the administrative offices are significantly behind. You can then switch the Branch filter to 'Administration' to focus the entire dashboard on that group."

---

#### KPI Card 3 — Units with No Submissions

> "This card counts every office that has zero submissions for the current school year — not even one document. These are the offices that need the most immediate follow-up."

> "The badge on this card is red with 'Needs follow-up' if there are any such offices, or green with 'All submitted' if every office has filed at least something."

> "Below the count, the card lists the offices with the longest gap since their last upload — meaning not just 'no submission this SY' but the ones that haven't uploaded anything in the longest time overall. Each one is a clickable link that goes directly to that office's dashboard."

> "This gives QAO a ready-made follow-up list. Instead of manually going through a spreadsheet to find who's missing, the system surfaces them automatically and prioritizes them by how long they've been inactive."

---

#### Documents per Unit — Bar Chart (main left panel)

> "This horizontal bar chart shows every office ranked by how many documents they've submitted for the selected school year — highest at the top, lowest at the bottom."

- **Maroon bars** — academic departments
- **Gold bars** — administration offices

> "The length of the bar is proportional to the number of documents. An office with 10 documents gets a full-length bar; one with 2 gets a short one; one with 0 has no bar at all."

> "Hovering over a bar highlights it. Clicking any bar goes directly to that office's individual dashboard — so if you see a department with a suspiciously short bar, one click gets you to their full submission breakdown."

> "This chart is most useful during a review meeting. You can scan it in seconds to identify outliers — who's submitting a lot, who's barely filing, and who has nothing at all. It makes the follow-up conversation specific: instead of 'some offices are behind', you can point to exactly which ones."

---

#### Units Table (right panel)

> "Alongside the chart is the full units table — every office in one scrollable list."

| Column | What it tells you |
|---|---|
| **Unit** | Office or department name — clicking goes to their dashboard. Below the name shows the branch and when they last uploaded. |
| **This SY** | Number of documents submitted for the current school year |
| **Status** | Green 'Submitted' if they've filed at least one document this SY; Red 'No files' if they haven't |
| **View →** | Quick link to that office's individual dashboard |

> "The 'last upload' line under each office name is particularly useful — it says things like 'last upload Today' or 'last upload 3 months ago'. This lets you quickly identify offices that have been completely inactive for a long time, even if they technically have older documents on file."

> "The search bar at the top of this panel filters the list in real time as you type. So if someone asks 'what's the status of the College of Computer Studies?', you type 'computer' and you're there in two seconds."

---

#### KPI Framework Panel (bottom)

> "At the bottom of the QAO dashboard is the KPI Framework — a reference panel for the four evaluation indicators that QAO uses to assess offices."

> "These four indicators are:"

1. **Documentation completeness** — what share of required folders have at least one current-year document. Target: 100%.
2. **Submission timeliness** — documents filed on or before the semestral cut-off date. Target: 95%.
3. **Version currency** — evidence revised within the last two school years. Target: 90%.
4. **Audit readiness** — units passing internal QAO spot-checks without findings. Target: 85%.

> "Right now, this panel is a reference display — it shows the indicators and targets so QAO can communicate expectations clearly to offices. As the system matures and more data accumulates, these indicators can be scored live based on actual submission data."

---

### 4c. Per-Office Dashboard (`/dashboard/office/[unitId]`)

> "When you click any office — from the bar chart, the units table, or the 'no submissions' card — you land on that office's individual dashboard. This is the deep-dive view for one specific office."

> "At the top, there's a breadcrumb trail: University Dashboard → Academics or Administration → Office Name. You can click back to the university dashboard at any point."

> "The 'View Repository →' button in the top right corner jumps directly to that office's document repository."

---

#### Filters

> "QAO can filter this view by both school year and semester. So if you want to see specifically what was submitted in the 1st semester of SY 2024–2025, you can narrow it down to exactly that."

---

#### KPI Cards

> "The three cards here are the same structure as the office user's dashboard, but QAO is seeing them from an oversight perspective:"

- **Total Documents** — all active documents ever filed by this office
- **This School Year** — documents filed for the currently filtered SY, plus the last upload date. If the last upload was 6 months ago, that's a signal.
- **Folders Complete** — X of Y folders with at least one submission this SY. Color-coded: green if all complete, amber if partial, red if very few.

---

#### Folder Submission Status Bars

> "Each folder has a progress bar showing its status for the selected school year and semester."

- **Green 'Complete'** — at least one document filed this SY for this filter
- **Amber 'In progress'** — has older documents but nothing matching the current SY/semester filter
- **Gray 'No files'** — nothing at all

> "Each bar is also clickable — it goes directly to that folder in the office's repository. So if QAO sees a folder marked 'No files', one click opens the folder to verify, and if needed, QAO can archive or download from right there."

> "The overall percentage at the bottom — e.g., '71% complete' — tells QAO at a glance how close this office is to full compliance for the selected period."

---

#### Recent Activity Feed

> "The activity feed shows the last 6 document events for this office — new uploads and version updates."

> "This answers the question: 'when did they last do something?' If the most recent activity was 4 months ago, that's useful context before sending a follow-up. If everything was uploaded yesterday, the office is actively working."

> "Green icons are new documents; gold icons are updated versions. The version number appears on the right — so you can see at a glance that a document is already on v3, meaning it's been revised twice."

---

#### Document Breakdown Table

> "The table at the bottom gives QAO a folder-by-folder snapshot — the same columns as the office user sees, but QAO is reading it as a reviewer, not as the one submitting."

> "The most important columns for QAO are:"
- **This SY** — is it zero? Then nothing has been filed.
- **Last Upload** — how long ago was the most recent submission? A folder last updated 14 months ago needs attention.
- **Status** — Complete, In progress, or No files. A quick scan down this column tells you where the gaps are.

> "Clicking any folder name in this table opens that folder in the repository — so QAO can go from 'this folder has no files' to reviewing the actual repository in one click."

---

### 4d. QAO Repository Access

> "QAO can open the repository for any office."

**Click "View Repository →" from the per-office dashboard**

Show the folder grid with status badges — same view the office user sees.

**Open a folder**

Key differences from office user view:
- QAO **cannot** see an Upload File button — they never submit on behalf of offices
- QAO **can** see version history for every document
- QAO **can** archive or restore any document in any office
- QAO **can** see the Archived tab for every office

> "QAO's role here is review and oversight — they can see everything, archive or restore anything, and download any version of any file. But they cannot upload. Offices are responsible for their own submissions."

---

## 5. System Administrator

> "The third role is the System Administrator. This is a deliberately limited role."

**Log in as system_admin**

Show:
- Only two nav links: **All Accounts** and **Account Approvals**
- No access to any document, repository, or dashboard
- The banner on the accounts page: "System Administrator accounts manage user accounts and system configuration only. Document contents are not accessible from this role, by design."

> "The System Administrator can approve or reject accounts and see all registered users — that's it. They cannot open a single document. This is a security design decision: account administration and document access are kept completely separate."

---

## 6. Key Design Decisions

> "Before we wrap up, I want to highlight a few things we built deliberately."

| Design Decision | Why |
|---|---|
| **No hard deletes** | Every document and every version is permanently preserved. Archive is the only removal action. |
| **Compliance tracking from folder structure** | No manual checklist. The folders are the requirements. If a folder has a doc this SY, it's submitted. |
| **QAO is read-only for uploads** | Offices are accountable for their own submissions. QAO reviews; offices submit. |
| **Signed download URLs** | Files are private. Every download generates a short-lived link (5 minutes). No one can share a permanent file URL. |
| **Signup requires approval** | No one gets access without QAO or Admin explicitly approving them. |
| **System Admin has no document access** | Account management and document contents are completely separate roles. |

---

## 7. Common Questions — Prepared Answers

**"What if an office submits the wrong file?"**
> They can archive the wrong file and upload the correct one. The archived file is still there if ever needed for audit.

**"Can QAO edit or delete what an office submitted?"**
> QAO can archive a document (hide it from active view) and restore it. No one can permanently delete anything.

**"What happens if we need to look at what was submitted two years ago?"**
> Every document with its original version history is always accessible. Use the school year filter in the folder view to browse older submissions.

**"Can two offices see each other's documents?"**
> No. Office users only see their own unit. QAO sees all units.

**"What file types are accepted?"**
> PDF, Word (.doc/.docx), Excel (.xls/.xlsx), JPG, and PNG. Maximum 50 MB per file.

**"What if an office submits a new version — can we still download the old one?"**
> Yes. The version history table inside any folder shows all versions with a Download button for each.

---

## Wrap-Up

> "POLARIS replaces the email chains and scattered shared drives with a single, organized, access-controlled system. QAO can see in real time which offices are compliant and which need follow-up — without sending a single reminder email. Offices always know exactly what they've submitted and what's still pending. And every document, every version, every action is permanently on record."

> "Thank you — happy to take questions."
