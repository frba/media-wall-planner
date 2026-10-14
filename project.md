# Arch2D Canvas & Prompt Generator — Project Specification (v2)

## 1. Executive Summary
**Arch2D Canvas & Prompt Generator** is a responsive, single-page interior elevation planning tool engineered for interior designers, architects, and homeowners. It enables users to draft precise 2D elevation layouts of custom media walls, cabinetry, and shelving units, apply realistic architectural textures, and export both high-resolution Image-to-Image reference PNGs (≥2000px wide) and structured, descriptive text prompts for AI image generators (Midjourney, Stable Diffusion, and natural-prose models such as Gemini / GPT-Image).

The application features a built-in **Multi-Provider AI Render Engine & Prompt Studio**:
- Users can tune the generated prompt with real-time architectural modifier chips (lighting, materials, camera, styles).
- Users can connect multiple AI image generation providers (Pollinations — default, easiest setup; Google Nano Banana family; OpenAI GPT-Image; and Custom OpenAI-compatible endpoints) using their own API key (stored in browser `localStorage` — see Security Note in §2).
- Instant in-app rendering, gallery history, CAD vs 3D side-by-side comparison, and 1-click downloads.
- Full project save/load via JSON export and import — no work is lost between sessions.

---

## 2. Agreed Architectural & Technical Decisions

| Dimension | Decision | Rationale |
| :--- | :--- | :--- |
| **Architecture** | Single Self-Contained `index.html` (deliverable), assembled from `src/` files by a dev-only `build.sh` | Users get one zero-install file that opens by double-click over `file://`. Source lives in separate files under `src/` so several contributors can work in parallel without conflicts. Each file is a classic `'use strict'` IIFE that registers itself on a shared `window.Arch2D` namespace — inline `<script type="module">` blocks cannot import from each other, so modules are avoided. No Node/Vite toolchain. |
| **CSS Framework** | Vanilla CSS with CSS Custom Properties (design tokens) | Removes Tailwind CDN runtime (~300KB, not recommended for production). Full control, no external CDN dependency, faster load. |
| **Coordinate Origin** | Bottom-Left Floor Level ($Y=0$ at floor, $X=0$ at left wall) | Aligns with architectural elevation standards where millwork/cabinetry elevations are dimensioned upwards from finished floor level (AFF). |
| **Canvas Texture Rendering** | Pure HTML5 Canvas 2D API (no SVG patterns) | Eliminates CORS canvas taint risk entirely. All textures are drawn programmatically via `CanvasRenderingContext2D` path/fill commands. Export via `toDataURL()` is always safe. |
| **Multi-Provider AI Engine** | Multi-API Integration with `localStorage` Key Storage; model IDs are user-editable | Supports **Pollinations** (default — easiest setup), **Google Nano Banana family** (Gemini API `generateContent`), **OpenAI GPT-Image**, and **Custom/OpenAI-compatible** endpoints. Model IDs ship with current defaults but can be edited, because vendors retire models frequently (see §4.3). |
| **AI Key Storage** | Browser `localStorage` | **Security Note:** `localStorage` is accessible to any JavaScript executing on the page. Keys are stored for convenience only. Users should treat stored keys as semi-public and rotate them if sharing their device. The app will not transmit keys to any server other than the user's chosen AI provider. |
| **Project Persistence** | JSON Export / Import + localStorage Auto-save | Users can save their full canvas state as a `.arch2d.json` file and reload it at any time. A `localStorage` auto-save also preserves the last session as a fallback. |
| **Interactive Prompt Tuning** | Live Prompt Editor with Categorized Tuning Chips | Users can customize the generated prompt, append aesthetic modifiers (Lighting, Camera, Detailing, Materials), and automatically set aspect ratio matching wall proportions. |
| **Pre-built Templates** | Included (Japandi Slats, Floating Luxury Console, Full-Wall Shelving Library) | Enables 1-click loading of realistic layouts for instant evaluation and prototyping. |
| **Quick-Add Presets** | Included (65" TV, Soundbar, Fireplace, Floating Console, Shelves, Slats) | Speeds up workflow with pre-dimensioned standard interior components. |
| **Lighting Effects** | Included (LED cove/halo backlighting & under-cabinet glow) | Visualized on canvas with Canvas 2D radial/linear gradient overlays and translated into prompt descriptions. |
| **Style & Mood Selectors** | Included (Warm Japandi, Dark Luxury Contemporary, Scandinavian Minimalist, Industrial Chic) | Controls AI prompt aesthetic weighting and ambient lighting modifiers. |

---

## 3. Detailed UI Layout & Component Breakdown

```
+-------------------------------------------------------------------------------------------------------------------------------+
|  HEADER: Arch2D Elevation Architect  |  [Templates ▾]  |  [💾 Save Project]  [📂 Load Project]  |  [📷 Export PNG]  [🤖 AI Render & Prompt Studio]  |
+--------------------+---------------------------------------------------------------+------------------------------------------+
| LEFT SIDEBAR       | CENTER ELEVATION CANVAS                                       | RIGHT SIDEBAR                            |
| - Wall Dimensions  | - True-to-scale Aspect Ratio Workspace                        | Selected Element Inspector               |
|   Width / Height cm| - Architectural Grid: 10cm Major (bold), 5cm Minor (dashed)   | - Label / Component Name                 |
| - Quick Add Presets| - Floor line indicator (Y=0 AFF) with dimension markers       | - Width, Height (cm)                     |
|   (TV, Console,    | - Rectangular elements with Canvas 2D textures                | - X (from left), Y (AFF cm)              |
|    Fireplace, etc.)| - Drag-to-move, 8-point corner/edge resize handles            | - Material Texture Palette               |
| - Templates Loader | - Touch/stylus support (Pointer Events API)                   | - Custom Color & Opacity                 |
| - Style & Mood     | - Smart magnetic snapping (grid + neighbor edge alignment)    | - LED Glow / Backlight toggle            |
|                    | - Multi-select (Shift+click or rubber-band drag)              | - Layer controls (Up/Down)               |
|                    | - On-canvas HUD: Label, W x H cm, X/Y position AFF           | - Duplicate & Delete                     |
|                    | - Selection box & multiple object stacking                    | - [👁 Toggle Annotations] (A key)        |
+--------------------+---------------------------------------------------------------+------------------------------------------+
```

### 3.1 Header Controls
- **Application Title:** `Arch2D Elevation Architect` with clean dark-mode badge indicator.
- **Template Switcher:** Dropdown to load starter templates instantly.
- **Save Project:** Downloads the full canvas state as `arch2d-[timestamp].arch2d.json`.
- **Load Project:** Opens a file picker to restore a `.arch2d.json` file, replacing the current canvas state.
- **Export PNG Reference:** Generates a high-resolution, scale-preserved 2000px+ PNG with Canvas 2D textures, dimension callouts, and clean linework. Suitable as an Image-to-Image reference for AI generation. *(Note: this is a colored elevation drawing, not a ControlNet depth/lineart map. Run a Canny/HED preprocessor externally if a ControlNet workflow is required.)*
- **AI Render & Prompt Studio:** Launches an expansive modal supporting prompt generation, interactive prompt tuning, multi-provider API settings, direct generation, and image gallery comparison.

### 3.2 Left Sidebar (Wall & Setup)
- **Wall Envelope:**
  - `Wall Width (cm)` (e.g., 400 cm)
  - `Wall Height (cm)` (e.g., 280 cm)
  - Dynamic aspect-ratio adaptation in the center viewport.
- **Add Custom Block:** Button to inject a 50×50 cm generic block at origin or center.
- **Quick-Add Architectural Library:**
  - `OLED 65" TV` (145 × 83 cm)
  - `Dolby Atmos Soundbar` (110 × 10 cm)
  - `Linear Electric Fireplace` (150 × 40 cm)
  - `Floating Low Credenza` (240 × 45 cm)
  - `Vertical Slat Feature Panel` (120 × 280 cm)
  - `Recessed Open Bookshelf` (80 × 160 cm)
  - `Upper Storage Cupboards` (240 × 60 cm)
- **Design Mood & Style Selector:**
  - Japandi / Organic Modern (Oak slats, warm limestone, linen, soft neutral)
  - Dark Luxury Contemporary (Smoked eucalyptus, nero marquina, brass trims, moody LED)
  - Scandinavian Light (White ash, matte chalk white, airy open shelving)
  - Modern Industrial (Charcoal steel frames, walnut, exposed brick backdrop)

### 3.3 Center Elevation Canvas (Interactive Engine)
- **Coordinate System:** Origin $(X=0, Y=0)$ anchored at the bottom-left floor line.
  - $Y$ increases upwards (Above Finished Floor - AFF).
  - $X$ increases rightwards.
- **Scale Mapping:** Dynamically calculated scale factor:
  $$\text{scale} = \min\left(\frac{\text{canvasWidth}_{\text{px}}}{\text{wallWidth}_{\text{cm}}}, \frac{\text{canvasHeight}_{\text{px}}}{\text{wallHeight}_{\text{cm}}}\right)$$
- **Grid Subsystem:**
  - Major lines at every 10 cm.
  - Minor lines at every 5 cm.
  - Floor baseline clearly designated with floor level styling and tick marks.
- **Interactions:**
  - Click/tap & drag element to reposition.
  - Drag handles (8 cardinal & corner anchors) to resize.
  - Magnetic snapping to 5cm / 10cm grid lines and adjacent object boundaries.
  - Multi-layer depth sorting (`zIndex`).
  - Active selection bounding box with live cm dimensions.
  - **Multi-select:** Shift+click to add/remove individual elements; drag on empty canvas area to rubber-band select a group. Group move supported.
  - **Annotation toggle:** `A` key or sidebar button shows/hides dimension callout overlay (does not affect export).

### 3.4 Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Arrow Keys` | Nudge selected element(s) by 1 cm |
| `Shift + Arrow` | Nudge selected element(s) by 10 cm |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + D` | Duplicate selected |
| `Delete` / `Backspace` | Delete selected |
| `Escape` | Deselect all |
| `Shift + Click` | Add to / remove from selection |
| `A` | Toggle annotation overlay |
| `E` | Toggle seated spectator eye level & ideal TV center datum |

### 3.4.1 Spectator Eye Level & Ergonomic TV Center Datum
- **Architectural Benchmark:** Standard seated spectator eye height is anchored at **105 cm AFF** (approx. 42 inches above finished floor, per CEDIA/THX ergonomic recommendations), with a comfortable viewing band of **$\pm 10\text{ cm}$ (95–115 cm AFF)**.
- **Dynamic Alignment & Feedback:** When enabled (toolbar toggle or `E` key):
  - Renders a gold/amber architectural datum line and comfort viewing zone across the wall.
  - Automatically identifies placed TV units, draws the TV's horizontal midpoint axis, and computes the vertical delta between the screen center and seated eye level.
  - Displays real-time delta callout pills (e.g. `✓ TV Center Aligned`, `TV Center +15 cm above eye level`).
  - Provides magnetic snapping to the ideal eye-level height when moving a TV.
  - Adds a 1-click `🎯 Align TV Center to Eye Level` button inside the Inspector for selected TV units.

### 3.5 Undo / Redo History
- Full history stack, capped at **50 states** to control memory usage.
- Every state-mutating action (add, delete, move, resize, texture change, wall resize) pushes a serialized snapshot of the canvas state to the stack.
- Undo (`Ctrl+Z`) pops the stack and restores the prior snapshot.
- History is cleared when a new project is loaded from file.

### 3.6 Touch & Tablet Support
- All pointer events are implemented using the [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) (`pointerdown`, `pointermove`, `pointerup`) which handles mouse, touch, and stylus inputs uniformly.
- Pinch-to-zoom on the canvas viewport is supported via two-finger gesture detection.
- The right sidebar collapses into a bottom sheet on viewports narrower than 768px.

### 3.7 Right Sidebar (Properties & Shader Inspector)
- **Target Item Binding:** Synchronized bi-directional inputs.
- **Metrics:** `Label`, `Width (cm)`, `Height (cm)`, `X (from left, cm)`, `Y (AFF, cm)`.
- **Material Textures (Canvas 2D Drawn — no SVG, no external assets):**
  1. *Vertical Wood Slats* (parameterized fluted slats with shadow grooves via fillRect + shadow)
  2. *Natural Wood Grain* (horizontal organic grain via bezier curves + noise)
  3. *Matte Paint / Cabinet Lacquer* (solid fill with subtle noise grain overlay)
  4. *Tinted Glass / Display Screen* (linear gradient sheen with inner arc highlight)
  5. *Acoustic Mesh / Fabric* (dot-grid pattern via arc fills)
  6. *Recessed Shelves / Niches* (inner shadow via inset gradient)
  7. *Linear Fireplace Flames* (animated canvas gradient for flame effect)
- **LED Lighting Modifiers:**
  - Backlight Halo (warm 3000K or daylight 4000K glow via radial gradient overlay)
  - Under-cabinet Downlight Glow
- **Layer & Management:**
  - Bring Forward / Send Backward
  - Duplicate Element (offsets +10cm)
  - Delete Element

---

## 4. Multi-Provider AI Render Engine & Prompt Studio

### 4.1 Natural Language Decomposition Algorithm
1. **Scene Context:** Overall room envelope:
   `"Architectural interior design elevation, custom built-in media wall measuring [Wall Width]cm wide by [Wall Height]cm high, [Selected Aesthetic Mood] aesthetic, photorealistic, cinematic ambient lighting."`
2. **Spatial Ordering & Stacking:**
   - Elements sorted by vertical elevation (Base/Floor units $\to$ Mid-level focal elements $\to$ Upper storage) and horizontal zones (Left wing, Center stage, Right wing).
   - Translates coordinates into descriptive spatial phrases:
     - $Y < 20$ cm: *"Anchoring the base along the floor level..."*
     - $Y \approx \text{mid}$: *"Mounted at eye-level in the central zone..."*
     - $Y > 200$ cm: *"Crowning the upper wall..."*
3. **Texture & Lighting Synthesis:**
   - Incorporates exact materials, dimensions, and LED backlighting into the prompt:
     - *"A 240cm x 45cm floating low credenza finished in smooth natural walnut grain with recessed handle grooves."*
     - *"Directly behind, a full-height 120cm x 280cm vertical acoustic oak slat backdrop with concealed warm 3000K LED edge illumination."*
4. **Diffusion Syntax Formats:**
   - Midjourney format: with `--ar [W:H] --v 6.1 --style raw`
   - Natural prose format (Gemini / GPT-Image): narrative description optimized for semantic fidelity.
   - Stable Diffusion format: token-weighted tags with negative prompt.

### 4.2 Interactive Prompt Tuning Studio
- **Live Textarea Editor:** Users can freely edit or augment the prompt in place.
- **One-Click Tuning Chips / Modifiers:**
  - *Lighting:* "Warm 2700K Architectural LED Cove", "Golden Hour Sunbeam", "Moody Twilight Interior", "Soft Diffused High-Key Studio"
  - *Camera Angle:* "Front-facing Orthographic Elevation View", "Eye-Level Architectural Digest Photography", "Wide 24mm Lens"
  - *Materials & Realism:* "Tactile Fluted White Oak Slats", "Honed Calacatta Viola Marble", "Brushed Brass Shadow Reveals", "Matte Chalk Plaster"
  - *Render Engines:* "Octane Render Photorealistic", "Unreal Engine 5 ArchViz", "35mm Hasselblad Film Grain"

### 4.3 Supported AI Image Generation Providers

| Provider | Default Model / Endpoint | Selectable Models | Key Required? | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Pollinations (Flux)** — *default* | `https://gen.pollinations.ai/image/{prompt}?model=flux` (falls back to legacy `image.pollinations.ai/prompt/{prompt}`) | `flux` (editable) | Optional (free key from enter.pollinations.ai) | Easiest setup: works with no account where anonymous access is allowed. **Reliability caveat:** community service, no SLA, may rate-limit or answer 401/402 — the UI then suggests adding a free key. |
| **Google Nano Banana** | `gemini-3.1-flash-image` via `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` (`x-goog-api-key` header) | `gemini-3.1-flash-image` (Nano Banana 2), `gemini-3.1-flash-lite-image` (fastest), `gemini-3-pro-image` (highest quality), `gemini-2.5-flash-image` (original Nano Banana) | Yes (Google AI Studio key) | `generationConfig.responseModalities: ["IMAGE","TEXT"]`, `imageConfig.aspectRatio` (e.g. `16:9`), optional `imageSize` `1K`/`2K`/`4K`. Image returned as base64 `inlineData`. |
| **OpenAI GPT-Image** | `gpt-image-2.5-flare` via `POST https://api.openai.com/v1/images/generations` | `gpt-image-2.5-flare` (fast), `gpt-image-2.5-sunburst` (precision) | Yes (OpenAI key) | Paid per image. Handles both `b64_json` and `url` responses. **Browser CORS is not guaranteed** — on a network/CORS failure the UI explains that a proxy (Custom endpoint) is needed. |
| **Custom / OpenAI-Compatible** | User-defined base URL & model (e.g. Together AI, Fal, Ollama, LocalAI, or a personal proxy) | Free text | Optional / per provider | Uses the OpenAI `images/generations` request shape. Also the recommended workaround for any provider that blocks browser calls. |

> **Retired models (verified Oct 2026):** Google Imagen models are shut down on the Gemini API (Google points to Nano Banana instead), and OpenAI DALL-E 2/3 are retired in favor of GPT-Image. Neither is offered.

### 4.4 Generation & Render Comparison Workflow
- In-browser API key management stored in `localStorage` (see Security Note in §2).
- One-click `✨ Generate 3D Render` with animated status and progress feedback.
- Interactive render viewer with side-by-side or split slider comparing the 2D elevation with the AI render.
- Download buttons for the rendered 3D image, 2D reference PNG, and a side-by-side comparison sheet.
- **Cross-origin renders:** Base64 results (Google, OpenAI `b64_json`) can always be drawn onto the comparison sheet. URL results (Pollinations, some Custom endpoints) are fetched as a Blob first; if the host does not send CORS headers, the render is still shown and can be opened/downloaded, but the comparison sheet button is disabled with an explanation (drawing it would taint the canvas).

---

## 5. Project Persistence

### 5.1 JSON Save / Load
- **Save (`💾 Save Project`):** Serializes the full application state to JSON and triggers a browser download as `arch2d-[timestamp].arch2d.json`.
- **Load (`📂 Load Project`):** Opens a `<input type="file">` picker. Parses the JSON, validates the schema version, and reconstructs the canvas. Clears undo history.
- **Schema (v1):**
  ```json
  {
    "schemaVersion": 1,
    "wallWidth": 400,
    "wallHeight": 280,
    "mood": "japandi",
    "elements": [
      {
        "id": "uuid",
        "label": "OLED 65\" TV",
        "x": 127, "y": 120,
        "width": 145, "height": 83,
        "texture": "glass",
        "color": "#1a1a1a",
        "opacity": 1,
        "ledHalo": true,
        "ledUnderglow": false,
        "zIndex": 2
      }
    ]
  }
  ```

### 5.2 Auto-Save Fallback
- On every canvas mutation, the serialized state is written to `localStorage` under the key `arch2d_autosave`.
- On app load, if `arch2d_autosave` exists, the user is offered: **"Restore last session?"** / **"Start fresh"**.

---

## 6. Technical Implementation Details

- **Deliverable:** `index.html` — a single self-contained file generated by `build.sh`, containing:
  - Vanilla CSS (embedded `<style>`) using CSS custom properties for the design token system. No external CSS framework CDN dependency.
  - JavaScript inlined as classic `<script>` blocks, one per source file, each headed by a section banner (e.g. `/* === src/state.js === */`).
- **Source layout (`src/`):** `00-namespace.js`, `01-bus.js`, `02-vocab.js`, `state.js`, `persistence.js`, `textures.js`, `render.js`, `export.js`, `canvas.js`, `input.js`, `templates.js`, `prompt.js`, `providers.js`, `studio.js`, `ui.js`, `main.js`, plus `tokens.css`, `ui.css`, `studio.css`. Interfaces are frozen in `CONTRACTS.md`.
- **Module rules:** Every file is a `'use strict'` IIFE that registers on `window.Arch2D`. Modules communicate only through `Arch2D.*` APIs and the `Arch2D.bus` event bus.
- **Dev harness:** `dev.html` loads the `src/` files individually with classic `<script src>` tags, so it also works over `file://`.
- **Offscreen Canvas Export:** Uses an offscreen `HTMLCanvasElement` at $2000\text{px}+$ width. All textures drawn via `CanvasRenderingContext2D` (no SVG, no external assets) — `toDataURL('image/png')` is always safe from CORS taint.
- **Pointer Events:** All interactive canvas interactions use the Pointer Events API (`pointerdown`, `pointermove`, `pointerup`) for unified mouse, touch, and stylus handling.
- **Robustness:** Handles 15+ complex overlapping objects, undo/redo (50-state cap), responsive resizing, zero lag target.
- **Running Locally:** Double-click `index.html` — no server and no install. (`python3 -m http.server` is optional and never required, because no ES modules or `fetch` of local files are used.)
- **Rebuilding:** `./build.sh` regenerates `index.html` from `src/`.
