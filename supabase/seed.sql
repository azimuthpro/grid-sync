-- Local development seed: insolation for every tracked city from 7 days ago to
-- 2 days ahead, so charts, production estimates and reports have data.
-- Values follow a midday bell curve with a per-city, per-day cloud factor.
INSERT INTO public.insolation_data (city, province, date, hour, insolation_percentage)
SELECT c.city,
       c.province,
       d::date,
       h,
       round(
         (65 * sin(pi() * (h - 5) / 14.0)
             * (0.45 + 0.55 * abs(sin(hashtext(c.city || d::date::text)))))::numeric,
         2
       )
FROM (VALUES
  ('Białystok', 'Podlaskie'),
  ('Bydgoszcz', 'Kujawsko-Pomorskie'),
  ('Gdańsk', 'Pomorskie'),
  ('Gorzów Wielkopolski', 'Lubuskie'),
  ('Katowice', 'Śląskie'),
  ('Kielce', 'Świętokrzyskie'),
  ('Koszalin', 'Zachodniopomorskie'),
  ('Kraków', 'Małopolskie'),
  ('Lublin', 'Lubelskie'),
  ('Olsztyn', 'Warmińsko-Mazurskie'),
  ('Opole', 'Opolskie'),
  ('Poznań', 'Wielkopolskie'),
  ('Rzeszów', 'Podkarpackie'),
  ('Suwałki', 'Podlaskie'),
  ('Szczecin', 'Zachodniopomorskie'),
  ('Toruń', 'Kujawsko-Pomorskie'),
  ('Warszawa', 'Mazowieckie'),
  ('Wrocław', 'Dolnośląskie'),
  ('Zakopane', 'Małopolskie'),
  ('Zielona Góra', 'Lubuskie'),
  ('Łódź', 'Łódzkie')
) AS c(city, province)
CROSS JOIN generate_series(current_date - 7, current_date + 2, interval '1 day') AS d
CROSS JOIN generate_series(6, 18) AS h
ON CONFLICT DO NOTHING;

-- Local test account: dev@gridsync.test / gridsync-dev (local stack only)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd0d0d0d0-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'dev@gridsync.test',
  crypt('gridsync-dev', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
);

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'd0d0d0d0-0000-4000-8000-000000000001',
  'd0d0d0d0-0000-4000-8000-000000000001',
  '{"sub":"d0d0d0d0-0000-4000-8000-000000000001","email":"dev@gridsync.test","email_verified":true}',
  'email', now(), now(), now()
);

-- One 8 kWp installation in Kraków with a household weekly profile
INSERT INTO public.user_locations (id, user_id, name, city, pv_power_kwp, mwe_code)
VALUES (
  'd0d0d0d0-0000-4000-8000-0000000000a1',
  'd0d0d0d0-0000-4000-8000-000000000001',
  'Dom', 'Kraków', 8.00, 'MWE-DEV-0001'
);

INSERT INTO public.consumption_profiles (location_id, day_of_week, hour, consumption_kwh)
SELECT 'd0d0d0d0-0000-4000-8000-0000000000a1', d, h,
       CASE
         WHEN h BETWEEN 0 AND 5 THEN 0.25
         WHEN h BETWEEN 6 AND 8 THEN 0.9
         WHEN h BETWEEN 17 AND 21 THEN 1.4
         WHEN d IN (0, 6) THEN 0.8
         ELSE 0.45
       END
FROM generate_series(0, 6) AS d
CROSS JOIN generate_series(0, 23) AS h;
