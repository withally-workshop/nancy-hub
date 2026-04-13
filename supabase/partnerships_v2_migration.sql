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
