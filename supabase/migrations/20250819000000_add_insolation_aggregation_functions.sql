-- Migration: Add insolation data aggregation functions
-- Created: 2025-08-19
-- Purpose: Create SQL-level aggregation functions for chart data

-- =====================================================
-- HOURLY AGGREGATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_insolation_hourly_avg(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_province TEXT DEFAULT NULL,
    p_show_forecast BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    hour INTEGER,
    date TEXT,
    insolation_percentage DECIMAL(8,2),
    count BIGINT,
    dates BIGINT,
    cities BIGINT,
    provinces BIGINT
) 
LANGUAGE SQL
STABLE
AS $$
    WITH date_range AS (
        SELECT 
            COALESCE(p_start_date, (SELECT MIN(date) FROM insolation_data)) as start_date,
            COALESCE(p_end_date, (SELECT MAX(date) FROM insolation_data)) as end_date
    ),
    filtered_data AS (
        SELECT 
            id.hour,
            id.date,
            id.insolation_percentage,
            id.city,
            id.province
        FROM insolation_data id
        CROSS JOIN date_range dr
        WHERE id.date >= dr.start_date 
            AND id.date <= dr.end_date
            AND (p_city IS NULL OR p_city = 'all' OR id.city = p_city)
            AND (p_province IS NULL OR p_province = 'all' OR id.province = p_province)
            AND (p_show_forecast = TRUE OR id.date <= CURRENT_DATE)
    )
    SELECT 
        fd.hour,
        LPAD(fd.hour::TEXT, 2, '0') || ':00' as date,
        ROUND(AVG(fd.insolation_percentage), 2) as insolation_percentage,
        COUNT(*) as count,
        COUNT(DISTINCT fd.date) as dates,
        COUNT(DISTINCT fd.city) as cities,
        COUNT(DISTINCT fd.province) as provinces
    FROM filtered_data fd
    GROUP BY fd.hour
    ORDER BY fd.hour;
$$;

-- =====================================================
-- DAILY AGGREGATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_insolation_daily_avg(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_province TEXT DEFAULT NULL,
    p_show_forecast BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    date DATE,
    insolation_percentage DECIMAL(8,2),
    count BIGINT,
    cities BIGINT,
    provinces BIGINT,
    city_list TEXT
) 
LANGUAGE SQL
STABLE
AS $$
    WITH date_range AS (
        SELECT 
            COALESCE(p_start_date, (SELECT MIN(date) FROM insolation_data)) as start_date,
            COALESCE(p_end_date, (SELECT MAX(date) FROM insolation_data)) as end_date
    ),
    all_dates AS (
        SELECT generate_series(
            (SELECT start_date FROM date_range),
            (SELECT end_date FROM date_range),
            '1 day'::interval
        )::date as date
    ),
    filtered_data AS (
        SELECT 
            id.date,
            id.insolation_percentage,
            id.city,
            id.province
        FROM insolation_data id
        CROSS JOIN date_range dr
        WHERE id.date >= dr.start_date 
            AND id.date <= dr.end_date
            AND (p_city IS NULL OR p_city = 'all' OR id.city = p_city)
            AND (p_province IS NULL OR p_province = 'all' OR id.province = p_province)
            AND (p_show_forecast = TRUE OR id.date <= CURRENT_DATE)
    ),
    aggregated_data AS (
        SELECT 
            fd.date,
            ROUND(AVG(fd.insolation_percentage), 2) as insolation_percentage,
            COUNT(*) as count,
            COUNT(DISTINCT fd.city) as cities,
            COUNT(DISTINCT fd.province) as provinces,
            CASE 
                WHEN COUNT(DISTINCT fd.city) > 3 THEN
                    (SELECT STRING_AGG(city, ', ')
                     FROM (SELECT DISTINCT fd2.city 
                           FROM filtered_data fd2 
                           WHERE fd2.date = fd.date 
                           LIMIT 3) cities_limited) 
                    || ' i ' || (COUNT(DISTINCT fd.city) - 3)::TEXT || ' więcej'
                ELSE
                    (SELECT STRING_AGG(city, ', ')
                     FROM (SELECT DISTINCT fd2.city 
                           FROM filtered_data fd2 
                           WHERE fd2.date = fd.date) all_cities)
            END as city_list
        FROM filtered_data fd
        GROUP BY fd.date
    )
    SELECT 
        ad_outer.date,
        COALESCE(aggd.insolation_percentage, 0) as insolation_percentage,
        COALESCE(aggd.count, 0) as count,
        COALESCE(aggd.cities, 0) as cities,
        COALESCE(aggd.provinces, 0) as provinces,
        COALESCE(aggd.city_list, '') as city_list
    FROM all_dates ad_outer
    LEFT JOIN aggregated_data aggd ON ad_outer.date = aggd.date
    ORDER BY ad_outer.date;
$$;

-- =====================================================
-- MONTHLY AGGREGATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_insolation_monthly_avg(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_province TEXT DEFAULT NULL,
    p_show_forecast BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    month TEXT,
    date TEXT,
    insolation_percentage DECIMAL(8,2),
    count BIGINT,
    cities BIGINT,
    provinces BIGINT,
    dates BIGINT,
    city_list TEXT
) 
LANGUAGE SQL
STABLE
AS $$
    WITH date_range AS (
        SELECT 
            COALESCE(p_start_date, (SELECT MIN(date) FROM insolation_data)) as start_date,
            COALESCE(p_end_date, (SELECT MAX(date) FROM insolation_data)) as end_date
    ),
    filtered_data AS (
        SELECT 
            TO_CHAR(id.date, 'YYYY-MM') as month,
            id.date,
            id.insolation_percentage,
            id.city,
            id.province
        FROM insolation_data id
        CROSS JOIN date_range dr
        WHERE id.date >= dr.start_date 
            AND id.date <= dr.end_date
            AND (p_city IS NULL OR p_city = 'all' OR id.city = p_city)
            AND (p_province IS NULL OR p_province = 'all' OR id.province = p_province)
            AND (p_show_forecast = TRUE OR id.date <= CURRENT_DATE)
    )
    SELECT 
        fd.month,
        fd.month || '-01' as date,
        ROUND(AVG(fd.insolation_percentage), 2) as insolation_percentage,
        COUNT(*) as count,
        COUNT(DISTINCT fd.city) as cities,
        COUNT(DISTINCT fd.province) as provinces,
        COUNT(DISTINCT fd.date) as dates,
        CASE 
            WHEN COUNT(DISTINCT fd.city) > 3 THEN
                (SELECT STRING_AGG(city, ', ')
                 FROM (SELECT DISTINCT fd2.city 
                       FROM filtered_data fd2 
                       WHERE fd2.month = fd.month 
                       LIMIT 3) cities_limited) 
                || ' i ' || (COUNT(DISTINCT fd.city) - 3)::TEXT || ' więcej'
            ELSE
                (SELECT STRING_AGG(city, ', ')
                 FROM (SELECT DISTINCT fd2.city 
                       FROM filtered_data fd2 
                       WHERE fd2.month = fd.month) all_cities)
        END as city_list
    FROM filtered_data fd
    GROUP BY fd.month
    ORDER BY fd.month;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION get_insolation_hourly_avg(DATE, DATE, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_insolation_daily_avg(DATE, DATE, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_insolation_monthly_avg(DATE, DATE, TEXT, TEXT, BOOLEAN) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION get_insolation_hourly_avg IS 'Aggregates insolation data by hour across multiple days with filtering options';
COMMENT ON FUNCTION get_insolation_daily_avg IS 'Aggregates insolation data by date across all hours with full date range coverage';
COMMENT ON FUNCTION get_insolation_monthly_avg IS 'Aggregates insolation data by month across all days with filtering options';