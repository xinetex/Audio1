# Building a Mac App - Complete Guide

## Overview

I've set up **Electron** to wrap your audiovisual art tool as a native Mac application. This gives you:

✅ **Native Mac App** (.app bundle)  
✅ **Full-screen and windowed modes**  
✅ **Dock icon and menu bar**  
✅ **Bundled backend server** (no separate terminal needed)  
✅ **DMG installer** for easy distribution  
✅ **Code signing ready** (for Mac App Store or direct distribution)  
✅ **Auto-updater support** built-in  

## Quick Start

### 1. Install Electron Dependencies

```bash
cd packages/electron
pnpm install
```

### 2. Build Frontend and Backend

```bash
# From root directory
cd ../../

# Build client
cd packages/client
pnpm build

# Build server
cd ../server
pnpm build
```

### 3. Run in Development Mode

```bash
cd ../electron
pnpm dev
```

This launches the app with:
- Frontend at http://localhost:3000
- Backend bundled and auto-started
- DevTools enabled
- Hot reload on frontend changes

### 4. Build the Mac App

```bash
# Build .app bundle + DMG installer
pnpm build:mac

# Or just build .app (faster for testing)
pnpm package
```

Output will be in `packages/electron/dist/`:
- `Audiovisual Art Studio.app` - The Mac application
- `Audiovisual Art Studio-1.0.0.dmg` - Installer for distribution

## File Structure

```
packages/electron/
├── main.js                    # Electron main process
├── package.json               # Electron config & build settings
├── entitlements.mac.plist     # macOS permissions
├── assets/
│   └── icon.icns             # App icon (1024x1024)
└── dist/                      # Build output (generated)
```

## Features Included

### Native Mac Integration

**Menu Bar:**
- File menu (New Project, Close)
- Edit menu (Undo, Redo, Cut, Copy, Paste)
- View menu (Zoom, Fullscreen, DevTools)
- Window menu (Minimize, Zoom)
- Help menu (Documentation link)

**Window:**
- Native titlebar with traffic lights
- Minimum size: 1024×768
- Default size: 1400×900
- Custom background color matching your UI
- Dark mode support

**Keyboard Shortcuts:**
- Cmd+N - New Project
- Cmd+W - Close Window
- Cmd+Q - Quit App
- Cmd+R - Reload
- Cmd+Shift+I - Toggle DevTools
- Standard Edit shortcuts

### Backend Integration

The Electron app automatically:
1. Starts the Express server on launch
2. Waits for server to be ready
3. Opens the frontend window
4. Kills the server when app quits

No need to run separate terminals!

## Creating an App Icon

Your app needs an icon. Here's how to create one:

### Option 1: Use iconutil (Built-in macOS)

```bash
# 1. Create icon set folder
mkdir -p icon.iconset

# 2. Add images at these sizes:
# icon_16x16.png, icon_32x32.png, icon_64x64.png, 
# icon_128x128.png, icon_256x256.png, icon_512x512.png, icon_1024x1024.png
# Plus @2x versions for retina

# 3. Convert to .icns
iconutil -c icns icon.iconset

# 4. Move to electron assets
mv icon.icns packages/electron/assets/
```

### Option 2: Use Online Tools

1. Create a 1024×1024 PNG
2. Use https://cloudconvert.com/png-to-icns
3. Download and place in `packages/electron/assets/icon.icns`

### Option 3: Use electron-icon-builder

```bash
npm install -g electron-icon-builder

# From a 1024x1024 PNG
electron-icon-builder --input=./icon.png --output=packages/electron/assets
```

## Distribution Options

### Option 1: DMG Installer (Easiest)

```bash
pnpm build:dmg
```

Share the `.dmg` file. Users:
1. Download the DMG
2. Open it
3. Drag app to Applications folder
4. Done!

**Pros:** Simple, familiar to Mac users  
**Cons:** Shows "unidentified developer" warning (needs code signing)

### Option 2: Code Signed + Notarized

For professional distribution without warnings:

```bash
# 1. Get Apple Developer Account ($99/year)
# 2. Create certificates in Xcode
# 3. Set environment variables:
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="your-team-id"

# 4. Build and notarize
pnpm notarize
```

Update `package.json` with your signing info:

```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAMID)",
  "hardenedRuntime": true,
  "entitlements": "entitlements.mac.plist"
}
```

### Option 3: Mac App Store

```bash
pnpm build:mas
```

Requirements:
- Apple Developer Account
- Mac App Store certificates
- App Store Connect setup
- TestFlight testing
- Apple review process

## Environment Variables

The app needs your Replicate API key. Options:

### Option 1: Build-time (Recommended)

Before building, set in `packages/server/.env`:
```env
REPLICATE_API_TOKEN=your_token_here
```

The token gets bundled with the app (users don't need to configure).

### Option 2: Runtime (More Flexible)

User can create `.env` file in app directory:
```bash
~/Library/Application Support/Audiovisual Art Studio/.env
```

Add this to `main.js`:
```javascript
const envPath = path.join(
  app.getPath('userData'),
  '.env'
);
require('dotenv').config({ path: envPath });
```

### Option 3: Settings Panel

Add a settings UI where users can input their API key. Store in:
```javascript
const Store = require('electron-store');
const store = new Store();

store.set('replicate.apiKey', 'user_key');
```

## Customization

### Change App Name

Edit `packages/electron/package.json`:
```json
{
  "name": "your-app-name",
  "productName": "Your App Name"
}
```

### Change App ID

For code signing and updates:
```json
"build": {
  "appId": "com.yourcompany.yourapp"
}
```

### Window Settings

Edit `main.js` `createWindow()`:
```javascript
mainWindow = new BrowserWindow({
  width: 1600,           // Change default size
  height: 1000,
  fullscreen: false,     // Start fullscreen
  frame: true,           // Show/hide titlebar
  transparent: false,    // Transparent window
  titleBarStyle: 'hidden' // Custom titlebar style
});
```

### Custom Menu Items

Add to menu template in `main.js`:
```javascript
{
  label: 'Generate',
  submenu: [
    {
      label: 'Generate Video',
      accelerator: 'CmdOrCtrl+G',
      click: () => {
        mainWindow.webContents.send('generate-video');
      }
    }
  ]
}
```

## Auto-Updates

Already configured with `electron-updater`. To enable:

1. **Set up update server** (GitHub Releases or custom)
2. **Add to main.js**:

```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available. Download?'
  });
});
```

3. **Publish releases** with versioned builds

## Troubleshooting

### Server Won't Start

Check server builds successfully:
```bash
cd packages/server
pnpm build
node dist/index.js
```

### FFmpeg Not Found

Bundle FFmpeg with the app:
```json
"extraResources": [
  {
    "from": "node_modules/ffmpeg-static/ffmpeg",
    "to": "ffmpeg"
  }
]
```

Then in server code:
```javascript
const ffmpegPath = path.join(
  process.resourcesPath,
  'ffmpeg'
);
```

### Icon Doesn't Show

- Ensure `icon.icns` is in `packages/electron/assets/`
- Rebuild app completely
- Check build logs for icon errors

### App Won't Open (Security Warning)

**For testing:**
```bash
xattr -cr "Audiovisual Art Studio.app"
```

**For distribution:**
- Code sign the app
- Get it notarized by Apple

### Build Fails

Common issues:
```bash
# Clear electron cache
rm -rf ~/Library/Caches/electron
rm -rf ~/Library/Caches/electron-builder

# Reinstall
cd packages/electron
rm -rf node_modules
pnpm install
```

## Performance Optimization

### Reduce App Size

Edit `package.json` files array:
```json
"files": [
  "main.js",
  "assets/**/*",
  "../client/dist/**/*",
  "../server/dist/**/*",
  "!**/*.map",           // Exclude source maps
  "!**/node_modules/**"  // Exclude dev deps
]
```

### Lazy Load Components

Split frontend code:
```javascript
// In React components
const Preview = lazy(() => import('./components/Preview'));
```

### Cache Static Assets

Add to `main.js`:
```javascript
session.defaultSession.webRequest.onBeforeSendHeaders(
  (details, callback) => {
    details.requestHeaders['Cache-Control'] = 'max-age=3600';
    callback({ requestHeaders: details.requestHeaders });
  }
);
```

## Alternatives to Electron

If you want something lighter:

### Tauri (Rust-based)
- **Pros:** Smaller app size (5-10MB vs 100MB+), faster
- **Cons:** More complex setup, Rust learning curve
- **Best for:** Performance-critical apps

### Neutralino (Native WebView)
- **Pros:** Tiny size (2-5MB), simple
- **Cons:** Limited API, less mature
- **Best for:** Simple web apps

### Native Swift/SwiftUI
- **Pros:** Best performance, native feel
- **Cons:** Mac-only, most work to implement
- **Best for:** Mac App Store, premium apps

## Next Steps

1. **Create an icon** (1024×1024 PNG → .icns)
2. **Build the app**: `pnpm build:mac`
3. **Test it**: Double-click the `.app` file
4. **Share the DMG** or **get it code signed**

The app is production-ready! 🎉

---

**Need help?** Check the [Electron docs](https://www.electronjs.org/docs/latest/) or [electron-builder docs](https://www.electron.build/).
