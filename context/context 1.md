
/
WorkNest_Case_Study_Enhanced (1).pdf
pdf

Make a very good ppt for all the delivarables mentioned in the case and propose a business solutions tooo

Viewed 14 files, ran 6 commands, and 2 more tools
12 slides, covering all five function deliverables plus a unified recommendation:

Title
Context (the three floors, pricing)
Diagnosis (one root cause, five symptoms)
Finance deliverable (entities, ACID failures, fix)
Operations deliverable (double-booking trace, ER sketch, fix)
Marketing & Analytics deliverable (missing fields, segmentation fix)
HR deliverable (staffing gap, Staff_Training entity, business rule)
Technology deliverable (full ER diagram, failure-to-DBMS-concept mapping)
Proposed business solution (unified platform, four modules)
Rollout plan (3 phases, one per month)
Expected impact (stat callouts + function payoffs)
Closing
Each function slide names the specific broken rule from the case and ties it to the same root fix: one shared database instead of five separate spreadsheets and WhatsApp threads. The technology slide gives a first-draft ER diagram with all entities and relationships, and the recommendation slide argues for building it once rather than patching each function separately.


Worknest case study solution
Presentation·PPTX 
which property from acid prevents double booking of same seat

Thought for 3s
Isolation.

Double-booking is fundamentally a concurrency problem: two staff members (or two transactions) try to book the same seat/room at nearly the same moment. Each one checks availability, sees it's free, and writes their booking — without knowing the other is doing the exact same thing at the same time.

Isolation guarantees that concurrent transactions don't interfere with each other's reads and writes. In a properly isolated system:

Staff A's booking transaction locks the row (or slot) the moment it starts writing.
Staff B's transaction, checking that same slot a second later, sees it as already taken — not the stale "free" state.
Only one of the two transactions succeeds; the other gets rejected or has to retry against updated data.
Worth noting: Isolation alone isn't the whole fix. It stops two simultaneous writes from both succeeding, but you also need a UNIQUE constraint on (resource_id, date, start_time) as the underlying rule — that's what Isolation is protecting. Without the constraint, isolation just makes the writes happen one after another instead of at the same time; it doesn't say the second one should fail.

So the pairing in the WorkNest case is:

Rule: no two bookings can share the same seat + date + time → enforced by a UNIQUE constraint
ACID guarantee: Isolation ensures that under concurrent access, that constraint actually gets checked against current data, not stale data one staff member read a few seconds earlier
Good, let's zoom out to that level before we touch any code. Here's the full picture.

Domain Coverage — Confirming Every Angle From the Case Is Represented
Case Domain	Where It Lives in the Project	What It Demonstrates
Technology/IT	The entire schema, RLS policies, exclusion constraint, ACID transactions	The core "single source of truth" fix — this is the backbone everything else sits on
Operations	Admin Portal → Operations view (live booking grid across 3 floors)	No more double-booking, staff see one real-time truth instead of scattered sheets
Finance	Customer Portal → Billing dashboard + Admin → invoice management	Cancellation-and-billing as one atomic transaction, accurate hour-tracking
HR	Admin Portal → Staffing view (shift + certification tracker)	Shift coverage guaranteed via a queryable rule, not institutional memory
Marketing & Analytics	Admin Portal → Analytics dashboard (channel, occupancy, conversion)	The "where should we open next" question, now answerable from real data
Every function from your original case study deck has a corresponding, working piece in the project. Nothing's left as just a diagram, each one becomes a real screen backed by real queries.

Prerequisites — What Needs to Exist Before Phase 0 Starts
This is the checklist to close out before any building begins, so the phases don't stall mid-way.

Accounts & Access

GitHub account (repo already created, per your plan)
Supabase account (free tier is sufficient for this scale)
Vercel account (for deployment, connects directly to GitHub)
Team Role Assignments

Decide now, not later, who owns which phase/domain across your 7 people. Suggested split: 2 on schema/backend (Phase 1), 2 on Customer Portal (Phases 3-4), 2 on Admin Portal (Phases 5-7), 1 floating on integration/deployment/docs. Overlap is fine, but someone needs clear ownership per phase so work doesn't collide.
Data Specification (decide the shape before generating it)

Confirm the volumes we discussed: ~50-80 members, ~250-400 bookings, 3 locations, ~60 resources, 8-10 staff
Decide the date range for historical data now — e.g., "last 6 months," so every chart and query is built against a consistent window from day one
Decide the acquisition channel categories and plan types exactly as final, since these become CHECK constraint values — changing them later means touching the schema again
Demo Logistics (settle before build, not day-of)

Confirm classroom wifi/network won't block Supabase/Vercel domains — test this once, early, not on demo day
Assign who plays which role in the live demo (as discussed)
Decide now that a rehearsal run happens at least 2-3 days before the actual class demo, with enough buffer to fix anything broken
Operating Agreement — How I'll Work With You Through the Build
Acknowledging your points directly, this is how I'll operate for the rest of this project:

Simplicity by default. Every phase will be the smallest working version that proves the concept, no premature complexity. If something can be done in fewer steps without losing the "this shows real database understanding" value, that's the version I'll give you.
Step-by-step within each phase. When we move into build mode, each phase gets broken into ordered, checkable steps, not a wall of code dropped at once. You'll know exactly what to run, what to expect to see, and how to confirm it worked before moving to the next step.
Errors get fixed, not deflected. If something breaks, I diagnose and give you a corrected version immediately, not a vague "try troubleshooting this yourself" response.
No stalling during active build sessions. When we're mid-phase, you get complete, working answers in that same exchange, not partial answers with "continue this later" gaps.
We're aligned on scope and prerequisites. The natural next move is: do you want to start locking the exact data specification (final list of acquisition channels, plan names, resource counts per floor) right now, or jump straight into Phase 0 setup? Either is fine, just tell me which one and we'll go step by step from there.


Message collapsed
Ran 4 commands, viewed 2 files, and 2 more tools
One-page MSA, everything we agreed on: scope, tech stack, data spec, prerequisites, phase plan, and working terms.

Say the word and we start Phase 0 — step by step, with codes and exact commands.


Worknest project msa
Document·DOCX 


You are out of free messages until 3:20 AM
Write a message…


Claude is AI and can make mistakes. Please double-check responses.





