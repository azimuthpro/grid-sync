---
description: "Bump version following semantic versioning principles"
allowed-tools: ["Bash", "Read", "Edit", "MultiEdit"]
argument-hint: "[major|minor|patch] (optional - if not provided, will analyze git history)"
---

# Bump Version Command

This command implements semantic versioning for the GridSync project.

## Usage

- `/bumpv` - Analyze git history and determine appropriate bump
- `/bumpv patch` - Force a patch version bump
- `/bumpv minor` - Force a minor version bump  
- `/bumpv major` - Force a major version bump

## Process

**IMPORTANT**: When the user says "bump v", this means:

1. **Analyze git commit history** to determine appropriate version bump level:
   - Run `git log --oneline --since="[last-version-date]"` or `git log --oneline [last-version-tag]..HEAD`
   - Review commit types and messages for breaking changes, new features, or bug fixes
   - Apply Semantic Versioning decision criteria (see below) to determine MAJOR, MINOR, or PATCH
   - Consider the cumulative impact of all changes since the last version

2. **Update app version** in package.json with the determined version level

3. **Update README.md Version History** - Add new version section with:
   - Release date
   - Summary of major changes and features
   - Key improvements from commit history
   - Technical details relevant for users and developers

4. **Update CLAUDE.md Recent Update section** - **ONLY IF** changes contain important information for LLM model context:
   - New version number and date
   - Key architectural or technical changes that affect how LLM should work with the codebase
   - New API routes, database schema changes, or processing flow updates
   - Skip this step for minor updates, UI changes, or version bumps without architectural significance

5. **Update version numbers in UI components**:
   - `app/dashboard/settings/page.tsx` - Update version display at bottom

6. **Review commit titles** to accurately summarize all changes in documentation

7. After updating the version, documentation, and UI, commit all changes using the "commit" instructions.

## Semantic Versioning Decision Criteria

Follow [Semantic Versioning](https://semver.org/) principles for all version bumps:

- **MAJOR version** (X.0.0): Breaking changes that make existing functionality incompatible
- **MINOR version** (0.X.0): New features that are backward compatible
- **PATCH version** (0.0.X): Bug fixes and improvements that are backward compatible

### When analyzing git history to determine version bump level:

**MAJOR (Breaking Changes):**
- Commits with `BREAKING CHANGE:` in footer
- API route changes that modify request/response structure
- Database schema changes requiring migrations
- Removed or renamed public APIs, components, or functions
- Changed authentication or security model

**MINOR (New Features):**
- `feat:` commits adding new functionality
- New API endpoints
- New UI components or pages
- New configuration options
- Enhanced existing features without breaking changes

**PATCH (Bug Fixes & Improvements):**
- `fix:` commits resolving bugs
- `refactor:` commits improving code without changing functionality  
- `perf:` commits improving performance
- `style:` commits with formatting or styling changes
- `docs:` commits updating documentation
- `test:` commits adding or fixing tests
- `chore:` commits for maintenance tasks

### Decision Process

1. **Scan all commits** since the last version tag
2. **Identify highest impact change** using the hierarchy: MAJOR > MINOR > PATCH
3. **Consider cumulative effect** - multiple minor features may warrant a minor bump even with patches
4. **Check for breaking changes** in commit footers or descriptions
5. **When in doubt**, prefer the more conservative (lower) version bump

## Examples of Version Bump Analysis

**PATCH Example (0.1.5 → 0.1.6):**
```bash
git log --oneline v0.1.5..HEAD
fix(auth): resolve login redirect issue
fix(dashboard): correct chart rendering bug
docs: update installation instructions
chore: update dependencies
```
*Result: PATCH bump - only bug fixes and maintenance*

**MINOR Example (0.1.6 → 0.2.0):**
```bash  
git log --oneline v0.1.6..HEAD
feat(reports): add CSV export functionality
feat(dashboard): implement energy balance charts
fix(auth): resolve session timeout issue
refactor(api): optimize database queries
```
*Result: MINOR bump - new features with backward compatibility*

**MAJOR Example (0.2.0 → 1.0.0):**
```bash
git log --oneline v0.2.0..HEAD  
feat(api): redesign authentication system

BREAKING CHANGE: API endpoints now require JWT tokens instead of session cookies
feat(dashboard): add real-time monitoring
fix(reports): correct calculation errors
```
*Result: MAJOR bump - breaking changes to authentication system*