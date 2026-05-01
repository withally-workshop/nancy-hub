# CLAUDE.md — Nancy Hub Project

## Who I Am
**Name:** Dione
**Role:** Marketing Executive Partner at Hello Nancy, working alongside Crystal (Head of Marketing)
**Email:** danielle@carenbloom.com (super admin)

## The Client & Company
**Company:** Hello Nancy
**Key contact:** Crystal — Head of Marketing, spontaneous, casual, idealistic
**What they do:** Pop-up events, merch, social media, content creation — with many external and internal teams running simultaneously

## What We're Building
A private internal hub — the team's daily operating system — so nobody gets lost across scattered priorities, channels, and responsibilities. One place to see what's due, who owns it, and what's coming next.

## Crystal's Communication Style
- Spontaneous and casual — not formal
- Idealistic and vision-driven — she thinks in big ideas
- Cares most about **learning**, **visualizing concepts**, and **executing her ideas**
- Tends to leap forward and miss the "next step" — needs the hub to bridge idea → execution
- All work goes through an approval chain: Dione → Crystal → Founders

## The Real Problems We're Solving
1. **Too many ideas, not enough next steps** — Crystal generates fast; execution details get missed
2. **Priorities everywhere** — WhatsApp, Slack, calendar — no single source of truth
3. **Reactive work** — without a system, the team works on the wrong thing at the wrong time
4. **Approval overhead** — work needs to be clear and polished before it goes up the chain
5. **Learning while executing** — fast environment, many responsibilities, no room to stop and regroup

## How to Work With Me

**Walk me through it + Ask me first + Show me first (B + C + D)**

- Before building anything: give me **3 options**, tell me which one you'd pick and why, then wait for my go-ahead
- Walk me through what you're doing and why as you build
- Show me a preview before committing to a full build
- Build **one step at a time** — show me the result before moving to the next step
- Test every output with a **real example from our workflow** before saying it's done

## Rules That Cannot Be Broken

1. **Never hardcode anything without asking first** — always confirm values, IDs, structure with me before baking them in
2. **Always think A to Z** — before we call something done, make sure everything from A to Y is connected, polished, and makes sense. No loose ends, no disconnected pieces, no unfinished logic hiding behind a working surface
3. **Never overstate what exists** — if something is a projection, label it projected. If it's unfinished, say so
4. **One step at a time** — don't jump ahead while the current step is still unverified
5. **Brainstorm before planning** — when working on a new feature or fix, brainstorm with me first. State your understanding of the problem, ask clarifying questions, then propose a solution. Don't skip straight to a full plan or code.
6. **Deploy to the right project** — Always push to the **`nancy-hub`** Vercel project (live at `nancy-hub.vercel.app`), NEVER to `nancy-hub-v2`. The git auto-deploy webhook is broken, so use `vercel deploy --prod` from the project folder, then alias to `nancy-hub.vercel.app` if needed. Verify the deployed file matches local before telling me it's done.
7. **Fix the whole logic, not just the function** — when fixing or building anything, audit the entire flow it touches. Don't just patch the line that's broken. Flag any redundant code, contradictory logic, dead code paths, or shortcuts you find along the way. If a function looks duplicated or the logic doesn't make sense end-to-end, surface it before moving on.
8. **Flag anything that could block a Vercel deploy** — proactively call out anything that risks breaking the build or hiding a deploy failure: stale/wrong git remote, broken auto-deploy webhook, deployments going to the wrong Vercel project, build errors, missing env vars, files that exceed Vercel limits, syntax errors in HTML/JS, broken imports, large untracked files, or git push redirects. Tell me BEFORE I think it's deployed, not after.

## Session Protocol

At the start of every session:
1. Re-read this file
2. Check session history and any open plan files in `.claude/plans/`
3. Note what was last built and what's still pending
4. **Then** ask me what we're working on today — don't assume

At the end of every session:
- Summarize what was built
- List what's still missing or unfinished
- Tell me what I should do next (including any Supabase/manual steps)

## Project Stack
- Vanilla HTML / CSS / JavaScript (no frameworks, no build tools)
- Supabase (data stored as JSON strings in `settings` table)
- `hub.js` + `styles.css` shared across all pages
- `bootHub()` → `onPageReady()` pattern per page
- Super admin check: `email === 'danielle@carenbloom.com'`

## Hub Pages
| Page | Status |
|------|--------|
| Task Hub (taskflow.html) | ✅ Functional — in daily use |
| Learning Hub (learning.html) | ✅ Functional — in daily use |
| Events (projects.html — Events tab) | ✅ Built, testing |
| Projects (projects.html — Projects tab) | 🔧 Just built, needs refinement |
| Social (social.html) | 🔧 In progress |
| Partnerships (creators.html) | 🔧 Needs work |
| Dashboard (index.html) | ✅ Exists |
| Brand Guidelines (brand.html) | ✅ Exists |
| Onboarding (onboarding.html) | ✅ Exists |

## Current State
- Hub is in internal testing with Dione + Crystal only
- Goal: roll out to the full Hello Nancy team once core flows are proven
- Priority: Task Hub is the anchor — everything else feeds into it

---

*Last updated: 2026-04-22*
