import { Chess } from 'chess.js';

export const DEMO_PGN = `[Event "A short lesson: king safety"]
[White "Study example"]
[Black "Training partner"]
[Result "0-1"]

1. f3 e5 2. g4 Qh4# 0-1`;

export function parseGame(pgn, extra = {}) {
  const board = new Chess();
  board.loadPgn(pgn);
  const headers = board.getHeaders();
  const moves = board.history({ verbose: true });
  if (!moves.length) throw new Error('This PGN has no moves.');
  if (!['1-0', '0-1', '1/2-1/2'].includes(headers.Result)) throw new Error('Import a completed game with a final result.');
  if (headers.Variant && !['standard', 'chess'].includes(headers.Variant.toLowerCase())) throw new Error('Only standard chess is supported.');
  return { id: extra.id || hash(pgn), pgn, white: headers.White || 'White', black: headers.Black || 'Black', result: headers.Result, date: headers.Date || '', moves: moves.map(m => ({san:m.san, from:m.from, to:m.to, promotion:m.promotion, color:m.color, piece:m.piece, captured:m.captured, before:m.before, after:m.after})), ...extra };
}
function hash(text) { let h = 2166136261; for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return `pgn-${h >>> 0}`; }
export function uciMove(chess, uci) { return chess.move({from:uci.slice(0,2), to:uci.slice(2,4), promotion:uci[4]}); }
export function lineToSan(fen, line = []) { const c = new Chess(fen); const result=[]; for (const u of line.slice(0,6)) { try { result.push(uciMove(c,u).san); } catch { break; } } return result; }
export function classify(loss, best) { return best ? 'Best' : loss >= 200 ? 'Blunder' : loss >= 100 ? 'Mistake' : loss >= 50 ? 'Inaccuracy' : 'Good'; }
export function phase(move, index) { const c = new Chess(move.before); const pieces = c.board().flat().filter(Boolean); return pieces.filter(p => !['p','k'].includes(p.type)).length <= 4 ? 'Endgame' : index < 20 ? 'Opening' : 'Middlegame'; }
export function reviewMove(move, index, before, after) {
  const played = move.from + move.to + (move.promotion || '');
  const best = before.best === played;
  const sign = move.color === 'w' ? 1 : -1;
  const loss = best ? 0 : Math.max(0, Math.round((before.cp - after.cp) * sign));
  const bestSan = lineToSan(move.before, [before.best])[0] || '—';
  const stage = phase(move, index);
  let theme = `${stage} decisions`;
  if (after.mate !== null && after.cp * sign < 0) theme = 'Allowing forced mate';
  else if (before.mate !== null && before.cp * sign > 0 && (after.mate === null || after.cp * sign <= 0)) theme = 'Missing forced mate';
  else if (bestSan.includes('x') && !move.captured) theme = 'Missed captures';
  else if (bestSan.includes('+') && !move.san.includes('+')) theme = 'Missed checks';
  return { index, loss, label:classify(loss,best), theme, phase:stage, best:before.best, bestSan, line:lineToSan(move.before,before.pv), before, after };
}
export function patterns(games, username, side = 'w') {
  const groups = new Map();
  for (const game of games) {
    const name = username.trim().toLowerCase();
    const color = game.white.toLowerCase() === name ? 'w' : game.black.toLowerCase() === name ? 'b' : game.demo ? side : null;
    if (!color || !game.analysis || game.demo) continue;
    for (const r of game.analysis) {
      if (game.moves[r.index].color !== color || r.loss < 50) continue;
      const entry = groups.get(r.theme) || {theme:r.theme,count:0,total:0,examples:[]};
      entry.count++; entry.total += r.loss; entry.examples.push({gameId:game.id,index:r.index}); groups.set(r.theme,entry);
    }
  }
  return [...groups.values()].sort((a,b)=>b.count-a.count || b.total-a.total);
}
export function scoreText(score) { if (!score) return '—'; return score.mate !== null ? `${score.cp >= 0 ? '+' : '−'}M${Math.abs(score.mate)}` : `${score.cp >= 0 ? '+' : ''}${(score.cp/100).toFixed(2)}`; }

export async function fetchArchives(username, signal, fetcher = fetch) {
  const name=username.trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,25}$/.test(name)) throw new Error('Enter a valid Chess.com username.');
  const data=await request(`https://api.chess.com/pub/player/${encodeURIComponent(name)}/games/archives`,signal,fetcher);
  return (data.archives || []).filter(url => new RegExp(`^https://api\\.chess\\.com/pub/player/${name}/games/\\d{4}/\\d{2}$`, 'i').test(url)).reverse();
}
export async function importMonth(url, signal, fetcher = fetch) {
  if (!/^https:\/\/api\.chess\.com\/pub\/player\/[a-z0-9_-]+\/games\/\d{4}\/\d{2}$/i.test(url)) throw new Error('Invalid archive URL.');
  const data=await request(url,signal,fetcher);
  let skipped=0;
  const games=(data.games || []).filter(g=>g.rules==='chess' && g.pgn).sort((a,b)=>b.end_time-a.end_time).flatMap(g=>{
    try {return [parseGame(g.pgn,{id:g.uuid || g.url, url:g.url, timeClass:g.time_class,date:new Date(g.end_time*1000).toLocaleDateString(),endTime:g.end_time})];} catch {skipped++;return [];}
  });
  return {games,skipped};
}
async function request(url,signal,fetcher) {
  const r=await fetcher(url,{signal});
  if (!r.ok) throw new Error(r.status===404 ? 'Chess.com could not find this player or archive.' : r.status===429 ? 'Chess.com is busy. Please wait a minute and try again.' : `Chess.com returned ${r.status}. Try again or upload a PGN.`);
  return r.json();
}
