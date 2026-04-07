# Nancy Hub v2 — Setup Guide

> Internal marketing hub for CareNBloom. Admin: Dione (danielle@carenbloom.com)

---

## Stack

| Layer | Service | Cost |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS — no build needed | Free |
| Auth + Database | Supabase | Free tier |
| File storage | Google Drive via Apps Script | Free |
| AI triage | Gemini Flash API | Free |
| Backend trigger | Google Apps Script | Free |

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and open your project
2. Make sure these tables exist (SQL Editor → run if missing):

```sql
-- Hub settings (key/value store)
create table if not exists settings (
  key text primary key,
  value text
);

-- User profiles
create table if not exists boards (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  avatar text,
  role text default 'member',
  share_code text,
  auth_id uuid,
  created_at timestamptz default now()
);

-- Activity tracking
create table if not exists activity_log (
  id uuid default gen_random_uuid() primary key,
  board_id uuid,
  member_name text,
  member_email text,
  action text,
  details text,
  section text,
  created_at timestamptz default now()
);

-- Inbox triage sessions
create table if not exists inbox_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  source text,
  summary text,
  important_items jsonb,
  marketing_assets jsonb,
  processed_at timestamptz default now()
);
```

3. In Authentication → Settings → make sure "Enable email confirmations" is OFF (so signups work without email verify)
4. In Authentication → URL Configuration → add your site URL

---

## 2. Google Apps Script Setup

The GAS script is your backend bridge to Gmail and Google Drive.

### First-time setup

1. Go to [script.google.com](https://script.google.com)
2. Click **New project**
3. Delete the default `myFunction()` code
4. Copy the entire contents of `gas/Code.gs` from this repo and paste it in
5. Click **Save** (Ctrl+S), name it `Nancy Hub`

### Authorize Gmail

1. In the GAS editor, select `testGmail` from the function dropdown
2. Click **Run**
3. A popup will appear — click **Review Permissions → Allow**
4. Check the **Execution log** — should say `Gmail OK`

### Authorize Drive

1. Select `testDrive` from the dropdown and click **Run**
2. Check the log — should show Drive usage percentage

### Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙ → select **Web app**
3. Set:
   - **Description:** Nancy Hub Backend
   - **Execute as:** Me (Dione's account)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like:
   `https://script.google.com/macros/s/LONG_ID_HERE/exec`
6. Paste this URL into `shared/hub.js` as the value of `SCRIPT_URL`
7. Also paste it into `taskflow.html` at the same variable (line ~1314)

> **Important:** Every time you change the script code, you must create a **New deployment** (not update existing) for the changes to take effect.

---

## 3. Gemini API Key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key
4. Open the app → Admin Base → Settings → paste into **Gemini API Key** → Save

---

## 4. Slack Token (for Inbox Review)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App → From scratch**
3. Name it `Nancy Hub`, select your workspace
4. Go to **OAuth & Permissions**
5. Under **Scopes → User Token Scopes**, add:
   - `channels:history`
   - `channels:read`
   - `groups:history` (for private channels)
6. Click **Install to Workspace → Allow**
7. Copy the **User OAuth Token** (starts with `xoxp-`)
8. Open Admin Base → Settings → paste into **Slack Token** → Save

---

## 5. Hub Password

Default hub password is `nancy2024`. To change it:
- Admin Base → Settings → Hub Password → enter new password → Save

Share this password with your team. It's the entry gate before the login screen.

---

## 6. First Admin Account

The account `danielle@carenbloom.com` is automatically set as admin when it signs up.
All other `@carenbloom.com` accounts are set as `member` by default.
You can promote/demote users in Admin Base → Team Members.

---

## Running the App

No server needed. Just open `index.html` in a browser. If hosting on GitHub Pages or similar, make sure all file paths are relative.

---

## What Each File Does

| File | Purpose |
|---|---|
| `index.html` | Hub home — links to all sections |
| `taskflow.html` | Task Hub — main page, most features |
| `social.html` | Content & Socials (UI built, backend pending) |
| `learning.html` | Learning & Playbook (placeholder) |
| `creators.html` | Creators & Onboarding (placeholder) |
| `admin.html` | Admin Base — health monitor, settings, team |
| `shared/hub.js` | Shared auth, Supabase client, utilities |
| `shared/styles.css` | Global styles |
| `gas/Code.gs` | Google Apps Script — copy into GAS editor |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| GAS Script shows red in Admin | Re-deploy in GAS as a new deployment |
| Gmail fetch fails | Run `testGmail()` in GAS editor to authorize |
| Slack shows yellow | Add token in Admin → Settings |
| Supabase shows red | Check if project is paused at supabase.com/dashboard |
| Login not working | Check Supabase Auth → confirm email is OFF |
| Files not uploading | Run `testDrive()` in GAS editor, check folder permissions |
