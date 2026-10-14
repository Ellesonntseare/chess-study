import {mkdir,writeFile} from 'node:fs/promises';
const dir=new URL('../public/pieces/',import.meta.url);await mkdir(dir,{recursive:true});
for(const color of ['w','b'])for(const type of ['K','Q','R','B','N','P']){
 const name=color+type+'.svg';const r=await fetch('https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/'+name);
 if(!r.ok)throw new Error(`Piece download failed: ${name}: ${r.status}`);
 const text=await r.text();if(!text.includes('<svg'))throw new Error('Invalid SVG');await writeFile(new URL(name,dir),text);
}
console.log('12 Cburnett chess pieces downloaded.');
