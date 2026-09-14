# WorkNest Functional Defect Log

Functional testing date: 2026-09-14  
Environment: `https://worknest-tau.vercel.app`  
Application source changed: No

| Defect ID | Requirement / workflow | Description | Severity | Status | Evidence |
|---|---|---|---|---|---|
| F1 | FR5 / TC032-TC034 | Admin pricing changes do not propagate to the customer booking catalog. The admin resource price was changed from ₹150/hr to ₹175/hr, but the customer booking card continued to display “From ₹150/hr”. The booking UI uses fixed resource-type display prices rather than the configured resource price. | High | Open | Admin resource editor accepted ₹175/hr; member `/portal/book` still displayed ₹150/hr. |
| F2 | FR4 / TC024-TC029 | Configured minimum booking duration is not enforced during booking. A Hot Desk minimum was set to 120 minutes; the customer could still select a 1-hour duration and the booking was confirmed. | High | Open | Admin showed `120 min`; member booking accepted 1 hour and displayed “meets the minimum booking duration.” Setting was restored to 30 minutes afterward. |
| F3 | FR14 / TC124-TC127 | Submitting a member support query does not provide a visible success confirmation and the page emits React hydration error #418. The message remained in the form after submission, so end-to-end submission cannot be considered reliable. | Medium | Open | Browser runtime error on `/portal/help`; after entering a test message and submitting, no success state appeared. |

## Retested / not defects

- Platinum allowance: a newly created Platinum account received 8 hours as required; earlier zero-hour seeded accounts were treated as existing data.
- Booking wizard progression: the wizard advanced when location, resource, date, time, and seat were selected sequentially.
- Booking and cancellation: a future booking was confirmed and later cancelled successfully.
- Cross-user availability: a second member session saw the booked resource unavailable for the overlapping slot.

## Test-data cleanup/state

- Pricing was restored to ₹150/hr after the propagation test.
- The Hot Desk minimum duration was restored to 30 minutes after the enforcement test.
- Test accounts 23–26 were created through the signup UI and remain available for further testing.
