import { Chess } from 'chess.js';
import { reviewMove } from './chess.js';

export class StockfishEngine {
  constructor() { this.worker=null; this.pending=null; }
  async init() {
    this.worker = new Worker(`${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`);
    this.worker.onmessage = e => this.pending?.line(String(e.data));
    this.worker.onerror = () => this.pending?.reject(new Error('Stockfish could not load. Reload the app and try again.'));
    await this.wait('uci', line=>line==='uciok');
    this.worker.postMessage('setoption name Hash value 32');
    await this.wait('isready', line=>line==='readyok');
  }
  wait(command, predicate) {
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>finish(new Error('Stockfish timed out. Try Quick analysis.')),60000);
      const finish=(err,value)=>{clearTimeout(timer);this.pending=null;err?reject(err):resolve(value);};
      this.pending={reject:e=>finish(e),line:line=>{const result=predicate(line);if(result)finish(null,result);}};
      this.worker.postMessage(command);
    });
  }
  async evaluate(fen, milliseconds) {
    const chess=new Chess(fen);
    if(chess.isCheckmate()) return {cp:chess.turn()==='w'?-100000:100000,mate:0,pv:[],best:null,depth:0};
    if(chess.isDraw()) return {cp:0,mate:null,pv:[],best:null,depth:0};
    const sign=chess.turn()==='w'?1:-1;
    let score=null;
    this.worker.postMessage(`position fen ${fen}`);
    const result=await this.wait(`go movetime ${milliseconds}`,line=>{
      const m=line.match(/\bscore (cp|mate) (-?\d+)/);
      if(m && !/lowerbound|upperbound/.test(line)) {
        const n=Number(m[2]);
        score={cp:(m[1]==='mate' ? Math.sign(n||1)*(100000-Math.abs(n)*100) : n)*sign,mate:m[1]==='mate'?n*sign:null,depth:Number(line.match(/\bdepth (\d+)/)?.[1]||0),pv:(line.split(' pv ')[1]||'').trim().split(/\s+/).filter(Boolean)};
      }
      if(line.startsWith('bestmove ')) return {best:line.split(' ')[1]};
    });
    if(!score) throw new Error('Stockfish returned no evaluation. Please retry.');
    return {...score,...result};
  }
  async analyse(game,milliseconds,onProgress) {
    await this.init();
    const evaluations=[];
    const fens=[game.moves[0].before,...game.moves.map(m=>m.after)];
    for(let i=0;i<fens.length;i++) { evaluations.push(await this.evaluate(fens[i],milliseconds));onProgress(i+1,fens.length); }
    return game.moves.map((move,i)=>reviewMove(move,i,evaluations[i],evaluations[i+1]));
  }
  close() { this.pending?.reject(new Error('Analysis stopped.'));this.worker?.terminate();this.worker=null; }
}
