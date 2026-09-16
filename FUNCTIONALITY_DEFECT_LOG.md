# WorkNest Functional Defect Log

Functional testing date: 2026-09-14  
Environment: `https://worknest-tau.vercel.app`  
Application source changed: No

| Defect ID | Requirement / workflow | Description | Severity | Status | Evidence |
|---|---|---|---|---|---|
| F1 | FR5 / TC032-TC034 | Admin pricing changes did not propagate to the customer booking catalog. | High | Fixed in source | Booking catalog now reads database pricing and refreshes every five seconds while the member page remains open. |
| F2 | FR4 / TC024-TC029 | Configured minimum booking duration was not enforced during booking. | High | Fixed in source | The customer duration options and server-side booking validation now enforce the selected resource minimum. |
| F3 | FR14 / TC124-TC127 | Support submission did not provide a reliable success state and the page emitted React hydration error #418. | Medium | Fixed in source; deployment retest pending | The form now passes the server action directly and resets only after a successful action state. |

## Retested / not defects

- Platinum allowance: a newly created Platinum account received 8 hours as required; earlier zero-hour seeded accounts were treated as existing data.
- Booking wizard progression: the wizard advanced when location, resource, date, time, and seat were selected sequentially.
- Booking and cancellation: a future booking was confirmed and later cancelled successfully.
- Cross-user availability: a second member session saw the booked resource unavailable for the overlapping slot.

## Test-data cleanup/state

- Pricing was restored to ₹150/hr after the propagation test.
- The Hot Desk minimum duration was restored to 30 minutes after the enforcement test.
- Test accounts 23–26 were created through the signup UI and remain available for further testing.
