---
name: Attendee badge template validation
description: Validation rules for replacing branded attendee-badge artwork while preserving portrait quality and frame alignment.
---

Always render and visually inspect a real portrait against replacement attendee-badge artwork before considering the integration complete. Preserve full-color PNG output for photographic badges rather than reducing the finished image to an indexed palette.

**Why:** A template’s apparent photo-frame boundaries can differ substantially from rough visual estimates, leaving uncovered placeholder areas or covering the branded border. Indexed PNG compression also noticeably degrades portrait clarity.

**How to apply:** After changing badge artwork or placement, generate a representative portrait sample, inspect all four frame edges and the face crop, verify output dimensions, then run the badge-delivery tests and restart the API workflow.