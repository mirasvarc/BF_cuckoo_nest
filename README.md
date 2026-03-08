# Cuckoo's Nest Admin

Desktop control panel for managing the countdown timer display in the **Cuckoo's Nest** escape room by [BrainFAQ Escape Games](https://brainfaq.cz).

Built with Electron. Runs on macOS and Windows.

---

## How it works

The app opens two windows simultaneously:

- **Admin window** — the game master's control panel (this window)
- **Display window** — shown on the projector or secondary monitor for players

If a secondary monitor is connected, the display window opens on it in fullscreen automatically. With only one monitor it opens as a preview window on the primary screen.

All changes in the admin window sync to the display in real time.

---

## Usage

### Timer controls

| Action                     | How                                                              |
| -------------------------- | ---------------------------------------------------------------- |
| Start countdown            | Click **Start**                                                  |
| Pause                      | Click **Pause / Pozastavit**                                     |
| Reset to default           | Click **Reset** → confirm in the popup                           |
| Set a specific time        | Click the time display, type `HH:MM:SS`, press Tab or click away |
| Quick-set common durations | Use the preset buttons: 30 / 45 / 60 / 75 / 90 min               |

When the timer reaches 00:00:00 it continues counting upward and turns red — indicating overtime.

### Display text

- Click the **header text** to edit it inline
- Use the **quick-set text buttons** (bottom-left panel) to switch to a predefined phrase instantly
- Switching language also translates whichever predefined phrase is currently shown

### Language

Toggle **CZ / EN** in the top-right corner. Switches the UI and all predefined phrases. Custom text typed manually is not affected.

---

## Development

```bash
npm install
npm start        # run in development mode
```

**Requirements:** Node.js 18+

---

## Building installers

You must build on the target platform — cross-compilation is not supported by Electron.

### macOS — `.dmg`

```bash
# One-time: create img/kuku.icns from your SVG (see instructions below)
npm run make
# → out/make/Cuckoo's Nest Admin-2.0.0-arm64.dmg
```

**Creating `img/kuku.icns`** (requires a 1024×1024 PNG export of the logo):

```bash
mkdir img/kuku.iconset
sips -z 16 16     img/icon_1024.png --out img/kuku.iconset/icon_16x16.png
sips -z 32 32     img/icon_1024.png --out img/kuku.iconset/icon_16x16@2x.png
sips -z 32 32     img/icon_1024.png --out img/kuku.iconset/icon_32x32.png
sips -z 64 64     img/icon_1024.png --out img/kuku.iconset/icon_32x32@2x.png
sips -z 128 128   img/icon_1024.png --out img/kuku.iconset/icon_128x128.png
sips -z 256 256   img/icon_1024.png --out img/kuku.iconset/icon_128x128@2x.png
sips -z 256 256   img/icon_1024.png --out img/kuku.iconset/icon_256x256.png
sips -z 512 512   img/icon_1024.png --out img/kuku.iconset/icon_256x256@2x.png
sips -z 512 512   img/icon_1024.png --out img/kuku.iconset/icon_512x512.png
cp img/icon_1024.png                    img/kuku.iconset/icon_512x512@2x.png
iconutil -c icns img/kuku.iconset -o img/kuku.icns
```

### Windows — `.exe`

On a Windows machine with Node.js installed:

```bat
npm install
npm run make
rem → out\make\squirrel.windows\x64\CuckoosNestAdmin-v2.0-setup.exe
```

---

## Project structure

```
main.js              — main process, window creation, IPC
preload-admin.js     — exposes sendUpdate() to the admin renderer
preload-display.js   — exposes onUpdate() to the display renderer
index.html           — admin UI
cuckoo.html          — display UI (projector output)
js/countdown.js      — admin logic: timer, editing, i18n
js/display.js        — display logic: digit animation, cursor hide
css/style.css        — shared styles
img/                 — logo and icon assets
```

---

_Cuckoo's Nest escape room — BrainFAQ Escape Games_
