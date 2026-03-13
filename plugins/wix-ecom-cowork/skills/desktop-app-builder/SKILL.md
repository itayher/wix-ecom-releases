# Desktop App Builder — Skill Reference

## CRITICAL: Sandbox Awareness

**You are running in a cloud sandbox.** You CANNOT:
- Access npm registry (you will get 502 errors)
- Download Electron or any packages
- Run `npm install`, `npm ci`, `yarn install`, `curl`, or `wget`

**DO NOT attempt to install or download anything. It WILL fail.**

## How It Works

The user has a pre-built Electron template on their LOCAL Mac at:

**`~/.wix-desktop-app-template/`**

It contains `node_modules` with the full Electron binary. Your job is to:

1. **Generate a `.command` script** (self-contained bash file)
2. The script runs on the USER'S Mac (not in the sandbox)
3. It copies the template, writes `index.html` + updates `main.js`, and builds the .dmg

## Template File Structure

```
~/.wix-desktop-app-template/
├── main.js          — Loads index.html via path.join(__dirname, 'index.html'), has SITE_ID_PLACEHOLDER
├── preload.js       — IPC bridge: window.wixApi()
├── index.html       — Placeholder, replaced with generated UI
├── package.json     — files: ["main.js", "preload.js", "index.html"], productName: "WixManager"
└── node_modules/    — Full Electron + electron-builder (pre-installed)
```

## What the .command Script Must Do

1. **Copy** template: `cp -a ~/.wix-desktop-app-template "$BUILD_DIR"` (use `-a` NOT `-r` — preserves symlinks!)
2. **Verify** node_modules exists
3. **Replace** `SITE_ID_PLACEHOLDER` in `main.js` with real site ID via `sed`
4. **Write** the full generated HTML as `$BUILD_DIR/index.html` (heredoc)
5. **Update** `productName` in `package.json` via `sed`
6. **Build**: `cd "$BUILD_DIR" && npx electron-builder --mac dmg`
7. **Open** output folder in Finder

## Critical Rules

- **NEVER embed HTML in main.js** — write it as `index.html`
- **NEVER use `loadURL('data:text/html...')`** — use `loadFile(path.join(__dirname, 'index.html'))`
- **ALWAYS use `cp -a`** not `cp -r` (preserves symlinks in node_modules/.bin)
- **NEVER modify main.js** beyond the `sed` replacement of `SITE_ID_PLACEHOLDER`
- **NEVER run npm install** or any download command

## BANNED COMMANDS (in the sandbox)

- `npm install` / `npm ci` / `yarn install` / `pnpm install`
- `npm init`
- `curl` or `wget` to download packages
- Any command that installs or downloads dependencies
- Building a web app / HTML file as a fallback

## Output Naming

Name the .command file after its function:
- `WixPriceEditor-builder.command`
- `WixOrderManager-builder.command`
- `WixInventoryManager-builder.command`
- `WixFulfillmentManager-builder.command`
- `WixProductEditor-builder.command`

## Size Constraint

Keep the final binary under 120MB. Do not bundle unnecessary Electron modules.
