-- GridSync Database Schema
-- This file contains the complete database schema for the GridSync application
-- Run this file in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
-- Note: JWT secret is automatically configured by Supabase

-- =====================================================
-- USER LOCATIONS TABLE
-- =====================================================
CREATE TABLE public.user_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    pv_power_kwp DECIMAL(8,2) NOT NULL CHECK (pv_power_kwp > 0),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX idx_user_locations_city ON public.user_locations(city);
CREATE INDEX idx_user_locations_is_primary ON public.user_locations(is_primary);

-- Add constraint to ensure only one primary location per user
CREATE UNIQUE INDEX idx_user_locations_unique_primary 
ON public.user_locations(user_id) 
WHERE is_primary = true;

-- =====================================================
-- CONSUMPTION PROFILES TABLE
-- =====================================================
CREATE TABLE public.consumption_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES public.user_locations(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    consumption_kwh DECIMAL(8,3) NOT NULL CHECK (consumption_kwh >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint for day/hour combination per location
CREATE UNIQUE INDEX idx_consumption_profiles_unique_slot 
ON public.consumption_profiles(location_id, day_of_week, hour);

-- Create indexes for faster queries
CREATE INDEX idx_consumption_profiles_location_id ON public.consumption_profiles(location_id);
CREATE INDEX idx_consumption_profiles_day_hour ON public.consumption_profiles(day_of_week, hour);

-- =====================================================
-- INSOLATION DATA TABLE
-- =====================================================
CREATE TABLE public.insolation_data (
    id SERIAL PRIMARY KEY,
    city TEXT NOT NULL,
    province TEXT, -- Polish province/voivodeship (nullable for backward compatibility)
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    insolation_percentage DECIMAL(5,2) NOT NULL CHECK (insolation_percentage >= 0 AND insolation_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique constraint for city/province/date/hour combination
CREATE UNIQUE INDEX idx_insolation_data_unique_entry 
ON public.insolation_data(city, COALESCE(province, 'unknown'), date, hour);

-- Create indexes for faster queries
CREATE INDEX idx_insolation_data_city ON public.insolation_data(city);
CREATE INDEX idx_insolation_data_province ON public.insolation_data(province);
CREATE INDEX idx_insolation_data_date ON public.insolation_data(date);
CREATE INDEX idx_insolation_data_city_date ON public.insolation_data(city, date);
CREATE INDEX idx_insolation_data_city_province ON public.insolation_data(city, province);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insolation_data ENABLE ROW LEVEL SECURITY;

-- User Locations RLS Policies
CREATE POLICY "Users can view their own locations" ON public.user_locations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations" ON public.user_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" ON public.user_locations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations" ON public.user_locations
    FOR DELETE USING (auth.uid() = user_id);

-- Consumption Profiles RLS Policies
CREATE POLICY "Users can view consumption profiles for their locations" ON public.consumption_profiles
    FOR SELECT USING (
        location_id IN (
            SELECT id FROM public.user_locations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert consumption profiles for their locations" ON public.consumption_profiles
    FOR INSERT WITH CHECK (
        location_id IN (
            SELECT id FROM public.user_locations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update consumption profiles for their locations" ON public.consumption_profiles
    FOR UPDATE USING (
        location_id IN (
            SELECT id FROM public.user_locations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete consumption profiles for their locations" ON public.consumption_profiles
    FOR DELETE USING (
        location_id IN (
            SELECT id FROM public.user_locations WHERE user_id = auth.uid()
        )
    );

-- Insolation Data RLS Policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view insolation data" ON public.insolation_data
    FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating updated_at
CREATE TRIGGER update_user_locations_updated_at 
    BEFORE UPDATE ON public.user_locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consumption_profiles_updated_at 
    BEFORE UPDATE ON public.consumption_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary location per user
CREATE OR REPLACE FUNCTION enforce_single_primary_location()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a location as primary, unset all other primary locations for this user
    IF NEW.is_primary = true THEN
        UPDATE public.user_locations 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for primary location enforcement
CREATE TRIGGER enforce_single_primary_location_trigger
    BEFORE INSERT OR UPDATE ON public.user_locations
    FOR EACH ROW EXECUTE FUNCTION enforce_single_primary_location();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get user's primary location
CREATE OR REPLACE FUNCTION get_user_primary_location(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    name TEXT,
    city TEXT,
    pv_power_kwp DECIMAL,
    is_primary BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT ul.id, ul.user_id, ul.name, ul.city, ul.pv_power_kwp, ul.is_primary, ul.created_at, ul.updated_at
    FROM public.user_locations ul
    WHERE ul.user_id = user_uuid AND ul.is_primary = true
    LIMIT 1;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to calculate energy production
CREATE OR REPLACE FUNCTION calculate_energy_production(
    pv_power_kwp DECIMAL,
    insolation_percentage DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    -- Formula: PV Power (kWp) * Insolation % * System Efficiency (85%) * Inverter Efficiency (95%)
    RETURN pv_power_kwp * (insolation_percentage / 100.0) * 0.85 * 0.95;
END;
$$ language 'plpgsql' IMMUTABLE;

-- Function to get consumption profile for location
CREATE OR REPLACE FUNCTION get_weekly_consumption_pattern(location_uuid UUID)
RETURNS TABLE(
    day_of_week INTEGER,
    hour INTEGER,
    consumption_kwh DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT cp.day_of_week, cp.hour, cp.consumption_kwh
    FROM public.consumption_profiles cp
    WHERE cp.location_id = location_uuid
    ORDER BY cp.day_of_week, cp.hour;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample Polish cities insolation data (can be removed in production)
-- This is basic sample data - in production, this would be populated from weather APIs

INSERT INTO public.insolation_data (city, date, hour, insolation_percentage) VALUES
-- Sample data for Warsaw (can be expanded)
('Warszawa', '2024-01-01', 8, 15.5),
('Warszawa', '2024-01-01', 9, 25.2),
('Warszawa', '2024-01-01', 10, 35.8),
('Warszawa', '2024-01-01', 11, 45.1),
('Warszawa', '2024-01-01', 12, 52.3),
('Warszawa', '2024-01-01', 13, 48.7),
('Warszawa', '2024-01-01', 14, 42.1),
('Warszawa', '2024-01-01', 15, 32.4),
('Warszawa', '2024-01-01', 16, 18.9),
-- Add more cities and dates as needed
('Kraków', '2024-01-01', 8, 16.2),
('Kraków', '2024-01-01', 9, 26.1),
('Kraków', '2024-01-01', 10, 37.5),
('Kraków', '2024-01-01', 11, 46.8),
('Kraków', '2024-01-01', 12, 54.1),
('Kraków', '2024-01-01', 13, 50.2),
('Kraków', '2024-01-01', 14, 43.7),
('Kraków', '2024-01-01', 15, 33.9),
('Kraków', '2024-01-01', 16, 19.8)
ON CONFLICT (city, date, hour) DO NOTHING;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consumption_profiles TO authenticated;
GRANT SELECT ON public.insolation_data TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION get_user_primary_location(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_energy_production(DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_consumption_pattern(UUID) TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.user_locations IS 'Stores user photovoltaic installation locations with power capacity and location details';
COMMENT ON TABLE public.consumption_profiles IS 'Stores weekly energy consumption patterns (168 data points: 7 days × 24 hours) for each location';
COMMENT ON TABLE public.insolation_data IS 'Stores solar irradiation forecast data by city, province, date, and hour for energy production calculations';

COMMENT ON COLUMN public.user_locations.pv_power_kwp IS 'Photovoltaic installation power capacity in kilowatts peak (kWp)';
COMMENT ON COLUMN public.consumption_profiles.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN public.consumption_profiles.hour IS 'Hour of day in 24-hour format (0-23)';
COMMENT ON COLUMN public.insolation_data.province IS 'Polish province (voivodeship) where the city is located. Allows distinguishing cities with the same name in different provinces.';
COMMENT ON COLUMN public.insolation_data.insolation_percentage IS 'Solar irradiation as percentage of standard test conditions (0-100%)';

-- Schema setup complete
-- Run this file in Supabase SQL editor to create all tables, indexes, policies, and functions