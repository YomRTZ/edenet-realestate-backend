const fs = require('fs');
const path = require('path');
const root = path.join(process.cwd(), 'src', 'models');
const models = {};
for (const fname of fs.readdirSync(root).sort()) {
  if (!fname.endsWith('.js') || fname === 'associations.js') continue;
  const text = fs.readFileSync(path.join(root, fname), 'utf8');
  const m = text.match(/define\(\s*['\"]([A-Za-z0-9_]+)['\"]\s*,\s*\{/);
  if (!m) continue;
  const name = m[1];
  const lines = text.split(/\r?\n/);
  let inAttrs = false;
  let brace = 0;
  const attrs = [];
  for (const line of lines) {
    if (!inAttrs && /define\(/.test(line)) {
      inAttrs = true;
      brace = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      continue;
    }
    if (inAttrs) {
      brace += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (brace <= 0) break;
      const m2 = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*/);
      if (m2) attrs.push(m2[1]);
    }
  }
  models[name] = { file: fname, attributes: attrs };
}
const assocText = fs.readFileSync(path.join(root, 'associations.js'), 'utf8');
const assocs = [];
for (const line of assocText.split(/\r?\n/)) {
  const m = line.trim().match(/models\.([A-Za-z0-9_]+)\.(hasMany|belongsTo)\(models\.([A-Za-z0-9_]+),.*foreignKey:\s*['\"]([A-Za-z0-9_]+)['\"]/);
  if (m) assocs.push({ src: m[1], kind: m[2], dst: m[3], fk: m[4] });
}
const md = ['# Database Tables and Relationships'];
for (const name of Object.keys(models)) {
  md.push(`## ${name}`);
  md.push('| Attribute |');
  md.push('| --- |');
  for (const attr of models[name].attributes) {
    md.push(`| ${attr} |`);
  }
  md.push('');
}
md.push('## Relationships');
md.push('| Source | Relationship | Target | Foreign Key |');
md.push('| --- | --- | --- | --- |');
for (const a of assocs) {
  const rel = a.kind === 'hasMany' ? '1..*' : '*..1';
  md.push(`| ${a.src} | ${rel} ${a.kind} | ${a.dst} | ${a.fk} |`);
}
fs.writeFileSync(path.join(process.cwd(), 'DATABASE_SCHEMA.md'), md.join('\n'), 'utf8');
console.log('written DATABASE_SCHEMA.md');
