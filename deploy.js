#!/usr/bin/env node

// Force deployment script
const fs = require('fs');
const path = require('path');

// Update build timestamp
const buildId = Date.now();
const buildFile = path.join(__dirname, '.vercel-build-id');

fs.writeFileSync(buildFile, `BUILD_ID=${buildId}`);

// Update package.json version
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Increment patch version
const version = packageJson.version.split('.');
version[2] = parseInt(version[2]) + 1;
packageJson.version = version.join('.');

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log(`✅ Updated build ID to: ${buildId}`);
console.log(`✅ Updated version to: ${packageJson.version}`);
console.log('🚀 Ready for deployment!');