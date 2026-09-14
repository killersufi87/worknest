# WorkNest Functional Test Results

Functional testing date: 2026-09-14  
Environment: `https://worknest-tau.vercel.app`

## Cross-panel and workflow tests

| Test | Result | Actual result |
|---|---|---|
| Admin changes hourly price -> customer booking catalog | **Fail** | Admin accepted the change to ₹175/hr, but customer booking continued to show ₹150/hr. Logged as F1. |
| Admin changes minimum duration -> customer booking validation | **Fail** | A 120-minute minimum still allowed a 1-hour booking and confirmation. Logged as F2. |
| Admin resource management page | Pass / partial | Existing resource rows displayed editable minimum duration, hourly and monthly prices. Changes could be submitted; propagation/enforcement failures are listed above. |
| Member signup for Regular, Silver, Gold, Platinum | Pass | Accounts 23, 24, 25 and 26 were created through the UI. |
| Platinum allowance initialization | Pass | New account 26 displayed 8 hours remaining. |
| Member booking flow | Pass | Sequential location, resource type, date, time and seat selection produced a confirmation. |
| Booking overlap availability | Pass | A second member session saw the occupied resource unavailable for the overlapping slot. |
| Booking cancellation | Pass / partial | Future booking was cancelled successfully; refund preview behavior remains a separate defect from the prior test run. |
| Member support submission | Fail | Form submission produced no visible success state and the page reported React hydration error #418. Logged as F3. |
| Admin analytics refresh/visibility | Pass / partial | Admin analytics displayed revenue, booking counts, monthly revenue, occupancy and resource-type summaries. Full numerical reconciliation after controlled changes was not completed. |

## Summary

- Functional workflows tested: 10
- Passed: 5
- Failed: 3
- Partial: 2
- Functional defects logged: 3
- Source code changes: none

The original BRD, SDD, application source, and prior test document were not edited.

## Note for Developers
Resource pricing needs better synchronization between the Admin and Member sides. When an Admin changes a resource price, the updated price should immediately appear on the Member booking screen without requiring a refresh or new session. Monetary values should also be displayed consistently with the required decimal precision.
