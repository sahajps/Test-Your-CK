import fs from 'node:fs';
import { cultures, keyOf, types } from './data-lib.ts';
const min=10; let failed=false;
for(const culture of cultures){
  const pool=JSON.parse(fs.readFileSync(`public/data/pool.${culture}.json`,'utf8'));
  for(const type of types){
    const vals:string[]=pool.types[type]||[]; const keys=vals.map(keyOf);
    if(vals.some(v=>!v)||new Set(keys).size!==keys.length){console.error(`${culture}/${type}: empty or duplicate value`);failed=true;}
    if(culture!=='western'&&vals.length<min) console.warn(`SKIPPED ELIGIBILITY: ${culture}/${type} has ${vals.length} (<${min})`);
  }
}
if(failed) process.exit(1); console.log('Data validation passed; undersized groups will be skipped by the engine.');
