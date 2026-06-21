# Content Guide — How It Works

Read this before making changes to the Content Guide.

---

## What Is the Content Guide?

The Content Guide is Hello Nancy's internal tool for planning, tracking, and executing video content shoots. It lives at two links:

- View page: https://nancy-hub.vercel.app/content-guide.html
  This is the read-only version. The full team uses this during shoots to see what needs filming, check off completed shots, and reference concept details. Nobody can accidentally edit anything here.

- Edit page: https://nancy-hub.vercel.app/content-guide-edit.html
  This is the admin version. Only Dione and Crystal can log in. This is where videos get added, tagged, analysed, and organised. All changes made here show up on the view page immediately (on refresh).

Both pages pull the same data from Supabase. There is no build step — everything is plain HTML/CSS/JS.

---

## What Changed in the June 2025 Redesign

Before, the guide was a flat list of concept guides with stacked cards — video on top, small text below. Hooks were buried in body text and hard to scan. The Original and Nancy analysis sections sat at the very bottom of each card.

Now the layout is completely different:

- Three tabs at the top: Concepts, Shoot Schedule, and Edit & Publish
- Under Concepts, there are six category cards: Product, Big Prop, Venue, Celeb, Creators / People, and Founder / Team
- Each category has a toggle between Concepts and Shots
- Detail cards use a side-by-side layout: video embed on the left, metadata fields on the right (Tags, People, Hook, Caption, Text Overlay), with Original and Nancy analysis cards filling the space below the metadata — not pushed to the bottom
- Hook types are now color-coded badges: pink for Visual, green for Script, blue for Audio, yellow for Mix
- Tags are solid colored pills: purple for People, green for Product, yellow for Location, blue for Prop
- Views and likes now show icons (eye and heart) next to the numbers

---

## The Three Tabs

### Concepts Tab (default)

This is the main workspace. It shows six category cards on the home screen:

- Product (the drink products — Lem, BeRRi, Avo, etc.)
- Big Prop (inflatables, truck, mirrors — large visual props)
- Venue (shoot locations — London Street, Mandrake, Paddle Court)
- Celeb (celebrity content — Nick Kyrgios and similar)
- Creators / People (street interviews, creator content)
- Founder / Team (behind-the-scenes, team content)

Click a category to see its concepts (video reference cards) or shots (filming checklist).

### Shoot Schedule Tab

Shows the shoot plan organised by location and time block. The idea is that if three concepts all need the same prop or location, you set it up once and film everything in that block.

On the view page, this is read-only. On the edit page, admins can add, edit, and delete time blocks and scenes.

### Edit & Publish Tab

A kanban board that tracks where each concept is in the editing pipeline. Concepts move through seven stages:

Shot → Ingested → Assigned → Editing → Review → Approved → Published

On the view page, this is read-only. On the edit page, admins can add concepts to the pipeline, change their status, assign editors, and set publish times.

---

## How the Shooting Workflow Flows

This is the end-to-end process from planning to publishing:

1. Concepts get added in the edit page — each one is a video reference with analysis, tags, hook type, and filming instructions.

2. Shots are created and linked to concepts. Each shot describes one specific thing to film (for example, "Court rally — wide action shots of Nick"). Shots are grouped by category and person.

3. During the shoot, the team opens the view page on their phones. They use the shot checklist to tick off each shot as it's filmed. This is the one thing the view page can write — checkbox completions save to Supabase in real time.

4. As shots complete, a progress bar fills up on each concept card. When ALL shots linked to a concept are done, it shows a "Ready for Editors" badge. This tells the team that concept has all the footage it needs.

5. "Ready for Editors" is a signal, not an automatic action. An admin then manually adds that concept to the Edit & Publish pipeline (on the edit page) and sets its status to "Ingested" or "Assigned."

6. From there, editors move concepts through the pipeline stages: Assigned → Editing → Review → Approved → Published. The whole team can see progress on the view page's Edit & Publish tab.

---

## How a Detail Card Works

When you click on a concept, the detail card shows:

Left side:
- Title of the concept
- Link to the original video (Instagram, TikTok, or YouTube)
- Embedded video preview with the outlier score badge (e.g. "13.94x")
- Views and likes counts with icons

Right side:
- Tags — the products, locations, and props involved (colored pills)
- People — who appears in or films this concept (purple pills)
- Hook — the hook type and description (e.g. "Visual Hook. Rapid-fire close-ups of luxury materials")
- Caption — the suggested post caption
- Text Overlay — any on-screen text
- Two dark cards side by side:
  - Original — analysis of why the original video went viral, with timestamped frame breakdowns (lime green badges)
  - Nancy — how Hello Nancy will recreate this concept, with production shot breakdowns (pink badges)

---

## How the Analysis Works

Each concept video has analysis data that breaks down why the original went viral and how Nancy should recreate it:

**Original side (why it worked):**
- Deep Analysis — a written breakdown of the viral mechanics (what made the hook work, pacing, visual strategy)
- Frame Breakdown — timestamped shots from the original video (e.g. "0:00–0:02 Extreme close-up of product texture"). These show as lime green timestamp badges.

**Nancy side (how to recreate it):**
- Execution — a description of how Nancy will adapt this concept (who films it, what to focus on, what to change)
- Production Shots — the specific shots the Nancy team needs to capture (e.g. "Wide shot of Nick serving on court"). These show as pink timestamp badges.

All of this data is entered through the edit page. The view page just displays it.

---

## Tags

Tags describe what appears in each concept video. They are organised into five categories:

- People (purple pills): Nick Kyrgios, Rahul, Momoko, Rachana, Crystal, Susan, Jackie, Kem, Gillian, Lottie Moss
- Product (green pills): Lem, Avo, BeRRi, Blanket, Snack Pack, Lem-Avo-BeRRi
- Location (yellow pills): London Street, Mandrake, Paddle Court
- Prop (blue pills): Inflatable Lem, Inflatable BeRRi, Big Inflatable Tennis Ball, Merch, Nancy Truck, Court, Mirrors
- Type: AI

Note: Crystal should only appear in 2–3 videos max. Susan and Jackie take most people shots. Corrine is the videographer (not a People tag — she films, she doesn't appear in concepts).

---

## What You Can Change

- Styling — colors, spacing, fonts, layout tweaks
- Adding new tags — but you must add them in both the view page and the edit page files. They each have their own copy of the tag list.
- Adding new pipeline stages — add to both files
- Adding videos, shots, and schedule blocks — through the edit page, not by editing the code
- Rearranging the order of fields on the detail card
- Grid card appearance

## What You Must Not Change

- The five Supabase key names. Renaming any of them breaks the entire data connection between the two pages.
- The data merge logic in the loading function. It merges Supabase data on top of defaults field by field — this is intentional and changing it will lose data.
- The load and save functions for shots. Both pages depend on the exact same data shape.
- The view page's read-only rule. No save buttons, no edit modals, no forms. The only thing that writes is the shot checkbox.
- Changing one page without the other. The tag list, categories, pipeline statuses, and migration maps must stay identical in both files. If you change one and not the other, they will show different data.
- The video embed function. It detects Instagram, TikTok, and YouTube URLs and renders the correct embed. It works — leave it alone.
- Shot data in the code. Shots come from Supabase dynamically. Never hardcode them.
- The migration maps. These remap old category names to new ones. Removing them breaks all existing data in Supabase.

---

## Deployment

There is no build step. To deploy:

    npx vercel deploy --prod --yes

Always deploy to the nancy-hub Vercel project (nancy-hub.vercel.app). Never deploy to nancy-hub-v2. The git auto-deploy webhook is broken — always use the CLI command above.

---

*Last updated: 21 June 2025*
