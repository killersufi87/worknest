# WorkNest Defect Log

Test execution date: 2026-09-14  
Environment: `https://worknest-tau.vercel.app`

| Defect ID | Test case(s) | Description | Severity | Status | Evidence |
|---|---|---|---|---|---|
| D1 | TC001-TC009 | The test cases specify employee ID-based login, but the deployed Employee login presents an Email field and the server action authenticates by email. An employee ID cannot be entered or tested as specified. | High | Open | `/login` shows `Email`; invalid submission returns `Invalid email or password.` |
| D2 | TC038, TC042-TC053, TC065 | **Not reproducible with a newly created account.** Previously tested seeded Platinum accounts showed 0 remaining hours, but a newly created Platinum account received the required 8 hours. | Closed / data condition | New account ID 26 showed `8 Hours remaining`; no source defect confirmed. |
| D3 | TC039-TC041, TC054-TC059, TC066 | **Not reproducible when the booking flow is completed sequentially.** The wizard advanced after selecting location, resource type, date, time, and seat. | Closed / test interaction | A future Hot Desk booking was confirmed successfully for new account ID 26. |
| D4 | TC124-TC127 | The authenticated Member Help & Support page emitted a React hydration error (`Minified React error #418`) during load. The form was visible, but support submission was not treated as reliable until the runtime error is resolved. | Medium | Open | Browser page error recorded while loading `/portal/help` as member ID 5. |
| D5 | TC088 | Cancellation immediately changes a confirmed booking to cancelled without displaying the required refund preview (tier, notice condition, refund percentage, and refund amount) before confirmation. | Medium | Open | Future booking cancellation from the member booking history changed directly to `cancelled`; no preview was shown. |

Cases requiring representative load datasets, cross-user isolation, or new records were not marked as defects where the required isolated setup was unavailable. No application code was changed.
