-- Add 'suspended' as a distinct status so suspended accounts can be
-- differentiated from accounts that were rejected at the approval stage.
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
