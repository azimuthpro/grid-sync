-- Fix unique constraint to use simple column names without COALESCE
-- This allows the JavaScript client to properly reference it in onConflict

-- Drop the existing constraint that uses COALESCE
DROP INDEX IF EXISTS idx_insolation_data_unique_entry;

-- Create new unique constraint using simple column names
-- Since we now normalize province to 'unknown' in the application code, we can use simple columns
CREATE UNIQUE INDEX idx_insolation_data_unique_entry 
ON public.insolation_data(city, province, date, hour);

-- Comment on the fix
COMMENT ON INDEX idx_insolation_data_unique_entry IS 
'Unique constraint for city-province-date-hour combination. Province is normalized to ''unknown'' in application code when null.';