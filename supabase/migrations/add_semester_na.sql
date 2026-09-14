-- Run this in the Supabase SQL Editor to allow "Full Year" documents
alter table documents drop constraint documents_semester_check;
alter table documents add constraint documents_semester_check check (semester in ('1st', '2nd', 'Summer', 'N/A'));
