import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const hashes={
 'stockfish-19-lite-single.js':'ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a',
 'stockfish-19-lite-single.wasm':'ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de'
};
for(const [file,expected]of Object.entries(hashes)){
 const bytes=await readFile(new URL('../public/engine/'+file,import.meta.url));
 if(createHash('sha256').update(bytes).digest('hex')!==expected)throw new Error(`Stockfish checksum mismatch: ${file}`);
}
console.log('Bundled Stockfish 19.0.1 verified.');
