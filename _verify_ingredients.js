// Verify all product ingredient arrays reference ingredients that exist in the KB
const fs = require('fs');
const html = fs.readFileSync('hair-routine/index.html', 'utf8');
const script = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];

// Extract INGREDIENT_KB + IngredientKB module (between the KB comment and StateManager)
const kbStart = script.indexOf('// ===== IngredientKB (Ingredient Knowledge Base) =====');
const smStart = script.indexOf('const StateManager = (function() {');
let kbCode = script.substring(kbStart, smStart);

// Extract DEFAULT_INVENTORY — ends at "        ];\n\n        const DEFAULT_STATE"
const invStart = script.indexOf('const DEFAULT_INVENTORY = [');
const invEnd = script.indexOf('];\r\n\r\n        const DEFAULT_STATE');
if (invEnd === -1) {
    // Try Unix line endings
    var invEndAlt = script.indexOf('];\n\n        const DEFAULT_STATE');
    if (invEndAlt === -1) { console.error('Cannot find inventory end'); process.exit(1); }
    var invCode = script.substring(invStart, invEndAlt + 2);
} else {
    var invCode = script.substring(invStart, invEnd + 2);
}
let invCodeFinal = invCode;

// Replace const/let with var for eval compatibility
kbCode = kbCode.replace(/\bconst\b/g, 'var').replace(/\blet\b/g, 'var');
invCodeFinal = invCodeFinal.replace(/\bconst\b/g, 'var');

const testBody = kbCode + '\n' + invCodeFinal + `

var errors = [];
var total = 0;
var withIngs = 0;

DEFAULT_INVENTORY.forEach(function(product) {
    var ings = product.intelligence && product.intelligence.ingredients;
    if (!ings || ings.length === 0) {
        errors.push(product.id + ': NO ingredients array');
        return;
    }
    withIngs++;
    ings.forEach(function(ing) {
        total++;
        var found = IngredientKB.getByName(ing);
        if (!found) {
            errors.push(product.id + ': "' + ing + '" NOT in KB');
        }
    });
});

console.log('Products with ingredients: ' + withIngs + '/' + DEFAULT_INVENTORY.length);
console.log('Total ingredient references: ' + total);
if (errors.length > 0) {
    console.log('ERRORS (' + errors.length + '):');
    errors.forEach(function(e) { console.log('  ' + e); });
    process.exit(1);
} else {
    console.log('ALL INGREDIENT REFERENCES VALID');
}
`;

eval('(function() {\n' + testBody + '\n})();');
