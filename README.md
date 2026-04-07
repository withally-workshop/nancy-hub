# Nancy Hub

Internal marketing hub for the CareNBloom team.

## Pages

| Page | Status |
|---|---|
| `index.html` | Hub home |
| `taskflow.html` | Task Hub — tasks, deliverables, inbox triage |
| `social.html` | Content & Socials (UI ready) |
| `admin.html` | Admin Base — health monitor, settings, team |
| `learning.html` | Learning & Playbook (coming soon) |
| `creators.html` | Creators & Onboarding (coming soon) |

## Stack

- **Frontend:** Vanilla HTML / CSS / JS — no build step
- **Auth + DB:** Supabase
- **File storage:** Google Drive via Apps Script (`gas/Code.gs`)
- **AI triage:** Gemini Flash API
- **Access:** `@carenbloom.com` emails only

## Setup

See [SETUP.md](SETUP.md) for full step-by-step instructions covering Supabase, Google Apps Script, Gemini, and Slack.

## Running locally

No server needed — open `index.html` directly in a browser.
