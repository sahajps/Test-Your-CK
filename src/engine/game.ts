import { ASIAN_CULTURES, GROUPS, type Culture, type Difficulty, type EntityType, type Group, type Pool, type Round } from './types';

export const entityKey=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function xmur3(str:string){let h=1779033703^str.length;for(let i=0;i<str.length;i++)h=Math.imul(h^str.charCodeAt(i),3432918353),h=h<<13|h>>>19;return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^h>>>16)>>>0}}
export function mulberry32(a:number){return()=>{let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const shuffle=<T,>(a:T[],rnd:()=>number)=>{const b=[...a];for(let i=b.length-1;i;i--){const j=Math.floor(rnd()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const takeUnique=(pool:string[],used:Set<string>,forbidden:Set<string>,rnd:()=>number)=>shuffle(pool,rnd).find(x=>!used.has(entityKey(x))&&!forbidden.has(entityKey(x)));

export function composition(culture:Culture,pools:Pool[],rounds=12,minPool=10):{group:Group;type:EntityType}[]{
  const p=pools.find(x=>x.culture===culture); if(!p) return [];
  const eligible=GROUPS.filter(g=>g==='names' ? p.types.names_m.length>=minPool&&p.types.names_f.length>=minPool : p.types[g as EntityType].length>=minPool);
  if(!eligible.length)return [];
  const result:{group:Group;type:EntityType}[]=[];
  for(const g of eligible){result.push({group:g,type:g==='names'?'names_m':g as EntityType},{group:g,type:g==='names'?'names_f':g as EntityType});}
  let i=0;while(result.length<rounds&&i<eligible.length){const g=eligible[i++];result.push({group:g,type:g==='names'?(i%2?'names_m':'names_f'):g as EntityType});}
  return result.slice(0,rounds);
}

export function generateSession({culture,difficulty,seed,rounds=12,pools,minPool=10}:{culture:Culture;difficulty:Difficulty;seed:string;rounds?:number;pools:Pool[];minPool?:number}):Round[]{
  const rnd=mulberry32(xmur3(`${seed}|${culture}|${difficulty}`)());
  const byCulture=new Map(pools.map(p=>[p.culture,p])); const chosen=byCulture.get(culture); const west=byCulture.get('western');
  if(!chosen||!west)throw new Error('Required pool missing');
  const used=new Set<string>(); const specs=shuffle(composition(culture,pools,rounds,minPool),rnd);
  return specs.map((spec,ri)=>{
    const ownKeys=new Set(chosen.types[spec.type].map(entityKey));
    const correct=takeUnique(chosen.types[spec.type],used,new Set(),rnd);if(!correct)throw new Error(`Not enough ${spec.type} entries`);
    used.add(entityKey(correct));
    const wanted:Culture[] = difficulty==='easy'?['western','western','western']:difficulty==='standard'?['western','western',shuffle(ASIAN_CULTURES.filter(c=>c!==culture),rnd)[0]]:[ 'western',...shuffle(ASIAN_CULTURES.filter(c=>c!==culture),rnd).slice(0,2)];
    const opts=[{id:`${culture}:${spec.type}:${chosen.types[spec.type].indexOf(correct)}`,en:correct,culture}];
    for(const dc of wanted){const source=byCulture.get(dc);let en=source&&takeUnique(source.types[spec.type],used,ownKeys,rnd);let actual=dc;
      if(!en){const fallback=shuffle(pools.filter(p=>p.culture!==culture&&p.types[spec.type].length),rnd).find(p=>{const x=takeUnique(p.types[spec.type],used,ownKeys,rnd);if(x){en=x;actual=p.culture;return true}return false});if(!fallback||!en)throw new Error(`No distractor for ${spec.type}`);}
      used.add(entityKey(en));opts.push({id:`${actual}:${spec.type}:${byCulture.get(actual)!.types[spec.type].indexOf(en)}`,en,culture:actual});
    }
    const options=shuffle(opts,rnd);return{id:`${seed}-${ri}`,group:spec.group,type:spec.type,options,correctIndex:options.findIndex(o=>o.culture===culture)};
  });
}

export function scoreAnswer(correct:boolean,secondsLeft:number,streakBefore:number,timerSeconds=12){if(!correct)return 0;const time=Math.max(0,Math.min(timerSeconds,secondsLeft));return Math.round((100+Math.round(50*time/timerSeconds))*(1+.25*Math.min(streakBefore,4)));}
export function groupAccuracy(rounds:Round[],answers:boolean[]):Record<Group,number|null>{return Object.fromEntries(GROUPS.map(g=>{const idx=rounds.map((r,i)=>r.group===g?i:-1).filter(i=>i>=0);return[g,idx.length?Math.round(100*idx.filter(i=>answers[i]).length/idx.length):null]})) as Record<Group,number|null>;}
