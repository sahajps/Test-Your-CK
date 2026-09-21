import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XLSX from 'xlsx';

export const cultures = ['chinese','japanese','korean','vietnamese','pakistani','indian','western'] as const;
export const types = ['authors','beverage','food','locations','names_m','names_f','sports'] as const;
export type Culture = typeof cultures[number];
export type EntityType = typeof types[number];
export type RecordRow = { culture: Culture; type: EntityType; en: string; sourceLang: string; sourceIndex: number };
export type StageStats = Record<string, { raw: number; missing: number; nonLatin: number; tooLong: number; brackets: number; irrelevant: number; duplicate: number; ambiguous: number; blocklisted: number; kept: number }>;
export const keyOf = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const typeFor = (name: string): EntityType => name.includes('names-male') ? 'names_m' : name.includes('names-female') ? 'names_f' : name.includes('cricket') || name.includes('football') ? 'sports' : path.basename(name, '.xlsx') as EntityType;
const hasNonLatinScript = (s: string) => /[\u0370-\u1fff\u2e80-\u9fff\uac00-\ud7af\uf900-\ufaff]/u.test(s);
const blankStats = () => ({raw:0,missing:0,nonLatin:0,tooLong:0,brackets:0,irrelevant:0,duplicate:0,ambiguous:0,blocklisted:0,kept:0});

export function readAndClean(root = process.cwd()) {
  const stats: StageStats = {};
  const candidates: RecordRow[] = [];
  const files = fs.readdirSync(path.join(root,'entities'), {withFileTypes:true})
    .flatMap(d => d.isDirectory() ? fs.readdirSync(path.join(root,'entities',d.name)).filter(f=>f.endsWith('.xlsx')).map(f=>path.join(root,'entities',d.name,f)) : []);
  for (const file of files.sort()) {
    const dirCulture = path.basename(path.dirname(file)).toLowerCase() as Culture;
    const type = typeFor(file);
    const statKey = `${dirCulture}/${type}`;
    stats[statKey] ||= blankStats();
    const book = XLSX.readFile(file, {cellText:true});
    const sheet = book.Sheets[book.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet, {defval:''});
    rows.forEach((row, index) => {
      const stat = stats[statKey]; stat.raw++;
      let culture = dirCulture;
      const label = String(row.Culture || '').trim().toLowerCase();
      if ((cultures as readonly string[]).includes(label)) culture = label as Culture;
      if (label && /irrelevant|unlabel/.test(label)) { stat.irrelevant++; return; }
      const en = String(row.Translation || row.en || '').trim().replace(/\s+/g,' ');
      if (!en) { stat.missing++; return; }
      if (hasNonLatinScript(en)) { stat.nonLatin++; return; }
      if (en.length > 32) { stat.tooLong++; return; }
      if (/[()[\]]/.test(en)) { stat.brackets++; return; }
      candidates.push({culture,type,en,sourceLang:dirCulture === 'indian' ? 'hi/ml/mr/gu' : dirCulture,sourceIndex:index + 2});
    });
  }
  const block = new Set(fs.readFileSync(path.join(root,'data-src/blocklist.txt'),'utf8').split(/\r?\n/).map(s=>s.trim()).filter(s=>s && !s.startsWith('#')));
  const ownSeen = new Set<string>();
  const unique: RecordRow[] = [];
  for (const r of candidates) {
    const compound = `${r.culture}|${r.type}|${keyOf(r.en)}`;
    if (ownSeen.has(compound)) { const s=stats[`${r.sourceLang === 'hi/ml/mr/gu' ? 'indian' : r.sourceLang}/${r.type}`]; if(s)s.duplicate++; continue; }
    ownSeen.add(compound); unique.push(r);
  }
  const owners = new Map<string,Set<Culture>>();
  for (const r of unique) {
    const k = `${r.type}|${keyOf(r.en)}`;
    if (!owners.has(k)) owners.set(k,new Set());
    owners.get(k)!.add(r.culture);
  }
  const collisions = [...owners].filter(([,v])=>v.size>1).map(([k,v])=>({key:k,cultures:[...v]}));
  const kept = unique.filter(r => {
    const sk = `${r.sourceLang === 'hi/ml/mr/gu' ? 'indian' : r.sourceLang}/${r.type}`;
    if (block.has(keyOf(r.en))) { if(stats[sk])stats[sk].blocklisted++; return false; }
    if ((owners.get(`${r.type}|${keyOf(r.en)}`)?.size || 0)>1) { if(stats[sk])stats[sk].ambiguous++; return false; }
    stats[sk]!.kept++; return true;
  }).sort((a,b)=> a.culture.localeCompare(b.culture)||a.type.localeCompare(b.type)||keyOf(a.en).localeCompare(keyOf(b.en)));
  return {records:kept,stats,collisions};
}

export function buildPools(root = process.cwd()) {
  const {records,stats,collisions}=readAndClean(root);
  const out=path.join(root,'public/data'); fs.mkdirSync(out,{recursive:true});
  const counts: Record<string,Record<string,number>>={};
  for(const culture of cultures){
    const typeMap: Record<string,string[]>={}; counts[culture]={};
    for(const type of types){
      const vals=records.filter(r=>r.culture===culture&&r.type===type).map(r=>r.en);
      typeMap[type]=vals; counts[culture][type]=vals.length;
    }
    fs.writeFileSync(path.join(out,`pool.${culture}.json`),JSON.stringify({culture,types:typeMap}));
  }
  const hash=crypto.createHash('sha256').update(JSON.stringify(records.map(r=>[r.culture,r.type,r.en]))).digest('hex').slice(0,12);
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({dataVersion:hash,generated:new Date().toISOString().slice(0,10),counts},null,2)+'\n');
  return {records,stats,collisions,counts,dataVersion:hash};
}
