-- Add mwe_code column to user_locations table
-- MWE code (Kod MWE) is an optional identifier for energy production units from URE registry

ALTER TABLE public.user_locations 
    ADD COLUMN mwe_code TEXT;

-- Add constraint for maximum length and basic format validation
ALTER TABLE public.user_locations 
    ADD CONSTRAINT check_mwe_code_length 
    CHECK (mwe_code IS NULL OR (LENGTH(mwe_code) <= 100 AND LENGTH(mwe_code) > 0));

-- Add comment for documentation
COMMENT ON COLUMN public.user_locations.mwe_code IS 
    'Optional MWE code (Kod MWE) - identifier for energy production unit from URE registry';