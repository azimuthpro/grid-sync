---
description: "Review changes and create a git commit with proper validation"
allowed-tools: ["Bash", "Read", "Grep", "Glob"]
---

# Commit Command

This command implements the complete commit workflow for the GridSync project.

## Process

**IMPORTANT**: When the user says "commit", this means:

1. **Check what has changed** using git commands:
   - `git status` - see modified, added, or deleted files
   - `git diff` - review exact changes in modified files
   - `git diff --cached` - review staged changes
   - `git diff --name-only` - get quick list of changed files

2. **Run build check** (`npm run build`) to ensure no build errors
3. **Add all files** to the repository (`git add .`)
4. **Commit all unsaved changes** in the repository (`git commit`)

**ALWAYS review the changes before committing** to ensure you understand what is being committed and can write an accurate commit message describing all modifications.

## Commit Message Guidelines

**Format**: `<type>(<scope>): <description>` - 50 chars max, imperative mood
**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Good Examples**: 
- `feat(dashboard): add energy balance charts`
- `fix(auth): resolve login redirect loop`
- `refactor(api): optimize database queries`

**Avoid**: "Fixed stuff", "WIP", "Various changes"

## Clean Commit Policy

Do NOT add any automatic information such as:
- Co-authored-by tags
- Generated with [tool name] messages  
- Any automated signatures or metadata

Keep commit messages clean and focused only on describing all uncommitted changes made.