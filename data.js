// ============================================================
//  THE WEAPON SHOP v4 — Data Definitions
// ============================================================

const MATERIALS = {
    wood: { name: 'Wood', cost: 5, icon: '🪵', requiredTier: 0 }, iron_ore: { name: 'Iron Ore', cost: 15, icon: '⛏️', requiredTier: 0 },
    leather: { name: 'Leather', cost: 10, icon: '🧶', requiredTier: 0 }, steel_ingot: { name: 'Steel Ingot', cost: 40, icon: '⚙️', requiredTier: 0 },
    magic_crystal: { name: 'Magic Crystal', cost: 80, icon: '💎', requiredTier: 0 },
    herbs: { name: 'Herbs', cost: 8, icon: '🌿', requiredTier: 0 }, mushroom: { name: 'Mushroom', cost: 12, icon: '🍄', requiredTier: 0 }, crystal_vial: { name: 'Crystal Vial', cost: 20, icon: '🧪', requiredTier: 0 },
    dragon_scale: { name: 'Dragon Scale', cost: 150, icon: '🐉', requiredTier: 3 }, shadow_silk: { name: 'Shadow Silk', cost: 120, icon: '🕸️', requiredTier: 3 },
    mythril_bar: { name: 'Mythril Bar', cost: 250, icon: '🔷', requiredTier: 4 }, celestial_shard: { name: 'Celestial Shard', cost: 400, icon: '⭐', requiredTier: 4 },
    phoenix_feather: { name: 'Phoenix Feather', cost: 600, icon: '🪶', requiredTier: 5 }, void_essence: { name: 'Void Essence', cost: 550, icon: '🌀', requiredTier: 5 },
    titan_core: { name: 'Titan Core', cost: 900, icon: '🗿', requiredTier: 6 }, abyssal_ink: { name: 'Abyssal Ink', cost: 850, icon: '🖋️', requiredTier: 6 },
    stardust: { name: 'Stardust', cost: 1400, icon: '✨', requiredTier: 7 }, primordial_shard: { name: 'Primordial Shard', cost: 1200, icon: '💠', requiredTier: 7 },
    chrono_crystal: { name: 'Chrono Crystal', cost: 2200, icon: '⏳', requiredTier: 8 }, divine_fragment: { name: 'Divine Fragment', cost: 2000, icon: '👼', requiredTier: 8 },
    cosmic_ore: { name: 'Cosmic Ore', cost: 3500, icon: '🌌', requiredTier: 9 }, infinity_shard: { name: 'Infinity Shard', cost: 5000, icon: '♾️', requiredTier: 9 },
    // Chest-exclusive essences — not buyable, only from chest loot
    bronze_essence: { name: 'Bronze Essence', cost: 0, icon: '🥉', requiredTier: 0, chestOnly: true },
    silver_essence: { name: 'Silver Essence', cost: 0, icon: '🥈', requiredTier: 0, chestOnly: true },
    gold_essence: { name: 'Gold Essence', cost: 0, icon: '🏅', requiredTier: 0, chestOnly: true },
    platinum_essence: { name: 'Platinum Essence', cost: 0, icon: '💎', requiredTier: 0, chestOnly: true },
    diamond_essence: { name: 'Diamond Essence', cost: 0, icon: '💠', requiredTier: 0, chestOnly: true },
};

const TIER_CONFIG = {
    1: { improvementEvery: 5, unlockNext: 10 }, 2: { improvementEvery: 8, unlockNext: 15 }, 3: { improvementEvery: 10, unlockNext: 20 },
    4: { improvementEvery: 12, unlockNext: 25 }, 5: { improvementEvery: 15, unlockNext: 30 }, 6: { improvementEvery: 20, unlockNext: 40 },
    7: { improvementEvery: 30, unlockNext: 60 }, 8: { improvementEvery: 50, unlockNext: 100 }, 9: { improvementEvery: 100, unlockNext: 200 },
    10: { improvementEvery: 250, unlockNext: null },
};
const TIER_PRICES = [35, 65, 160, 500, 1500, 3000, 5500, 9000, 16000, 35000];

const QUALITIES = {
    common: { name: 'Common', color: '#9ca3af', multiplier: 1.0, fusionResult: 'uncommon', scale: 1 },
    uncommon: { name: 'Uncommon', color: '#10b981', multiplier: 1.5, fusionResult: 'rare', scale: 2 },
    rare: { name: 'Rare', color: '#60a5fa', multiplier: 2.0, fusionResult: 'epic', scale: 3 },
    epic: { name: 'Epic', color: '#a78bfa', multiplier: 3.0, fusionResult: 'legendary', scale: 4 },
    legendary: { name: 'Legendary', color: '#f59e0b', multiplier: 5.0, fusionResult: null, scale: 5 },
};
const QUALITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const MASTERY_SCHEDULE = {
    1: { priceMultiplier: 1.10, matReduce: null, speed: false, qualityUp: false, label: '+10% sell price' },
    2: { priceMultiplier: 1.20, matReduce: null, speed: false, qualityUp: false, label: '+20% sell price' },
    3: { priceMultiplier: 1.20, matReduce: 'first', speed: false, qualityUp: false, label: '−1 most used material' },
    4: { priceMultiplier: 1.30, matReduce: null, speed: false, qualityUp: false, label: '+30% sell price' },
    5: { priceMultiplier: 1.30, matReduce: 'second', speed: false, qualityUp: false, label: '−1 next material' },
    6: { priceMultiplier: 1.40, matReduce: null, speed: true, qualityUp: true, label: '+40% price & better quality' },
    7: { priceMultiplier: 1.40, matReduce: null, speed: true, qualityUp: false, label: 'Items sell faster' },
    8: { priceMultiplier: 1.50, matReduce: null, speed: false, qualityUp: false, label: '+50% sell price' },
    9: { priceMultiplier: 1.50, matReduce: 'third', speed: false, qualityUp: false, label: '−1 most used again' },
    10: { priceMultiplier: 1.75, matReduce: null, speed: false, qualityUp: false, label: '✦ Master Forged (+75%)' },
};

const GROUPS = { weapons: '⚔️ Weapons', armor: '🛡️ Armor', accessories: '💎 Accessories' };

// Recipe templates: 5 sets × 10 tiers
// Recipe sets: cost should be ~50-70% of sell price at each tier
// Mat costs: wood=5, leather=10, iron=15, steel=40, crystal=80, herbs=8, mushroom=12, vial=20, dragon=150, silk=120, mythril=250, celest=400, phoenix=600, void=550, titan=900, abyss=850, star=1400, primo=1200, chrono=2200, divine=2000, cosmic=3500, infinity=5000
const R = {
    physical: [{ wood: 3 }, { iron_ore: 2, wood: 1 }, { steel_ingot: 2, iron_ore: 1 }, { steel_ingot: 2, magic_crystal: 1, dragon_scale: 1 }, { mythril_bar: 2, celestial_shard: 1, dragon_scale: 1 }, { phoenix_feather: 2, mythril_bar: 1 }, { titan_core: 2, phoenix_feather: 1 }, { stardust: 2, primordial_shard: 1, titan_core: 1 }, { chrono_crystal: 2, divine_fragment: 2 }, { cosmic_ore: 2, infinity_shard: 2, chrono_crystal: 1 }],
    agile: [{ wood: 2, leather: 1 }, { iron_ore: 1, leather: 2 }, { steel_ingot: 1, leather: 2 }, { steel_ingot: 1, shadow_silk: 2 }, { mythril_bar: 1, celestial_shard: 1, shadow_silk: 1 }, { void_essence: 2, phoenix_feather: 1 }, { abyssal_ink: 2, titan_core: 1 }, { primordial_shard: 2, stardust: 1 }, { divine_fragment: 2, chrono_crystal: 1 }, { infinity_shard: 2, cosmic_ore: 1 }],
    magic: [{ wood: 3 }, { wood: 2, iron_ore: 1 }, { steel_ingot: 1, magic_crystal: 1 }, { magic_crystal: 2, dragon_scale: 1 }, { mythril_bar: 1, celestial_shard: 2 }, { phoenix_feather: 2, void_essence: 1 }, { abyssal_ink: 2, titan_core: 1 }, { stardust: 2, primordial_shard: 2 }, { chrono_crystal: 2, divine_fragment: 2 }, { cosmic_ore: 2, infinity_shard: 2 }],
    craft: [{ wood: 2, leather: 1 }, { iron_ore: 1, leather: 1, wood: 1 }, { steel_ingot: 1, magic_crystal: 1 }, { steel_ingot: 2, magic_crystal: 1 }, { mythril_bar: 1, celestial_shard: 1, shadow_silk: 1 }, { phoenix_feather: 1, void_essence: 1, mythril_bar: 1 }, { titan_core: 1, abyssal_ink: 1, phoenix_feather: 1 }, { stardust: 2, primordial_shard: 1, titan_core: 1 }, { chrono_crystal: 2, divine_fragment: 1, stardust: 1 }, { cosmic_ore: 2, infinity_shard: 2 }],
    precious: [{ wood: 1, iron_ore: 1 }, { iron_ore: 2 }, { steel_ingot: 1, magic_crystal: 1 }, { magic_crystal: 1, dragon_scale: 1 }, { mythril_bar: 1, celestial_shard: 1 }, { phoenix_feather: 1, void_essence: 1 }, { titan_core: 1, abyssal_ink: 1 }, { stardust: 1, primordial_shard: 1 }, { chrono_crystal: 1, divine_fragment: 1 }, { cosmic_ore: 1, infinity_shard: 1 }],
    organic: [{ herbs: 3 }, { herbs: 2, mushroom: 1 }, { mushroom: 2, crystal_vial: 1 }, { herbs: 2, crystal_vial: 1, shadow_silk: 1 }, { mushroom: 2, crystal_vial: 1, dragon_scale: 1 }, { phoenix_feather: 1, void_essence: 1, crystal_vial: 1 }, { abyssal_ink: 1, titan_core: 1, mushroom: 1 }, { stardust: 1, primordial_shard: 1, herbs: 1 }, { chrono_crystal: 1, divine_fragment: 1, crystal_vial: 1 }, { cosmic_ore: 1, infinity_shard: 1, mushroom: 1 }],
};

// Category definitions: group, label, icon, recipe set, price multiplier, 10 item names
const CAT = {
    // ===== WEAPONS (10) =====
    swords: { group: 'weapons', label: '⚔️ Swords', icon: '⚔️', r: 'physical', p: 1.0, n: ['Wooden Sword', 'Iron Sword', 'Steel Sword', 'Enchanted Blade', 'Celestial Saber', 'Phoenix Blade', 'Abyssal Edge', 'Stardust Rapier', 'Chrono Katana', 'Infinity Blade'] },
    axes: { group: 'weapons', label: '🪓 Axes', icon: '🪓', r: 'physical', p: 1.05, n: ['Wooden Axe', 'Iron Axe', 'Steel Axe', 'Enchanted Cleaver', 'Worldsplitter', 'Phoenix Axe', 'Abyssal Axe', 'Star Cleaver', 'Temporal Axe', 'Infinity Axe'] },
    staves: { group: 'weapons', label: '🪄 Staves', icon: '🪄', r: 'magic', p: 1.1, n: ['Wooden Staff', 'Apprentice Staff', 'Mage Staff', 'Arcane Staff', 'Staff of Eternity', 'Phoenix Rod', 'Abyssal Staff', 'Starweave Staff', 'Chrono Scepter', 'Infinity Focus'] },
    daggers: { group: 'weapons', label: '🗡️ Daggers', icon: '🗡️', r: 'agile', p: 0.85, n: ['Wooden Shiv', 'Iron Dagger', 'Steel Stiletto', 'Shadow Blade', 'Voidfang', 'Phoenix Fang', 'Abyssal Dagger', 'Stardust Needle', 'Chrono Shiv', 'Infinity Fang'] },
    bows: { group: 'weapons', label: '🏹 Bows', icon: '🏹', r: 'agile', p: 0.95, n: ['Shortbow', 'Longbow', 'Steel Bow', 'Enchanted Bow', 'Celestial Arc', 'Phoenix Bow', 'Abyssal Bow', 'Star Bow', 'Chrono Bow', 'Infinity Arc'] },
    guns: { group: 'weapons', label: '🔫 Guns', icon: '🔫', r: 'craft', p: 1.15, n: ['Flintlock', 'Musket', 'Revolver', 'Enchanted Pistol', 'Celestial Cannon', 'Phoenix Blaster', 'Abyssal Gun', 'Star Cannon', 'Chrono Rifle', 'Infinity Gun'] },
    spears: { group: 'weapons', label: '🔱 Spears', icon: '🔱', r: 'physical', p: 0.9, n: ['Wooden Spear', 'Iron Spear', 'Steel Lance', 'Enchanted Pike', 'Celestial Halberd', 'Phoenix Lance', 'Abyssal Trident', 'Star Spear', 'Chrono Pike', 'Infinity Spear'] },
    hammers: { group: 'weapons', label: '🔨 Hammers', icon: '🔨', r: 'physical', p: 1.1, n: ['Wooden Mallet', 'Iron Hammer', 'Steel Maul', 'War Hammer', 'Celestial Crusher', 'Phoenix Hammer', 'Abyssal Maul', 'Star Hammer', 'Chrono Mace', 'Infinity Hammer'] },
    thrown: { group: 'weapons', label: '💫 Thrown', icon: '💫', r: 'agile', p: 0.8, n: ['Throwing Stones', 'Iron Shuriken', 'Steel Chakram', 'Enchanted Kunai', 'Celestial Disc', 'Phoenix Star', 'Abyssal Knife', 'Star Glaive', 'Chrono Dart', 'Infinity Shuriken'] },
    polearms: { group: 'weapons', label: '🚩 Polearms', icon: '🚩', r: 'physical', p: 0.95, n: ['Wooden Pike', 'Iron Glaive', 'Steel Halberd', 'Enchanted Glaive', 'Celestial Naginata', 'Phoenix Glaive', 'Abyssal Polearm', 'Star Halberd', 'Chrono Glaive', 'Infinity Polearm'] },
    // ===== ARMOR (10) =====
    light: { group: 'armor', label: '👘 Light', icon: '👘', r: 'magic', p: 0.95, n: ['Cloth Robe', 'Silk Robe', 'Mage Robe', 'Enchanted Vestment', 'Celestial Raiment', 'Phoenix Robe', 'Abyssal Vestment', 'Star Robe', 'Chrono Garb', 'Infinity Robe'] },
    medium: { group: 'armor', label: '🦵 Medium', icon: '🦵', r: 'agile', p: 1.0, n: ['Leather Vest', 'Studded Leather', 'Hardened Leather', 'Enchanted Hide', 'Dragonhide Vest', 'Phoenix Hide', 'Abyssal Leather', 'Star Jacket', 'Chrono Vest', 'Infinity Leather'] },
    heavy: { group: 'armor', label: '🧱 Heavy', icon: '🧱', r: 'physical', p: 1.15, n: ['Chainmail', 'Scale Mail', 'Steel Plate', 'Enchanted Plate', 'Celestial Plate', 'Phoenix Plate', 'Abyssal Plate', 'Star Armor', 'Chrono Plate', 'Infinity Plate'] },
    shields: { group: 'armor', label: '🛡️ Shields', icon: '🛡️', r: 'physical', p: 1.0, n: ['Wooden Shield', 'Iron Shield', 'Steel Shield', 'Enchanted Aegis', 'Divine Bulwark', 'Phoenix Shield', 'Abyssal Aegis', 'Star Shield', 'Chrono Guard', 'Infinity Bulwark'] },
    helmets: { group: 'armor', label: '⛑️ Helmets', icon: '⛑️', r: 'craft', p: 0.9, n: ['Leather Cap', 'Iron Helm', 'Steel Helm', 'Enchanted Crown', 'Celestial Helm', 'Phoenix Crown', 'Abyssal Helm', 'Star Tiara', 'Chrono Helm', 'Infinity Crown'] },
    gloves: { group: 'armor', label: '🧤 Gloves', icon: '🧤', r: 'agile', p: 0.85, n: ['Cloth Gloves', 'Leather Gloves', 'Steel Gauntlets', 'Enchanted Grips', 'Celestial Gloves', 'Phoenix Gauntlets', 'Abyssal Grips', 'Star Gloves', 'Chrono Gauntlets', 'Infinity Gauntlets'] },
    boots: { group: 'armor', label: '👢 Boots', icon: '👢', r: 'agile', p: 0.85, n: ['Sandals', 'Leather Boots', 'Steel Greaves', 'Enchanted Boots', 'Celestial Treads', 'Phoenix Boots', 'Abyssal Greaves', 'Star Boots', 'Chrono Treads', 'Infinity Boots'] },
    belts: { group: 'armor', label: '🥼 Belts', icon: '🥼', r: 'craft', p: 0.85, n: ['Rope Belt', 'Leather Belt', 'Steel Buckle', 'Enchanted Sash', 'Celestial Girdle', 'Phoenix Belt', 'Abyssal Sash', 'Star Belt', 'Chrono Girdle', 'Infinity Belt'] },
    capes: { group: 'armor', label: '🪂 Capes', icon: '🪂', r: 'agile', p: 0.9, n: ['Cloth Cape', 'Leather Cape', 'Ranger Mantle', 'Enchanted Cape', 'Celestial Mantle', 'Phoenix Cape', 'Abyssal Mantle', 'Star Cape', 'Chrono Cape', 'Infinity Cape'] },
    cloaks: { group: 'armor', label: '🪴 Cloaks', icon: '🪴', r: 'magic', p: 0.95, n: ['Linen Cloak', 'Silk Cloak', 'Mage Cloak', 'Shadow Shroud', 'Celestial Cloak', 'Phoenix Shroud', 'Abyssal Cloak', 'Star Shroud', 'Chrono Cloak', 'Infinity Shroud'] },
    // ===== ACCESSORIES (10) =====
    rings: { group: 'accessories', label: '💍 Rings', icon: '💍', r: 'precious', p: 1.2, n: ['Copper Band', 'Silver Ring', 'Gold Ring', 'Enchanted Signet', 'Ring of Ascension', 'Phoenix Ring', 'Abyssal Ring', 'Star Ring', 'Chrono Ring', 'Infinity Ring'] },
    necklaces: { group: 'accessories', label: '📿 Necklaces', icon: '📿', r: 'precious', p: 1.1, n: ['Leather Pendant', 'Iron Amulet', 'Crystal Necklace', 'Dragon Talisman', 'Starweave Choker', 'Phoenix Pendant', 'Abyssal Amulet', 'Star Necklace', 'Chrono Choker', 'Infinity Amulet'] },
    earrings: { group: 'accessories', label: '✨ Earrings', icon: '✨', r: 'precious', p: 1.0, n: ['Wooden Studs', 'Iron Hoops', 'Silver Earrings', 'Enchanted Drops', 'Celestial Earrings', 'Phoenix Studs', 'Abyssal Hoops', 'Star Earrings', 'Chrono Drops', 'Infinity Earrings'] },
    trinkets: { group: 'accessories', label: '🔮 Trinkets', icon: '🔮', r: 'magic', p: 1.05, n: ['Lucky Charm', 'Iron Token', 'Crystal Orb', 'Enchanted Idol', 'Celestial Relic', 'Phoenix Token', 'Abyssal Idol', 'Star Orb', 'Chrono Relic', 'Infinity Trinket'] },
    instruments: { group: 'accessories', label: '🎵 Instruments', icon: '🎵', r: 'craft', p: 1.0, n: ['Wooden Flute', 'Iron Bell', 'Silver Harp', 'Enchanted Lute', 'Celestial Horn', 'Phoenix Lyre', 'Abyssal Drum', 'Star Harp', 'Chrono Bell', 'Infinity Organ'] },
    enchantments: { group: 'accessories', label: '📜 Enchantments', icon: '📜', r: 'magic', p: 1.15, n: ['Minor Scroll', 'Iron Rune', 'Spell Tome', 'Enchanted Grimoire', 'Celestial Scroll', 'Phoenix Rune', 'Abyssal Tome', 'Star Spell', 'Chrono Grimoire', 'Infinity Scroll'] },
    potions: { group: 'accessories', label: '⚗️ Potions', icon: '⚗️', r: 'organic', p: 1.0, n: ['Minor Potion', 'Health Tonic', 'Mana Elixir', 'Strength Draught', 'Dragon Blood Vial', 'Phoenix Elixir', 'Void Tonic', 'Star Potion', 'Chrono Draught', 'Infinity Elixir'] },
    food: { group: 'accessories', label: '🍲 Food', icon: '🍲', r: 'organic', p: 0.85, n: ['Bread', 'Hearty Stew', 'Roasted Game', 'Enchanted Feast', 'Celestial Pastry', 'Phoenix Delicacy', 'Abyssal Cuisine', 'Star Confection', 'Chrono Banquet', 'Infinity Ambrosia'] },
    bracelets: { group: 'accessories', label: '💞 Bracelets', icon: '💞', r: 'precious', p: 1.0, n: ['Leather Band', 'Iron Bracelet', 'Silver Bangle', 'Enchanted Cuff', 'Celestial Bracelet', 'Phoenix Bangle', 'Abyssal Cuff', 'Star Bracelet', 'Chrono Band', 'Infinity Bracelet'] },
    familiars: { group: 'accessories', label: '🐾 Familiars', icon: '🐾', r: 'organic', p: 1.25, n: ['Imp', 'Stone Golem', 'Shadow Fox', 'Arcane Sprite', 'Celestial Familiar', 'Phoenix Companion', 'Void Entity', 'Star Wisp', 'Chrono Beast', 'Infinity Guardian'] },
};

// ===== HELPERS (declared early, used in generation below) =====
function nameToId(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''); }
// Map tier → chest essence material id
function chestEssenceFor(tier) {
    if (tier <= 2) return 'bronze_essence';
    if (tier <= 4) return 'silver_essence';
    if (tier <= 6) return 'gold_essence';
    if (tier <= 8) return 'platinum_essence';
    return 'diamond_essence';
}

// ===== GENERATE WEAPONS (220 items) =====
const WEAPONS = {};
for (const [catId, cat] of Object.entries(CAT)) {
    const recipes = R[cat.r];
    for (let t = 0; t < 10; t++) {
        const id = nameToId(cat.n[t]), nextId = t < 9 ? nameToId(cat.n[t + 1]) : null;
        WEAPONS[id] = {
            name: cat.n[t], category: catId, tier: t + 1, icon: cat.icon,
            recipe: { ...recipes[t] }, baseSellPrice: Math.floor(TIER_PRICES[t] * cat.p), nextTier: nextId
        };
    }
}

// ===== GENERATE ALTERNATES (220 items, require chest essence) =====
const ALT_ADJ = ['Sharp', 'Swift', 'Dark', 'Rune', 'Star', 'Fire', 'Void', 'Astral', 'Time', 'Apex'];
const ALTERNATE_DATA = {};
for (const [id, w] of Object.entries(WEAPONS)) {
    const altId = 'alt_' + id, altRecipe = { ...w.recipe };
    const sorted = Object.entries(altRecipe).sort((a, b) => b[1] - a[1]);
    if (sorted[0][1] > 1) altRecipe[sorted[0][0]]--;
    altRecipe[chestEssenceFor(w.tier)] = 1;
    ALTERNATE_DATA[altId] = {
        name: `★ ${ALT_ADJ[w.tier - 1]} ${w.name} `, category: w.category, tier: w.tier,
        icon: w.icon, recipe: altRecipe, baseSellPrice: Math.floor(w.baseSellPrice * 1.20),
        nextTier: w.nextTier, isAlternate: true, baseWeaponId: id
    };
}

// ===== GENERATE MASTERWORK (220 items, require chest essence) =====
const MW_ADJ = ['Grand', 'War', 'True', 'Arc', 'Holy', 'Fell', 'Deep', 'Nova', 'Fate', 'Omega'];
const MASTERWORK_DATA = {};
for (const [id, w] of Object.entries(WEAPONS)) {
    const mwId = 'mw_' + id, mwRecipe = { ...w.recipe };
    mwRecipe[chestEssenceFor(w.tier)] = 2;
    MASTERWORK_DATA[mwId] = {
        name: `✦ ${MW_ADJ[w.tier - 1]} ${w.name} `, category: w.category, tier: w.tier,
        icon: w.icon, recipe: mwRecipe, baseSellPrice: Math.floor(w.baseSellPrice * 1.35),
        nextTier: w.nextTier, isMasterwork: true, baseWeaponId: id
    };
}

// ===== GENERATE FUSION BLUEPRINTS (220 items, require chest essence) =====
const FUS_ADJ = ['Tempered', 'Reinforced', 'Runed', 'Forged', 'Empowered', 'Blazing', 'Cursed', 'Stellar', 'Timeworn', 'Eternal'];
const FUSION_DATA = {};
for (const [id, w] of Object.entries(WEAPONS)) {
    const fusId = 'fus_' + id, fusRecipe = { ...w.recipe };
    fusRecipe[chestEssenceFor(w.tier)] = 1;
    FUSION_DATA[fusId] = {
        name: `⚗️ ${FUS_ADJ[w.tier - 1]} ${w.name} `, category: w.category, tier: w.tier,
        icon: w.icon, recipe: fusRecipe, baseSellPrice: Math.floor(w.baseSellPrice * 1.30),
        nextTier: w.nextTier, isFusion: true, baseWeaponId: id
    };
}

// Fusion blueprint drop chances (quality being fused → base chance)
const FUSION_CHANCES = { common: 0.001, uncommon: 0.01, rare: 0.03, epic: 0.10 };

// ===== QUEST CONFIG =====
const QUEST_CONFIG = {
    bronze: { label: 'Bronze', icon: '🥉', tiers: [1, 2], countRange: [3, 5], timeRange: [60, 90], color: '#cd7f32' },
    silver: { label: 'Silver', icon: '🥈', tiers: [3, 4], countRange: [5, 8], timeRange: [90, 120], color: '#c0c0c0' },
    gold: { label: 'Gold', icon: '🥇', tiers: [5, 6], countRange: [8, 12], timeRange: [120, 180], color: '#ffd700' },
    platinum: { label: 'Platinum', icon: '💎', tiers: [7, 8], countRange: [10, 15], timeRange: [150, 240], color: '#e5e4e2' },
    diamond: { label: 'Diamond', icon: '💠', tiers: [9, 10], countRange: [12, 20], timeRange: [180, 300], color: '#b9f2ff' },
};
const CHEST_LOOT = {
    bronze: { matTiers: [0, 3], matRange: [5, 15], bpChance: 0.05, bpTiers: [1, 2], essence: 'bronze_essence', essenceRange: [1, 2] },
    silver: { matTiers: [0, 4], matRange: [10, 25], bpChance: 0.12, bpTiers: [3, 4], essence: 'silver_essence', essenceRange: [1, 2] },
    gold: { matTiers: [0, 6], matRange: [15, 30], bpChance: 0.20, bpTiers: [5, 6], essence: 'gold_essence', essenceRange: [1, 3] },
    platinum: { matTiers: [0, 8], matRange: [20, 40], bpChance: 0.30, bpTiers: [7, 8], essence: 'platinum_essence', essenceRange: [1, 3] },
    diamond: { matTiers: [0, 9], matRange: [25, 50], bpChance: 0.45, bpTiers: [9, 10], essence: 'diamond_essence', essenceRange: [1, 4] },
};
const MW_BLUEPRINT_COST_MULTIPLIER = 45; // tier × this
const QUEST_COOLDOWN = 30;

// ===== HELPERS =====
function getBaseWeaponId(id) { return id.startsWith('alt_') ? id.slice(4) : id.startsWith('mw_') ? id.slice(3) : id.startsWith('fus_') ? id.slice(4) : id; }
function getWeaponData(id) { return WEAPONS[id] || ALTERNATE_DATA[id] || MASTERWORK_DATA[id] || FUSION_DATA[id] || null; }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
