# **Business Requirements Document (BRD)** 

_DPMG Project Team 3 — WorkNest_ 

|**Project Name**||WorkNest — S<br>Platform|mart Workspace Booking & Membership Management|
|---|---|---|---|
|**Group Number & Team**<br>**Members**||Group 3 — Lak|shmi P, Sangeetha, Kajal, Sristi Sinha, Sufyaan Bin Salman|
|**Version**||v1.0||
|**Date**||29-08-2026||
|**Prepared By**||Sufyaan Bin Sa|lman|
|**Reviewed By**||Sangeetha||
|**1. Team Charter**<br>**Team Member**|**Phase**|**Owned**|**Role / Responsibility**|
|**Sufyaan Bin Salman**|Requir|ements|Wrote functional and non-functional requirements;<br>coordinated scope discussions between admin-interface<br>and customer-interface needs; owns this BRD.|
|**Lakshmi P**|Design||Owns UI/UX flow for the admin and customer interfaces;<br>defines wireframes for the booking, pricing, and<br>membership screens.|
|**Sangeetha**|Build||Leads implementation of the booking engine, pricing/plan<br>logic, and the cancellation refund rule engine.|
|**Kajal**|Test||Owns test case design for double-booking conflicts, refund<br>calculations across membership tiers, and role-based<br>access rules.|
|**Sristi Sinha**|Demo|& Closure|Prepares the demo script, seed/sample data, and final<br>project closure documentation for submission.|



## **1. Team Charter** 

## **2. Purpose & Problem Statement** 

Small coworking operators running 2–3 locations currently track desk and conference-room bookings, membership tiers, and cancellation refunds by hand — across spreadsheets and phone/WhatsApp messages. This causes double-bookings, inconsistent refund amounts when members cancel, and no clear view of which locations or resource types actually earn revenue. WorkNest gives location staff a single dashboard to configure resources, pricing, and cancellation rules per membership tier, while letting members book desks and rooms, track their remaining plan hours, and cancel bookings themselves under rules the admin controls. 

## **3. Business Objectives & Success Metrics (SLA / KPIs)** 

These metrics define what "success" looks like for WorkNest once it goes live, and are what the team will be graded against during the demo. 

|**Objective**|**KPI / Success Metric**|**Target (SLA)**|
|---|---|---|
|Eliminate double-bookings|Number of overlapping/double-booked<br>resource slots after go-live|0 double-bookings, enforced at<br>the database level|
|Cut admin cancellation<br>workload|Average time admin spends manually<br>processing one cancellation (today: manual,<br>~10 min)|Under 1 minute of admin<br>involvement per cancellation<br>post-launch|
|Give members real-time<br>visibility|Share of members who can view their<br>remaining plan hours without contacting<br>admin|100% of active members, updated<br>within the same session as a<br>booking|
|Drive self-service adoption|Share of active members completing at least<br>one self-service booking|80% within the first month after<br>launch|
|Keep the platform available|System uptime during business hours (8 AM<br>–8 PM), Vercel + Supabase free tier|99% uptime during business<br>hours|
|Guarantee refund accuracy|Cancellation refunds calculated per the<br>admin-configured tier rule|100% match between refund<br>shown and the configured tier<br>percentage|



## **4. Scope** 

### **In Scope** 

- Admin login using employee credentials, with the admin's location auto-assigned from their employee ID 

- Admin-configurable resource catalog (Hot Desk, Dedicated Desk, Conference Room) per location, with add/edit/remove 

- Admin-defined minimum booking duration per resource type, including per conference-room capacity tier (e.g., 2 hrs standard, 4 hrs for a 20-person room) 

- Admin-defined Hourly and Monthly pricing, and 4 membership tiers (Regular, Silver, Gold, Platinum) with tierbased cancellation refund percentages and notice windows 

- Member booking flow: select location, resource type (filtered to the member's plan), and time slot, with doublebooking prevented at the database level 

- Member booking history, self-service cancellation (per admin-defined policy), membership status (plan, hours/days remaining), and a Help & Support screen 

- Admin cross-location live booking view and revenue/occupancy analytics 

### **Out of Scope** 

- Real payment gateway integration — fees and refunds are calculated but not processed through a live payment processor 

- SMS / WhatsApp notifications 

- Native mobile app 

- Multi-tenant support (multiple coworking brands on a single deployment) 

## **5. Stakeholders & User Roles** 

|**Role**|**Description / Needs**|
|---|---|
|**Admin / Location Employee**|Logs in with employee credentials (location auto-assigned by employee ID);<br>configures resources, pricing, and cancellation rules for their location; monitors<br>cross-location bookings and analytics.|
|**Member – Regular (hourly)**|Books desks or rooms on a pay-per-use basis with no monthly commitment; no<br>monthly hour allowance to track.|
|**Member – Silver / Gold /**<br>**Platinum**|Books resources under a monthly plan; tracks remaining monthly hours; cancels<br>bookings under their tier's refund rule (Platinum highest refund, Silver lowest).|
|**Course Instructor (Prof.**<br>**Swaminathan N)**|Evaluates the BRD, build, and final demo against the DPMG course rubric;<br>approves scope before Phase 1 is locked.|
|**Development Team**|Five-member student team (Section 1 above) responsible for requirements,<br>design, build, test, and closure.|



## **6. Functional Requirements** 

Each requirement is written so it can be tested independently — one behaviour per row. 

|**Req**<br>**ID**|**Requirement**|**Priority**|**Owner**|**Acceptance Criteria**|
|---|---|---|---|---|
|**FR1**|Admin can log in using<br>employee credentials|Must|Sangeetha|Valid credentials load the admin<br>dashboard within 2 seconds; invalid<br>credentials show an error without<br>revealing which field was wrong.|
|**FR2**|System auto-assigns the admin's<br>location based on their employee<br>ID at login|Must|Sangeetha|The admin's location is set<br>automatically post-login and cannot be<br>changed from the login screen.|
|**FR3**|Admin can add, edit, or remove<br>resources (Hot Desk, Dedicated<br>Desk, Conference Room) for<br>their location|Must|Sangeetha|A resource added, edited, or removed<br>by the admin reflects on the live<br>booking grid within the same session,<br>no reload required.|
|**FR4**|Admin can set a minimum<br>booking duration per resource<br>type, including per conference<br>room capacity tier|Must|Sangeetha|A booking attempt below the configured<br>minimum (e.g., 2 hrs for a standard<br>room, 4 hrs for a 20-person room) is<br>rejected and the minimum is shown to<br>the member.|
|**FR5**|Admin can configure Hourly and<br>Monthly pricing per resource<br>type|Must|Sangeetha|A price change made by the admin<br>reflects on the member's booking screen<br>for that resource within the same<br>session.|
|**FR6**|Admin can define the<br>cancellation refund percentage<br>per membership tier|Must|Sangeetha|Refund percentages set by the admin<br>(e.g., Platinum 100%, Gold 80%, Silver<br>70%) are applied automatically when a<br>member of that tier cancels.|
|**FR7**|Admin can define the<br>cancellation notice window (e.g.,<br>days/hours before the booking)|Must|Sangeetha|A cancellation requested outside the<br>configured notice window shows the<br>reduced or zero refund before the<br>member confirms.|



|**FR8**|Member can log in using their<br>member ID|Must|Kajal|A valid member ID loads that member's<br>dashboard; an invalid ID shows a<br>generic error.|
|---|---|---|---|---|
|**FR9**|Member can book a resource by<br>selecting a location and resource<br>type|Must|Sangeetha|Only resource types included in the<br>member's active plan are selectable;<br>other types are hidden or disabled.|
|**FR10**|System prevents double-booking<br>of the same resource for<br>overlapping time slots|Must|Sangeetha|A second booking on an already-booked<br>slot is rejected at the database level, not<br>only in the UI.|
|**FR11**|Member can view their booking<br>history|Must|Kajal|All past and upcoming bookings for the<br>logged-in member display with date,<br>resource, location, and status.|
|**FR12**|Member can cancel a booking<br>under the admin-defined<br>cancellation policy|Must|Kajal|The refund amount shown before the<br>member confirms cancellation matches<br>the admin-configured tier percentage<br>and notice window.|
|**FR13**|Member can view their current<br>plan, remaining monthly hours,<br>and renewal/expiry date|Must|Kajal|Remaining hours update immediately<br>after each new booking or cancellation.|
|**FR14**|Member can raise a query<br>through a Help & Support screen|Should|Lakshmi P|A submitted query is stored and visible<br>to admin with the member ID,<br>timestamp, and message text.|
|**FR15**|Admin can view a live, cross-<br>location booking grid|Should|Sangeetha|The grid reflects booking status across<br>all 3 locations in real time, without a<br>manual page reload.|
|**FR16**|Admin can view revenue and<br>occupancy analytics by location<br>and resource type|Could|Sangeetha|Chart totals for the last 6 months match<br>the underlying bookings table for the<br>same period.|
|**FR17**|Gold and Platinum members can<br>receive a configurable free<br>monthly conference-room-hours<br>allowance|Could|Sangeetha|Free hours used reduce the member's<br>allowance counter and do not generate a<br>charge until the allowance is exhausted.|



## **7. Non-Functional Requirements** 

|**NFR ID**|**NFR Area**|**Requirement**|
|---|---|---|
|**NFR1**|**Performance**|The booking availability grid should load in under 2 seconds for up to 400<br>bookings spread across 3 locations.|
|**NFR2**|**Usability**|A first-time member should be able to complete a booking within 3 screens<br>without needing training material.|
|**NFR3**|**Scalability**|The system should support up to 80 members and 60 resources across 3 locations<br>without requiring architecture changes.|
|**NFR4**|**Data & Privacy**|No real payment card data is stored; only mock/sample billing data is used for the<br>class demo.|
|**NFR5**|**Availability**|The system should be reachable during business hours (8 AM–8 PM) with no<br>more than 1% downtime, in line with the Vercel/Supabase free-tier SLA.|



|**NFR6**|**Security**|Role-based access (admin vs. member) is enforced via Row-Level Security so a<br>member cannot view another member's bookings, and an admin cannot view<br>another location's data.|
|---|---|---|
|**NFR7**|**Auditability**|Every cancellation and its refund calculation is traceable to the membership-tier<br>rule that was active at the time of cancellation.|



## **8. CARIAD Log.** 

C = Constraint, A = Assumption, R = Risk, I = Issue, D = Dependency. 

|**No.**|**Statement**|**Description / Notes / Mitigation**|
|---|---|---|
|**C-01**|The project must run entirely on free-tier<br>services (Vercel + Supabase).|No budget line exists for this course project; any paid<br>add-on (e.g., extra Supabase compute) is off the table<br>unless the team funds it personally.|
|**C-02**|Total build timeline is capped at roughly 5<br>weeks to fit the DPMG submission<br>calendar.|Phase estimates in the technical plan (setup through<br>deploy) must stay inside this window, including buffer<br>for the demo rehearsal.|
|**A-01**|Employee IDs used for admin login are<br>assumed to already exist and be valid;<br>WorkNest does not issue them.|We're assuming HR/ops (simulated for the class project)<br>hands us a clean list of employee IDs mapped to<br>locations — we haven't built an ID-issuing flow.|
|**A-02**|All 3 locations price in INR; no multi-<br>currency support is assumed necessary.|Confirmed against the case study data (Hot-desk<br>4,000/mo etc.); revisit if the instructor's rubric expects<br>₹<br>multi-currency.|
|**A-03**|Seed data of 50–80 members and 250–400<br>bookings is enough to demo booking,<br>cancellation, and analytics convincingly.|Matches the volumes agreed in our earlier project<br>agreement; we won't generate a larger synthetic dataset<br>unless analytics screens look sparse.|
|**R-01**|Double-booking bugs may only surface<br>under concurrent booking load, which is<br>hard to fully test with a 5-person team<br>before demo day.|Mitigation: Kajal to add explicit concurrent-booking test<br>cases (two near-simultaneous booking attempts on the<br>same slot) before demo rehearsal, not just sequential<br>tests.|
|**R-02**|Refund logic has enough branching (4 tiers<br>× notice-window bands) that a wrong<br>admin configuration could silently apply<br>the wrong refund.|Mitigation: Kajal to write a test matrix covering all 4<br>tiers against at least 3 notice-window bands before sign-<br>off; Sangeetha to review the rule engine against that<br>matrix.|
|**I-01**|The exact free-conference-hours allowance<br>for Gold/Platinum tiers has not been<br>finalized by the team as of this version.|Marked FR17 as "Could" priority until the team agrees<br>on a number; won't block Phase 1 schema work since<br>the field can default to 0.|
|**D-01**|The Supabase project<br>(Worknest_project_db) and GitHub repo<br>must stay accessible through the demo<br>date.|Free-tier Supabase projects can pause after a period of<br>inactivity — someone on the team needs to log in<br>periodically to keep it active.|
|**D-02**|Formal BRD sign-off from Prof.<br>Swaminathan N is needed before Phase 1<br>(schema design) is treated as locked scope.|Until sign-off, treat FR/NFR numbering in this<br>document as v1.0 draft — IDs may shift if scope<br>changes after review.|



## **9. Process Flow: As-Is vs. To-Be** 

The flow below contrast today's manual, phone/spreadsheet-driven process with the WorkNest self-service flow. 

### **As-Is (Current Manual Process)** 

**1.** Member calls or messages the admin to check resource availability at a location. 

**2.** Admin manually checks a spreadsheet, cross-referencing availability across locations. 

**3.** Admin confirms the slot verbally over phone or WhatsApp. 

**4.** Admin manually enters the booking into the spreadsheet. 

**5.** Member arrives on-site to use the booked resource. 

**6.** If the member needs to cancel, they call or message the admin again. 

**7.** Admin manually calculates the refund amount using a calculator, based on memory of the pricing rules. 

**8.** Admin updates the spreadsheet by hand to reflect the cancellation and refund. 

### **To-Be (WorkNest Self-Service Process)** 

**1.** Member logs into the WorkNest portal using their member ID. 

**2.** Member selects a location and resource type; the system only shows resource types included in their active plan. 

**3.** System checks live availability directly against the database in real time. 

**4.** System books the slot and automatically blocks any overlapping booking attempts on that resource. 

**5.** Member views the confirmed booking in their booking history and membership screen. 

**6.** If needed, the member requests cancellation directly in the app. 

**7.** System automatically applies the refund rule tied to the member's tier and the admin-defined notice window. 

**8.** Booking status and refund amount update in real time, with no manual admin intervention required. 

## **10. Approval** 

|**Role**|**Name**|**Signature / Date**|
|---|---|---|
|**Prepared by (Team)**|Sufyaan Bin Salman||
|**Approved by (Instructor)**|Prof. Swaminathan N||



