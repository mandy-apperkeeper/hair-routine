const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

var checks = 0;
var fails = 0;

function check(condition, msg) {
    checks++;
    if (condition) { console.log('PASS:', msg); }
    else { fails++; console.log('FAIL:', msg); }
}

check(html.indexOf('const RecommendationEngine') !== -1, 'RecommendationEngine module exists');
check(html.indexOf('function renderRecommendationCard()') !== -1, 'renderRecommendationCard function exists');
check(html.indexOf('getRecommendations: getRecommendations') !== -1, 'getRecommendations in public API');
check(html.indexOf('getConflictWarnings: getConflictWarnings') !== -1, 'getConflictWarnings in public API');
check(html.indexOf('getMissingStepWarnings: getMissingStepWarnings') !== -1, 'getMissingStepWarnings in public API');
check(html.indexOf('id="recommendation-card"') !== -1, 'recommendation-card HTML element exists');
check(html.indexOf('renderRecommendationCard()') !== -1, 'renderRecommendationCard called');

// Check module order: RecommendationEngine after UseUpRotation, before WalkthroughEngine
var recIdx = html.indexOf('const RecommendationEngine');
var useUpIdx = html.indexOf('UseUpRotation =');
var walkIdx = html.indexOf('const WalkthroughEngine');
check(recIdx > useUpIdx, 'RecommendationEngine after UseUpRotation');
check(recIdx < walkIdx, 'RecommendationEngine before WalkthroughEngine');

// Check the recommendation card is in the landing section
var cardIdx = html.indexOf('id="recommendation-card"');
var dailyPlanIdx = html.indexOf('id="daily-plan-container"');
var insightIdx = html.indexOf('id="insight-card"');
check(cardIdx > dailyPlanIdx, 'Recommendation card after daily plan container');
check(cardIdx < insightIdx, 'Recommendation card before insight card');

console.log('\n' + checks + ' checks, ' + fails + ' failures');
if (fails > 0) process.exit(1);
