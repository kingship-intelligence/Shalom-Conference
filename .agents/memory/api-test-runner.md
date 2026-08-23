---
name: API test runner
description: Workspace-specific constraint for running TypeScript tests in the API package
---

The API package must declare the workspace TypeScript test runner in its own devDependencies; root catalog availability alone does not make the runner resolvable from a package script.

**Why:** Node resolves --import loaders from the package executing the script, and this monorepo does not guarantee root-level binaries are visible there.

**How to apply:** Keep the package-local catalog dependency and invoke tests through the package script.