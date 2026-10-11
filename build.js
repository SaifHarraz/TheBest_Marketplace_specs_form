const fs = require('fs');
const path = require('path');
const { FEATURES_DATA, CATEGORIES_DATA } = require('./features_data.js');
const { JOURNEY_NODES } = require('./journey_data.js');

console.log(`Building index.html with ${FEATURES_DATA.length} features, ${CATEGORIES_DATA.length} categories, and ${JOURNEY_NODES.length} journey nodes...`);

const templatePath = path.join(__dirname, 'template.html');
const outputPath = path.join(__dirname, 'index.html');

let template = fs.readFileSync(templatePath, 'utf8');

template = template.replace('/* __FEATURES_DATA__ */', JSON.stringify(FEATURES_DATA, null, 2));
template = template.replace('/* __CATEGORIES_DATA__ */', JSON.stringify(CATEGORIES_DATA, null, 2));
template = template.replace('/* __JOURNEY_NODES__ */', JSON.stringify(JOURNEY_NODES, null, 2));

fs.writeFileSync(outputPath, template, 'utf8');
console.log('Successfully compiled index.html!');
