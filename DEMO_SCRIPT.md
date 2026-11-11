# POLARIS Demo Script
**QAO Compliance & Document Repository System**

---

## Overview
POLARIS is a university-wide compliance and document management system built for the Quality Assurance Office (QAO). It tracks whether all offices and departments have submitted their required documents for each school year.

**Three types of users:**
- **Office Users** — department staff who upload documents
- **QAO** — monitors compliance across all offices
- **System Admin** — manages user accounts

---

## FLOW 1: Registration & Approval

### Step 1 — Sign Up (as an Office User)
> *"Let's start by registering a new account. Any office staff member can request access through the sign-up page."*

- Go to `/signup`
- Show the **POLARIS branding** on the left — explain the acronym stands for the university's quality assurance initiative
- Fill in the form: name, email, password, and **select your office/department** from the dropdown
  - The dropdown is structured hierarchically — colleges contain departments
- Point out the note: *"Your account will be reviewed and approved by the QAO before access is granted"*
- Submit the form

### Step 2 — Pending Page
> *"After signing up, the user is immediately redirected to a holding page while their account is under review."*

- Show the **pending screen** with the clock icon and waiting message
- Explain: the user cannot access anything until approved
- If rejected, they'll see a different screen with a red icon and contact info

### Step 3 — System Admin Approves the Account
> *"Now let's switch to the System Admin side to approve this request."*

- Log in as **System Admin** → redirected to `/admin/accounts`
- Show the **left sidebar**: Accounts and Audit Log navigation
- Click **Accounts** — show the list of all users with their status badges
- Switch to the **Requests tab** (or go to `/admin/approvals`) — show the pending request
- Click **Approve** — the user is now active
- Point out: you can also **Reject**, **Suspend**, or **Promote to Admin** from here

### Step 4 — Audit Log
> *"Every action in the system is permanently logged. Let's take a look."*

- Click **Audit Log** in the sidebar
- Show the table: **actor, action badge, timestamp, details**
- Point out the color-coded action badges — green for approvals, blue for uploads, red for rejections, etc.
- Explain: this is immutable — no one can edit or delete these records

---

## FLOW 2: Office User — Uploading Documents

### Step 5 — Office User Dashboard
> *"Now let's log in as the office user we just approved."*

- Log in as the office user → redirected to `/dashboard`
- Show the **header**: office name, "Compliance Dashboard" label, school year filter
- Walk through the **Compliance Progress card**:
  - The fraction shows how many folders have been submitted this SY
  - The animated progress bar moves as more folders are filed
  - The star animation on the bar tip is a nice touch showing current progress
- Show the **Filed / Missing** stat cards on the right
- Point out the **deadline banner** at the top if a submission deadline is approaching

### Step 6 — Folder Breakdown Table
> *"Below the progress cards is a detailed breakdown of every required folder."*

- Scroll down to the **Folder Breakdown table**
- Explain the three status badges:
  - 🟢 **Filed** — has documents uploaded this school year
  - 🟡 **Outdated** — has documents but from a previous SY
  - 🔴 **Missing** — no documents at all
- Click **View** on a folder to go to the repository

### Step 7 — Repository & Uploading
> *"Each folder has its own document repository where files are stored and versioned."*

- Show the folder page `/repository/[unitId]/[folderId]`
- Point out the **Active / Archived tabs** and document list
- Click **Upload File**
- Walk through the **Upload Modal**:
  - Enter document title
  - Select school year and semester
  - Drag and drop a file (or click to browse) — supports PDF, Word, Excel, images up to 50MB
  - Show the success state: green border, filename, file size shown
- Click **Upload** — document appears in the list
- Show that uploading a new version of an existing doc creates a **version history** (v2, v3, etc.)
- Go back to dashboard — the folder status has updated to **Filed** ✅

---

## FLOW 3: QAO — University-Wide Monitoring

### Step 8 — QAO University Dashboard
> *"Now let's log in as the QAO to see the bird's-eye view of the entire university."*

- Log in as QAO → redirected to `/dashboard` (university-wide view)
- Show the **three summary cards** at the top:
  1. **Submission Rate** — percentage with a ring chart
  2. **Fully Filed** — offices that completed all folders
  3. **No Submissions Yet** — offices that haven't uploaded anything
- Point out the **branch and school year filters** in the header — QAO can filter by Academics or Administration

### Step 9 — Compliance Overview
> *"The Compliance Overview card breaks down progress by branch."*

- Show the **Academics row** — progress bar, filed count, percentage
- Show the **Administration row** — same structure
- These give QAO a quick snapshot without needing to drill into individual offices

### Step 10 — Folder Coverage
> *"The Folder Coverage section shows, for each required folder type, how many offices have submitted it."*

- Show the **Academics / Administration tabs**
- Each row is a folder name with a progress bar and submitted count (e.g., "2 / 32")
- **Click on a folder row** — a drawer slides in from the right
- Walk through the drawer:
  - Shows **not submitted** count and **filed** count at the top
  - **Filter tabs**: All / Not Submitted / Submitted
  - Search bar to find a specific office
  - Each office row shows a green checkmark if submitted, red dot if not
  - **Click an office** — closes the drawer and navigates directly to that office's folder repository

### Step 11 — Recent Uploads
> *"On the right side, QAO can see the most recent uploads across all offices in real time."*

- Show the **Recent Uploads card** — document title, office name, folder, uploader, timestamp
- Each row is clickable and goes straight to that folder

### Step 12 — Submission Deadlines
> *"QAO can also set and manage submission deadlines for each semester."*

- Show the **Submission Deadlines card**
- Point out the 1st Sem, 2nd Sem, and Summer deadline rows
- QAO can click to set or edit a deadline date
- Office users will see a **deadline banner** on their dashboard when a deadline is approaching

### Step 13 — All Offices Table
> *"At the bottom, QAO has a full table of every office and department."*

- Show the **All Offices table**
- Walk through the columns: Office name, Unit (Academics/Administration badge), Filed count, Compliance bar, Status badge
- Show the **search, filter by unit, filter by status** controls
- Point out the **Export Excel** button — downloads a CSV report
- Click **View** on any office → goes to the QAO's office-specific dashboard

### Step 14 — Individual Office Dashboard (QAO View)
> *"QAO can drill into any office to see its specific compliance details."*

- Show `/dashboard/office/[unitId]`
- Same compliance progress and folder breakdown as the office user sees, but from QAO's perspective
- Show the **Repository button** — links directly to that office's document repository
- QAO can also **browse and upload** documents on behalf of an office if needed

---

## Summary

| Who | What They Do |
|-----|-------------|
| **Office User** | Signs up → gets approved → uploads documents per folder per semester |
| **QAO** | Monitors all offices → tracks deadlines → drills into any office or folder |
| **System Admin** | Approves/rejects accounts → manages users → reviews audit log |

> *"POLARIS gives the QAO complete visibility into university-wide compliance, while making it simple for each office to know exactly what they need to submit and when."*

---

## Tips for the Demo
- Have **3 browser tabs open**: one per role (office user, QAO, system admin)
- Pre-upload 1–2 documents so the dashboard isn't empty
- Show the drawer filter feature — it's one of the more impressive interactions
- If asked about security: mention role-based access control, audit logging, and that all file storage is handled by Supabase
