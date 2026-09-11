# WorkNest — Demo Script

A suggested order for the live demo. Each step names the FR it proves,
so it doubles as a live traceability walkthrough.

## Part 1 — Member Journey (~4 min)

1. **Homepage** (`/`) — show the landing page, click "Sign up."
2. **Sign up** as a new member, pick Gold tier, Koramangala. → **FR8**
   - Point out the Member ID shown on success — "this is what a member
     types to log in, not an email."
3. **Log out**, log back in with that Member ID + password. → **FR8**
4. **Dashboard** — point out: tier banner color (Gold = gold), hours
   remaining, renewal date. → **FR13**
5. **Book a Resource** — select Koramangala, note only Dedicated Desk +
   Meeting Room are selectable for a Gold member (not Hot Desk/Cabin). → **FR9**
6. Book a Meeting Room for a time slot within free hours. Confirm it
   shows "used your free hours" not a charge. → **FR17**
7. **My Bookings** — show the new booking, location included. → **FR11**
8. **Cancel it** — show the refund % applied based on notice given. → **FR12**
9. **Billing & Invoices** — show the transaction reflecting the refund.
10. **Help & Support** — submit a query. → **FR14**

## Part 2 — Double-Booking Proof (~1 min)

11. Open two browser tabs as the same or different members. Try booking
    the *same* resource at the *same* time in both. The second one
    should fail. → **FR10**
    - Optional: mention this is enforced by the database itself
      (a Postgres exclusion constraint), not just app-side checking.

## Part 3 — Admin Journey (~4 min)

12. Log out, log in on the **Employee tab** with the admin account. → **FR1–2**
13. **Live Booking Grid** — show today's cross-floor occupancy,
    color-coded by how full each hour is. → **FR15**
14. **Manage Resources** — add a new Hot Desk, edit its hourly price
    live. → **FR3–5**
15. **Shift & Certification Tracker** — show the roster and the coverage
    gap warning (a real flagged day with no certified staff). → **FR18**
16. **Analytics** — revenue by month, occupancy by location, revenue by
    resource type, all computed from real booking data. → **FR16**

## If Something Goes Wrong Live

- If a booking fails unexpectedly, check the browser console — most
  likely cause is a stale session; refresh and log in again.
- If images don't load, that's cosmetic (Unsplash hotlinking), not a
  functional bug — mention it and move on.
- Keep this doc open on a second screen during the actual demo.
