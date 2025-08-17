-- Add system_losses column to user_locations table
-- This allows users to override the default system efficiency per location

ALTER TABLE public.user_locations 
ADD COLUMN system_losses DECIMAL(3,2) NULL;

-- Add CHECK constraint to ensure system_losses is between 0 and 1
ALTER TABLE public.user_locations 
ADD CONSTRAINT chk_system_losses_range 
CHECK (system_losses IS NULL OR (system_losses > 0 AND system_losses <= 1));

-- Add comment to explain the column
COMMENT ON COLUMN public.user_locations.system_losses IS 
'Custom system efficiency factor (0-1). NULL means use default SYSTEM_LOSSES constant. Accounts for inverter losses, wiring losses, soiling, shading, etc.';

-- Update the updated_at timestamp function to trigger on system_losses changes
-- (This should already be handled by the existing trigger, but adding for clarity)