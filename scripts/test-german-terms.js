const { generateAcademicTerms, getCurrentTerm } = require('../lib/academic-systems');

console.log('Testing German academic terms...\n');

const germanTerms = generateAcademicTerms('DE');
console.log('Generated terms for Germany:');
console.log(germanTerms.slice(0, 10));

console.log('\nCurrent term for Germany:', getCurrentTerm('DE'));

// Check if "Sommersemester 2025" is in the list
const searchTerm = 'Sommersemester 2025';
const found = germanTerms.includes(searchTerm);
console.log(`\nIs "${searchTerm}" in the generated terms? ${found}`);

if (!found) {
  // Find similar terms
  const similarTerms = germanTerms.filter(term => term.includes('Sommersemester') && term.includes('2025'));
  console.log('Similar terms found:', similarTerms);
}