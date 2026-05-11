// Verify all product ingredient arrays reference ingredients that exist in the KB
const fs = require('fs');
const html = fs.readFileSync('hair-routine/index.html', 'utf8');

// Extract the full script content
const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
const script = scriptMatch[1];

// We need to extract just the INGREDIENT_KB data + IngredientKB module + DEFAULT_INVENTORY
// Strategy: find and extract each piece, then eval together

const kbDataStart = script.indexOf('// ===== IngredientKB (Ingredient Knowledge Base) =====');
const kbModuleEnd = script.indexOf('})();\n', script.indexOf('return {', script.indexOf('const IngredientKB = (function()')));
const kbSection = script.substring(kbDataStart, kbModuleEnd + 5);

const invStart = script.indexOf('const DEFAULT_INVENTORY = [');
const invEnd = script.indexOf('];\n', invStart + 100);
const invSection = 'var ' + script.substring(invStart + 6, invEnd + 2); // change const to var

const combined = kbSection + '\n' + invSection + `
var errors = [];
var totalIngredients = 0;
var productsWithIngredients = 0;

DEFAULT_INVENTORY.forEach(function(product) {
    var ings = product.intelligence && product.intelligence.ingredients;
    if (!ings || ings.length === 0) {
        errors.push(product.id + ': NO ingredients array');
        return;
    }
    productsWithIngredients++;
    ings.forEach(function(ing) {
        totalIngredients++;
        var found = IngredientKB.getByName(ing);
        if (!found) {
            errors.push(product.id + ': "' + ing + '" NOT in KB');
        }
    });
});

console.log('Products with ingredients:', productsWithIngredients + '/' + DEFAULT_INVENTORY.length);
console.log('Total ingredient references:', totalIngredients);

if (errors.length > 0) {
    console.log('\\nERRORS (' + errors.length + '):');
    errors.forEach(function(e) { console.log('  ' + e); });
    process.exit(1);
} else {
    console.log('\\nALL INGREDIENT REFERENCES VALID');
}
`;

// Write to temp file and run
fs.writeFileSync('hair-routine/_temp_verify.js', '(function() {\n"use strict";\n' + combined + '\n})();');

try {
    require('./_temp_verify.js');
} catch(e) {
    // Try eval instead
    try {
        eval('(function() {\n"use strict";\n' + combined + '\n})();');
    } catch(e2) {
        console.error('ERROR:', e2.message);
        process.exit(1);
    }
}
