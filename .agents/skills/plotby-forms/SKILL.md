---
name: plotby-forms
description: Implement Plotby's seven-step Add Plot wizard, validation, draft persistence, and pricing calculations.
---

# Plotby Form Standards

Use React Hook Form and Zod with shared form controls and adapters. The seven steps are: dimensions/pricing; classification/approvals; facing/road access; address/geolocation; photos/documents/keywords; contact/ownership; review/publish.

Preserve state across steps, support save/resume draft, warn about unsaved changes, and show field-level errors. Allow nullable road widths and irregular-plot manual area. Keep calculations pure: compute base amount from area and rate, support none/percentage/flat discounts, validate bounds, use decimal-safe money handling, and never allow negative final amounts. Validate again on the backend and cover calculations with unit tests.
