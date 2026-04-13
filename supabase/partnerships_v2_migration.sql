-- Partnerships v2 migration
-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── pipeline: new columns ────────────────────────────────────
ALTER TABLE partnership_pipeline
  ADD COLUMN IF NOT EXISTS tracker_type    text NOT NULL DEFAULT 'Influencer',
  ADD COLUMN IF NOT EXISTS next_step_due   date,
  ADD COLUMN IF NOT EXISTS lead_contact    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS email_subject   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_name    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS touchpoint_date date,
  ADD COLUMN IF NOT EXISTS touchpoint_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS link_to_folder  text DEFAULT '';

-- ── creators: social link columns ────────────────────────────
ALTER TABLE partnership_creators
  ADD COLUMN IF NOT EXISTS tiktok_link   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ig_link       text DEFAULT '',
  ADD COLUMN IF NOT EXISTS youtube_link  text DEFAULT '';

-- ── onboarding kit: file/link field ──────────────────────────
ALTER TABLE partnership_kit
  ADD COLUMN IF NOT EXISTS link_url text DEFAULT '';

-- ── custom columns: meta table ───────────────────────────────
CREATE TABLE IF NOT EXISTS partnership_custom_cols (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  field_key  text NOT NULL,
  field_label text NOT NULL,
  col_order  int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ── custom fields: jsonb blob on each table ───────────────────
ALTER TABLE partnership_creators    ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
ALTER TABLE partnership_pipeline    ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
ALTER TABLE partnership_performance ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
ALTER TABLE partnership_payments    ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
ALTER TABLE partnership_affiliates  ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '{}';
