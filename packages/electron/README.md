# Electron Mac App

This package wraps the audiovisual art tool as a native Mac application.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Build frontend and backend
cd ../client && pnpm build
cd ../server && pnpm build

# 3. Run in development
cd ../electron
pnpm dev

# 4. Build Mac app
pnpm build:mac
```

## What You Get

- ✅ Native Mac app (.app bundle)
- ✅ DMG installer for distribution
- ✅ Backend server auto-starts (no terminal needed)
- ✅ Menu bar, dock icon, keyboard shortcuts
- ✅ Code signing ready
- ✅ Auto-updater support

## Building

```bash
# Development mode (with DevTools)
pnpm dev

# Build .app only (fast)
pnpm package

# Build .app + DMG installer
pnpm build:mac

# Build for Mac App Store
pnpm build:mas
```

## Output

Built apps will be in `dist/`:
- `Audiovisual Art Studio.app` - Mac application
- `Audiovisual Art Studio-1.0.0.dmg` - Installer

## App Icon

You need to create `assets/icon.icns`:

**Option 1 - Online Tool:**
1. Create 1024×1024 PNG
2. Convert at https://cloudconvert.com/png-to-icns
3. Save as `assets/icon.icns`

**Option 2 - iconutil:**
```bash
mkdir icon.iconset
# Add icon_16x16.png through icon_1024x1024.png
iconutil -c icns icon.iconset
mv icon.icns assets/
```

## Configuration

Edit `package.json` to customize:
- App name and ID
- Window size and appearance
- Build targets
- Code signing settings

## Distribution

**For Testing:**
```bash
# Remove quarantine attribute
xattr -cr "Audiovisual Art Studio.app"
```

**For Release:**
1. Get Apple Developer account ($99/year)
2. Add code signing identity to `package.json`
3. Run `pnpm notarize`
4. Distribute the signed DMG

## Troubleshooting

**Server won't start:**
- Check `../server/dist/index.js` exists
- Build server: `cd ../server && pnpm build`

**FFmpeg not found:**
- Install FFmpeg: `brew install ffmpeg`
- Or bundle it with the app (see MAC_APP_GUIDE.md)

**Icon doesn't show:**
- Ensure `assets/icon.icns` exists
- Rebuild completely

See **MAC_APP_GUIDE.md** for complete documentation.
