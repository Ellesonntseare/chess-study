import {mkdir,writeFile,readFile} from 'node:fs/promises';
const res=new URL('../android/app/src/main/res/',import.meta.url);
await mkdir(new URL('drawable/',res),{recursive:true});
await writeFile(new URL('drawable/ic_chess.xml',res),`<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108"><path android:fillColor="#16201b" android:pathData="M0,0h108v108h-108z"/><path android:fillColor="#c4df99" android:pathData="M33,78h44v7h-44z M36,72h38v4h-38z M39,68c0,-12 16,-12 18,-27l-17,10 -12,-7 8,-16 10,-4 0,-11 12,11c22,7 23,27 14,44z"/><path android:fillColor="#16201b" android:pathData="M43,32h5v5h-5z"/></vector>`);
const manifest=new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url);
let text=await readFile(manifest,'utf8');text=text.replace(/@mipmap\/ic_launcher_round/g,'@drawable/ic_chess').replace(/@mipmap\/ic_launcher/g,'@drawable/ic_chess');await writeFile(manifest,text);
console.log('Android chess icon configured.');
