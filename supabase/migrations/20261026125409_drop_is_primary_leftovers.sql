-- 20250817010000 dropped user_locations.is_primary but left the trigger and
-- helper functions that read it, so every insert/update on user_locations
-- fails on a database built from the migrations. IF EXISTS keeps this a no-op
-- where they were already removed by hand.
DROP TRIGGER IF EXISTS enforce_single_primary_location_trigger ON public.user_locations;
DROP FUNCTION IF EXISTS public.enforce_single_primary_location();
DROP FUNCTION IF EXISTS public.get_user_primary_location(UUID);
