import { buildPools } from './data-lib.ts';
const built=buildPools();
console.log(`Built ${built.records.length} clean entities (data version ${built.dataVersion}).`);
