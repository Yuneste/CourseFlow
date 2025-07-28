// Simple script to create placeholder icons for PWA
// In production, you'd use a proper icon generator

const fs = require('fs');
const path = require('path');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#FA8072"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="200" text-anchor="middle" fill="white">📚</text>
</svg>
`;

// Create icons directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');

// Save SVG
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

console.log('✅ Icon placeholder created. For production, generate proper PNG icons.');