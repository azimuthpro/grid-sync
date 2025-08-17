-- Remove primary location feature from user_locations table
-- This removes the is_primary column and associated constraints/indexes

-- Drop the unique constraint that ensures only one primary location per user
DROP INDEX IF EXISTS public.idx_user_locations_unique_primary;

-- Drop the index on is_primary column
DROP INDEX IF EXISTS public.idx_user_locations_is_primary;

-- Drop the is_primary column
ALTER TABLE public.user_locations 
DROP COLUMN IF EXISTS is_primary;