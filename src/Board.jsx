import React, { useState } from 'react';
import { Chess } from 'chess.js';

export default function Board({fen,flipped,onMove,lastMove,arrow,muted}) {
  const [selected,setSelected]=useState(null);
  const [promotion,setPromotion]=useState(null);
  const chess=new Chess(fen);
  const files=flipped?'hgfedcba':'abcdefgh';
  const ranks=flipped?'12345678':'87654321';
  const legal=selected?chess.moves({square:selected,verbose:true}):[];
  function move(from,to,piece) {
    const options=chess.moves({square:from,verbose:true}).filter(m=>m.to===to);
    if(!options.length){setSelected(chess.get(to)?.color===chess.turn()?to:null);return;}
    if(options.some(m=>m.promotion)&&!piece){setPromotion({from,to});return;}
    const m=chess.move({from,to,promotion:piece});
    if(!muted)playSound(Boolean(m.captured));
    onMove(m);setSelected(null);setPromotion(null);
  }
  function click(square) {if(selected&&selected!==square)move(selected,square);else setSelected(selected===square?null:chess.get(square)?.color===chess.turn()?square:null);}
  const coord=s=>[files.indexOf(s[0])*100+50,ranks.indexOf(s[1])*100+50];
  const start=arrow?coord(arrow.slice(0,2)):null,end=arrow?coord(arrow.slice(2,4)):null;
  return <div className="board-wrap"><div className="board" role="group" aria-label="Interactive chessboard">{[...ranks].flatMap((rank,ri)=>[...files].map((file,fi)=>{
    const square=file+rank,piece=chess.get(square),target=legal.some(m=>m.to===square);
    return <button key={square} className={`square ${(ri+fi)%2?'dark':'light'} ${selected===square?'selected':''} ${lastMove?.includes(square)?'last-move':''}`} aria-label={`${square}${piece?` ${piece.color==='w'?'white':'black'} ${({k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'})[piece.type]}`:''}`} onClick={()=>click(square)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();move(e.dataTransfer.getData('text/plain'),square);}}>{fi===0&&<span className="rank">{rank}</span>}{ri===7&&<span className="file">{file}</span>}{piece&&<img draggable src={`${import.meta.env.BASE_URL}pieces/${piece.color}${piece.type.toUpperCase()}.svg`} alt="" onDragStart={e=>{e.dataTransfer.setData('text/plain',square);setSelected(square);}}/>}{target&&<span className={`legal-dot ${piece?'capture-ring':''}`}/>}</button>;
  }))}</div>{arrow&&<svg className="arrows" viewBox="0 0 800 800" aria-hidden="true"><defs><marker id="arrowhead" markerWidth="3" markerHeight="3" refX="1.7" refY="1.5" orient="auto"><polygon points="0 0, 3 1.5, 0 3" fill="#b9e79b"/></marker></defs><line x1={start[0]} y1={start[1]} x2={start[0]+(end[0]-start[0])*.78} y2={start[1]+(end[1]-start[1])*.78} stroke="#b9e79b" strokeWidth="17" opacity=".85" markerEnd="url(#arrowhead)"/></svg>}{promotion&&<div className="promotion" role="dialog" aria-label="Choose promotion piece"><b>Promote to</b>{['q','r','b','n'].map(p=><button key={p} onClick={()=>move(promotion.from,promotion.to,p)}>{({q:'Queen',r:'Rook',b:'Bishop',n:'Knight'})[p]}</button>)}<button onClick={()=>setPromotion(null)}>Cancel</button></div>}</div>;
}
let audio;
export function playSound(capture=false){try{audio ||=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(capture?220:520,audio.currentTime);o.frequency.exponentialRampToValueAtTime(capture?90:220,audio.currentTime+.09);g.gain.setValueAtTime(.16,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.13);}catch{}}
