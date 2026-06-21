# Content Guide System — Context for Collaborators

> Read this **entire file** before touching any `content-guide*.html` file.
> These two pages are tightly coupled. A change in one can break the other.

---

## Overview

The Content Guide is Hello Nancy's internal tool for planning, tracking, and executing video content shoots. It has two pages — a **read-only view** for the full team and a **protected editor** for admins. Everything runs on vanilla HTML/CSS/JS with Supabase as the backend. There is no build step, no framework, no bundler.

---

## The Two Pages — View vs Edit

| | View Page | Edit Page |
|---|---|---|
| **File** | `content-guide.html` | `content-guide-edit.html` |
| **URL** | `nancy-hub.vercel.app/content-guide.html` | `nancy-hub.vercel.app/content-guide-edit.html` |
| **Who uses it** | Full team — anyone with the link | Admins only (Dione, Crystal) |
| **Auth** | None — public link, no login | Supabase email/password login gate |
| **Can edit data?** | **No.** Read-only. No save buttons, no modals, no editing UI. | **Yes.** Full CRUD — add/edit/delete videos, shots, schedule, pipeline |
| **Purpose** | Reference during shoots. See what needs filming, check off shots, view concepts. | Build and manage the guide. Add videos, tag content, create shoot schedules, manage pipeline. |

### What this means in practice

- The **view page** is what gets opened on phones during a shoot. It shows shot checklists, concept guides, and the schedule — but nobody can accidentally change anything.
- The **edit page** is where Dione (or Crystal) builds the guide before a shoot: adding videos, tagging them, setting up the shoot schedule, managing the edit & publish pipeline.
- Both pages load the **same data from Supabase**, so edits made in the editor appear on the view page immediately (on refresh).

### Rule: View page must NEVER have editing UI

No save buttons, no text inputs that write to Supabase, no modals that modify data, no "+ Add" buttons. The only interactive elements allowed on the view page are:
- Navigation (clicking into guides, shots, back buttons)
- Shot checkboxes (marking shots as done — this is the ONE write action allowed)
- Filter pills (filtering by tags)

If you see editing UI on the view page, it's a bug — remove it.

---

## General Mandatory Shots — How It Works

This is the core system. It answers: **"What shots do we need to capture at this event?"**

### The data structure

All shot data lives in one Supabase key: **`nancy_content_guide_shots_config_v1`**

```json
{
  "shots": [...],           // GENERAL_SHOTS — individual shot items
  "groups": [...],          // GS_GROUPS — how shots are organized into categories
  "schedule": [...],        // PEOPLE_SCHEDULE — legacy, still stored but not displayed
  "shootSchedule": [...],   // SHOOT_BLOCKS — the Shoot Schedule page data
  "pipeline": [...]         // PIPELINE — the Edit & Publish page data
}
```

**This data is NOT hardcoded.** Both pages load it dynamically via `loadShotsConfig()`. Never hardcode shot data into the HTML files.

### GENERAL_SHOTS (the `shots` array)

Each shot is one thing that needs filming:

```json
{
  "id": "nick-court-rally",
  "person": "Nick Kyrgios",
  "label": "Court rally & serve — wide action shots",
  "detail": "Wide and medium shots of Nick doing rallies...",
  "videoTitles": ["Nick Kyrgios - this was nuts", "Daily Mail Sport - Knockout game"]
}
```

- `id` — unique identifier, used for tracking completion
- `person` — which person/product/prop this shot belongs to (links to a group)
- `label` — what to film (shown as the checkbox label)
- `detail` — extra context (shown smaller below the label)
- `videoTitles` — which concept videos use this shot (links shots to videos by title)

### GS_GROUPS (the `groups` array)

Groups organize shots into categories shown as clickable cards on the home screen:

```json
{
  "label": "Celebrity",
  "items": [
    { "key": "Nick Kyrgios", "emoji": "🎬", "short": "Nick" }
  ]
}
```

Current groups (after migration): Product, Big Prop, Venue, Celeb, Creators / People, Founder / Team. Old labels (Celebrity, People, Products, Locations, Props & B-roll) are migrated on load via `GS_GROUP_MIGRATION_MAP`.

### How it displays

**Home screen** → 3-tab navigation: **Concepts** (default), **Shoot Schedule**, **Edit & Publish**. Under Concepts tab, shows 6 category cards (Product 🧴, Big Prop 🎈, Venue 📍, Celeb ⭐, Creators / People 👥, Founder / Team 🎬) with concept + shot count badges.

**Click a category** → Shows **Concepts | Shots** pill toggle. Under Concepts: horizontal concept cards with video embed, tags, script, outlier score. Under Shots: shot checklist with checkboxes, filter pills, progress bar, and connected concept thumbnails per shot.

**Checking a shot** → Saves to a separate Supabase key (`nancy_content_guide_gs_v1`) as a done set: `{ "done": ["nick-court-rally", ...] }`. This works on BOTH view and edit pages — it's the one write action allowed on the view page.

### How shots link to videos

The `videoTitles` array on each shot references concept videos by their title string. When a video title is renamed in the editor, the shots config auto-updates to match.

### CATEGORIES and migration maps

Both files define a `CATEGORIES` array (6 unified categories replacing old GS_GROUPS labels and GUIDES_LIST entries), a `GUIDE_MIGRATION_MAP` (remaps old guide IDs to new category IDs), and a `GS_GROUP_MIGRATION_MAP` (remaps old group labels to new category labels). The teaser guide is mapped to `null` (dropped). DM References videos land in Celeb temporarily.

---

## Shoot Schedule & Edit & Publish

Accessible via tabs on the home screen (replacing the old 2-pill navigation):

### Shoot Schedule pill

Opens a **full page** (replaces the home screen content) showing time-blocked shoot plans:

```
SHOOT_BLOCKS = [
  {
    "location": "Main Court",
    "time": "9:00 – 11:00",
    "scenes": [
      {
        "label": "Giant inflatable — zoom OUT reveal",
        "equipment": "Giant inflatable · gimbal/crane",
        "icon": "🎈",
        "concepts": [
          { "num": 4, "shot": 1, "hook": "It's THIS big 🤩 (Inflatable reveal)" }
        ]
      }
    ]
  }
]
```

The idea: group scenes by location and time, not by concept. If three concepts all need the same inflatable shot, you set up the inflatable ONCE and film for all three.

- **View page:** Read-only display. No add/edit/delete.
- **Edit page:** Full CRUD. Click a time block header to edit/delete. Click a scene to edit/delete. "+ Add Time Block" and "+ Add Scene" buttons.

### Edit & Publish pill

Opens a **full page** showing a kanban-style pipeline board. Concepts move through 7 statuses:

```
SHOT → INGESTED → ASSIGNED → EDITING → REVIEW → APPROVED → PUBLISHED
```

```
PIPELINE = [
  {
    "conceptNum": "4",
    "name": "POV: you finally found the one",
    "status": "editing",
    "editor": "Crystal",
    "publishTime": "12:00"
  }
]
```

- **View page:** Read-only kanban. See where each concept is in the pipeline.
- **Edit page:** Full CRUD. Click a card to edit (change status, reassign editor, update publish time). "+ Add Concept" button.

Both pages use the same `PIPELINE_STATUSES` array for column definitions:
```javascript
var PIPELINE_STATUSES = [
  { key:'shot', label:'SHOT', color:'#888' },
  { key:'ingested', label:'INGESTED', color:'#f5a623' },
  { key:'assigned', label:'ASSIGNED', color:'#44aaff' },
  { key:'editing', label:'EDITING', color:'#ff00aa' },
  { key:'review', label:'REVIEW', color:'#d966ff' },
  { key:'approved', label:'APPROVED', color:'#4caf50' },
  { key:'published', label:'PUBLISHED', color:'#222' }
];
```

---

## Concept Guides (the video lists)

Below the General Mandatory Shots section, both pages show **Concept cards** (Event, Teaser, Franchise, Daily, etc.). Each concept guide contains a list of videos with:

- Video URL + embedded preview
- Content title
- Outlier score (performance metric)
- Production shots (what to film for this video)
- Script (Nancified caption)
- Tags (People, Product, Location, Prop, Type)
- Full Guide (detailed breakdown — Why It Works, How to Nancify, etc.)

---

## Supabase Keys Reference

| Key | What it stores | Who writes to it |
|-----|---------------|-----------------|
| `nancy_content_guide_v1` | Full video list (all concepts + their videos) | Edit page only |
| `nancy_cg_full_guides_v1` | Full Guide content per video (Why It Works, etc.) | Edit page only |
| `nancy_content_guide_shots_config_v1` | General Mandatory Shots + groups + schedule + pipeline | Edit page only |
| `nancy_content_guide_gs_v1` | Shot completion checkboxes (`done` set) | Both pages (checkboxes) |
| `nancy_content_guide_tags_v1` | Custom tags added via editor | Edit page only |

**Never rename these keys.** Both pages depend on the exact strings.

---

## Data Flow

```
Edit page (content-guide-edit.html)
  → Admin logs in
  → Adds/edits videos, tags, shots, schedule, pipeline
  → Saves to Supabase keys above

View page (content-guide.html)
  → No login required
  → On load: reads all Supabase keys, merges with hardcoded defaults
  → Displays everything read-only
  → Only write: shot checkboxes → nancy_content_guide_gs_v1
```

### Hardcoded defaults

Both pages contain hardcoded default data (the original 13 event videos, guide structure, full guide content). Supabase data is **merged on top** — it doesn't replace the defaults. This means:

- `content-guide.html` has `DATA.guides[0].videos` with rich fields like `filmingGuide` and `description`
- `content-guide-edit.html` has `VIDEOS` array with `shots` and `script` defaults
- The merge is **field-by-field** (title, outlierScore, shots, script only) — never replace the whole video object

---

## What You CAN Touch

- Adding new concept guides or videos (through the edit page UI, not by editing HTML)
- Adding new tags to `TAG_CATEGORIES` (**must be done in BOTH files** — they each have their own copy)
- CSS styling changes (colors, spacing, fonts)
- Adding new `PIPELINE_STATUSES` entries (add to both files)
- Adding new `GS_GROUPS` entries (via Supabase, not hardcoded)

## What You CANNOT Touch

1. **Supabase key names** — `nancy_content_guide_v1`, `nancy_cg_full_guides_v1`, etc. Changing these breaks data loading.
2. **The field-by-field merge in `loadData()`** — Do NOT replace `g.videos = sg.videos`. The merge is intentional to preserve rich fields from hardcoded data.
3. **The `status` field logic** — Videos without a status default to `"approved"` for backwards compatibility. Don't change this.
4. **Adding editing UI to the view page** — No save buttons, no modals, no text inputs that write to Supabase. The view page is read-only.
5. **Changing one page without the other** — `TAG_CATEGORIES`, `PIPELINE_STATUSES`, `GUIDES_LIST` / `DATA.guides`, `GUIDE_EMOJIS`, group card layout, filter tab UI — all must stay in sync between both files.
6. **Hardcoding shot data** — `GENERAL_SHOTS` and `GS_GROUPS` come from Supabase. Never put them inline in HTML.

---

## What Currently Needs Fixing

### Pipeline modal Save button (Edit & Publish page — edit page only)

When clicking "+ Add Concept" on the Edit & Publish page, filling the form, and clicking Save, the `PIPELINE` array sometimes stays empty. Adding data via the browser JS console (`PIPELINE.push({...}); saveShotsFullConfig();`) works fine — the issue is isolated to the modal's Save button click handler. The most likely cause is an event propagation issue or the dynamically created modal's onclick not binding correctly. The data and save logic are correct — it's the UI click path that's broken.

### Legacy data still stored

`PEOPLE_SCHEDULE` (per-person schedule pills like "Nick 2-4pm") is still stored in the Supabase config under the `schedule` key but is no longer displayed anywhere. It was replaced by the Shoot Schedule and Edit & Publish pills. It's harmless but could be cleaned up.

### Old CSS still present

Some unused CSS classes from the old per-person schedule system (`.sched-pill`, `.sched-add-btn`, etc.) may still exist in the edit page. Harmless but could be cleaned up.

---

## Deployment

No build step. All files are plain HTML/CSS/JS served directly.

```
npx vercel deploy --prod --yes
```

**Always deploy to the `nancy-hub` Vercel project** (live at `nancy-hub.vercel.app`).
Never deploy to `nancy-hub-v2`. The git auto-deploy webhook is broken — always use the CLI.

---

## Tag System

Tags are organized into categories in `TAG_CATEGORIES` (defined in BOTH files — keep them in sync):

| Category | Tags |
|----------|------|
| **People** | Nick Kyrgios, Rahul, Momoko, Rachana, Crystal, Susan, Jackie, Kem, Gillian, Lottie Moss |
| **Product** | Lem, Avo, BeRRi, Blanket, Snack Pack, Lem-Avo-BeRRi |
| **Location** | London Street, Mandrake, Paddle Court |
| **Prop** | Inflatable Lem, Inflatable BeRRi, Big Inflatable Tennis Ball, Merch, Nancy Truck, Court, Mirrors |
| **Type** | AI |

To add a new tag: add the string to `TAG_CATEGORIES` in **both** files. Do not rename existing tag strings without migrating Supabase data.

---

## Key Functions Reference

### Edit page (`content-guide-edit.html`)

| Function | What it does |
|----------|-------------|
| `renderEditorHome()` | Renders 3-tab bar + 6 category cards |
| `edSwitchTab(tabId)` | Switches between Concepts / Schedule / Pipeline tabs |
| `renderEdCategoryDetail(catId, pill)` | Category detail with Concepts / Shots pill toggle |
| `renderEdCategoryConcepts(catId)` | Concept summary cards with link to full editor |
| `renderEdCategoryShots(catId, filter)` | Shot checklist inside category detail |
| `renderShootSchedulePage(wrap)` | Shoot Schedule with time blocks and scenes |
| `renderPipelinePage(wrap)` | Edit & Publish kanban board |
| `saveShotsFullConfig()` | Saves ALL config (shots, groups, schedule, shootSchedule, pipeline) to Supabase |
| `loadShotsConfig()` | Loads config from Supabase into JS variables + applies GS migration |
| `addShootBlock()` / `editShootBlock(bi)` | CRUD for time blocks |
| `addScene(bi)` / `editScene(bi, si)` | CRUD for scenes within a time block |
| `addPipelineCard()` / `editPipelineCard(idx)` | CRUD for pipeline kanban cards |

### View page (`content-guide.html`)

| Function | What it does |
|----------|-------------|
| `renderHome()` | Sets active tab and renders tab bar + concepts tab |
| `renderTabBar()` | 3-tab bar: Concepts / Shoot Schedule / Edit & Publish |
| `switchTab(tabId)` | Switches tab content |
| `renderConceptsTab(wrap)` | 6 category cards grid |
| `renderCategoryDetail(catId, pill)` | Category detail with Concepts / Shots pill toggle |
| `renderCategoryConcepts(catId)` | Horizontal concept cards with video embed + full details |
| `renderCategoryShots(catId, filter)` | Shot checklist with connected video thumbnails |
| `showSchedulePageView(wrap)` | Read-only Shoot Schedule |
| `showPipelinePageView(wrap)` | Read-only Edit & Publish kanban |
| `renderShot(id)` | Renders shot detail page (page 2) |
| `renderGuide(id)` | Renders concept guide detail page (page 3) |

---

*Last updated: 2026-06-21*
