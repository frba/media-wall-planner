/* Arch2D — shared vocabulary (Phase 0). Single source of truth for textures, moods,
   presets and prompt chips, so the renderer, the inspector and the prompt generator
   never drift apart. Data only — no behaviour. */
(function () {
  'use strict';
  const A = window.Arch2D;

  const textures = {
    slats: { label: 'Vertical Wood Slats', defaultColor: '#b08d66', phrase: 'three-dimensional fluted timber slats with deep acoustic shadow grooves and matte oiled finish' },
    woodgrain: { label: 'Natural Wood Grain', defaultColor: '#9a7552', phrase: 'continuous natural wood grain veneer with organic cathedral patterns and satin sheen' },
    matte: { label: 'Matte Lacquer', defaultColor: '#d9d3c8', phrase: 'smooth architectural ultra-matte lacquer with subtle soft-touch finish' },
    glass: { label: 'Glass / Screen', defaultColor: '#0d0f12', phrase: 'deep pitch-black bezel-less OLED glass with subtle dark ambient room reflections' },
    mesh: { label: 'Acoustic Mesh', defaultColor: '#3a3a3c', phrase: 'fine tactile woven acoustic fabric with micro-mesh texture' },
    niche: { label: 'Recessed Niche', defaultColor: '#cfc6b8', phrase: 'recessed open display niche with limewashed interior and warm downlighting' },
    fireplace: { label: 'Linear Fireplace', defaultColor: '#141414', phrase: 'frameless linear electric fireplace with glowing ember bed and soft ambient flame ribbons' },
  };

  const moods = {
    japandi: {
      label: 'Japandi / Organic Modern',
      short: 'Japandi',
      wall: '#e6dfd3',
      wallPattern: 'plaster',
      wallMaterial: 'warm limewash plaster wall with delicate hand-troweled mineral texture',
      phrase: 'refined Japandi organic-modern',
      flooring: 'wide-plank European white oak hardwood flooring with a subtle matte satin finish',
      atmosphere: 'Soft, diffused natural daylight enters through off-camera floor-to-ceiling sheer linen curtains, casting gentle directional window shadows across the wall.',
      lighting: 'soft diffused warm daylight with gentle architectural shadows and warm indirect ambient glow',
      accent: '#c9a57a',
      materials: {
        slats: 'three-dimensional fluted natural white oak timber slats with deep matte black acoustic felt reveals',
        woodgrain: 'warm natural white oak veneer with continuous horizontal cathedral grain and seamless waterfall edges',
        matte: 'warm sand-toned ultra-matte lacquer with hairline shadowline reveals',
        glass: 'deep pitch-black bezel-less OLED glass with subtle dark ambient room reflections',
        mesh: 'natural oatmeal linen acoustic fabric with tactile micro-weave',
        niche: 'limewashed recessed niche with solid white oak shelving and curated ceramic vessels',
        fireplace: 'linear electric fireplace with a soft warm amber ember bed',
      },
    },
    darkLuxury: {
      label: 'Dark Luxury Contemporary',
      short: 'Dark Luxury',
      wall: '#2b2724',
      wallPattern: 'plaster',
      wallMaterial: 'deep charcoal Venetian plaster wall with subtle burnished sheen and brushed brass shadow reveals',
      phrase: 'dark luxury contemporary penthouse',
      flooring: 'smoked European oak hardwood flooring in a refined herringbone pattern or honed Nero Marquina stone slab',
      atmosphere: 'Moody architectural evening atmosphere with layered 2700K indirect LED illumination and warm ambient reflections.',
      lighting: 'moody low-key architectural lighting with warm 2700K indirect LED grazing and subtle specular reflections',
      accent: '#c8a165',
      materials: {
        slats: 'deep smoked eucalyptus fluted slats with dark bronze metallic reveals',
        woodgrain: 'smoked eucalyptus architectural veneer with rich linear grain',
        matte: 'deep charcoal ultra-matte lacquer with recessed brushed brass trims',
        glass: 'smoked bronze anti-reflective glass panel',
        mesh: 'charcoal acoustic wool fabric with fine micro-perforations',
        niche: 'honed Nero Marquina marble-lined niche with delicate white veining and integrated warm mini-spotlight',
        fireplace: 'frameless linear fireplace with tall amber flames and blackened steel surround',
      },
    },
    scandi: {
      label: 'Scandinavian Light',
      short: 'Scandinavian',
      wall: '#f1efea',
      wallPattern: 'plaster',
      wallMaterial: 'matte chalk-white mineral plaster wall with soft light absorption',
      phrase: 'light Scandinavian minimalist',
      flooring: 'pale Nordic white ash or bleached Scandinavian oak plank flooring',
      atmosphere: 'Abundant diffused Nordic natural daylight fills the room with soft, gentle shadows and clean natural ambience.',
      lighting: 'bright airy natural daylight with soft ambient fill and clean shadow lines',
      accent: '#d8c3a0',
      materials: {
        slats: 'pale white ash timber slats with natural light wood grain',
        woodgrain: 'bleached white ash architectural veneer',
        matte: 'chalk-white ultra-matte lacquer with handleless push-latch millwork',
        glass: 'ultra-slim OLED glass display',
        mesh: 'light heather grey wool acoustic fabric',
        niche: 'airy open display niche in pale white ash with minimal Scandinavian ceramic styling',
        fireplace: 'minimal linear fireplace with a clean ribbon flame line',
      },
    },
    industrial: {
      label: 'Modern Industrial',
      short: 'Industrial',
      wall: '#7b4a3a',
      wallPattern: 'brick',
      wallMaterial: 'authentic weathered red brick wall with raw mortar joints and blackened steel shadowlines',
      phrase: 'refined modern industrial loft',
      flooring: 'polished micro-cement flooring with satin sheen or reclaimed dark walnut planks',
      atmosphere: 'Warm ambient interior lighting mixed with soft window daylight for balanced, rich dynamic range.',
      lighting: 'warm Edison-toned 2400K ambient illumination mixed with diffused natural window light',
      accent: '#d08b4e',
      materials: {
        slats: 'dark-stained American walnut fluted slats with blackened acoustic backing',
        woodgrain: 'rich dark American walnut veneer with expressive grain',
        matte: 'charcoal powder-coated blackened steel panels',
        glass: 'deep black glass display framed in hairline blackened steel',
        mesh: 'perforated charcoal industrial metal mesh with tactile texture',
        niche: 'open architectural shelf framed in blackened steel with exposed weld details',
        fireplace: 'linear fireplace recessed in a heavy blackened steel architectural hearth',
      },
    },
  };

  /* Standard components (project.md §3.2). y = default bottom edge AFF in cm. */
  const presets = {
    tv: { label: 'OLED 65" TV', width: 145, height: 83, texture: 'glass', color: '#0d0f12', y: 100, noun: 'ultra-thin flush-mounted 65-inch OLED television' },
    soundbar: { label: 'Dolby Atmos Soundbar', width: 110, height: 10, texture: 'mesh', color: '#2b2b2d', y: 85, noun: 'slim architectural Dolby Atmos soundbar' },
    fireplace: { label: 'Linear Electric Fireplace', width: 150, height: 40, texture: 'fireplace', color: '#141414', y: 45, noun: 'linear electric fireplace' },
    credenza: { label: 'Floating Low Credenza', width: 240, height: 45, texture: 'woodgrain', color: '#8a6a4a', y: 15, noun: 'floating low credenza with continuous grain', ledUnderglow: true },
    slats: { label: 'Vertical Slat Feature Panel', width: 120, height: 280, texture: 'slats', color: '#b08d66', y: 0, noun: 'full-height vertical fluted timber slat feature panel' },
    bookshelf: { label: 'Recessed Open Bookshelf', width: 80, height: 160, texture: 'niche', color: '#cfc6b8', y: 70, noun: 'recessed open display bookshelf' },
    upper: { label: 'Upper Storage Cupboards', width: 240, height: 60, texture: 'matte', color: '#d9d3c8', y: 200, noun: 'row of handleless upper storage cupboards' },
    custom: { label: 'Custom Block', width: 50, height: 50, texture: 'matte', color: '#9aa3ad', y: 0, noun: 'custom architectural millwork module' },
  };

  /* Prompt tuning chips (project.md §4.2). */
  const chips = {
    Lighting: [
      'Concealed 2700K Architectural LED Cove',
      'Soft Morning Window Light via Sheer Curtains',
      'Moody Evening Ambient Glow',
      'Diffused Downward Under-Cabinet Wash',
    ],
    Camera: [
      '35mm Tilt-Shift Architectural Lens (Zero Distortion)',
      'Front-Facing Orthographic Elevation View',
      'Eye-Level Architectural Digest Editorial Shot',
      'f/8 Sharp Corner-to-Corner Depth',
    ],
    Materials: [
      'Tactile Fluted Oak with Black Acoustic Felt',
      'Hand-Troweled Limewash Plaster Texture',
      'Honed Calacatta Viola Marble Niche',
      'Seamless Waterfall Mitered Edge Veneer',
    ],
    Realism: [
      'Architectural Digest Magazine Feature',
      'Omit All CAD Lines & Dimension Text',
      'Subtle Ambient Window Reflections on OLED TV',
      'Wide-Plank European Oak Hardwood Foreground',
    ],
  };

  const ledTemps = {
    3000: { label: 'Warm 3000K', color: '#ffb35c', phrase: 'warm 2700K-3000K indirect' },
    4000: { label: 'Daylight 4000K', color: '#ffe6c2', phrase: 'neutral 4000K daylight' },
  };

  const config = {
    historyLimit: 50,
    snapPx: 8, // magnetic snap threshold in screen pixels
    minSizeCm: 1,
    defaultEyeLevelCm: 105, // Ergonomic seated eye level AFF (~42 inches, CEDIA/THX standard)
    eyeComfortBandCm: 10,   // Comfortable vertical eye range: ±10 cm (95–115 cm AFF)
    midjourneyVersion: '6.1', // per project.md §4.1 — change here when Midjourney updates
    maxPromptUrlChars: 1800,
  };

  A.vocab = { textures, moods, presets, chips, ledTemps, config };
})();
