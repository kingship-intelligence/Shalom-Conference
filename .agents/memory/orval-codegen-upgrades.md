---
name: Orval codegen upgrades
description: Compatibility constraints when upgrading Orval separately from generated API clients.
---

Keep committed generated API clients unchanged during dependency-only Orval security upgrades unless the codegen configuration is migrated at the same time.

**Why:** Newer Orval releases can switch generated Zod expressions to Zod 4 APIs, choose the wrong React Query generation mode when package discovery fails, and emit `Headers.entries()` calls that require DOM iterable typings. Regenerating without addressing those defaults breaks the existing Zod 3 and TypeScript setup.

**How to apply:** A future intentional regeneration should explicitly configure Zod 3 output and React Query 5 discovery/versioning, then either enable the required DOM iterable library or choose an output form compatible with the current TypeScript libraries. Validate generated diffs and run library typechecking before committing them.