-- Add province column to insolation_data table
-- This migration adds support for Polish provinces to handle cities with the same name

-- Add province column (nullable for backward compatibility)
ALTER TABLE public.insolation_data 
ADD COLUMN province TEXT;

-- Drop old unique constraint that only used city, date, hour
DROP INDEX IF EXISTS idx_insolation_data_unique_entry;

-- Create new unique constraint including province
-- This allows cities with the same name in different provinces
CREATE UNIQUE INDEX idx_insolation_data_unique_entry 
ON public.insolation_data(city, COALESCE(province, 'unknown'), date, hour);

-- Add index for province queries
CREATE INDEX idx_insolation_data_province ON public.insolation_data(province);

-- Add index for city-province combination
CREATE INDEX idx_insolation_data_city_province ON public.insolation_data(city, province);

-- Update existing records to have 'unknown' province for data consistency
UPDATE public.insolation_data 
SET province = 'unknown' 
WHERE province IS NULL;

-- Add check constraint to ensure province is valid (from POLISH_PROVINCES list)
ALTER TABLE public.insolation_data 
ADD CONSTRAINT chk_insolation_data_province 
CHECK (
  province IS NULL OR 
  province = 'unknown' OR
  province IN (
    'Dolnośląskie',
    'Kujawsko-Pomorskie', 
    'Lubelskie',
    'Lubuskie',
    'Łódzkie',
    'Małopolskie',
    'Mazowieckie',
    'Opolskie',
    'Podkarpackie',
    'Podlaskie',
    'Pomorskie',
    'Śląskie',
    'Świętokrzyskie',
    'Warmińsko-Mazurskie',
    'Wielkopolskie',
    'Zachodniopomorskie'
  )
);

-- Add comment to document the new column
COMMENT ON COLUMN public.insolation_data.province IS 'Polish province (voivodeship) where the city is located. Allows distinguishing cities with the same name in different provinces.';