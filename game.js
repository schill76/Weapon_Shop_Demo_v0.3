// ============================================================
//  THE WEAPON SHOP v4 — Game Logic & Rendering
//  Requires data.js loaded first
// ============================================================

// ===== STATE =====
const state = {
    gold: 100, materials: {}, mastery: {}, weaponStash: {}, lockedItems: new Set(),
    unlocked: {}, blueprints: new Set(), masterworkBlueprints: new Set(), fusionBlueprints: new Set(),
    masterworkPoints: 0, masterworkTrades: {}, salesLog: [], activeGroup: 'weapons',
    activeCategory: 'swords', rightTab: 'shop', totalEarned: 0, totalCrafted: 0,
    quests: [null, null, null], activeChestSlot: null,
    materialUnlocks: { 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false },
};

// ===== SERIALIZE / DESERIALIZE =====
function serializeState() {
    return { ...state, blueprints: [...state.blueprints], masterworkBlueprints: [...state.masterworkBlueprints], fusionBlueprints: [...state.fusionBlueprints], lockedItems: [...state.lockedItems] };
}
function deserializeState(d) {
    Object.assign(state, d);
    state.blueprints = new Set(d.blueprints || []); state.masterworkBlueprints = new Set(d.masterworkBlueprints || []);
    state.fusionBlueprints = new Set(d.fusionBlueprints || []); state.lockedItems = new Set(d.lockedItems || []);
    if (!state.materialUnlocks) state.materialUnlocks = { 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false };
    if (!state.masterworkTrades) state.masterworkTrades = {};
    if (!state.activeGroup) state.activeGroup = 'weapons';
}

// ===== SAVE / LOAD =====
function saveGame() {
    const blob = new Blob([JSON.stringify(serializeState())], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'weapon-shop-save.json'; a.click();
    showToast('💾 Game saved!', 'unlock');
}
function loadGame() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
    inp.onchange = e => {
        const f = e.target.files[0]; if (!f) return; const r = new FileReader();
        r.onload = ev => { try { deserializeState(JSON.parse(ev.target.result)); autoSave(); render(); showToast('📂 Game loaded!', 'unlock'); } catch (e) { showToast('Invalid save file', 'sale'); } };
        r.readAsText(f);
    }; inp.click();
}
function autoSave() { try { localStorage.setItem('weaponShopSave', JSON.stringify(serializeState())); } catch (e) { } }
function autoLoad() { try { const d = localStorage.getItem('weaponShopSave'); if (d) { deserializeState(JSON.parse(d)); return true; } } catch (e) { } return false; }

// ===== INIT =====
function init() {
    if (!autoLoad()) {
        Object.keys(MATERIALS).forEach(id => { state.materials[id] = 0; });
        Object.keys(WEAPONS).forEach(id => { state.mastery[id] = 0; state.unlocked[id] = WEAPONS[id].tier === 1; });
    } else {
        // ensure chest essences exist in materials (added in v5)
        ['bronze_essence', 'silver_essence', 'gold_essence', 'platinum_essence', 'diamond_essence'].forEach(id => { if (state.materials[id] == null) state.materials[id] = 0; });
        if (!state.fusionBlueprints) state.fusionBlueprints = new Set();
    }
    for (let i = 0; i < 3; i++)if (!state.quests[i]) generateQuest(i);
    render(); setInterval(simulateCustomer, 3000); setInterval(updateQuestTimers, 1000); setInterval(autoSave, 30000);
}

// ===== MATERIALS =====
function isMaterialUnlocked(id) { const m = MATERIALS[id]; return m.requiredTier === 0 || !!state.materialUnlocks[m.requiredTier]; }
function checkMaterialUnlocks() { for (let t = 3; t <= 9; t++) { if (state.materialUnlocks[t]) continue; state.materialUnlocks[t] = Object.entries(WEAPONS).some(([id, w]) => w.tier >= t && (state.mastery[id] || 0) > 0); } }
function buyMaterial(id, qty) { const cost = MATERIALS[id].cost * qty; if (state.gold < cost) return; state.gold -= cost; state.materials[id] += qty; flashGold(); render(); }

// ===== QUALITY =====
function rollOneQuality(up) {
    const roll = Math.random() * 100;
    if (up) { if (roll < 0.2) return 'legendary'; if (roll < 2.1) return 'epic'; if (roll < 8.0) return 'rare'; if (roll < 30.0) return 'uncommon'; return 'common'; }
    if (roll < 1.0) return 'epic'; if (roll < 5.0) return 'rare'; if (roll < 20.0) return 'uncommon'; return 'common';
}
function rollQuality(weaponId) {
    const bonus = getMasteryBonus(weaponId), up = !!bonus.qualityUp;
    const q1 = rollOneQuality(up);
    if (!bonus.doubleRoll) return q1;
    const q2 = rollOneQuality(up);
    return QUALITY_ORDER.indexOf(q1) >= QUALITY_ORDER.indexOf(q2) ? q1 : q2;
}

// ===== STASH =====
function addToStash(weaponId, quality) {
    if (!state.weaponStash[weaponId]) state.weaponStash[weaponId] = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    state.weaponStash[weaponId][quality]++;
    if (['rare', 'epic', 'legendary'].includes(quality)) state.lockedItems.add(`${weaponId}_${quality}`);
}
function removeFromStash(wId, q, n = 1) { if (!state.weaponStash[wId] || state.weaponStash[wId][q] < n) return false; state.weaponStash[wId][q] -= n; return true; }
function getStashCount(wId, q) { return state.weaponStash[wId]?.[q] || 0; }
function getTotalStash() { let t = 0; for (const q of Object.values(state.weaponStash)) for (const c of Object.values(q)) t += c; return t; }

// ===== MASTERY =====
function getMasteryLevel(wId) { const wd = getWeaponData(wId); if (!wd) return 0; return Math.min(10, Math.floor((state.mastery[wId] || 0) / TIER_CONFIG[wd.tier].improvementEvery)); }
function getMasteryPriceMultiplier(wId) { const l = getMasteryLevel(wId); return l === 0 ? 1.0 : MASTERY_SCHEDULE[l].priceMultiplier; }
function getMasteryBonus(wId) { const l = getMasteryLevel(wId); return l === 0 ? {} : MASTERY_SCHEDULE[l]; }
function getSellPrice(wId, q = 'common') { const wd = getWeaponData(wId); if (!wd) return 0; return Math.floor(wd.baseSellPrice * getMasteryPriceMultiplier(wId) * QUALITIES[q].multiplier); }
function getEffectiveRecipe(wId) {
    const wd = getWeaponData(wId); if (!wd) return {};
    return { ...wd.recipe };
}
function getNextBonusInfo(wId) {
    const lv = getMasteryLevel(wId); if (lv >= 10) return null; const wd = getWeaponData(wId); if (!wd) return null;
    const th = TIER_CONFIG[wd.tier].improvementEvery; return { label: MASTERY_SCHEDULE[lv + 1].label, craftsNeeded: (lv + 1) * th - (state.mastery[wId] || 0) };
}

// ===== CRAFTING =====
function canCraft(wId) {
    const wd = getWeaponData(wId); if (!wd) return false;
    if (wd.isAlternate) { if (!state.blueprints.has(wId)) return false; }
    else if (wd.isMasterwork) { if (!state.masterworkBlueprints.has(wId)) return false; }
    else if (wd.isFusion) { if (!state.fusionBlueprints.has(wId)) return false; }
    else { if (!state.unlocked[wId]) return false; }
    const recipe = getEffectiveRecipe(wId); for (const [m, q] of Object.entries(recipe)) if ((state.materials[m] || 0) < q) return false; return true;
}
function canCraftN(wId, n) {
    const wd = getWeaponData(wId); if (!wd) return false;
    if (wd.isAlternate) { if (!state.blueprints.has(wId)) return false; }
    else if (wd.isMasterwork) { if (!state.masterworkBlueprints.has(wId)) return false; }
    else if (wd.isFusion) { if (!state.fusionBlueprints.has(wId)) return false; }
    else { if (!state.unlocked[wId]) return false; }
    const recipe = getEffectiveRecipe(wId);
    for (const [m, q] of Object.entries(recipe)) if ((state.materials[m] || 0) < q * n) return false;
    return true;
}
function maxCraftable(wId) {
    const recipe = getEffectiveRecipe(wId); if (!Object.keys(recipe).length) return 0;
    let n = Infinity;
    for (const [m, q] of Object.entries(recipe)) { if (q > 0) n = Math.min(n, Math.floor((state.materials[m] || 0) / q)); }
    return n === Infinity ? 0 : n;
}
function craftWeapon(wId) { craftWeaponN(wId, 1); }
function craftWeaponN(wId, n) {
    if (!canCraft(wId)) return;
    const wd = getWeaponData(wId), baseId = getBaseWeaponId(wId);
    const actual = Math.min(n, maxCraftable(wId)); if (actual < 1) return;
    let lastQuality = 'common';
    for (let i = 0; i < actual; i++) {
        const recipe = getEffectiveRecipe(wId); // re-compute each time (mastery may change)
        const bonus = getMasteryBonus(wId);
        const isFree = bonus.freeChance && Math.random() < bonus.freeChance;
        if (!isFree) { for (const [m, q] of Object.entries(recipe)) state.materials[m] -= q; }
        else showToast(`✨ Free craft! (${wd.name})`, 'unlock');
        if (!state.mastery[wId]) state.mastery[wId] = 0; state.mastery[wId]++; state.totalCrafted++;
        checkMaterialUnlocks();
        const quality = rollQuality(wId); addToStash(wId, quality); lastQuality = quality;
        const q2 = QUALITIES[quality];
        if (quality !== 'common') showToast(`✨ ${q2.name} ${wd.name}!`, 'craft');
        // Double craft bonus
        if (bonus.doubleChance && Math.random() < bonus.doubleChance) {
            addToStash(wId, quality);
            showToast(`⚒️ Double craft! (${wd.name})`, 'craft');
        }
        const tc = TIER_CONFIG[wd.tier], lv = getMasteryLevel(wId);
        if (state.mastery[wId] % tc.improvementEvery === 0 && lv <= 10) {
            if (lv === 10) showToast(`✦ ${wd.name} MASTER FORGED!`, 'unlock');
            else if (lv > 0) showToast(`⭐ ${wd.name} Lv.${lv}!`, 'craft');
        }
        checkUnlocks(baseId); updateQuestProgress(baseId);
    }
    if (actual > 1) showToast(`⚒️ Forged ${actual}× ${wd.name}`, 'craft');
    const card = document.querySelector(`[data-weapon="${wId}"]`); if (card) { card.classList.add('craft-flash'); setTimeout(() => card.classList.remove('craft-flash'), 300); }
    render();
}
function checkUnlocks(baseId) {
    const w = WEAPONS[baseId]; if (!w || !w.nextTier) return; const cfg = TIER_CONFIG[w.tier]; if (!cfg.unlockNext) return;
    if ((state.mastery[baseId] || 0) >= cfg.unlockNext && !state.unlocked[w.nextTier]) { state.unlocked[w.nextTier] = true; addSalesLog(`🔓 ${WEAPONS[w.nextTier].name} unlocked!`, 'unlock'); showToast(`🔓 ${WEAPONS[w.nextTier].name} unlocked!`, 'unlock'); }
}

// ===== FUSION =====
function fuseWeapon(wId, quality) {
    const q = QUALITIES[quality]; if (!q.fusionResult || getStashCount(wId, quality) < 3) return;
    removeFromStash(wId, quality, 3); addToStash(wId, q.fusionResult);
    const wd = getWeaponData(wId), baseId = getBaseWeaponId(wId);
    showToast(`🔀 3 ${q.name}→1 ${QUALITIES[q.fusionResult].name} ${wd.name}!`, 'craft');
    // Roll for fusion blueprint unlock
    const fusId = 'fus_' + baseId;
    if (!state.fusionBlueprints.has(fusId)) {
        let chance = (FUSION_CHANCES[quality] || 0);
        if (state.masterworkBlueprints.has('mw_' + baseId)) chance *= 1.5;
        if (state.blueprints.has('alt_' + baseId)) chance *= 2.5;
        if (Math.random() < chance) {
            state.fusionBlueprints.add(fusId); state.mastery[fusId] = 0;
            addSalesLog(`⚗️ ${FUSION_DATA[fusId].name} blueprint!`, 'unlock');
            showToast(`⚗️ Fusion Blueprint: ${FUSION_DATA[fusId].name}!`, 'unlock');
        }
    }
    render();
}

// ===== MASTERWORK HALL =====
function canTradeItem(wId, q) { if (getMasteryLevel(wId) < 10) return false; if (state.masterworkTrades[wId]?.[q]) return false; return getStashCount(wId, q) >= 1; }
function tradeMasterworkItem(wId, quality) {
    if (!canTradeItem(wId, quality)) return; removeFromStash(wId, quality);
    if (!state.masterworkTrades[wId]) state.masterworkTrades[wId] = {}; state.masterworkTrades[wId][quality] = true;
    const baseId = getBaseWeaponId(wId), tier = (WEAPONS[baseId] || getWeaponData(wId)).tier;
    state.masterworkPoints += tier * QUALITIES[quality].scale; showToast(`✦ +${tier * QUALITIES[quality].scale} MW pts!`, 'unlock'); render();
}
function buyMasterworkBlueprint(baseId) {
    const mwId = 'mw_' + baseId; if (state.masterworkBlueprints.has(mwId)) return;
    const cost = WEAPONS[baseId].tier * MW_BLUEPRINT_COST_MULTIPLIER; if (state.masterworkPoints < cost) return;
    state.masterworkPoints -= cost; state.masterworkBlueprints.add(mwId); state.mastery[mwId] = 0;
    addSalesLog(`✦ ${MASTERWORK_DATA[mwId].name}!`, 'unlock'); showToast(`✦ ${MASTERWORK_DATA[mwId].name} unlocked!`, 'unlock'); render();
}

// ===== CUSTOMERS =====
function simulateCustomer() {
    const avail = []; for (const [wId, qs] of Object.entries(state.weaponStash)) for (const [q, c] of Object.entries(qs)) if (c > 0 && !state.lockedItems.has(`${wId}_${q}`)) avail.push({ weaponId: wId, quality: q });
    if (!avail.length) return; const pick = avail[Math.floor(Math.random() * avail.length)]; sellFromStash(pick.weaponId, pick.quality);
    const speed = avail.filter(i => hasSpeedBonus(i.weaponId) && getStashCount(i.weaponId, i.quality) > 0 && !state.lockedItems.has(`${i.weaponId}_${i.quality}`));
    if (speed.length > 0 && Math.random() < 0.30) { const s = speed[Math.floor(Math.random() * speed.length)]; sellFromStash(s.weaponId, s.quality); } render();
}
function sellFromStash(wId, q) { if (!removeFromStash(wId, q)) return; const p = getSellPrice(wId, q), wd = getWeaponData(wId); state.gold += p; state.totalEarned += p; addSalesLog(`💰 ${QUALITIES[q].name} ${wd.name} ${p}g`, 'sale'); showToast(`💰 ${p}g — ${QUALITIES[q].name} ${wd.name}`, 'sale'); flashGold(); }

// ===== QUESTS (auto-accept) =====
function generateQuest(i) {
    const tiers = ['bronze']; const hasT3 = Object.entries(WEAPONS).some(([id, w]) => w.tier >= 3 && state.unlocked[id]);
    const hasT5 = Object.entries(WEAPONS).some(([id, w]) => w.tier >= 5 && state.unlocked[id]);
    const hasT7 = Object.entries(WEAPONS).some(([id, w]) => w.tier >= 7 && state.unlocked[id]);
    const hasT9 = Object.entries(WEAPONS).some(([id, w]) => w.tier >= 9 && state.unlocked[id]);
    if (hasT3) tiers.push('silver'); if (hasT5) tiers.push('gold'); if (hasT7) tiers.push('platinum'); if (hasT9) tiers.push('diamond');
    // Fixed weights per number of available tiers — Bronze always most common
    const WEIGHTS = {
        1: [100],
        2: [70, 30],
        3: [55, 25, 20],
        4: [40, 25, 20, 15],
        5: [30, 25, 20, 15, 10],
    };
    const weights = WEIGHTS[tiers.length];
    let r = Math.random() * 100, tier = tiers[tiers.length - 1];
    let cum = 0; for (let k = 0; k < tiers.length; k++) { cum += weights[k]; if (r < cum) { tier = tiers[k]; break; } }
    const cfg = QUEST_CONFIG[tier];
    let eligible = Object.entries(WEAPONS).filter(([id, w]) => cfg.tiers.includes(w.tier) && state.unlocked[id]);
    if (!eligible.length) { eligible = Object.entries(WEAPONS).filter(([id, w]) => [1, 2].includes(w.tier) && state.unlocked[id]); tier = 'bronze'; }
    if (!eligible.length) { state.quests[i] = null; return; }
    const [wId] = eligible[Math.floor(Math.random() * eligible.length)]; const c = QUEST_CONFIG[tier];
    state.quests[i] = {
        targetWeaponId: wId, targetCount: randInt(c.countRange[0], c.countRange[1]),
        timeLimit: randInt(c.timeRange[0], c.timeRange[1]), chestTier: tier,
        status: 'active', progress: 0, acceptedAt: Date.now(), failedAt: null, rewards: null
    };
}
function updateQuestProgress(baseId) { state.quests.forEach((q, i) => { if (!q || q.status !== 'active') return; if (q.targetWeaponId === baseId) { q.progress++; if (q.progress >= q.targetCount) completeQuest(i); } }); }
function completeQuest(i) { const q = state.quests[i]; if (!q) return; q.status = 'completed'; q.rewards = generateLoot(q.chestTier); showToast(`📦 Quest complete!`, 'unlock'); render(); }
function failQuest(i) { const q = state.quests[i]; if (!q) return; q.status = 'failed'; q.failedAt = Date.now(); showToast(`❌ Quest failed!`, 'sale'); render(); }
function updateQuestTimers() {
    const now = Date.now(); let nr = false;
    state.quests.forEach((q, i) => {
        if (!q) { generateQuest(i); nr = true; return; }
        if (q.status === 'active') { if ((now - q.acceptedAt) / 1000 >= q.timeLimit) { failQuest(i); nr = true; } else nr = true; }
        if (q.status === 'failed' && (now - q.failedAt) / 1000 >= QUEST_COOLDOWN) { generateQuest(i); nr = true; }
    }); if (nr) renderQuests();
}

// ===== CHESTS =====
function generateLoot(tier) {
    const cfg = CHEST_LOOT[tier], rewards = [], rolls = randInt(2, 4);
    const mats = Object.entries(MATERIALS).filter(([id, m]) => !m.chestOnly && m.requiredTier <= cfg.matTiers[1]);
    // Only add the essence to the pool if the player owns a blueprint that needs it
    const essenceNeeded = [...state.blueprints, ...state.masterworkBlueprints, ...state.fusionBlueprints]
        .some(bpId => { const d = getWeaponData(bpId); return d && chestEssenceFor(d.tier) === cfg.essence; });
    if (essenceNeeded) mats.push([cfg.essence, MATERIALS[cfg.essence]]);
    for (let i = 0; i < rolls; i++) { const [id, m] = mats[Math.floor(Math.random() * mats.length)]; rewards.push({ type: 'material', materialId: id, amount: randInt(cfg.matRange[0], cfg.matRange[1]), name: m.name, icon: m.icon }); }
    if (Math.random() < cfg.bpChance) { const bp = rollBlueprint(cfg.bpTiers); if (bp) rewards.push({ type: 'blueprint', blueprintId: bp, name: ALTERNATE_DATA[bp].name, icon: '📜' }); }
    return rewards;
}
function rollBlueprint(tiers) { const u = Object.entries(ALTERNATE_DATA).filter(([id, a]) => tiers.includes(a.tier) && !state.blueprints.has(id)); return u.length ? u[Math.floor(Math.random() * u.length)][0] : null; }
function openChest(i) { const q = state.quests[i]; if (!q || q.status !== 'completed' || !q.rewards) return; state.activeChestSlot = i; renderChestModal(); }
function closeChestModal() {
    const i = state.activeChestSlot; if (i == null) return; const q = state.quests[i];
    if (!q) { state.activeChestSlot = null; render(); return; }
    q.rewards.forEach(r => { if (r.type === 'material') state.materials[r.materialId] += r.amount; else if (r.type === 'blueprint') { state.blueprints.add(r.blueprintId); state.mastery[r.blueprintId] = 0; addSalesLog(`📜 ${r.name}`, 'unlock'); } });
    state.quests[i] = null; state.activeChestSlot = null; render();
}

// ===== UTILITY =====
function setGroup(g) { state.activeGroup = g; const first = Object.entries(CAT).find(([, c]) => c.group === g); if (first) state.activeCategory = first[0]; render(); }
function setCategory(c) { state.activeCategory = c; render(); }
function setRightTab(t) { state.rightTab = t; render(); }
function toggleLock(wId, q) { const k = `${wId}_${q}`; state.lockedItems.has(k) ? state.lockedItems.delete(k) : state.lockedItems.add(k); render(); }
function addSalesLog(msg, type) { state.salesLog.unshift({ message: msg, type }); if (state.salesLog.length > 25) state.salesLog.pop(); }
function flashGold() { const el = document.getElementById('gold-display'); if (!el) return; el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 300); }
function showToast(msg, type) { const c = document.getElementById('toast-container'); if (!c) return; const t = document.createElement('div'); t.className = `toast ${type}`; t.textContent = msg; c.appendChild(t); setTimeout(() => { if (t.parentNode) t.remove(); }, 3000); }

// ===== RENDERING =====
function render() { renderGold(); renderStats(); renderMaterialShop(); renderInventory(); renderCategoryTabs(); renderCraftingArea(); renderRightPanel(); renderSalesLog(); renderQuests(); renderChestModal(); }
function renderGold() { const el = document.getElementById('gold-amount'); if (el) el.textContent = state.gold.toLocaleString(); }
function renderStats() {
    const c = document.getElementById('total-crafted'), e = document.getElementById('total-earned'), b = document.getElementById('blueprint-count'), m = document.getElementById('mw-points');
    if (c) c.textContent = state.totalCrafted; if (e) e.textContent = state.totalEarned.toLocaleString();
    if (b) b.textContent = `${state.blueprints.size + state.masterworkBlueprints.size + state.fusionBlueprints.size}/${Object.keys(ALTERNATE_DATA).length + Object.keys(MASTERWORK_DATA).length + Object.keys(FUSION_DATA).length}`;
    if (m) m.textContent = state.masterworkPoints;
}
function renderMaterialShop() {
    const c = document.getElementById('material-shop'); if (!c) return;
    c.innerHTML = Object.entries(MATERIALS).filter(([id, m]) => isMaterialUnlocked(id) && !m.chestOnly).map(([id, m]) => {
        const c1 = state.gold >= m.cost, c5 = state.gold >= m.cost * 5, c10 = state.gold >= m.cost * 10;
        return `<div class="material-row"><div class="material-info"><div class="material-name">${m.icon} ${m.name}</div><div class="material-cost">${m.cost}g</div></div><div class="buy-buttons"><button class="btn-buy" onclick="buyMaterial('${id}',1)" ${c1 ? '' : 'disabled'}>×1</button><button class="btn-buy" onclick="buyMaterial('${id}',5)" ${c5 ? '' : 'disabled'}>×5</button><button class="btn-buy" onclick="buyMaterial('${id}',10)" ${c10 ? '' : 'disabled'}>×10</button></div></div>`;
    }).join('');
}
function renderInventory() {
    const c = document.getElementById('inventory'); if (!c) return;
    c.innerHTML = '<div class="inventory-grid">' + Object.entries(MATERIALS).filter(([id, m]) => {
        if (!isMaterialUnlocked(id)) return false;
        if (m.chestOnly && (state.materials[id] || 0) === 0) return false;
        return true;
    }).map(([id, m]) => {
        const n = state.materials[id] || 0; return `<div class="inventory-item ${n === 0 ? 'empty' : ''}">${m.icon} ${m.name}<span class="count">${n}</span></div>`;
    }).join('') + '</div>';
}
function renderCategoryTabs() {
    document.querySelectorAll('.group-tab').forEach(t => t.classList.toggle('active', t.dataset.group === state.activeGroup));
    const c = document.getElementById('category-tabs'); if (!c) return;
    c.innerHTML = Object.entries(CAT).filter(([, cat]) => cat.group === state.activeGroup)
        .map(([id, cat]) => `<button class="tab ${state.activeCategory === id ? 'active' : ''}" data-category="${id}" onclick="setCategory('${id}')">${cat.label}</button>`).join('');
}
function renderCraftingArea() {
    const c = document.getElementById('crafting-area'); if (!c) return; const items = [];
    Object.entries(WEAPONS).forEach(([id, w]) => {
        if (w.category !== state.activeCategory) return;
        items.push({ id, data: w, isAlt: false, isMW: false, isFus: false });
        const aId = 'alt_' + id; if (state.blueprints.has(aId)) items.push({ id: aId, data: ALTERNATE_DATA[aId], isAlt: true, isMW: false, isFus: false });
        const mId = 'mw_' + id; if (state.masterworkBlueprints.has(mId)) items.push({ id: mId, data: MASTERWORK_DATA[mId], isAlt: false, isMW: true, isFus: false });
        const fId = 'fus_' + id; if (state.fusionBlueprints.has(fId)) items.push({ id: fId, data: FUSION_DATA[fId], isAlt: false, isMW: false, isFus: true });
    });
    items.sort((a, b) => a.data.tier - b.data.tier || (a.isAlt || a.isMW || a.isFus ? 1 : 0) - (b.isAlt || b.isMW || b.isFus ? 1 : 0));
    c.innerHTML = items.map(({ id, data: w, isAlt, isMW, isFus }) => {
        const baseId = getBaseWeaponId(id);
        const isUn = isAlt ? state.blueprints.has(id) : isMW ? state.masterworkBlueprints.has(id) : isFus ? state.fusionBlueprints.has(id) : state.unlocked[id];
        const craft = canCraft(id), mst = state.mastery[id] || 0, mLvl = getMasteryLevel(id), sp = getSellPrice(id, 'common');
        const recipe = getEffectiveRecipe(id), tc = TIER_CONFIG[w.tier], isMF = mLvl >= 10;
        const th = tc.improvementEvery, prog = isMF ? th : (mst % th), pct = (prog / th) * 100;
        const rHtml = Object.entries(recipe).map(([mId, qty]) => {
            const h = state.materials[mId] || 0; const ok = h >= qty; const m = MATERIALS[mId];
            return `<span class="recipe-item ${ok ? 'has-enough' : 'not-enough'}">${m.icon}${qty} ${m.name}(${h})</span>`;
        }).join('');
        let unlockHtml = '';
        if (!isAlt && !isMW && !isFus && w.nextTier && isUn) { const ut = tc.unlockNext; if (ut) { const bm = state.mastery[id] || 0; if (!state.unlocked[w.nextTier]) { const rem = ut - bm; unlockHtml = `<div class="unlock-info">🔒 <span class="unlock-highlight">${rem}</span> to unlock ${WEAPONS[w.nextTier].name}</div>`; } else unlockHtml = `<div class="unlock-info" style="color:var(--emerald)">✅ ${WEAPONS[w.nextTier].name} unlocked</div>`; } }
        let nextHtml = ''; if (isUn && mLvl < 10) { const info = getNextBonusInfo(id); if (info) nextHtml = `<div class="mastery-next">Next: ${info.label} (${info.craftsNeeded} crafts)</div>`; }
        let forgeHtml;
        if (!isUn) { const p = Object.entries(WEAPONS).find(([, x]) => x.nextTier === id); forgeHtml = `<button class="btn-craft locked-btn" disabled>🔒 ${p ? 'Craft more ' + WEAPONS[p[0]].name : 'Locked'}</button>`; }
        else {
            const mx = maxCraftable(id);
            const mk = (n, label) => `<button class="btn-craft-n ${mx >= n ? 'can-craft' : 'cannot-craft'}" onclick="${mx >= n ? `craftWeaponN('${id}',${n})` : 'void(0)'}" ${mx >= n ? '' : 'disabled'} title="Need ${n}× materials">${label}</button>`;
            const mxLabel = mx > 0 ? `×MAX(${mx})` : '×MAX';
            forgeHtml = `<div class="forge-btn-row">${mk(1, '⚒️ ×1')}${mk(5, '×5')}${mk(10, '×10')}<button class="btn-craft-n ${mx > 0 ? 'can-craft' : 'cannot-craft'}" onclick="${mx > 0 ? `craftWeaponN('${id}',${mx})` : 'void(0)'}" ${mx > 0 ? '' : 'disabled'}>${mxLabel}</button></div>`;
        }
        const bonusTxt = mLvl > 0 ? ` <span class="bonus">(+${Math.round((getMasteryPriceMultiplier(id) - 1) * 100)}%)</span>` : '';
        const masterTag = isMF ? '<span class="master-tag">✦ MASTER</span>' : '';
        const varTag = isAlt ? '<span class="alt-tag">★ ALT</span>' : isMW ? '<span class="mw-tag">✦ MW</span>' : isFus ? '<span class="fus-tag">⚗️ FUSION</span>' : '';
        const qualNote = mLvl >= 6 ? '<span class="quality-note">🎲+</span>' : '';
        return `<div class="weapon-card tier-${w.tier} ${isUn ? '' : 'locked'} ${isAlt ? 'alt-card' : ''} ${isMW ? 'mw-card' : ''} ${isFus ? 'fus-card' : ''} ${isMF ? 'master-forged' : ''}" data-weapon="${id}">
            <div class="weapon-card-header"><div class="weapon-name">${w.icon} ${w.name} <span class="tier-badge">T${w.tier}</span>${masterTag}${varTag}${qualNote}</div>
            <div class="weapon-sell-price">${sp}g${bonusTxt}</div></div>
            ${isUn ? `<div class="weapon-recipe">${rHtml}</div>
            <div class="mastery-section"><div class="mastery-header"><span class="mastery-label">${mst} crafted</span><span class="mastery-level">Lv.${mLvl}/10</span></div>
            <div class="mastery-bar-outer"><div class="mastery-bar-inner ${isMF ? 'max' : ''}" style="width:${isMF ? 100 : pct}%"></div></div>${nextHtml}${unlockHtml}</div>` : ''}
            ${forgeHtml}</div>`;
    }).join('');
}
function renderRightPanel() {
    document.querySelectorAll('.right-tab').forEach(t => t.classList.toggle('active', t.dataset.rtab === state.rightTab));
    const c = document.getElementById('right-content'); if (!c) return;
    document.getElementById('shop-count').textContent = `${getTotalStash()} items`;
    if (state.rightTab === 'shop') renderWeaponStash(c); else if (state.rightTab === 'fusion') renderFusion(c); else renderMasterworkHall(c);
}
function renderWeaponStash(c) {
    const entries = Object.entries(state.weaponStash).filter(([, q]) => Object.values(q).some(n => n > 0))
        .sort((a, b) => { const wa = getWeaponData(a[0]), wb = getWeaponData(b[0]); return (wa?.tier || 0) - (wb?.tier || 0); });
    if (!entries.length) { c.innerHTML = '<div class="shop-empty">No weapons in stock.</div>'; return; }
    c.innerHTML = entries.map(([wId, qualities]) => {
        const wd = getWeaponData(wId); if (!wd) return '';
        const pills = QUALITY_ORDER.filter(q => qualities[q] > 0).map(q => {
            const lk = state.lockedItems.has(`${wId}_${q}`);
            return `<span class="quality-pill q-${q} ${lk ? 'locked' : ''}" onclick="toggleLock('${wId}','${q}')" title="${QUALITIES[q].name}${lk ? ' 🔒' : ''}">${qualities[q]}${lk ? '🔒' : ''}</span>`;
        }).join('');
        return `<div class="stash-row"><div class="stash-weapon">${wd.icon} <span class="stash-name">${wd.name}</span></div><div class="quality-pills">${pills}</div></div>`;
    }).join('');
}
function renderFusion(c) {
    const fusible = [], near = [];
    for (const [wId, qs] of Object.entries(state.weaponStash)) for (const [q, count] of Object.entries(qs)) {
        if (count >= 3 && QUALITIES[q].fusionResult) fusible.push({ wId, q, count }); else if (count > 0 && count < 3 && QUALITIES[q].fusionResult) near.push({ wId, q, count });
    }
    if (!fusible.length && !near.length) { c.innerHTML = '<div class="shop-empty">Collect 3 of same quality to fuse.</div>'; return; }
    let h = '';
    if (fusible.length) {
        h += '<div class="section-title">Ready to Fuse</div>';
        h += fusible.map(({ wId, q, count }) => {
            const wd = getWeaponData(wId), qd = QUALITIES[q], nq = QUALITIES[qd.fusionResult];
            return `<div class="fusion-row"><div class="fusion-item"><span style="color:${qd.color}">${qd.name}</span> ${wd.name} ×${count}</div><button class="btn-fuse" onclick="fuseWeapon('${wId}','${q}')">3→1 <span style="color:${nq.color}">${nq.name}</span></button></div>`;
        }).join('');
    }
    if (near.length) {
        h += '<div class="section-title faded">Needs More</div>';
        h += near.map(({ wId, q, count }) => {
            const wd = getWeaponData(wId), qd = QUALITIES[q];
            return `<div class="fusion-row not-fusible"><span style="color:${qd.color}">${qd.name}</span> ${wd.name} — ${count}/3</div>`;
        }).join('');
    }
    c.innerHTML = h;
}
function renderMasterworkHall(c) {
    let h = `<div class="mw-points-header">✦ <strong>${state.masterworkPoints}</strong> Masterwork Points</div>`;
    const allM = [];
    Object.entries(WEAPONS).forEach(([id, w]) => { if (getMasteryLevel(id) >= 10) allM.push({ id, data: w }); });
    state.blueprints.forEach(aId => { if (getMasteryLevel(aId) >= 10 && ALTERNATE_DATA[aId]) allM.push({ id: aId, data: ALTERNATE_DATA[aId] }); });
    state.masterworkBlueprints.forEach(mId => { if (getMasteryLevel(mId) >= 10 && MASTERWORK_DATA[mId]) allM.push({ id: mId, data: MASTERWORK_DATA[mId] }); });
    state.fusionBlueprints.forEach(fId => { if (getMasteryLevel(fId) >= 10 && FUSION_DATA[fId]) allM.push({ id: fId, data: FUSION_DATA[fId] }); });
    allM.sort((a, b) => a.data.tier - b.data.tier);
    h += '<div class="section-title">Trade Items</div>';
    if (allM.length) {
        h += allM.map(({ id: wId, data: w }) => {
            const baseId = getBaseWeaponId(wId), tier = (WEAPONS[baseId] || w).tier, trades = state.masterworkTrades[wId] || {};
            const btns = QUALITY_ORDER.map(q => {
                const traded = !!trades[q], has = getStashCount(wId, q) >= 1, pts = tier * QUALITIES[q].scale;
                if (traded) return `<span class="mw-qcheck" style="color:${QUALITIES[q].color}">✓</span>`;
                return `<button class="btn-mw-trade-item" style="color:${QUALITIES[q].color};border-color:${QUALITIES[q].color}40" onclick="tradeMasterworkItem('${wId}','${q}')" ${has ? '' : 'disabled'} title="+${pts}pts">${QUALITIES[q].name[0]}</button>`;
            }).join('');
            return `<div class="mw-trade-row"><div class="mw-trade-name">${w.icon} ${w.name}</div><div class="mw-quality-btns">${btns}</div></div>`;
        }).join('');
    }
    else h += '<div class="shop-empty">Master a weapon (Lv.10) first</div>';
    h += '<div class="section-title">Buy Blueprints</div>';
    const ub = Object.entries(MASTERWORK_DATA).filter(([mwId]) => !state.masterworkBlueprints.has(mwId)).sort((a, b) => a[1].tier - b[1].tier);
    if (ub.length) {
        h += ub.map(([mwId, mw]) => {
            const cost = WEAPONS[mw.baseWeaponId].tier * MW_BLUEPRINT_COST_MULTIPLIER, ok = state.masterworkPoints >= cost;
            return `<div class="mw-bp-row"><span class="mw-bp-name">${mw.name}</span><span class="mw-bp-tier">T${mw.tier}</span><button class="btn-mw" onclick="buyMasterworkBlueprint('${mw.baseWeaponId}')" ${ok ? '' : 'disabled'}>${cost}pts</button></div>`;
        }).join('');
    }
    else h += '<div class="shop-empty">All owned!</div>'; c.innerHTML = h;
}
function renderSalesLog() {
    const c = document.getElementById('sales-log'); if (!c) return;
    if (!state.salesLog.length) { c.innerHTML = '<p class="log-empty">No sales yet...</p>'; return; }
    c.innerHTML = state.salesLog.map(e => `<div class="log-entry ${e.type === 'unlock' ? 'unlock-log' : ''}">${e.message}</div>`).join('');
}
function renderQuests() {
    const c = document.getElementById('quest-slots'); if (!c) return;
    c.innerHTML = state.quests.map((q, i) => {
        if (!q) return '<div class="quest-card quest-empty"><div class="quest-label">Generating...</div></div>';
        const w = WEAPONS[q.targetWeaponId], cfg = QUEST_CONFIG[q.chestTier], pp = Math.min(100, (q.progress / q.targetCount) * 100);
        const bp = getBpProgress(q.chestTier), bpDone = bp.owned === bp.total;
        const bpTag = `<span class="quest-bp-tag ${bpDone ? 'bp-done' : ''}">📜 ${bp.owned}/${bp.total}</span>`;
        if (q.status === 'active') {
            const el = (Date.now() - q.acceptedAt) / 1000, rem = Math.max(0, Math.ceil(q.timeLimit - el)), tp = Math.max(0, (rem / q.timeLimit) * 100);
            const catLabel = CAT[w.category]?.label || w.category;
            return `<div class="quest-card quest-active" style="--quest-color:${cfg.color}"><div class="quest-tier">${cfg.icon} ${cfg.label} ${bpTag}</div><div class="quest-desc">Forge ${q.targetCount}× ${w.name}</div><div class="quest-cat">${catLabel}</div><div class="quest-progress-row"><div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pp}%"></div></div><span>${q.progress}/${q.targetCount}</span></div><div class="quest-timer ${rem <= 15 ? 'urgent' : ''}"><div class="quest-timer-bar"><div class="quest-timer-fill" style="width:${tp}%"></div></div><span>${rem}s</span></div></div>`;
        }
        if (q.status === 'completed') return `<div class="quest-card quest-completed" style="--quest-color:${cfg.color}"><div class="quest-tier">${cfg.icon} ${cfg.label} ${bpTag}</div><div class="quest-desc">✅ Complete!</div><button class="btn-quest-open" onclick="openChest(${i})">Open Chest ${cfg.icon}</button></div>`;
        if (q.status === 'failed') { const cl = Math.max(0, Math.ceil(QUEST_COOLDOWN - (Date.now() - q.failedAt) / 1000)); return `<div class="quest-card quest-failed"><div class="quest-tier">❌ Failed ${bpTag}</div><div class="quest-desc">New in ${cl}s</div></div>`; }
        return '';
    }).join('');
}
function getBpProgress(chestTier) {
    const [min, max] = CHEST_LOOT[chestTier].bpTiers;
    const all = Object.keys(ALTERNATE_DATA).filter(id => { const t = ALTERNATE_DATA[id].tier; return t >= min && t <= max; });
    return { owned: all.filter(id => state.blueprints.has(id)).length, total: all.length };
}
function renderChestModal() {
    const modal = document.getElementById('chest-modal'); if (!modal) return; const i = state.activeChestSlot;
    if (i == null) { modal.style.display = 'none'; return; } const q = state.quests[i]; if (!q || !q.rewards) { modal.style.display = 'none'; return; }
    const cfg = QUEST_CONFIG[q.chestTier]; modal.style.display = 'flex';
    document.getElementById('chest-title').textContent = `${cfg.icon} ${cfg.label} Chest`;
    document.getElementById('chest-rewards').innerHTML = q.rewards.map(r => r.type === 'material' ? `<div class="chest-reward-item">${r.icon} <strong>+${r.amount}</strong> ${r.name}</div>` : `<div class="chest-reward-item blueprint-reward">📜 <strong>${r.name}</strong></div>`).join('');
}

document.addEventListener('DOMContentLoaded', init);
