-- Activates pgvector inside the theconnection database.
-- This file is auto-run by Postgres only on the FIRST boot of a fresh data volume.
CREATE EXTENSION IF NOT EXISTS vector;
