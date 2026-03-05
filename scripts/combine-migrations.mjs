import fs from 'fs';
import path from 'path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const outputFile = path.join(process.cwd(), 'supabase', 'init_schema_combined.sql');

// Read all migration files
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort(); // Sort alphabetically (by timestamp)

let combinedSql = '-- ==========================================\n';
combinedSql += '-- THIS FILE IS AUTO-GENERATED - DO NOT EDIT\n';
combinedSql += '-- ==========================================\n';
combinedSql += '-- It concatenates all migrations into a single file for easy reading and initialization.\n\n';

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  combinedSql += `-- ==========================================\n`;
  combinedSql += `-- Migration: ${file}\n`;
  combinedSql += `-- ==========================================\n\n`;
  combinedSql += content.trim();
  combinedSql += '\n\n';
}

fs.writeFileSync(outputFile, combinedSql);
console.log(`Successfully combined ${files.length} migrations into ${outputFile}`);
