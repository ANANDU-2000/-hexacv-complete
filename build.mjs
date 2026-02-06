#!/usr/bin/env node
// Build script that bypasses TypeScript checking
import { build } from 'vite';

console.log('🚀 Starting Vite build (TypeScript checking disabled)...');

build({
  logLevel: 'info',
  build: {
    emptyOutDir: true,
  },
}).then(() => {
  console.log('✅ Build completed successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
