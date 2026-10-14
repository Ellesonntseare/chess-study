import {mkdir,writeFile} from 'node:fs/promises';
import {fetchArchives,importMonth} from '../src/chess.js';
const username=process.argv[2]||'ellesonchess';
const archives=await fetchArchives(username,AbortSignal.timeout(30000));
const games=[];
for(const url of archives){const result=await importMonth(url,AbortSignal.timeout(60000));games.push(...result.games);console.log(`${url.split('/').slice(-2).join('-')}: ${result.games.length} games`);}
const unique=[...new Map(games.map(g=>[g.id,g])).values()].sort((a,b)=>b.endTime-a.endTime);
await mkdir(new URL('../public/',import.meta.url),{recursive:true});
await writeFile(new URL('../public/preloaded-games.json',import.meta.url),JSON.stringify({username,updatedAt:new Date().toISOString(),games:unique}));
console.log(`Bundled ${unique.length} completed games for ${username}.`);
