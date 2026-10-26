-- The insolation import and the /api/insolation routes use the secret key
-- (service_role). Hosted projects created before the Data API grant change
-- already have these privileges; databases built from the migrations do not.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insolation_data TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_locations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consumption_profiles TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
