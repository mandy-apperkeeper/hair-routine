/**
 * Verify RecommendationEngine logic (Task 8 checkpoint)
 */
'use strict';

// Mock dependencies
var mockState = null;
var STORAGE_KEY = 'test';

var StateManager = {
    getState: function() { return mockState; },
    saveState: function(s) { mockState = s; },
    isStorageAvailable: function() { return true; }
};

function daysSince(dateString) {
    if (!dateString) return null;
    var past = new Date(dateString);
    var now = new Date();
    var pastDay = new Date(past.getFullYear(), past.getMonth(), past.getDate());
    var nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var diffMs = nowDay.getTime() - pastDay.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

// Minimal inventory
var TEST_INVENTORY = [
    { id: 'garnier-color-repair-cond', name: 'Color Repair Conditioner', brand: 'Garnier Fructis',
      usingUp: false, intelligence: { mechanisms: ['cuticle_smoothing', 'conditioning'], step: 'conditioner', outcomes: { shine: 0.8, smoothness: 0.9 }, interactions: [] } },
    { id: 'loreal-21in1', name: '21-in-1 Leave-In Spray', brand: "L'Oreal EverPure",
      usingUp: false, intelligence: { mechanisms: ['cuticle_smoothing', 'penetrating_oil'], step: 'leave_in', outcomes: { shine: 0.9, smoothness: 0.8 }, interactions: [] } },
    { id: 'got2b-ultra-glued', name: 'Glued Blasting Freeze Spray/Gel', brand: 'Got2b',
      usingUp: false, intelligence: { mechanisms: ['humidity_barrier'], step: 'styling', outcomes: { definition: 0.8, frizz_control: 0.95 }, interactions: [] } },
    { id: 'nym-curl-talk-gel', name: 'Curl Talk Flash Freeze Gel', brand: "Not Your Mother's",
      usingUp: false, intelligence: { mechanisms: ['humidity_barrier'], step: 'styling', outcomes: { definition: 0.9, frizz_control: 0.9 }, interactions: [], ingredients: ['polyquaternium-69', 'glycerin', 'pvp'] } },
    { id: 'everpure-clarifying', name: 'Clarifying Shampoo', brand: "L'Oreal EverPure",
      usingUp: false, intelligence: { mechanisms: ['clarifying'], step: 'shampoo', outcomes: { cleanliness: 1.0 }, interactions: [] } },
    { id: 'marc-anthony-shield', name: 'Grow Long Anti-Frizz Shield', brand: 'Marc Anthony',
      usingUp: false, intelligence: { mechanisms: ['heat_protection', 'cuticle_smoothing'], step: 'heat_protection', outcomes: { smoothness: 0.8, frizz_control: 0.7 }, interactions: [] } },
];

// Extract RecommendationEngine from index.html
var fs = require('fs');
var html = fs.readFileSync('index.html', 'utf8');

// Find the RecommendationEngine IIFE
var startMarker = '// ===== RecommendationEngine (Active Intelligence) =====';
var endMarker = '// ===== WalkthroughEngine =====';
var startIdx = html.indexOf(startMarker);
var endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.log('FAIL: Could not find RecommendationEngine boundaries');
    process.exit(1);
}

var moduleCode = html.substring(startIdx, endIdx);

// Eval the module in our context
var RecommendationEngine;
eval(moduleCode);

// ===== TESTS =====
var passed = 0, failed = 0;
function assert(c, m) { if(c){passed++;console.log('PASS:',m);}else{failed++;console.log('FAIL:',m);} }

// --- Test 1: Domain rules with no events ---
console.log('\n--- Test 1: Domain rules (Tier 1) ---');
mockState = {
    inventory: TEST_INVENTORY,
    events: [],
    sealState: { active: false, washesSinceApplied: 0 },
    beliefs: {},
    thresholds: { washMinDays: 2, clarifyMinDays: 5, proteinMinDays: 7 }
};

var recs = RecommendationEngine.getRecommendations({ dewPoint: null, lane: null });
assert(recs.length > 0, 'Returns recommendations even with 0 events');
assert(recs[0].tier === 1, 'First recommendation is Tier 1');

// Should recommend amodimethicone conditioner
var condRec = recs.find(function(r) { return r.productId === 'garnier-color-repair-cond'; });
assert(condRec !== undefined, 'Recommends amodimethicone conditioner');
assert(condRec.confidence === 'high', 'Conditioner recommendation is high confidence');

// Should recommend leave-in
var leaveInRec = recs.find(function(r) { return r.productId === 'loreal-21in1'; });
assert(leaveInRec !== undefined, 'Recommends leave-in');

// --- Test 2: Humidity-based Got2b recommendation ---
console.log('\n--- Test 2: Humidity rule (Got2b > NYM when humid) ---');
var humidRecs = RecommendationEngine.getRecommendations({ dewPoint: 65, lane: 'curly' });
var got2bRec = humidRecs.find(function(r) { return r.productId === 'got2b-ultra-glued'; });
assert(got2bRec !== undefined, 'Got2b recommended when dew point > 60');
assert(got2bRec.reason.indexOf('65') !== -1, 'Reason includes actual dew point value');

// Should NOT recommend Got2b in dry conditions
var dryRecs = RecommendationEngine.getRecommendations({ dewPoint: 35, lane: 'curly' });
var got2bDry = dryRecs.find(function(r) { return r.productId === 'got2b-ultra-glued'; });
assert(got2bDry === undefined, 'Got2b NOT recommended when dew point < 60');

// --- Test 3: Clarify recommendation when overdue ---
console.log('\n--- Test 3: Clarify when overdue ---');
var tenDaysAgo = new Date();
tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
mockState.events = [
    { date: tenDaysAgo.toISOString(), products: ['everpure-clarifying'], treatments: ['clarify'], lane: 'curly', rating: 4 }
];

var overdueRecs = RecommendationEngine.getRecommendations({ dewPoint: null, lane: null });
var clarifyRec = overdueRecs.find(function(r) { return r.productId === 'everpure-clarifying'; });
assert(clarifyRec !== undefined, 'Clarify recommended when >7 days since last');
assert(clarifyRec.reason.indexOf('10') !== -1 || clarifyRec.reason.indexOf('days') !== -1, 'Reason mentions days since clarify');

// --- Test 4: Conflict warnings ---
console.log('\n--- Test 4: Conflict warnings ---');
mockState.sealState = { active: true, washesSinceApplied: 1 };

var warnings = RecommendationEngine.getConflictWarnings({
    dewPoint: null, lane: 'curly', selectedProducts: []
});
var sealWarning = warnings.find(function(w) { return w.type === 'seal_blocks_curly'; });
assert(sealWarning !== undefined, 'Seal warning fires for curly lane');
assert(sealWarning.suggestion.length > 0, 'Warning includes suggestion');

// PQ-69 + Polysilicone conflict
var conflictWarnings = RecommendationEngine.getConflictWarnings({
    dewPoint: null, lane: null, selectedProducts: ['nym-curl-talk-gel', 'marc-anthony-shield']
});
var pqConflict = conflictWarnings.find(function(w) { return w.type === 'pq69_polysilicone_conflict'; });
assert(pqConflict !== undefined, 'PQ-69 + Polysilicone conflict detected');

// No warning when seal is inactive
mockState.sealState = { active: false, washesSinceApplied: 0 };
var noWarnings = RecommendationEngine.getConflictWarnings({
    dewPoint: null, lane: 'curly', selectedProducts: []
});
var noSealWarning = noWarnings.find(function(w) { return w.type === 'seal_blocks_curly'; });
assert(noSealWarning === undefined, 'No seal warning when seal is inactive');

// --- Test 5: Glycerin humidity warning ---
console.log('\n--- Test 5: Glycerin + humidity warning ---');
var glycerinWarnings = RecommendationEngine.getConflictWarnings({
    dewPoint: 68, lane: 'curly', selectedProducts: ['nym-curl-talk-gel']
});
var glycWarn = glycerinWarnings.find(function(w) { return w.type === 'glycerin_humidity'; });
assert(glycWarn !== undefined, 'Glycerin warning fires at high dew point');

// No glycerin warning at moderate dew point
var modGlycerinWarnings = RecommendationEngine.getConflictWarnings({
    dewPoint: 50, lane: 'curly', selectedProducts: ['nym-curl-talk-gel']
});
var noGlycWarn = modGlycerinWarnings.find(function(w) { return w.type === 'glycerin_humidity'; });
assert(noGlycWarn === undefined, 'No glycerin warning at moderate dew point');

// --- Test 6: NYM suboptimal in humidity ---
console.log('\n--- Test 6: NYM suboptimal warning ---');
var nymWarn = glycerinWarnings.find(function(w) { return w.type === 'suboptimal_for_conditions'; });
assert(nymWarn !== undefined, 'NYM suboptimal warning fires at high dew point');

// --- Summary ---
console.log('\n===== TASK 8 VERIFICATION =====');
console.log('Passed: ' + passed);
console.log('Failed: ' + failed);
if (failed > 0) process.exit(1);
console.log('\nRecommendationEngine verified:');
console.log('  - Domain rules (Tier 1): conditioner, leave-in, Got2b humidity, clarify overdue');
console.log('  - Conflict warnings: seal state, PQ-69/polysilicone, glycerin/humidity, suboptimal');
console.log('  - Proper gating: humidity rules only fire when conditions met');
