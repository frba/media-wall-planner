/* Arch2D — House Item Library & Custom Item Prompt Modal.
   Provides a searchable architectural catalog of household elements
   (living, kitchen, bedroom, bath, storage, lighting, decor) and
   an interactive prompt builder to define and add custom items to the model. */
(function () {
  'use strict';
  const A = window.Arch2D;
  const U = A.util;
  const V = A.vocab;

  let modalBackdrop = null;
  let modalEl = null;
  let activeTab = 'browse'; // 'browse' | 'create'
  let activeCategory = 'all';
  let searchQuery = '';
  let customItems = []; // persisted user items

  const CATEGORIES = [
    { id: 'all', label: 'All Items', icon: '✨' },
    { id: 'living', label: 'Living & Media', icon: '🛋️' },
    { id: 'storage', label: 'Shelving & Storage', icon: '📚' },
    { id: 'kitchen', label: 'Kitchen & Dining', icon: '🍳' },
    { id: 'bedroom', label: 'Bedroom & Wardrobe', icon: '🛏️' },
    { id: 'office', label: 'Home Office', icon: '💼' },
    { id: 'bath', label: 'Bath & Laundry', icon: '🚿' },
    { id: 'decor', label: 'Lighting & Decor', icon: '🌿' },
    { id: 'arch', label: 'Doors & Windows', icon: '🚪' },
    { id: 'custom', label: 'My Custom Items', icon: '⭐' },
  ];

  /* Comprehensive Architectural Household Catalog */
  const HOUSE_CATALOG = [
    /* 1. Living & Entertainment */
    {
      id: 'tv_75',
      label: '75" 4K OLED TV',
      category: 'living',
      width: 167,
      height: 96,
      y: 100,
      texture: 'glass',
      color: '#0d0f12',
      noun: '75-inch flush-mounted OLED television',
      tags: ['tv', 'television', 'screen', 'oled', 'display', 'living', 'media'],
    },
    {
      id: 'tv_85',
      label: '85" Ultra-Slim Theater Display',
      category: 'living',
      width: 190,
      height: 108,
      y: 105,
      texture: 'glass',
      color: '#090a0d',
      noun: '85-inch ultra-slim home theater display',
      tags: ['tv', 'theater', 'screen', 'large', 'cinema', '85'],
    },
    {
      id: 'tv_frame',
      label: 'Art Mode Bezel TV (65")',
      category: 'living',
      width: 145,
      height: 83,
      y: 100,
      texture: 'matte',
      color: '#2a2825',
      noun: 'bezel-framed art television display with museum matting',
      tags: ['tv', 'frame', 'art', 'display', 'samsung', 'aesthetic'],
    },
    {
      id: 'soundbar_atmos',
      label: 'Dolby Atmos Soundbar',
      category: 'living',
      width: 125,
      height: 12,
      y: 85,
      texture: 'mesh',
      color: '#28282b',
      noun: 'architectural Dolby Atmos soundbar',
      tags: ['audio', 'soundbar', 'speaker', 'atmos', 'sound', 'tv'],
    },
    {
      id: 'subwoofer_unit',
      label: 'Wireless Subwoofer Unit',
      category: 'living',
      width: 38,
      height: 42,
      y: 0,
      texture: 'matte',
      color: '#1b1d22',
      noun: 'compact wireless subwoofer unit',
      tags: ['speaker', 'bass', 'subwoofer', 'audio', 'floor'],
    },
    {
      id: 'tower_speaker',
      label: 'Hi-Fi Floorstanding Tower Speaker',
      category: 'living',
      width: 30,
      height: 110,
      y: 0,
      texture: 'woodgrain',
      color: '#7b5e43',
      noun: 'audiophile floor-standing tower speaker',
      tags: ['speaker', 'audio', 'hi-fi', 'tower', 'music', 'sound'],
    },
    {
      id: 'credenza_floating_wide',
      label: 'Floating Minimalist Credenza',
      category: 'living',
      width: 260,
      height: 40,
      y: 20,
      texture: 'woodgrain',
      color: '#8a6a4a',
      ledUnderglow: true,
      noun: 'floating lowline credenza with continuous grain and underglow',
      tags: ['credenza', 'console', 'tv unit', 'cabinet', 'wood', 'floating'],
    },
    {
      id: 'credenza_fluted',
      label: 'Fluted Slat Media Console',
      category: 'living',
      width: 220,
      height: 45,
      y: 18,
      texture: 'slats',
      color: '#a07d57',
      ledUnderglow: true,
      noun: 'fluted timber floating media console with acoustic slats',
      tags: ['credenza', 'console', 'slats', 'timber', 'fluted'],
    },
    {
      id: 'bench_stone_cantilever',
      label: 'Cantilevered Stone Media Bench',
      category: 'living',
      width: 200,
      height: 30,
      y: 15,
      texture: 'matte',
      color: '#bfb8ad',
      noun: 'cantilevered honed stone architectural bench',
      tags: ['bench', 'stone', 'marble', 'minimal', 'hearth'],
    },
    {
      id: 'fireplace_linear_wide',
      label: 'Wide Linear Electric Fireplace',
      category: 'living',
      width: 180,
      height: 42,
      y: 35,
      texture: 'fireplace',
      color: '#141414',
      noun: 'recessed frameless linear fireplace with ambient flame ribbon',
      tags: ['fireplace', 'hearth', 'flame', 'electric', 'linear'],
    },
    {
      id: 'fireplace_hearth_double',
      label: 'Double-Sided Ambient Hearth',
      category: 'living',
      width: 130,
      height: 48,
      y: 40,
      texture: 'fireplace',
      color: '#111111',
      noun: 'modern architectural ribbon fireplace hearth',
      tags: ['fireplace', 'flame', 'hearth', 'cozy'],
    },
    {
      id: 'sofa_sectional_back',
      label: 'Modern Sectional Sofa Back',
      category: 'living',
      width: 240,
      height: 82,
      y: 0,
      texture: 'mesh',
      color: '#c9c3b8',
      noun: 'low-profile modern upholstered sectional sofa',
      tags: ['sofa', 'couch', 'seating', 'living', 'furniture'],
    },
    {
      id: 'armchair_lounge',
      label: 'Sculptural Lounge Armchair',
      category: 'living',
      width: 85,
      height: 78,
      y: 0,
      texture: 'mesh',
      color: '#555b64',
      noun: 'sculptural modern upholstered armchair',
      tags: ['chair', 'armchair', 'lounge', 'seating'],
    },
    {
      id: 'coffee_table_round',
      label: 'Low Round White Oak Coffee Table',
      category: 'living',
      width: 85,
      height: 38,
      y: 0,
      texture: 'woodgrain',
      color: '#927150',
      noun: 'low circular white oak coffee table',
      tags: ['table', 'coffee table', 'round', 'oak'],
    },

    /* 2. Shelving & Storage */
    {
      id: 'slat_wall_full',
      label: 'Full-Height Acoustic Slat Wall',
      category: 'storage',
      width: 120,
      height: 280,
      y: 0,
      texture: 'slats',
      color: '#b08d66',
      noun: 'floor-to-ceiling acoustic fluted timber slat wall',
      tags: ['slats', 'acoustic', 'wood', 'wall panel', 'feature wall'],
    },
    {
      id: 'slat_wainscot',
      label: 'Fluted Wall Wainscot with LED Halo',
      category: 'storage',
      width: 200,
      height: 110,
      y: 0,
      texture: 'slats',
      color: '#9a7552',
      ledHalo: true,
      noun: 'half-height fluted timber acoustic wainscoting with LED wash',
      tags: ['slats', 'wainscot', 'panel', 'led', 'accent'],
    },
    {
      id: 'bookshelf_niche_tall',
      label: 'Recessed Curated Bookshelf',
      category: 'storage',
      width: 90,
      height: 200,
      y: 50,
      texture: 'niche',
      color: '#cfc6b8',
      noun: 'recessed open display bookshelf with curated ceramic vessels',
      tags: ['bookshelf', 'shelf', 'shelves', 'niche', 'books', 'display'],
    },
    {
      id: 'niche_limewash_display',
      label: 'Limewash Display Niche',
      category: 'storage',
      width: 70,
      height: 130,
      y: 80,
      texture: 'niche',
      color: '#d8d0c2',
      noun: 'curated architectural limewashed display niche with downlighting',
      tags: ['niche', 'display', 'recessed', 'shelf', 'ceramic', 'decor'],
    },
    {
      id: 'upper_overhead_cupboards',
      label: 'Overhead Handleless Cabinets',
      category: 'storage',
      width: 240,
      height: 60,
      y: 200,
      texture: 'matte',
      color: '#d9d3c8',
      ledUnderglow: true,
      noun: 'row of handleless overhead storage cabinets with downward LED wash',
      tags: ['cabinet', 'upper', 'cupboard', 'overhead', 'storage'],
    },
    {
      id: 'tall_millwork_pantry',
      label: 'Tall Millwork Storage Wardrobe',
      category: 'storage',
      width: 80,
      height: 280,
      y: 0,
      texture: 'matte',
      color: '#c8c0b2',
      noun: 'full-height integrated millwork tall storage cupboard',
      tags: ['tall', 'cabinet', 'pantry', 'wardrobe', 'storage', 'millwork'],
    },
    {
      id: 'floating_shelf_oak',
      label: 'Minimalist Floating Oak Shelf',
      category: 'storage',
      width: 160,
      height: 6,
      y: 145,
      texture: 'woodgrain',
      color: '#a4805c',
      noun: 'minimalist floating white oak display shelf',
      tags: ['shelf', 'floating', 'oak', 'display', 'minimal'],
    },
    {
      id: 'shelf_led_wash',
      label: 'Floating Shelf + Concealed LED Downlight',
      category: 'storage',
      width: 200,
      height: 8,
      y: 150,
      texture: 'woodgrain',
      color: '#8e6e4f',
      ledUnderglow: true,
      noun: 'architectural floating shelf with integrated warm LED downwash',
      tags: ['shelf', 'led', 'light', 'floating', 'display'],
    },
    {
      id: 'wine_rack_wall',
      label: 'Wall-Mounted Architectural Wine Rack',
      category: 'storage',
      width: 65,
      height: 140,
      y: 75,
      texture: 'matte',
      color: '#2a2b2f',
      noun: 'wall-mounted minimalist dark metal wine display',
      tags: ['wine', 'rack', 'bar', 'storage', 'bottles'],
    },

    /* 3. Kitchen & Dining */
    {
      id: 'kitchen_island_counter',
      label: 'Monolithic Kitchen Island Counter',
      category: 'kitchen',
      width: 240,
      height: 92,
      y: 0,
      texture: 'woodgrain',
      color: '#7e6145',
      ledUnderglow: true,
      noun: 'monolithic kitchen island counter with waterfall edges',
      tags: ['kitchen', 'island', 'counter', 'bar', 'cooking'],
    },
    {
      id: 'kitchen_base_cabinet',
      label: 'Kitchen Base Cabinet Suite',
      category: 'kitchen',
      width: 180,
      height: 90,
      y: 0,
      texture: 'matte',
      color: '#d2cbbe',
      noun: 'row of handleless kitchen base cabinetry',
      tags: ['kitchen', 'cabinet', 'base', 'counter', 'storage'],
    },
    {
      id: 'kitchen_counter_splash',
      label: 'Honed Stone Counter & Splashback',
      category: 'kitchen',
      width: 240,
      height: 60,
      y: 90,
      texture: 'matte',
      color: '#dcd7cc',
      ledUnderglow: true,
      noun: 'seamless honed stone kitchen countertop and matching backsplash',
      tags: ['kitchen', 'backsplash', 'countertop', 'stone', 'marble'],
    },
    {
      id: 'fluted_glass_cupboard',
      label: 'Reeded Glass Upper Cabinet',
      category: 'kitchen',
      width: 140,
      height: 75,
      y: 155,
      texture: 'glass',
      color: '#1a1d22',
      noun: 'upper kitchen cabinetry with reeded fluted glass panels',
      tags: ['kitchen', 'glass', 'cabinet', 'cupboard', 'upper'],
    },
    {
      id: 'fridge_french_door',
      label: 'Flush French-Door Refrigerator',
      category: 'kitchen',
      width: 92,
      height: 185,
      y: 0,
      texture: 'matte',
      color: '#8d9197',
      noun: 'flush integrated stainless French-door refrigerator',
      tags: ['fridge', 'refrigerator', 'appliance', 'kitchen', 'freezer'],
    },
    {
      id: 'wall_oven_tower',
      label: 'Built-in Double Wall Oven Column',
      category: 'kitchen',
      width: 60,
      height: 125,
      y: 70,
      texture: 'glass',
      color: '#121316',
      noun: 'integrated black glass double wall oven and microwave column',
      tags: ['oven', 'microwave', 'appliance', 'kitchen', 'baking'],
    },
    {
      id: 'wine_cooler_under',
      label: 'Under-Counter Wine Cellar Cooler',
      category: 'kitchen',
      width: 60,
      height: 85,
      y: 0,
      texture: 'glass',
      color: '#131518',
      ledHalo: true,
      noun: 'under-counter tinted glass wine cellar cooler with warm interior light',
      tags: ['wine', 'cooler', 'fridge', 'cellar', 'kitchen', 'bar'],
    },
    {
      id: 'range_hood_modern',
      label: 'Minimalist Wall Range Hood',
      category: 'kitchen',
      width: 90,
      height: 70,
      y: 160,
      texture: 'matte',
      color: '#303238',
      noun: 'minimalist architectural wall-mounted range hood',
      tags: ['hood', 'range hood', 'ventilation', 'kitchen', 'stove'],
    },
    {
      id: 'dining_table_solid',
      label: '6-Seater Solid Oak Dining Table',
      category: 'kitchen',
      width: 180,
      height: 76,
      y: 0,
      texture: 'woodgrain',
      color: '#9c7956',
      noun: 'wide solid oak dining table',
      tags: ['dining', 'table', 'eating', 'wood', 'chairs'],
    },

    /* 4. Bedroom & Wardrobe */
    {
      id: 'bed_king_headboard',
      label: 'King Bed with Upholstered Headboard',
      category: 'bedroom',
      width: 210,
      height: 125,
      y: 0,
      texture: 'mesh',
      color: '#d0c8bc',
      ledHalo: true,
      noun: 'king-size bed with wide upholstered floating headboard and halo lighting',
      tags: ['bed', 'king', 'headboard', 'bedroom', 'mattress'],
    },
    {
      id: 'bed_queen_platform',
      label: 'Queen Platform Bed (White Oak)',
      category: 'bedroom',
      width: 170,
      height: 110,
      y: 0,
      texture: 'woodgrain',
      color: '#8e6e50',
      noun: 'low-profile white oak queen platform bed',
      tags: ['bed', 'queen', 'platform', 'bedroom', 'oak'],
    },
    {
      id: 'nightstand_floating',
      label: 'Floating Bedside Nightstand',
      category: 'bedroom',
      width: 55,
      height: 25,
      y: 45,
      texture: 'woodgrain',
      color: '#9f7c59',
      ledUnderglow: true,
      noun: 'floating white oak bedside nightstand with drawer and underglow',
      tags: ['nightstand', 'bedside', 'table', 'drawer', 'bedroom'],
    },
    {
      id: 'wardrobe_built_in',
      label: 'Full-Height 4-Door Wardrobe',
      category: 'bedroom',
      width: 200,
      height: 260,
      y: 0,
      texture: 'matte',
      color: '#cec7ba',
      noun: 'full-height custom built-in 4-door wardrobe',
      tags: ['wardrobe', 'closet', 'clothes', 'storage', 'bedroom'],
    },
    {
      id: 'dresser_6drawer',
      label: '6-Drawer Low Bedroom Dresser',
      category: 'bedroom',
      width: 150,
      height: 85,
      y: 0,
      texture: 'woodgrain',
      color: '#826346',
      noun: 'horizontal 6-drawer oak bedroom dresser',
      tags: ['dresser', 'drawers', 'storage', 'bedroom', 'clothes'],
    },
    {
      id: 'vanity_mirror_halo',
      label: 'Arched Vanity Mirror with LED Halo',
      category: 'bedroom',
      width: 70,
      height: 130,
      y: 80,
      texture: 'glass',
      color: '#0e1014',
      ledHalo: true,
      noun: 'arched architectural vanity mirror with soft warm LED halo backlight',
      tags: ['mirror', 'vanity', 'arch', 'led', 'makeup'],
    },
    {
      id: 'dressing_mirror_full',
      label: 'Full-Length Dressing Mirror',
      category: 'bedroom',
      width: 65,
      height: 190,
      y: 10,
      texture: 'glass',
      color: '#101216',
      noun: 'tall minimalist full-length dressing mirror',
      tags: ['mirror', 'full length', 'dressing', 'tall'],
    },

    /* 5. Home Office & Study */
    {
      id: 'work_desk_exec',
      label: 'Executive Solid Wood Work Desk',
      category: 'office',
      width: 160,
      height: 75,
      y: 0,
      texture: 'woodgrain',
      color: '#937251',
      noun: 'executive minimalist solid wood writing desk',
      tags: ['desk', 'office', 'table', 'workstation', 'study'],
    },
    {
      id: 'floating_desk_wall',
      label: 'Cantilevered Floating Workstation',
      category: 'office',
      width: 150,
      height: 15,
      y: 75,
      texture: 'woodgrain',
      color: '#846549',
      ledUnderglow: true,
      noun: 'wall-mounted cantilevered floating study desk with underglow',
      tags: ['desk', 'floating', 'cantilever', 'office', 'laptop'],
    },
    {
      id: 'office_chair_mesh',
      label: 'Ergonomic High-Back Task Chair',
      category: 'office',
      width: 65,
      height: 115,
      y: 0,
      texture: 'mesh',
      color: '#383b42',
      noun: 'ergonomic high-back task office chair',
      tags: ['chair', 'office', 'task', 'ergonomic', 'seat'],
    },
    {
      id: 'studio_monitors_dual',
      label: 'Dual 27" Curved Studio Monitors',
      category: 'office',
      width: 135,
      height: 48,
      y: 85,
      texture: 'glass',
      color: '#0d0f12',
      noun: 'dual frameless ultrawide studio monitors on desk mount',
      tags: ['monitors', 'screens', 'pc', 'computer', 'dual', 'office'],
    },

    /* 6. Bathroom & Laundry */
    {
      id: 'vanity_double_floating',
      label: 'Wall-Hung Double Bathroom Vanity',
      category: 'bath',
      width: 160,
      height: 52,
      y: 38,
      texture: 'woodgrain',
      color: '#8f7052',
      ledUnderglow: true,
      noun: 'wall-hung double bathroom vanity with continuous wood veneer and underglow',
      tags: ['vanity', 'sink', 'bathroom', 'basin', 'cabinet'],
    },
    {
      id: 'mirror_round_backlit',
      label: 'Illuminated Round Mirror (3000K)',
      category: 'bath',
      width: 85,
      height: 85,
      y: 105,
      texture: 'glass',
      color: '#0d0f12',
      ledHalo: true,
      noun: 'frameless circular mirror with warm 3000K LED halo glow',
      tags: ['mirror', 'round', 'circle', 'bathroom', 'led', 'backlit'],
    },
    {
      id: 'washer_dryer_stack',
      label: 'Stacked Front-Load Laundry Suite',
      category: 'bath',
      width: 70,
      height: 175,
      y: 0,
      texture: 'matte',
      color: '#eceae4',
      noun: 'integrated stacked front-load laundry washer and dryer suite',
      tags: ['washer', 'dryer', 'laundry', 'appliance', 'washing'],
    },

    /* 7. Lighting, Decor & Plants */
    {
      id: 'lamp_arc_floor',
      label: 'Architectural Arc Floor Lamp',
      category: 'decor',
      width: 55,
      height: 195,
      y: 0,
      texture: 'matte',
      color: '#1a1a1c',
      ledHalo: true,
      noun: 'architectural slender arc floor lamp with warm downlight',
      tags: ['lamp', 'floor lamp', 'light', 'lighting', 'arc'],
    },
    {
      id: 'wall_sconce_brass',
      label: 'Brushed Brass Linear Wall Sconce',
      category: 'decor',
      width: 12,
      height: 45,
      y: 165,
      texture: 'matte',
      color: '#c9a57a',
      ledHalo: true,
      noun: 'vertical brushed brass architectural wall sconce with halo backlighting',
      tags: ['sconce', 'light', 'lamp', 'brass', 'wall light'],
    },
    {
      id: 'olive_tree_potted',
      label: 'Mature Potted European Olive Tree',
      category: 'decor',
      width: 65,
      height: 175,
      y: 0,
      texture: 'niche',
      color: '#706554',
      noun: 'mature potted Mediterranean olive tree in textured ceramic planter',
      tags: ['plant', 'tree', 'olive', 'greenery', 'pot', 'decor'],
    },
    {
      id: 'fiddle_leaf_fig',
      label: 'Lush Fiddle Leaf Fig Planter',
      category: 'decor',
      width: 55,
      height: 140,
      y: 0,
      texture: 'niche',
      color: '#5c6352',
      noun: 'tall lush fiddle leaf fig plant in fluted terracotta pot',
      tags: ['plant', 'fig', 'greenery', 'pot', 'leaves'],
    },
    {
      id: 'canvas_art_oversized',
      label: 'Oversized Framed Abstract Canvas',
      category: 'decor',
      width: 130,
      height: 160,
      y: 75,
      texture: 'matte',
      color: '#e4ddd0',
      noun: 'large framed contemporary textured minimalist abstract canvas artwork',
      tags: ['art', 'painting', 'canvas', 'artwork', 'frame', 'picture'],
    },
    {
      id: 'slat_ceiling_drop',
      label: 'Slat Ceiling Cove with LED Drop',
      category: 'decor',
      width: 260,
      height: 22,
      y: 258,
      texture: 'slats',
      color: '#a6835d',
      ledUnderglow: true,
      noun: 'suspended timber slat ceiling cove with indirect downward LED wash',
      tags: ['ceiling', 'slats', 'cove', 'led', 'architectural'],
    },

    /* 8. Doors & Windows */
    {
      id: 'sliding_pocket_door',
      label: 'Sliding Timber Pocket / Barn Door',
      category: 'arch',
      width: 95,
      height: 245,
      y: 0,
      texture: 'woodgrain',
      color: '#8e6e4f',
      noun: 'floor-to-ceiling sliding architectural timber pocket door',
      tags: ['door', 'sliding', 'pocket door', 'barn door', 'wood'],
    },
    {
      id: 'window_picture_frame',
      label: 'Black-Framed Picture Window',
      category: 'arch',
      width: 160,
      height: 265,
      y: 10,
      texture: 'glass',
      color: '#101317',
      noun: 'large black-framed floor-to-ceiling picture window with outdoor views',
      tags: ['window', 'glass', 'outdoor', 'light', 'frame'],
    },
    {
      id: 'sheer_linen_drapes',
      label: 'Floor-to-Ceiling Sheer Linen Drapes',
      category: 'arch',
      width: 90,
      height: 275,
      y: 5,
      texture: 'mesh',
      color: '#f0ece4',
      noun: 'billowing floor-to-ceiling sheer linen window curtains',
      tags: ['curtain', 'drapes', 'linen', 'window', 'fabric', 'sheer'],
    },
    {
      id: 'radiator_cover_slats',
      label: 'Architectural Slat Radiator Cover',
      category: 'arch',
      width: 110,
      height: 75,
      y: 0,
      texture: 'slats',
      color: '#8e6f51',
      noun: 'fluted timber acoustic radiator cover console',
      tags: ['radiator', 'heater', 'cover', 'slats', 'console'],
    },
    {
      id: 'split_ac_unit',
      label: 'Slim Matte Wall AC / Heat Pump',
      category: 'arch',
      width: 90,
      height: 30,
      y: 235,
      texture: 'matte',
      color: '#e8e6df',
      noun: 'slim wall-mounted contemporary split-system AC unit',
      tags: ['ac', 'air conditioner', 'heat pump', 'climate', 'wall'],
    },
  ];

  /* Color Palette Presets for Custom Creator */
  const PALETTE_SWATCHES = [
    { label: 'White Oak', hex: '#9a7552' },
    { label: 'Smoked Walnut', hex: '#5c4331' },
    { label: 'Chalk White', hex: '#d9d3c8' },
    { label: 'Warm Cream', hex: '#cfc6b8' },
    { label: 'Pewter Grey', hex: '#8a909c' },
    { label: 'Deep Charcoal', hex: '#2b2724' },
    { label: 'Pitch Black', hex: '#0d0f12' },
    { label: 'Brushed Brass', hex: '#c9a57a' },
    { label: 'Muted Terracotta', hex: '#b06d57' },
  ];

  /* State for Creator Form */
  const creatorState = {
    label: 'Custom Architectural Element',
    category: 'living',
    width: 120,
    height: 60,
    y: 0,
    texture: 'woodgrain',
    color: '#9a7552',
    ledHalo: false,
    ledUnderglow: false,
    ledTemp: 3000,
  };

  /* ---------- Initialization & DOM ---------- */
  function init() {
    loadCustomItems();
    registerCatalogPresets();
    createModalDOM();
    bindEvents();
  }

  function loadCustomItems() {
    customItems = A.persistence.getJSON('custom_house_items', []);
  }

  function saveCustomItems() {
    A.persistence.setJSON('custom_house_items', customItems);
  }

  function registerCatalogPresets() {
    // Register items into V.presets so that prompt generator and state normalizer recognise them
    for (const item of HOUSE_CATALOG) {
      if (!V.presets[item.id]) {
        V.presets[item.id] = {
          label: item.label,
          width: item.width,
          height: item.height,
          texture: item.texture,
          color: item.color,
          y: item.y,
          noun: item.noun || item.label.toLowerCase(),
          ledHalo: !!item.ledHalo,
          ledUnderglow: !!item.ledUnderglow,
        };
      }
    }
  }

  function createModalDOM() {
    modalBackdrop = U.h('div', { class: 'modal-backdrop', id: 'library-backdrop' });

    modalEl = U.h(
      'div',
      { class: 'library-modal', id: 'library-modal' },
      // Header
      U.h(
        'div',
        { class: 'library-header' },
        U.h(
          'div',
          { class: 'library-title-group' },
          U.h('h2', { class: 'library-title' }, U.h('span', null, '🛋️'), U.h('span', null, 'House Item Library & Prompt')),
          U.h('span', { class: 'library-subtitle hide-sm' }, 'Add furniture, storage, lighting, kitchen & custom elements')
        ),
        U.h(
          'div',
          { class: 'library-nav-tabs' },
          U.h('button', { class: 'library-tab-btn active', id: 'lib-tab-browse', onclick: () => switchTab('browse') }, '🔍 Search & Browse'),
          U.h('button', { class: 'library-tab-btn', id: 'lib-tab-create', onclick: () => switchTab('create') }, '✨ Prompt Custom Item')
        ),
        U.h('button', { class: 'icon-btn', id: 'btn-close-library', title: 'Close (Esc)', onclick: close }, '✕')
      ),
      // Body Container
      U.h('div', { class: 'library-body', id: 'library-body' })
    );

    modalBackdrop.appendChild(modalEl);
    document.body.appendChild(modalBackdrop);

    // Close on backdrop click
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) close();
    });
  }

  function bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        close();
      }
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    modalEl.querySelector('#lib-tab-browse').classList.toggle('active', tab === 'browse');
    modalEl.querySelector('#lib-tab-create').classList.toggle('active', tab === 'create');
    renderBody();
  }

  function renderBody() {
    const body = modalEl.querySelector('#library-body');
    body.innerHTML = '';

    if (activeTab === 'browse') {
      renderBrowseTab(body);
    } else {
      renderCreatorTab(body);
    }
  }

  /* ---------- Browse Tab ---------- */
  function renderBrowseTab(container) {
    const view = U.h('div', { class: 'library-browse-view' });

    // Controls bar
    const controls = U.h('div', { class: 'library-controls-bar' });

    // Search row
    const searchRow = U.h('div', { class: 'library-search-row' });
    const searchWrap = U.h('div', { class: 'library-search-input-wrap' });
    const searchIcon = U.h('span', { class: 'library-search-icon' }, '🔍');

    const searchInput = U.h('input', {
      type: 'text',
      class: 'library-search-input',
      id: 'library-search-box',
      placeholder: 'Search 40+ household items (e.g., "sofa", "fridge", "mirror", "desk", "lamp", "slat", "shelf")...',
      value: searchQuery,
      oninput: (e) => {
        searchQuery = e.target.value;
        clearBtn.classList.toggle('visible', !!searchQuery);
        updateResults();
      },
    });

    const clearBtn = U.h(
      'button',
      {
        class: `library-search-clear ${searchQuery ? 'visible' : ''}`,
        title: 'Clear search',
        onclick: () => {
          searchQuery = '';
          searchInput.value = '';
          clearBtn.classList.remove('visible');
          searchInput.focus();
          updateResults();
        },
      },
      '✕'
    );

    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(searchInput);
    searchWrap.appendChild(clearBtn);

    const countBadge = U.h('span', { class: 'library-count-badge', id: 'library-count-badge' }, '0 items');

    searchRow.appendChild(searchWrap);
    searchRow.appendChild(countBadge);
    controls.appendChild(searchRow);

    // Category pills row
    const pillsRow = U.h('div', { class: 'library-category-pills' });
    for (const cat of CATEGORIES) {
      const pill = U.h(
        'button',
        {
          class: `category-pill ${activeCategory === cat.id ? 'active' : ''}`,
          onclick: () => {
            activeCategory = cat.id;
            pillsRow.querySelectorAll('.category-pill').forEach((p) => p.classList.remove('active'));
            pill.classList.add('active');
            updateResults();
          },
        },
        U.h('span', null, cat.icon),
        U.h('span', null, cat.label)
      );
      pillsRow.appendChild(pill);
    }
    controls.appendChild(pillsRow);
    view.appendChild(controls);

    // Container for dynamic Quick Add banner and Grid
    const resultsContainer = U.h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' } });
    const bannerSlot = U.h('div', { id: 'library-banner-slot' });
    const scrollArea = U.h('div', { class: 'library-items-scroll' });
    const grid = U.h('div', { class: 'library-items-grid', id: 'library-grid' });

    scrollArea.appendChild(grid);
    resultsContainer.appendChild(bannerSlot);
    resultsContainer.appendChild(scrollArea);
    view.appendChild(resultsContainer);
    container.appendChild(view);

    // Function to filter and update items
    function updateResults() {
      const q = searchQuery.trim().toLowerCase();

      // Check if user typed dimension prompt: e.g. "bookshelf 120x200" or "desk 140*60"
      bannerSlot.innerHTML = '';
      const dimMatch = q.match(/^(.+?)\s+(\d{2,4})\s*[x×*]\s*(\d{2,4})(.*)$/i);
      if (dimMatch) {
        const itemTitle = dimMatch[1].trim();
        const itemW = parseInt(dimMatch[2], 10);
        const itemH = parseInt(dimMatch[3], 10);

        const banner = U.h(
          'div',
          { class: 'library-quick-add-banner' },
          U.h(
            'div',
            { class: 'quick-add-info' },
            U.h('span', { style: { fontSize: '20px' } }, '💡'),
            U.h(
              'div',
              null,
              U.h('div', { class: 'quick-add-title' }, `Prompt Match: Quick Add "${itemTitle}"`),
              U.h('div', { class: 'quick-add-dims' }, `Dimensions: ${itemW} × ${itemH} cm — Click to place directly in model`)
            )
          ),
          U.h(
            'button',
            {
              class: 'btn primary',
              onclick: () => {
                addItemToModel({
                  label: itemTitle,
                  width: itemW,
                  height: itemH,
                  y: 0,
                  texture: 'matte',
                  color: '#9aa3ad',
                });
              },
            },
            '+ Add to Elevation'
          )
        );
        bannerSlot.appendChild(banner);
      }

      // Filter catalog
      const allItems = [...customItems, ...HOUSE_CATALOG];
      const filtered = allItems.filter((item) => {
        // Category check
        if (activeCategory === 'custom') {
          if (!customItems.includes(item)) return false;
        } else if (activeCategory !== 'all') {
          if (item.category !== activeCategory) return false;
        }

        // Query check
        if (!q) return true;
        if (item.label.toLowerCase().includes(q)) return true;
        if (item.category.toLowerCase().includes(q)) return true;
        if (item.tags && item.tags.some((t) => t.includes(q))) return true;
        if (`${item.width}x${item.height}`.includes(q) || `${item.width}×${item.height}`.includes(q)) return true;
        return false;
      });

      countBadge.textContent = `${filtered.length} item${filtered.length === 1 ? '' : 's'}`;

      grid.innerHTML = '';
      if (filtered.length === 0) {
        const empty = U.h(
          'div',
          { class: 'library-empty-state', style: { gridColumn: '1 / -1' } },
          U.h('div', { class: 'library-empty-icon' }, '🔍'),
          U.h('h3', { style: { color: 'var(--text-0)', margin: '0' } }, 'No items found matching your search'),
          U.h('p', null, `No catalog items matched "${searchQuery}". You can create a custom item using the Prompt tab!`),
          U.h(
            'button',
            {
              class: 'btn primary',
              style: { marginTop: '12px' },
              onclick: () => {
                creatorState.label = searchQuery || 'Custom House Item';
                switchTab('create');
              },
            },
            `✨ Prompt & Create "${searchQuery || 'Custom Item'}"`
          )
        );
        grid.appendChild(empty);
        return;
      }

      for (const item of filtered) {
        const card = createItemCard(item);
        grid.appendChild(card);
      }
    }

    // Initial populate
    updateResults();

    // Auto-focus search box
    setTimeout(() => {
      const box = modalEl.querySelector('#library-search-box');
      if (box) box.focus();
    }, 80);
  }

  function createItemCard(item) {
    const card = U.h('div', { class: 'library-card' });

    // Card Header with Canvas Thumbnail
    const cardHeader = U.h('div', { class: 'library-card-header' });

    const thumbCanvas = U.h('canvas', {
      class: 'library-thumb-canvas',
      width: 58,
      height: 44,
      title: `${item.texture} texture preview`,
    });
    renderThumbnail(thumbCanvas, item);

    const info = U.h(
      'div',
      { class: 'library-card-info' },
      U.h('div', { class: 'library-card-category' }, getCategoryLabel(item.category)),
      U.h('div', { class: 'library-card-title', title: item.label }, item.label)
    );

    cardHeader.appendChild(thumbCanvas);
    cardHeader.appendChild(info);
    card.appendChild(cardHeader);

    // Metadata Badges (Dimensions, AFF, Material, Lighting)
    const meta = U.h('div', { class: 'library-card-meta' });
    meta.appendChild(U.h('span', { class: 'library-tag-pill' }, `${item.width} × ${item.height} cm`));

    const yAff = typeof item.y === 'number' ? item.y : 0;
    meta.appendChild(U.h('span', { class: 'library-tag-pill tag-aff' }, yAff === 0 ? 'Floor Level' : `AFF ${yAff} cm`));

    const texLabel = (V.textures[item.texture] && V.textures[item.texture].label) || item.texture;
    meta.appendChild(U.h('span', { class: 'library-tag-pill' }, texLabel.split(' ')[0]));

    if (item.ledHalo || item.ledUnderglow) {
      meta.appendChild(U.h('span', { class: 'library-tag-pill tag-led' }, '💡 LED'));
    }

    card.appendChild(meta);

    // Actions: "Add" and "Add & Close"
    const actions = U.h('div', { class: 'library-card-actions' });

    const btnAdd = U.h(
      'button',
      {
        class: 'library-add-btn',
        title: 'Add to elevation model without closing library',
        onclick: (e) => {
          e.stopPropagation();
          addItemToModel(item);
          btnAdd.textContent = '✓ Added';
          btnAdd.style.background = 'var(--success)';
          btnAdd.style.color = '#fff';
          setTimeout(() => {
            btnAdd.textContent = '+ Add';
            btnAdd.style.background = '';
            btnAdd.style.color = '';
          }, 1000);
        },
      },
      '+ Add'
    );

    const btnAddClose = U.h(
      'button',
      {
        class: 'library-add-btn primary',
        title: 'Add to elevation model and close library',
        onclick: () => {
          addItemToModel(item);
          close();
        },
      },
      '+ Add & Close'
    );

    actions.appendChild(btnAdd);
    actions.appendChild(btnAddClose);
    card.appendChild(actions);

    return card;
  }

  function getCategoryLabel(catId) {
    const c = CATEGORIES.find((cat) => cat.id === catId);
    return c ? `${c.icon} ${c.label}` : catId;
  }

  /* ---------- Custom Item Creator Tab ---------- */
  function renderCreatorTab(container) {
    const view = U.h('div', { class: 'library-creator-view' });
    const card = U.h('div', { class: 'creator-form-card' });

    // Section 1: Name and Category
    const sec1 = U.h('div', { class: 'creator-section' });
    sec1.appendChild(U.h('label', { class: 'creator-label' }, 'Item Name & Category'));
    const row1 = U.h('div', { class: 'creator-row-2' });

    const nameInput = U.h('input', {
      type: 'text',
      class: 'input',
      placeholder: 'e.g. Sculptural Travertine Plinth, Velvet Ottoman, Wine Fridge...',
      value: creatorState.label,
      oninput: (e) => {
        creatorState.label = e.target.value || 'Custom Item';
        updatePreview();
      },
    });

    const catSelect = U.h(
      'select',
      {
        class: 'select',
        onchange: (e) => {
          creatorState.category = e.target.value;
          updatePreview();
        },
      },
      ...CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'custom').map((c) =>
        U.h('option', { value: c.id, selected: creatorState.category === c.id }, `${c.icon} ${c.label}`)
      )
    );

    row1.appendChild(nameInput);
    row1.appendChild(catSelect);
    sec1.appendChild(row1);
    card.appendChild(sec1);

    // Section 2: Dimensions & Vertical Elevation Datum (AFF)
    const sec2 = U.h('div', { class: 'creator-section' });
    sec2.appendChild(U.h('label', { class: 'creator-label' }, 'Architectural Dimensions & Placement Height (AFF)'));
    const row2 = U.h('div', { class: 'creator-row-3' });

    // Width
    const colW = U.h(
      'div',
      { class: 'form-field' },
      U.h('label', { class: 'form-label' }, 'Width (cm)'),
      U.h('input', {
        type: 'number',
        class: 'input',
        min: '5',
        max: '4000',
        value: creatorState.width,
        oninput: (e) => {
          creatorState.width = Math.max(5, parseInt(e.target.value, 10) || 50);
          updatePreview();
        },
      })
    );

    // Height
    const colH = U.h(
      'div',
      { class: 'form-field' },
      U.h('label', { class: 'form-label' }, 'Height (cm)'),
      U.h('input', {
        type: 'number',
        class: 'input',
        min: '5',
        max: '2000',
        value: creatorState.height,
        oninput: (e) => {
          creatorState.height = Math.max(5, parseInt(e.target.value, 10) || 50);
          updatePreview();
        },
      })
    );

    // Placement AFF
    const colY = U.h(
      'div',
      { class: 'form-field' },
      U.h('label', { class: 'form-label' }, 'Elevation AFF (cm)'),
      U.h('input', {
        type: 'number',
        class: 'input',
        min: '0',
        max: '2000',
        value: creatorState.y,
        oninput: (e) => {
          creatorState.y = Math.max(0, parseInt(e.target.value, 10) || 0);
          updatePreview();
        },
      })
    );

    row2.appendChild(colW);
    row2.appendChild(colH);
    row2.appendChild(colY);
    sec2.appendChild(row2);

    // Quick Elevation Benchmark Chips
    const chipsRow = U.h('div', { class: 'creator-quick-chips' });
    const benchmarks = [
      { label: 'Floor (0 cm)', y: 0 },
      { label: 'Credenza (20 cm)', y: 20 },
      { label: 'Desk/Table (75 cm)', y: 75 },
      { label: 'Counter (90 cm)', y: 90 },
      { label: 'Eye Level (105 cm)', y: 105 },
      { label: 'Upper Wall (180 cm)', y: 180 },
    ];
    for (const b of benchmarks) {
      const chip = U.h(
        'button',
        {
          class: `chip-btn ${creatorState.y === b.y ? 'active' : ''}`,
          onclick: () => {
            creatorState.y = b.y;
            colY.querySelector('input').value = b.y;
            chipsRow.querySelectorAll('.chip-btn').forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            updatePreview();
          },
        },
        b.label
      );
      chipsRow.appendChild(chip);
    }
    sec2.appendChild(chipsRow);
    card.appendChild(sec2);

    // Section 3: Material & Texture Procedural Shader
    const sec3 = U.h('div', { class: 'creator-section' });
    sec3.appendChild(U.h('label', { class: 'creator-label' }, 'Material Finish & Procedural Texture'));
    const texGrid = U.h('div', { class: 'creator-texture-grid' });

    for (const [id, tex] of Object.entries(V.textures)) {
      const opt = U.h(
        'div',
        {
          class: `creator-texture-opt ${creatorState.texture === id ? 'selected' : ''}`,
          onclick: () => {
            creatorState.texture = id;
            creatorState.color = tex.defaultColor;
            colorPicker.value = tex.defaultColor;
            texGrid.querySelectorAll('.creator-texture-opt').forEach((o) => o.classList.remove('selected'));
            opt.classList.add('selected');
            updateColorSwatches();
            updatePreview();
          },
        },
        U.h('div', { class: 'texture-chip-swatch', style: { background: tex.defaultColor } }),
        U.h('span', null, tex.label)
      );
      texGrid.appendChild(opt);
    }
    sec3.appendChild(texGrid);
    card.appendChild(sec3);

    // Section 4: Color Picker & Palettes
    const sec4 = U.h('div', { class: 'creator-section' });
    sec4.appendChild(U.h('label', { class: 'creator-label' }, 'Color & Tone'));
    const colorsRow = U.h('div', { class: 'creator-colors-row' });

    for (const sw of PALETTE_SWATCHES) {
      const circle = U.h('div', {
        class: `color-swatch-circle ${creatorState.color.toLowerCase() === sw.hex.toLowerCase() ? 'selected' : ''}`,
        style: { background: sw.hex },
        title: sw.label,
        onclick: () => {
          creatorState.color = sw.hex;
          colorPicker.value = sw.hex;
          updateColorSwatches();
          updatePreview();
        },
      });
      colorsRow.appendChild(circle);
    }

    const colorPicker = U.h('input', {
      type: 'color',
      class: 'color-custom-input',
      title: 'Custom Hex Color',
      value: creatorState.color,
      oninput: (e) => {
        creatorState.color = e.target.value;
        updateColorSwatches();
        updatePreview();
      },
    });
    colorsRow.appendChild(colorPicker);
    sec4.appendChild(colorsRow);
    card.appendChild(sec4);

    function updateColorSwatches() {
      colorsRow.querySelectorAll('.color-swatch-circle').forEach((c) => {
        const bg = c.style.background;
        c.classList.toggle('selected', creatorState.color.toLowerCase() === bg.toLowerCase());
      });
    }

    // Section 5: Architectural Lighting Controls
    const sec5 = U.h('div', { class: 'creator-section' });
    sec5.appendChild(U.h('label', { class: 'creator-label' }, 'Concealed Architectural Lighting'));
    const lightRow = U.h('div', { style: { display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' } });

    const chkHalo = U.h(
      'label',
      { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--fs-sm)' } },
      U.h('input', {
        type: 'checkbox',
        checked: creatorState.ledHalo,
        onchange: (e) => {
          creatorState.ledHalo = e.target.checked;
          updatePreview();
        },
      }),
      'Concealed LED Halo Backlighting'
    );

    const chkUnder = U.h(
      'label',
      { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--fs-sm)' } },
      U.h('input', {
        type: 'checkbox',
        checked: creatorState.ledUnderglow,
        onchange: (e) => {
          creatorState.ledUnderglow = e.target.checked;
          updatePreview();
        },
      }),
      'Downward Under-Cabinet Glow'
    );

    const selectTemp = U.h(
      'select',
      {
        class: 'select',
        style: { width: 'auto' },
        onchange: (e) => {
          creatorState.ledTemp = parseInt(e.target.value, 10);
          updatePreview();
        },
      },
      U.h('option', { value: '3000', selected: creatorState.ledTemp === 3000 }, 'Warm White (3000K)'),
      U.h('option', { value: '4000', selected: creatorState.ledTemp === 4000 }, 'Neutral Daylight (4000K)')
    );

    lightRow.appendChild(chkHalo);
    lightRow.appendChild(chkUnder);
    lightRow.appendChild(selectTemp);
    sec5.appendChild(lightRow);
    card.appendChild(sec5);

    // Section 6: Live Miniature Elevation Preview
    const previewBox = U.h('div', { class: 'creator-preview-box' });
    const previewCanvasWrap = U.h('div', { class: 'preview-canvas-wrap' });
    const previewCanvas = U.h('canvas', { width: 130, height: 75 });
    previewCanvasWrap.appendChild(previewCanvas);

    const previewMeta = U.h(
      'div',
      { class: 'preview-meta' },
      U.h('div', { class: 'preview-meta-title', id: 'prev-title' }, creatorState.label),
      U.h(
        'div',
        { class: 'preview-meta-desc', id: 'prev-desc' },
        `${creatorState.width} × ${creatorState.height} cm • AFF: ${creatorState.y} cm • Texture: ${creatorState.texture}`
      )
    );

    previewBox.appendChild(previewCanvasWrap);
    previewBox.appendChild(previewMeta);
    card.appendChild(previewBox);

    function updatePreview() {
      const titleEl = card.querySelector('#prev-title');
      const descEl = card.querySelector('#prev-desc');
      if (titleEl) titleEl.textContent = creatorState.label;
      if (descEl) {
        descEl.textContent = `${creatorState.width} × ${creatorState.height} cm • AFF: ${creatorState.y} cm • Texture: ${creatorState.texture}${
          creatorState.ledHalo || creatorState.ledUnderglow ? ' • LED Lit' : ''
        }`;
      }
      renderThumbnail(previewCanvas, creatorState);
    }

    // Section 7: Action Buttons
    const actions = U.h('div', { class: 'creator-actions' });

    const btnSaveLib = U.h(
      'button',
      {
        class: 'btn',
        onclick: () => {
          const item = Object.assign({}, creatorState, { id: 'cust_' + U.uid(), noun: creatorState.label.toLowerCase() });
          customItems.unshift(item);
          saveCustomItems();
          addItemToModel(item);
          A.ui.toast(`Saved "${item.label}" to library and added to model!`, 'success');
          close();
        },
      },
      '💾 Save to Library & Add'
    );

    const btnAddElevation = U.h(
      'button',
      {
        class: 'btn primary',
        onclick: () => {
          addItemToModel(creatorState);
          close();
        },
      },
      '✨ Add to Elevation Model'
    );

    actions.appendChild(btnSaveLib);
    actions.appendChild(btnAddElevation);
    card.appendChild(actions);

    view.appendChild(card);
    container.appendChild(view);

    // Initial canvas paint
    updatePreview();
  }

  /* ---------- Canvas Thumbnail Renderer ---------- */
  function renderThumbnail(canvas, item) {
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const w = item.width || 80;
    const h = item.height || 60;
    const pxPerCm = Math.min((cw - 12) / w, (ch - 12) / h);
    const rw = Math.max(6, Math.round(w * pxPerCm));
    const rh = Math.max(6, Math.round(h * pxPerCm));
    const rx = Math.round((cw - rw) / 2);
    const ry = Math.round((ch - rh) / 2);

    const tempEl = {
      id: 'thumb_' + (item.id || 'preview'),
      texture: item.texture || 'matte',
      color: item.color || '#9aa3ad',
      opacity: 1,
      ledHalo: !!item.ledHalo,
      ledUnderglow: !!item.ledUnderglow,
      ledTemp: item.ledTemp || 3000,
    };

    // Draw procedural texture via Arch2D texture shader engine
    A.textures.draw(ctx, tempEl, { x: rx, y: ry, w: rw, h: rh }, { pxPerCm: Math.max(0.4, pxPerCm) });

    // Subtle outline border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);
  }

  /* ---------- Add Item to Elevation Model ---------- */
  function addItemToModel(item) {
    const state = A.store.getState();
    const wallW = state.wallWidth || 400;
    const wallH = state.wallHeight || 280;

    const w = Math.min(item.width, wallW);
    const h = Math.min(item.height, wallH);

    // Position horizontally centered on the wall
    let x = Math.round((wallW - w) / 2);
    let y = typeof item.y === 'number' ? item.y : 0;

    // Boundary check within wall height
    if (y + h > wallH) {
      y = Math.max(0, wallH - h);
    }

    // Intelligent offset if an existing element has the exact same bounding box at center
    const hasOverlap = state.elements.some((e) => Math.abs(e.x - x) < 4 && Math.abs(e.y - y) < 4);
    if (hasOverlap) {
      x = Math.max(0, Math.min(wallW - w, x + 15));
    }

    const id = A.store.addElement({
      type: 'custom',
      label: item.label,
      width: w,
      height: h,
      x,
      y,
      texture: item.texture || 'matte',
      color: item.color || '#9aa3ad',
      ledHalo: !!item.ledHalo,
      ledUnderglow: !!item.ledUnderglow,
      ledTemp: item.ledTemp || 3000,
    });

    A.ui.toast(`Added "${item.label}" to elevation.`, 'success');
    return id;
  }

  /* ---------- Public API ---------- */
  function open(defaultTab = 'browse') {
    activeTab = defaultTab;
    modalBackdrop.classList.add('open');
    renderBody();
  }

  function close() {
    modalBackdrop.classList.remove('open');
  }

  function getCatalog() {
    return HOUSE_CATALOG.slice();
  }

  A.library = {
    init,
    open,
    close,
    getCatalog,
    addItemToModel,
  };
})();
