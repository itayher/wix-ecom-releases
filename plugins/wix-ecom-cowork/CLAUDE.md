# Claude Code Instructions — wix-ecom-cowork

## Before Building or Modifying This Plugin

**MANDATORY**: Read the full builder skill before making any changes:
`../wix-ecom-cowork-builder-skill/skills/wix-plugin-builder/SKILL.md`

That file contains the complete methodology, patterns, API discrepancies, coding rules, versioning workflow, and common mistakes to avoid. It is the authoritative guide for this plugin.

## Quick Reference

- **Commands** (`commands/*.md`) — User-facing. **Skills** (`skills/*/SKILL.md`) — Technical API patterns.
- Commands reference Skills (one-way). Skills NEVER reference Commands.
- Use `${API_KEY}` and `${SITE_ID}` — never hardcode values.
- UI endpoints often differ from docs — prefer what the UI actually uses.
- Distribution: GitHub repo `itayher/wix-ecom-cowork` — bump version in plugin.json, package.json, and marketplace.json.
