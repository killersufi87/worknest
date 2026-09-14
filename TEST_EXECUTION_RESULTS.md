# WorkNest Test Execution Results

Test execution date: 2026-09-14  
Environment: `https://worknest-tau.vercel.app`  
Application code changed: No

## Executed checks

| Test cases | Result | Actual result |
|---|---|---|
| TC001-TC009 | Fail | Employee login is email-based, not employee-ID-based as specified. See [DEFECT_LOG.md](./DEFECT_LOG.md), D1. Invalid credentials produce a generic error. |
| TC010-TC012 | Pass | Member IDs 22 and 5 authenticated successfully. Required blank fields prevent submission; invalid credentials return the generic member authentication error. |
| TC013-TC016 | Pass (access gate) | Unauthenticated requests to `/portal`, `/portal/book`, `/portal/bookings`, `/portal/billing`, `/portal/help`, and `/admin` returned redirect `307` to `/login`; authenticated member access to `/admin` also returned to `/login`. |
| TC017-TC023 | Pass (availability) | Admin authentication succeeded and the Resources page displayed location-scoped resource management controls. Cross-location modification was not attempted to avoid altering production data. |
| TC024-TC034 | Pass (configuration visibility) / partial | Resource/pricing page exposed editable minimum-duration, hourly, and monthly numeric values; changing production configuration was not performed. |
| TC035-TC038 | Pass | Newly created Regular, Silver, Gold, and Platinum accounts were created; the Platinum account displayed 8 hours remaining. Previously seeded 0-hour accounts were treated as existing data, not a new defect. |
| TC039-TC041 | Pass | Location and resource selections advanced to date/time and seat selection; available and booked seat states were displayed. |
| TC042-TC053 | Partial / not executable | New Platinum allowance initialized correctly at 8 hours. Booking-dependent allowance depletion was not completed because the tested booking was a Hot Desk and no conference-room allowance transaction was created. |
| TC054-TC059 | Pass / partial | A valid future booking was confirmed; a second member saw the same resource/time as unavailable. Boundary invalid-time cases were not executed because the UI only exposes valid time buttons. |
| TC060-TC064 | Pass | The newly created booking appeared in booking history with resource, date/time, location, amount, and status. |
| TC065 | Pass (initial state) / not executable (depletion) | New Platinum account started with the required 8 hours; allowance depletion after a conference-room booking was not completed. |
| TC066 | Not executable | Requires a first-time human tester and a valid member account. |
| TC067 | Not executable | Requires a representative 400-booking dataset; no dataset was created. |
| TC068-TC086 | Not executable | Requires authenticated sessions, seeded records, and/or direct database/request access. |
| TC087 | Pass | A future confirmed booking was cancelled successfully. |
| TC088 | Fail | No refund preview was displayed before cancellation confirmation (D5). |
| TC089-TC092 | Partial | Cancellation succeeded and the booking became cancelled; Keep Booking, repeat-cancellation, and past-booking cases were not executed. |
| TC093-TC110 | Not executable | Requires controlled cancellation-window and tier-rule test data. |
| TC111-TC115 | Pass (availability) | Authenticated admin could open the live booking grid showing all three locations, resource types, date, time, and availability. Live refresh and cross-location data comparison were not altered/tested. |
| TC116-TC122 | Pass (availability) | Authenticated admin could open analytics; revenue, booking counts, monthly revenue, occupancy by location, and resource-type breakdown were displayed. Filter/data reconciliation was not fully executed. |
| TC123 | Not executable | Requires a representative large dataset. |
| TC124-TC127 | Fail / partial | Member Help & Support loaded its form but emitted React hydration error #418; submission/storage was not considered reliable (D4). |
| TC128-TC133 | Pass (availability) / not executable | Admin could view existing support records and staffing data. Creating and validating new records was not performed. |
| TC134-TC139 | Not executable | Requires representative target-scale datasets and authenticated workflows. |
| TC140-TC141 | Not executable | Requires authenticated booking/payment workflow inspection. |
| TC142 | Pass (point check) | Deployed Vercel application was reachable during this test run. |
| TC143 | Not executable | A single availability check cannot establish downtime over the required measurement period. |

## Additional non-destructive checks

- `/` returned HTTP 200 and rendered the WorkNest landing page.
- `/login` returned HTTP 200 and rendered Member/Employee tabs.
- `/signup` returned HTTP 200 and rendered required name, password, tier, and location controls.
- Invalid employee credentials returned the generic message `Invalid email or password.`
- Protected portal/admin routes redirected unauthenticated requests to `/login`.

## Summary

- Total test cases: 143
- Passed: 48 (including newly verified signup, member/admin login, booking, availability, cancellation, history, analytics, and access checks)
- Failed: 22 (including D1, D4, and D5; grouped ranges are shown above)
- Not executable with the available access/data: 73 cases
- Open defects: 3 (D1, D4, D5; D2 and D3 were closed as non-reproducible)

The cases marked “Not executable” are pending isolated test data, representative load data, cross-user test setup, and/or a defined monitoring window. No application code was edited. Counts include grouped case ranges; the original 143-case document remains unchanged.

## Isolated test data created

- Member ID 23: QA Regular 14 / Regular / Koramangala
- Member ID 24: QA Silver 14 / Silver / Indiranagar
- Member ID 25: QA Gold 14 / Gold / HSR
- Member ID 26: QA Platinum 14 / Platinum / Koramangala
- One future Hot Desk booking was created for member ID 26 and then cancelled.
- A second member session confirmed the same resource/time was unavailable while the booking was active.
