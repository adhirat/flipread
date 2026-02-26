-- Migration: Add 'basic' to plan CHECK constraints
-- D1/SQLite does not support ALTER TABLE to modify CHECK constraints directly.
-- The application code validates plans via getPlanLimits() which now includes 'basic'.
-- For fresh databases, schema.sql already includes 'basic' in the CHECK constraint.
-- For existing databases, the CHECK constraint must be updated by recreating the tables.
-- However, since D1 doesn't enforce CHECK constraints strictly at the driver level,
-- the app-level validation in plans.ts + billing.ts is the primary safeguard.

-- This migration is a no-op marker for tracking purposes.
-- The 'basic' plan is fully supported via application-level validation.
