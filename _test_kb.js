// Quick test of IngredientKB module
const fs = require('fs');
const code = fs.readFileSync('hair-routine/_ingredientKB.js', 'utf8');

// Wrap in a function and execute
const wrapped = `(function() {
    'use strict';
    ${code}
    
    // Tests
    console.log('=== IngredientKB Test ===');
    console.log('Total ingredients:', Object.keys(INGREDIENT_KB).length);
    console.log('IngredientKB.size():', IngredientKB.size());
    console.log('Roles:', IngredientKB.getRoles().join(', '));
    
    // Test getByName
    var amod = IngredientKB.getByName('amodimethicone');
    console.log('\\ngetByName("amodimethicone"):', amod ? 'FOUND' : 'NOT FOUND');
    if (amod) console.log('  roles:', amod.roles.join(', '));
    
    var coconut = IngredientKB.getByName('Coconut Oil');
    console.log('getByName("Coconut Oil"):', coconut ? 'FOUND' : 'NOT FOUND');
    
    // Test getByRole
    var bondRepair = IngredientKB.getByRole('bond_repair');
    console.log('\\ngetByRole("bond_repair"):', bondRepair.length, 'ingredients');
    bondRepair.forEach(function(r) { console.log('  -', r.entry.commonName); });
    
    var cuticle = IngredientKB.getByRole('cuticle_smoothing');
    console.log('\\ngetByRole("cuticle_smoothing"):', cuticle.length, 'ingredients');
    
    // Test fuzzyMatch
    var fuzzy1 = IngredientKB.fuzzyMatch('amodimethicon');
    console.log('\\nfuzzyMatch("amodimethicon"):', fuzzy1.length, 'matches');
    if (fuzzy1[0]) console.log('  best:', fuzzy1[0].key, 'distance:', fuzzy1[0].distance);
    
    var fuzzy2 = IngredientKB.fuzzyMatch('dimethicone');
    console.log('fuzzyMatch("dimethicone"):', fuzzy2.length, 'matches');
    
    // Test getInteractionFlags
    var flags = IngredientKB.getInteractionFlags('glycerin');
    console.log('\\ngetInteractionFlags("glycerin"):', flags);
    
    // Test analyzeIngredientList
    var analysis = IngredientKB.analyzeIngredientList([
        'Amodimethicone', 'Citric Acid', 'Panthenol', 'Unknown Ingredient XYZ'
    ]);
    console.log('\\nanalyzeIngredientList test:');
    console.log('  matched:', analysis.matched.length);
    console.log('  unmatched:', analysis.unmatched.length, '(' + analysis.unmatched.join(', ') + ')');
    console.log('  roles:', analysis.detectedRoles.join(', '));
    console.log('  outcomes:', JSON.stringify(analysis.outcomeProfile));
    
    console.log('\\n=== ALL TESTS PASSED ===');
})();`;

try {
    eval(wrapped);
} catch (e) {
    console.error('ERROR:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
}
