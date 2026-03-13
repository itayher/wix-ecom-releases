# Wix Manager — Developer Guide

This is the plugin source for **Wix Manager**. If you're a user, see the [main README](../../README.md) for installation.

-----

## Install via Claude Code CLI

```bash
claude plugin install itayher/wix-ecom-cowork
```

Then create your Wix API key at [manage.wix.com/account/api-keys](https://manage.wix.com/account/api-keys) and share it with Claude when prompted.

-----

## Plugin Structure

```
plugins/wix-ecom-cowork/
  .claude-plugin/plugin.json   # Plugin metadata and version
  package.json                 # Plugin version (must match plugin.json)
  commands/                    # User-facing commands (27)
  skills/                      # Technical API patterns (32)
  agents/                      # Specialized agents (2)
  lib/                         # Shared utilities
  CLAUDE.md                    # Claude Code project instructions
```

## Architecture

**Commands** (`commands/*.md`) — User-facing, natural language patterns, step-by-step workflows. Reference skills.

**Skills** (`skills/*/SKILL.md`) — Technical API patterns with curl commands. Reusable across commands.

**One-way dependency**: Commands reference Skills. Skills never reference Commands.

## Contributing

1. Fork the repo
2. Add your feature:
   - Skill: `skills/{feature-name}/SKILL.md`
   - Command: `commands/{feature-name}.md`
3. Follow the coding rules in [CLAUDE.md](CLAUDE.md)
4. Submit a PR

### Coding Rules

- Use `${API_KEY}` and `${SITE_ID}` variables — never hardcode
- Show curl commands with jq parsing in skills
- No hardcoded business values — use variables or API responses
- Commands should use natural language patterns
- Test with a real Wix store

### Versioning

- **Patch** (x.y.Z): bug fixes, doc updates
- **Minor** (x.Y.0): new commands, skills, features
- Update version in both `plugin.json` and `package.json`

-----

## API Key Permissions

Your Wix API key needs:

- Read/Write Products
- Read/Write Orders
- Read/Write Inventory
- Read/Write Coupons
- Read Events, Read Event Orders, Read Event Guests
- Read Bookings, Read Services
- Read/Write CMS Data Collections
- Read Contacts

-----

## License

Apache-2.0 — see [LICENSE](../../LICENSE)
