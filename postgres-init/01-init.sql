-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE career_compass'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'career_compass')\gexec

-- Connect to the career_compass database
\c career_compass;

-- Create the postgres user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE career_compass TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
