import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jkvijwroptupuahjzbed.supabase.co",
  "sb_publishable_ER1nX6f3F8lgeCknxbu8ZA_Rd4YAN4q"
);

const POSITIONS = ["GK","DF","MF","FW"];
const SIDES = ["センター","左","右"];
const POS_COLOR = { GK:"#f59e0b", DF:"#3b82f6", MF:"#22c55e", FW:"#ef4444" };
const ATT_STATUSES = ["出席","欠席","検討中","療養中","未回答"];
const ATT_COLOR = { "出席":"#22c55e","欠席":"#ef4444","検討中":"#f59e0b","療養中":"#8b5cf6","未回答":"#94a3b8" };
const ATT_BG    = { "出席":"#f0fdf4","欠席":"#fef2f2","検討中":"#fffbeb","療養中":"#f5f3ff","未回答":"#f8fafc" };
const ATT_ICON  = { "出席":"✅","欠席":"❌","検討中":"🤔","療養中":"🏥","未回答":"⬜" };

// フォーメーション定義
// mfSplit: 中盤の枚数を「後ろの列→前の列」に分割（4ライン以上を表現）。例 4-2-3-1 → mf:5 を [2,3]
// fwSplit: 前線の分割（必要時）
const FORMATIONS = {
  // ===== 11人制（10種類）=====
  "4-4-2":   { label:"4-4-2",   gk:1,df:4,mf:4,fw:2,min:11 },                 // 3ライン
  "4-3-3":   { label:"4-3-3",   gk:1,df:4,mf:3,fw:3,min:11 },                 // 3ライン
  "4-2-3-1": { label:"4-2-3-1", gk:1,df:4,mf:5,fw:1,min:11, mfSplit:[2,3] },  // 4ライン（ボランチ2＋2列目3）
  "4-1-4-1": { label:"4-1-4-1", gk:1,df:4,mf:5,fw:1,min:11, mfSplit:[1,4] },  // 4ライン（アンカー1＋MF4）
  "4-3-1-2": { label:"4-3-1-2", gk:1,df:4,mf:4,fw:2,min:11, mfSplit:[3,1] },  // 4ライン（MF3＋トップ下1）
  "4-1-2-3": { label:"4-1-2-3", gk:1,df:4,mf:3,fw:3,min:11, mfSplit:[1,2] },  // 4ライン（アンカー1＋IH2）
  "3-4-3":   { label:"3-4-3",   gk:1,df:3,mf:4,fw:3,min:11 },                 // 3ライン
  "3-5-2":   { label:"3-5-2",   gk:1,df:3,mf:5,fw:2,min:11, mfSplit:[2,3] },  // ボランチ2＋3
  "3-4-2-1": { label:"3-4-2-1", gk:1,df:3,mf:4,fw:3,min:11, fwSplit:[2,1] },  // 4ライン（シャドー2＋1トップ）
  "5-3-2":   { label:"5-3-2",   gk:1,df:5,mf:3,fw:2,min:11 },                 // 3ライン
  // ===== 10人制 =====
  "4-3-2":  { label:"4-3-2",   gk:1,df:4,mf:3,fw:2,min:10 },
  "3-4-2":  { label:"3-4-2",   gk:1,df:3,mf:4,fw:2,min:10 },
  "3-3-3":  { label:"3-3-3",   gk:1,df:3,mf:3,fw:3,min:10 },
  // ===== 9人制 =====
  "3-3-2":  { label:"3-3-2",   gk:1,df:3,mf:3,fw:2,min:9 },
  "3-2-3":  { label:"3-2-3",   gk:1,df:3,mf:2,fw:3,min:9 },
  "2-4-2":  { label:"2-4-2",   gk:1,df:2,mf:4,fw:2,min:9 },
  // ===== 8人制 =====
  "3-3-1":  { label:"3-3-1",   gk:1,df:3,mf:3,fw:1,min:8 },
  "2-3-2":  { label:"2-3-2",   gk:1,df:2,mf:3,fw:2,min:8 },
  "3-2-2":  { label:"3-2-2",   gk:1,df:3,mf:2,fw:2,min:8 },
};

const initialMembers = [
  { id:1,  name:"今野",       number:1,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:2,  name:"裕作",       number:2,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:3,  name:"工藤チャゲ", number:3,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:4,  name:"しん",       number:4,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:5,  name:"鈴木",       number:5,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:6,  name:"福本",       number:6,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:7,  name:"とも",       number:7,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:8,  name:"ちいかわ",   number:8,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:9,  name:"りょう",     number:9,  pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:10, name:"マコ",       number:10, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:11, name:"タカ",       number:11, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:12, name:"南",         number:12, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:13, name:"舛田",       number:13, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:14, name:"浅葉",       number:14, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:15, name:"田代",       number:15, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:16, name:"しょう",     number:16, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:17, name:"沢海",       number:17, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:18, name:"武井",       number:18, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:19, name:"松ちゃん",   number:19, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:20, name:"たつや",     number:20, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:21, name:"Yusuke Mori",number:21, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:22, name:"柿澤",       number:22, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:23, name:"カズ",       number:23, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:24, name:"ナラタカ",   number:24, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:25, name:"椎葉",       number:25, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:26, name:"金指",       number:26, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:27, name:"山崎りんた", number:27, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:28, name:"香川",       number:28, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:29, name:"森部",       number:29, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:30, name:"榊原",       number:32, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:31, name:"ヒロ",       number:33, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:32, name:"井上",       number:37, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:33, name:"たくま",     number:38, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:34, name:"サク",       number:39, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:35, name:"藤本",       number:43, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:36, name:"国",         number:92, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
  { id:37, name:"やぎ",       number:89, pos1:"", pos2:"", pos3:"", side1:"", side2:"", side3:"" },
];

const initialEvents = [
  { id:1, type:"match",   title:"vs FC東京", date:"2026-06-15", timeFrom:"13:30", timeTo:"16:00", place:"代々木公園グラウンド", note:"ホーム戦", playerCount:11, deadline:"2026-06-12" },
  { id:2, type:"practice",title:"練習",      date:"2026-06-12", timeFrom:"19:00", timeTo:"21:00", place:"区立グラウンド",       note:"",        playerCount:11, deadline:"2026-06-11" },
  { id:3, type:"match",   title:"vs 横浜SC", date:"2026-06-22", timeFrom:"10:00", timeTo:"12:00", place:"横浜市営球場",         note:"アウェー",playerCount:8,  deadline:"2026-06-19" },
  { id:4, type:"紅白戦", title:"紅白戦",     date:"2026-06-17", timeFrom:"19:00", timeTo:"21:00", place:"区立グラウンド",       note:"",        playerCount:8,  deadline:"2026-06-16" },
];

const initAtt = () => ({
  1:{ 1:{status:"未回答"},2:{status:"未回答"},3:{status:"未回答"},4:{status:"未回答"},5:{status:"未回答"},6:{status:"未回答"},7:{status:"未回答"},8:{status:"未回答"},9:{status:"未回答"},10:{status:"未回答"},11:{status:"未回答"},12:{status:"未回答"},13:{status:"未回答"},14:{status:"未回答"},15:{status:"未回答"},16:{status:"未回答"},17:{status:"未回答"},18:{status:"未回答"},19:{status:"未回答"},20:{status:"未回答"},21:{status:"未回答"},22:{status:"未回答"},23:{status:"未回答"},24:{status:"未回答"},25:{status:"未回答"},26:{status:"未回答"},27:{status:"未回答"},28:{status:"未回答"},29:{status:"未回答"},30:{status:"未回答"},31:{status:"未回答"},32:{status:"未回答"},33:{status:"未回答"},34:{status:"未回答"},35:{status:"未回答"},36:{status:"未回答"},37:{status:"未回答"} },
  2:{ 1:{status:"未回答"},2:{status:"未回答"},3:{status:"未回答"},4:{status:"未回答"},5:{status:"未回答"},6:{status:"未回答"},7:{status:"未回答"},8:{status:"未回答"},9:{status:"未回答"},10:{status:"未回答"},11:{status:"未回答"},12:{status:"未回答"},13:{status:"未回答"},14:{status:"未回答"},15:{status:"未回答"},16:{status:"未回答"},17:{status:"未回答"},18:{status:"未回答"},19:{status:"未回答"},20:{status:"未回答"},21:{status:"未回答"},22:{status:"未回答"},23:{status:"未回答"},24:{status:"未回答"},25:{status:"未回答"},26:{status:"未回答"},27:{status:"未回答"},28:{status:"未回答"},29:{status:"未回答"},30:{status:"未回答"},31:{status:"未回答"},32:{status:"未回答"},33:{status:"未回答"},34:{status:"未回答"},35:{status:"未回答"},36:{status:"未回答"},37:{status:"未回答"} },
  3:{ 1:{status:"未回答"},2:{status:"未回答"},3:{status:"未回答"},4:{status:"未回答"},5:{status:"未回答"},6:{status:"未回答"},7:{status:"未回答"},8:{status:"未回答"},9:{status:"未回答"},10:{status:"未回答"},11:{status:"未回答"},12:{status:"未回答"},13:{status:"未回答"},14:{status:"未回答"},15:{status:"未回答"},16:{status:"未回答"},17:{status:"未回答"},18:{status:"未回答"},19:{status:"未回答"},20:{status:"未回答"},21:{status:"未回答"},22:{status:"未回答"},23:{status:"未回答"},24:{status:"未回答"},25:{status:"未回答"},26:{status:"未回答"},27:{status:"未回答"},28:{status:"未回答"},29:{status:"未回答"},30:{status:"未回答"},31:{status:"未回答"},32:{status:"未回答"},33:{status:"未回答"},34:{status:"未回答"},35:{status:"未回答"},36:{status:"未回答"},37:{status:"未回答"} },
  4:{ 1:{status:"未回答"},2:{status:"未回答"},3:{status:"未回答"},4:{status:"未回答"},5:{status:"未回答"},6:{status:"未回答"},7:{status:"未回答"},8:{status:"未回答"},9:{status:"未回答"},10:{status:"未回答"},11:{status:"未回答"},12:{status:"未回答"},13:{status:"未回答"},14:{status:"未回答"},15:{status:"未回答"},16:{status:"未回答"},17:{status:"未回答"},18:{status:"未回答"},19:{status:"未回答"},20:{status:"未回答"},21:{status:"未回答"},22:{status:"未回答"},23:{status:"未回答"},24:{status:"未回答"},25:{status:"未回答"},26:{status:"未回答"},27:{status:"未回答"},28:{status:"未回答"},29:{status:"未回答"},30:{status:"未回答"},31:{status:"未回答"},32:{status:"未回答"},33:{status:"未回答"},34:{status:"未回答"},35:{status:"未回答"},36:{status:"未回答"},37:{status:"未回答"} },
});

const initialAnnouncements = [
  { id:1, date:"2026-06-09", title:"6/15試合について",       body:"集合時間は13:00です。ユニフォームを忘れずに！" },
  { id:2, date:"2026-06-07", title:"練習場所変更のお知らせ", body:"6/12の練習は第2グラウンドに変更になりました。" },
];

// 初期管理者リスト（名前で管理）
const initialAdmins = ["管理者①", "管理者②", "管理者③"];

function slotSides(n) {
  if(n<=1) return ["セ"];
  if(n===2) return ["セ","セ"];
  if(n===3) return ["左","セ","右"];
  if(n===4) return ["左","セ","セ","右"];
  return ["左",...Array(n-2).fill("セ"),"右"];
}
function roleLabel(pos, side, band) {
  if(pos==="GK") return "GK";
  if(pos==="DF") return side==="左"?"左SB":side==="右"?"右SB":"CB";
  if(pos==="MF"){
    if(band==="DM") return side==="左"?"左ボランチ":side==="右"?"右ボランチ":"ボランチ";
    if(band==="AM") return side==="左"?"左SH":side==="右"?"右SH":"トップ下";
    return side==="左"?"左SMF":side==="右"?"右SMF":"CMF";
  }
  if(pos==="FW"){
    if(band==="SS") return side==="左"?"左シャドー":side==="右"?"右シャドー":"シャドー";
    return side==="左"?"左WG":side==="右"?"右FW":"CF";
  }
  return "CF";
}
// ポジション群の枠配列を、フォーメーションの分割定義に従って視覚的サブ行へ分割
// 返り値: [{slots:[{slot,idx}], band}] （後列→前列）
function bandRows(pos, rowSlots, f) {
  const split = pos==="MF" ? (f&&f.mfSplit) : pos==="FW" ? (f&&f.fwSplit) : null;
  const indexed = rowSlots.map((slot,idx)=>({slot,idx}));
  if(!split || split.reduce((a,b)=>a+b,0)!==rowSlots.length){
    // 分割なし: 1行（中盤はCMF、前線はFW）
    return [{ items:indexed, band: pos==="MF"?"CM":"FW" }];
  }
  // 分割あり: 後列→前列。MFは [DM, ...CM/AM]、FWは [SS, FW] を想定
  const rows=[]; let cur=0;
  split.forEach((n,li)=>{
    const items=indexed.slice(cur,cur+n); cur+=n;
    let band;
    if(pos==="MF"){
      if(split.length===2) band = li===0?"DM":"AM";
      else band = li===0?"DM":(li===split.length-1?"AM":"CM");
    } else if(pos==="FW"){
      band = li===split.length-1?"FW":"SS";
    } else band="";
    rows.push({items,band});
  });
  return rows;
}
function sideMatches(playerSide, slotSide) {
  const s = playerSide||"";
  if(slotSide==="左") return s.includes("左");
  if(slotSide==="右") return s.includes("右");
  // センター枠: センター適性・未設定・なしの人
  return s.includes("センター")||s===""||s.includes("なし");
}

function assignFormation(players, fKey) {
  const f = FORMATIONS[fKey];
  const counts = f ? { GK:f.gk, DF:f.df, MF:f.mf, FW:f.fw } : { GK:1,DF:4,MF:3,FW:3 };
  const slots = {};
  ["GK","DF","MF","FW"].forEach(pos=>{
    slots[pos] = Array.from({length:counts[pos]}, ()=>[]);
  });
  const used = new Set();
  const prs = [["pos1","side1"],["pos2","side2"],["pos3","side3"]];

  // パス1: サイド適性が枠と一致する空き枠に配置
  prs.forEach(([pr,sr])=>{
    players.forEach(p=>{
      if(used.has(p.id)) return;
      const pos=p[pr]; if(!pos||!slots[pos]) return;
      const sides=slotSides(slots[pos].length);
      const idx=sides.findIndex((s,i)=>slots[pos][i].length===0 && sideMatches(p[sr],s));
      if(idx>=0){ slots[pos][idx].push({...p,_side:p[sr]||""}); used.add(p.id); }
    });
  });
  // パス2: 同ポジションの空き枠ならどこでも配置
  prs.forEach(([pr,sr])=>{
    players.forEach(p=>{
      if(used.has(p.id)) return;
      const pos=p[pr]; if(!pos||!slots[pos]) return;
      const idx=slots[pos].findIndex(sl=>sl.length===0);
      if(idx>=0){ slots[pos][idx].push({...p,_side:p[sr]||""}); used.add(p.id); }
    });
  });
  // パス3: 余りは得意ポジションの枠に重ねる（サイド一致優先・少ない枠優先）
  players.forEach(p=>{
    if(used.has(p.id)) return;
    const i0=[p.pos1,p.pos2,p.pos3].findIndex(Boolean);
    const pos=i0>=0?[p.pos1,p.pos2,p.pos3][i0]:"MF";
    const side=i0>=0?[p.side1,p.side2,p.side3][i0]:"";
    const row=slots[pos]||slots["MF"];
    const sides=slotSides(row.length);
    let best=-1, bestN=Infinity;
    sides.forEach((s,i)=>{ if(sideMatches(side,s)&&row[i].length<bestN){best=i;bestN=row[i].length;} });
    if(best<0){ row.forEach((sl,i)=>{ if(sl.length<bestN){best=i;bestN=sl.length;} }); }
    row[best].push({...p,_side:side||""});
    used.add(p.id);
  });
  return slots;
}

function splitTeams(players) {
  const red=[],white=[];
  // ポジションごとに分け、各チームの人数が少ない方へ優先的に割り当て（人数均等を最優先）
  const order=["GK","DF","MF","FW",""];
  const grouped=[];
  order.forEach(pos=>{
    players.filter(p=>(p.pos1||"")===pos).forEach(p=>grouped.push(p));
  });
  // 念のため未分類（上記に該当しない）も拾う
  players.forEach(p=>{ if(!grouped.includes(p)) grouped.push(p); });
  grouped.forEach(p=>{
    if(red.length<white.length) red.push(p);
    else if(white.length<red.length) white.push(p);
    else red.push(p); // 同数なら紅へ
  });
  return { red, white };
}

// 時間選択（時・分を別スクロール、タッチで12:00から開始）
function TimeSelect({ value, onChange, minuteStep=10, accent=false, required=false, defaultHour=12, allowEmpty=false }) {
  // allowEmpty=true: 未入力を許容（--:--表示・空のまま保存可）。集合時間など任意項目用。
  // allowEmpty=false: 未設定でも defaultHour:00 を「選択中」として表示（チェックがそこに乗る）。
  const dh = defaultHour.toString().padStart(2,"0");
  const empty = !value;
  const [h,m] = value ? value.split(":") : (allowEmpty ? ["",""] : [dh,"00"]);
  const bg = required ? "#fef2f2" : accent ? "#fffbeb" : "#fff";
  const bc = required ? "#fca5a5" : accent ? "#f59e0b" : "#e2e8f0";
  const selStyle = {
    flex:1, minWidth:0, border:`1.5px solid ${bc}`, borderRadius:8,
    padding:"9px 4px", fontSize:15, outline:"none", boxSizing:"border-box",
    background:bg, textAlign:"center", textAlignLast:"center", touchAction:"manipulation"
  };
  const hours = Array.from({length:24},(_,i)=>i.toString().padStart(2,"0"));
  const minutes = Array.from({length:60/minuteStep},(_,i)=>(i*minuteStep).toString().padStart(2,"0"));
  return (
    <div style={{display:"flex",gap:4,alignItems:"center"}}>
      <select style={selStyle} value={h}
        onChange={e=>onChange(e.target.value===""?"":`${e.target.value}:${m||"00"}`)}>
        {allowEmpty&&<option value="">--</option>}
        {hours.map(hh=><option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span style={{fontWeight:700,color:"#64748b"}}>:</span>
      <select style={selStyle} value={m}
        onChange={e=>onChange(`${h||dh}:${e.target.value||"00"}`)}>
        {allowEmpty&&<option value="">--</option>}
        {minutes.map(mm=><option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

function FieldDisplay({ slots: baseSlots, fKey, accentColor, rotPrefix="", slotRot={}, onRotate, canDrag=false, moves=[], onMove }) {
  const [dragPid, setDragPid] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const pressRef = useRef(null);
  const justDraggedRef = useRef(false);
  const ghostRef = useRef(null);
  const hoverKeyRef = useRef(null);

  // ドラッグ中: ghostはrefで直接移動（再レンダリングを避けて滑らかに）、hoverは変化時のみ反映
  useEffect(()=>{
    if(dragPid===null) return;
    let raf=null;
    const onMove=(e)=>{
      const x=e.clientX,y=e.clientY;
      if(ghostRef.current){
        ghostRef.current.style.left=(x-24)+"px";
        ghostRef.current.style.top=(y-54)+"px";
      }
      if(raf) return;
      raf=requestAnimationFrame(()=>{
        raf=null;
        const el=document.elementFromPoint(x,y-34);
        const slotEl=el&&el.closest("[data-slotkey]");
        const k=slotEl?slotEl.getAttribute("data-slotkey"):null;
        if(k!==hoverKeyRef.current){ hoverKeyRef.current=k; setHoverKey(k); }
      });
    };
    const onUp=()=>{ setDragPid(null); hoverKeyRef.current=null; setHoverKey(null); };
    window.addEventListener("pointermove",onMove,{passive:true});
    window.addEventListener("pointerup",onUp);
    return ()=>{
      if(raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove",onMove);
      window.removeEventListener("pointerup",onUp);
    };
  },[dragPid]);

  // スロットをコピーして手動移動を適用
  // 全選手リスト（baseSlotsをフラット化）
  const allPlayers = [];
  ["GK","DF","MF","FW"].forEach(pos=>{ (baseSlots[pos]||[]).forEach(sl=>sl.forEach(p=>allPlayers.push(p))); });
  // 空スロット構造を用意
  const slots = {};
  ["GK","DF","MF","FW"].forEach(pos=>{ slots[pos] = (baseSlots[pos]||[]).map(()=>[]); });
  // moves = [[pid, "POS__si"]] を「絶対配置」として解釈（同じpidは最後の指定が有効）
  const placeMap = {}; // pid -> slotKey
  moves.forEach(([pid,slotKey])=>{ placeMap[pid]=slotKey; });
  const placed = new Set();
  // 1) 明示配置されている選手を先に置く
  allPlayers.forEach(p=>{
    const sk=placeMap[p.id];
    if(!sk) return;
    const [tPos,tSi]=sk.split("__");
    const si=parseInt(tSi);
    if(slots[tPos]&&slots[tPos][si]){ slots[tPos][si].push(p); placed.add(p.id); }
  });
  // 2) 残りは元の自動配置位置へ（既に置かれた人は除く）
  ["GK","DF","MF","FW"].forEach(pos=>{
    (baseSlots[pos]||[]).forEach((sl,si)=>{
      sl.forEach(p=>{ if(!placed.has(p.id)){ slots[pos][si].push(p); placed.add(p.id); } });
    });
  });
  const locate = (pid)=>{
    for(const pos of ["FW","MF","DF","GK"]){
      for(let si=0;si<slots[pos].length;si++){
        const ki=slots[pos][si].findIndex(p=>p.id===pid);
        if(ki>=0) return [pos,si,ki];
      }
    }
    return null;
  };

  const totalPlayers = ["GK","DF","MF","FW"].reduce((a,pos)=>a+slots[pos].reduce((b,sl)=>b+sl.length,0),0);

  const startPress = (e, pid) => {
    if(!canDrag) return;
    const x=e.clientX, y=e.clientY;
    pressRef.current = setTimeout(()=>{
      setDragPid(pid);
      requestAnimationFrame(()=>{ if(ghostRef.current){ ghostRef.current.style.left=(x-24)+"px"; ghostRef.current.style.top=(y-54)+"px"; } });
      if(navigator.vibrate) navigator.vibrate(30);
    }, 350);
  };
  const cancelPress = () => { if(pressRef.current){ clearTimeout(pressRef.current); pressRef.current=null; } };
  const handleUp = (e) => {
    cancelPress();
    if(dragPid!==null){
      const el = document.elementFromPoint(e.clientX, e.clientY-34);
      const slotEl = el && el.closest("[data-slotkey]");
      if(slotEl && onMove){
        const targetKey = slotEl.getAttribute("data-slotkey");
        const loc = locate(dragPid);
        const curKey = loc ? `${loc[0]}__${loc[1]}` : null;
        if(targetKey!==curKey) onMove(dragPid, targetKey);
      }
      justDraggedRef.current = true;
      setTimeout(()=>{ justDraggedRef.current=false; }, 100);
      setDragPid(null);
      setHoverKey(null);
    }
  };

  const f = FORMATIONS[fKey];
  const renderCell = (slot, si, pos, sides, band) => {
    const slotKey=`${pos}__${si}`;
    const rotKey=`${rotPrefix}${pos}-${si}`;
    const label=roleLabel(pos,sides[si],band);
    if(slot.length===0){
      return (
        <div key={slotKey} data-slotkey={slotKey}
          onPointerUp={handleUp}
          style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            borderRadius:7,padding:"5px 8px",minWidth:44,minHeight:48,
            border:hoverKey===slotKey?"2px solid #fbbf24":"1.5px dashed rgba(255,255,255,0.3)",
            userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",
            transition:"background 0.1s",
            background:hoverKey===slotKey?"rgba(251,191,36,0.35)":dragPid!==null?"rgba(255,255,255,0.12)":"transparent" }}>
          <div style={{ fontSize:9,color:"rgba(255,255,255,0.4)",fontWeight:700 }}>{label}</div>
        </div>
      );
    }
    const rot=slotRot[rotKey]||0;
    const cur=slot[rot%slot.length];
    const hasMore=slot.length>1;
    const isDragging=dragPid===cur.id;
    return (
      <div key={slotKey}
        data-slotkey={slotKey}
        onClick={()=>{ if(justDraggedRef.current) return; hasMore&&onRotate&&onRotate(rotKey); }}
        onPointerDown={(e)=>startPress(e,cur.id)}
        onPointerUp={handleUp}
        onPointerCancel={cancelPress}
        style={{ display:"flex",flexDirection:"column",alignItems:"center",
          background:hoverKey===slotKey&&dragPid!==null&&!isDragging?"rgba(251,191,36,0.35)":"rgba(255,255,255,0.13)",
          borderRadius:7,padding:"5px 8px",minWidth:44,
          position:"relative",cursor:hasMore?"pointer":canDrag?"grab":"default",
          border:hoverKey===slotKey&&dragPid!==null&&!isDragging?"2px solid #fbbf24":hasMore?"1.5px dashed rgba(255,255,255,0.4)":"1.5px solid transparent",
          opacity:isDragging?0.3:1,
          transition:"opacity 0.15s, background 0.1s",
          touchAction:canDrag?"none":"auto",
          userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",
          zIndex:1 }}>
        {hasMore&&(
          <div style={{ position:"absolute",top:-6,right:-6,background:"#f59e0b",color:"#fff",
            fontSize:8,fontWeight:800,borderRadius:10,padding:"1px 5px" }}>+{slot.length-1}</div>
        )}
        <div style={{ width:28,height:28,borderRadius:"50%",
          background:accentColor||POS_COLOR[cur.pos1]||"#64748b",
          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12 }}>
          {cur.number}
        </div>
        <div style={{ fontSize:9,color:"#e2e8f0",marginTop:2,textAlign:"center" }}>{cur.name.split(" ")[0]}</div>
        <div style={{ fontSize:7,color:"rgba(255,255,255,0.5)" }}>{label}</div>
      </div>
    );
  };
  const renderRow = (pos) => {
    const row = slots[pos]||[];
    if (!row.length) return null;
    // フォーメーション定義に従って視覚的サブ行へ分割（後列→前列）→表示は上が攻撃側なので逆順
    const subRows = [...bandRows(pos, row, f)].reverse();
    return (
      <div key={pos} style={{ marginBottom:6 }}>
        {subRows.map((sr,ri)=>{
          const sides=slotSides(sr.items.length);
          return (
            <div key={ri} style={{ display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginBottom:ri<subRows.length-1?6:0 }}>
              {sr.items.map((it,localIdx)=>renderCell(it.slot, it.idx, pos, sides, sr.band))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ background:accentColor?`linear-gradient(180deg,${accentColor}22 0%,#15803d 100%)`
      :"linear-gradient(180deg,#166534 0%,#15803d 50%,#16a34a 100%)",
      borderRadius:12,padding:"12px 8px",position:"relative",overflow:"hidden",
      userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none" }}>
      <div style={{ position:"absolute",inset:8,border:"1.5px solid rgba(255,255,255,0.18)",borderRadius:6,pointerEvents:"none" }} />
      <div style={{ position:"absolute",top:"50%",left:8,right:8,height:1,background:"rgba(255,255,255,0.12)",pointerEvents:"none" }} />
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:40,height:40,border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:"50%",pointerEvents:"none" }} />
      <div style={{ position:"relative",zIndex:1 }}>
        {["FW","MF","DF","GK"].map(pos=>renderRow(pos))}
        {totalPlayers===0&&(
          <div style={{ color:"rgba(255,255,255,0.4)",textAlign:"center",padding:24,fontSize:13 }}>出席者がいません</div>
        )}
        {totalPlayers>0&&(
          <div style={{ fontSize:9,color:"rgba(255,255,255,0.5)",textAlign:"center",marginTop:6 }}>
            点線枠（+数字）はタップで選手交代{canDrag?"　/　長押し→移動先で離して配置変更":""}
          </div>
        )}
      </div>
      {/* ドラッグ中: 指に追従するゴースト */}
      {dragPid!==null&&(()=>{
        const loc=locate(dragPid);
        if(!loc) return null;
        const p=slots[loc[0]][loc[1]].find(pl=>pl.id===dragPid);
        if(!p) return null;
        return (
          <div ref={ghostRef} style={{ position:"fixed",left:-999,top:-999,zIndex:1000,
            pointerEvents:"none",transform:"scale(1.25)",willChange:"left,top",
            display:"flex",flexDirection:"column",alignItems:"center",
            background:"rgba(15,23,42,0.85)",borderRadius:9,padding:"6px 9px",
            boxShadow:"0 8px 24px rgba(0,0,0,0.45)",
            border:"2px solid #fbbf24" }}>
            <div style={{ width:28,height:28,borderRadius:"50%",
              background:accentColor||POS_COLOR[p.pos1]||"#64748b",
              display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:12 }}>
              {p.number}
            </div>
            <div style={{ fontSize:9,color:"#fff",marginTop:2 }}>{p.name.split(" ")[0]}</div>
          </div>
        );
      })()}
    </div>
  );
}

// 紅白戦: 2チームを1つのドラッグコンテキストで扱い、チーム内移動＋チーム間移動の両方に対応
function RedWhiteField({ redPlayers, whitePlayers, fKey, canDrag, teamMoves=[], slotMoves=[], onChange, slotRot, onRotate }) {
  const [dragPid, setDragPid] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const pressRef = useRef(null);
  const justDraggedRef = useRef(false);
  const ghostRef = useRef(null);
  const hoverKeyRef = useRef(null);

  const moveMap = {}; teamMoves.forEach(([pid,team])=>{moveMap[pid]=team;});
  const red = [], white = [];
  redPlayers.forEach(p=>{ (moveMap[p.id]==="white"?white:red).push(p); });
  whitePlayers.forEach(p=>{ (moveMap[p.id]==="red"?red:white).push(p); });

  const buildSlots = (players, team) => {
    const s = assignFormation(players, fKey);
    const sm = slotMoves.filter(([,sk])=>sk.startsWith(team+":"));
    const locate=(pid)=>{
      for(const pos of ["FW","MF","DF","GK"]) for(let si=0;si<s[pos].length;si++){
        const ki=s[pos][si].findIndex(p=>p.id===pid); if(ki>=0) return [pos,si,ki];
      } return null;
    };
    sm.forEach(([pid,sk])=>{
      const loc=locate(pid); if(!loc) return;
      const [pos,si,ki]=loc;
      const rest=sk.split(":")[1];
      const [tPos,tSi]=rest.split("__");
      if(!s[tPos]||!s[tPos][parseInt(tSi)]) return;
      const pl=s[pos][si].splice(ki,1)[0];
      s[tPos][parseInt(tSi)].push(pl);
    });
    return s;
  };
  const redSlots = buildSlots(red,"red");
  const whiteSlots = buildSlots(white,"white");
  const allById = {}; [...red,...white].forEach(p=>allById[p.id]=p);
  const teamOf = (pid)=> red.some(p=>p.id===pid)?"red":"white";

  useEffect(()=>{
    if(dragPid===null) return;
    let raf=null;
    const onMove=(e)=>{
      const x=e.clientX,y=e.clientY;
      if(ghostRef.current){ ghostRef.current.style.left=(x-24)+"px"; ghostRef.current.style.top=(y-54)+"px"; }
      if(raf) return;
      raf=requestAnimationFrame(()=>{
        raf=null;
        const el=document.elementFromPoint(x,y-34);
        const slotEl=el&&el.closest("[data-slotkey]");
        const k=slotEl?slotEl.getAttribute("data-slotkey"):null;
        if(k!==hoverKeyRef.current){ hoverKeyRef.current=k; setHoverKey(k); }
      });
    };
    const onUp=()=>{ setDragPid(null); hoverKeyRef.current=null; setHoverKey(null); };
    window.addEventListener("pointermove",onMove,{passive:true});
    window.addEventListener("pointerup",onUp);
    return ()=>{ if(raf)cancelAnimationFrame(raf); window.removeEventListener("pointermove",onMove); window.removeEventListener("pointerup",onUp); };
  },[dragPid]);

  const startPress = (e,pid)=>{
    if(!canDrag) return;
    const x=e.clientX,y=e.clientY;
    pressRef.current=setTimeout(()=>{ setDragPid(pid); requestAnimationFrame(()=>{ if(ghostRef.current){ghostRef.current.style.left=(x-24)+"px";ghostRef.current.style.top=(y-54)+"px";} }); if(navigator.vibrate)navigator.vibrate(30); },350);
  };
  const cancelPress=()=>{ if(pressRef.current){clearTimeout(pressRef.current);pressRef.current=null;} };
  const handleUp=(e)=>{
    cancelPress();
    if(dragPid!==null){
      const el=document.elementFromPoint(e.clientX,e.clientY-34);
      const slotEl=el&&el.closest("[data-slotkey]");
      if(slotEl&&onChange){
        const targetKey=slotEl.getAttribute("data-slotkey");
        const targetTeam=targetKey.split(":")[0];
        const curTeam=teamOf(dragPid);
        onChange(dragPid, curTeam, targetTeam, targetKey);
      }
      justDraggedRef.current=true;
      setTimeout(()=>{justDraggedRef.current=false;},100);
      setDragPid(null); setHoverKey(null);
    }
  };

  const renderTeam = (team, slots, color, label) => {
    const total=["GK","DF","MF","FW"].reduce((a,pos)=>a+slots[pos].reduce((b,sl)=>b+sl.length,0),0);
    return (
      <div style={{ background:`linear-gradient(180deg,${color}22 0%,#15803d 100%)`,
        borderRadius:12,padding:"10px 8px",position:"relative",overflow:"hidden",
        userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none" }}>
        <div style={{fontSize:12,fontWeight:800,color:"#fff",marginBottom:6,textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>{label}（{total}名）</div>
        {["FW","MF","DF","GK"].map(pos=>{
          const row=slots[pos]||[];
          if(!row.length) return null;
          const sides=slotSides(row.length);
          return (
            <div key={pos} style={{marginBottom:6}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",textAlign:"center",marginBottom:3}}>{pos}</div>
              <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap"}}>
                {row.map((slot,si)=>{
                  const slotKey=`${team}:${pos}__${si}`;
                  const rotKey=`${team}-${pos}-${si}`;
                  const label2=roleLabel(pos,sides[si]);
                  const isHover=hoverKey===slotKey&&dragPid!==null;
                  if(slot.length===0){
                    return <div key={si} data-slotkey={slotKey} onPointerUp={handleUp}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",
                      borderRadius:7,padding:"5px 8px",minWidth:40,minHeight:46,
                      border:isHover?"2px solid #fbbf24":"1.5px dashed rgba(255,255,255,0.3)",
                      background:isHover?"rgba(251,191,36,0.35)":dragPid!==null?"rgba(255,255,255,0.12)":"transparent",
                      transition:"background 0.1s"}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",fontWeight:700}}>{label2}</div></div>;
                  }
                  const rot=slotRot[rotKey]||0;
                  const cur=slot[rot%slot.length];
                  const hasMore=slot.length>1;
                  const isDragging=dragPid===cur.id;
                  return (
                    <div key={si} data-slotkey={slotKey}
                      onClick={()=>{ if(justDraggedRef.current)return; hasMore&&onRotate&&onRotate(rotKey); }}
                      onPointerDown={(e)=>startPress(e,cur.id)}
                      onPointerUp={handleUp}
                      onPointerCancel={cancelPress}
                      style={{display:"flex",flexDirection:"column",alignItems:"center",
                        background:isHover&&!isDragging?"rgba(251,191,36,0.35)":"rgba(255,255,255,0.13)",
                        borderRadius:7,padding:"5px 7px",minWidth:40,
                        position:"relative",cursor:hasMore?"pointer":canDrag?"grab":"default",
                        border:isHover&&!isDragging?"2px solid #fbbf24":hasMore?"1.5px dashed rgba(255,255,255,0.4)":"1.5px solid transparent",
                        opacity:isDragging?0.3:1,touchAction:canDrag?"none":"auto",
                        userSelect:"none",WebkitUserSelect:"none"}}>
                      {hasMore&&<div style={{position:"absolute",top:-6,right:-6,background:"#f59e0b",color:"#fff",fontSize:8,fontWeight:800,borderRadius:10,padding:"1px 5px"}}>+{slot.length-1}</div>}
                      <div style={{width:26,height:26,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:11}}>{cur.number}</div>
                      <div style={{fontSize:9,color:"#e2e8f0",marginTop:2,textAlign:"center"}}>{cur.name.split(" ")[0]}</div>
                      <div style={{fontSize:7,color:"rgba(255,255,255,0.5)"}}>{label2}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {total===0&&<div style={{color:"rgba(255,255,255,0.4)",textAlign:"center",padding:20,fontSize:12}}>選手がいません</div>}
      </div>
    );
  };

  return (
    <div>
      {renderTeam("red", redSlots, "#dc2626", "🔴 紅チーム")}
      <div style={{height:10}}/>
      {renderTeam("white", whiteSlots, "#475569", "⚪ 白チーム")}
      {canDrag&&<div style={{fontSize:10,color:"#94a3b8",textAlign:"center",marginTop:8}}>選手を長押し→枠で離すと配置変更／相手チームの枠で離すとチーム移動</div>}
      {dragPid!==null&&allById[dragPid]&&(
        <div ref={ghostRef} style={{position:"fixed",left:-999,top:-999,zIndex:1000,pointerEvents:"none",transform:"scale(1.25)",willChange:"left,top",
          display:"flex",flexDirection:"column",alignItems:"center",background:"rgba(15,23,42,0.85)",borderRadius:9,padding:"6px 9px",
          boxShadow:"0 8px 24px rgba(0,0,0,0.45)",border:"2px solid #fbbf24"}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:teamOf(dragPid)==="red"?"#dc2626":"#475569",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:11}}>{allById[dragPid].number}</div>
          <div style={{fontSize:9,color:"#fff",marginTop:2}}>{allById[dragPid].name.split(" ")[0]}</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("schedule");
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Supabaseからデータ読み込み ──
  const draggingRef = useRef(false);
  const lastLocalSaveRef = useRef(0); // 自分が保存した直後はリアルタイム反映で上書きしない
  const lastLoadTimeRef = useRef(Date.now());
  const lastLoadDateRef = useRef("");
  const jstDateStr = (d=new Date()) => {
    // 日本時間(UTC+9)での YYYY-MM-DD（端末のタイムゾーンに依存しない）
    const jst = new Date(d.getTime() + 9*60*60000);
    return jst.toISOString().slice(0,10);
  };
  const loadAll = async () => {
    const [m,e,a,an,s,ph] = await Promise.all([
      supabase.from("members").select("*").order("number"),
      supabase.from("events").select("*").order("date"),
      supabase.from("attendance").select("*"),
      supabase.from("announcements").select("*").order("id",{ascending:false}),
      supabase.from("settings").select("*").eq("id",1).single(),
      supabase.from("place_history").select("*").order("created_at",{ascending:false}),
    ]);
    if(ph.data) setPlaceHistory(ph.data.map(r=>({id:r.id,place:r.place,mapUrl:r.map_url||""})));
    if(m.data){
      const mp=(r)=>({id:r.id,name:r.name,number:r.number,
        pos1:r.pos1||"",pos2:r.pos2||"",pos3:r.pos3||"",
        side1:r.side1||"",side2:r.side2||"",side3:r.side3||""});
      if(Date.now()-lastLocalSaveRef.current > 2500){
        setMembers(m.data.filter(r=>!r.deleted).map(mp));
        setTrashMembers(m.data.filter(r=>r.deleted).map(mp));
      }
    }
    if(e.data){
      const ep=(r)=>({id:r.id,type:r.type,title:r.title,date:r.date,
        timeFrom:r.time_from||"",timeTo:r.time_to||"",meetTime:r.meet_time||"",
        place:r.place||"",mapUrl:r.map_url||"",note:r.note||"",
        playerCount:r.player_count||11,deadline:r.deadline||"",deadlineTime:r.deadline_time||"",
        uniform:r.uniform||"",formation:r.formation||""});
      const freshEvents=e.data.filter(r=>!r.deleted).map(ep);
      if(Date.now()-lastLocalSaveRef.current > 2500){
        setEvents(freshEvents);
        setTrashEvents(e.data.filter(r=>r.deleted).map(ep));
      }
      // 管理者が保存した配置（手動移動）を復元
      // 自分が直近2.5秒以内に保存した場合は、リアルタイムechoによる巻き戻りを防ぐためスキップ
      if(Date.now()-lastLocalSaveRef.current > 2500){
        const fs={};
        e.data.forEach(r=>{
          if(r.field_moves){
            try{
              const obj=JSON.parse(r.field_moves);
              Object.entries(obj).forEach(([k,v])=>{ fs[`${r.id}|${k}`]=v; });
            }catch(err){}
          }
        });
        setFieldSwaps(fs);
      }
    }
    if(a.data){
      const att={};
      a.data.forEach(r=>{
        if(!att[r.event_id]) att[r.event_id]={};
        att[r.event_id][r.member_id]={status:r.status||"未回答",decideBy:r.decide_by||"",comment:r.comment||""};
      });
      setAttendance(att);
    }
    if(an.data){
      const ap=(r)=>({id:r.id,date:r.date,title:r.title,body:r.body});
      if(Date.now()-lastLocalSaveRef.current > 2500){
        setAnnouncements(an.data.filter(r=>!r.deleted).map(ap));
        setTrashAnns(an.data.filter(r=>r.deleted).map(ap));
      }
    }
    if(s.data){
      setTeamName(s.data.team_name||"チームマネージャー");
      setTeamOrigin(s.data.team_origin||"COMPANERO_DEFAULT");
      setLogoUrl(s.data.logo_url||null);
      setAdmins((s.data.admins||"").split(",").filter(Boolean));
    }
    lastLoadTimeRef.current = Date.now();
    lastLoadDateRef.current = jstDateStr();
    setLoading(false);
  };

  useEffect(()=>{
    loadAll();
    // 前回のログインを復元
    const saved=localStorage.getItem("teamapp_user");
    if(saved){
      setCurrentUser(saved==="manager"?"manager":parseInt(saved));
      setShowLogin(false);
    }
    setSelectedEventId(null);
    const onFocus=()=>{
      // 日付をまたいだ、または前回ロードから5分以上経過していたら、
      // 一旦スプラッシュを出してから読み込み直す（経過予定のチラ見え防止）
      const now=Date.now();
      const dateChanged = lastLoadDateRef.current && lastLoadDateRef.current!==jstDateStr();
      const longGap = now-lastLoadTimeRef.current > 5*60*1000;
      if(dateChanged || longGap){ setLoading(true); }
      loadAll();
    };
    window.addEventListener("focus",onFocus);
    document.addEventListener("visibilitychange",()=>{ if(!document.hidden) onFocus(); });
    // リアルタイム購読: 誰かがDBを変更したら全員が自動で最新に
    const channel = supabase
      .channel("teamapp-changes")
      .on("postgres_changes",{event:"*",schema:"public",table:"events"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"attendance"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"members"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"announcements"},()=>loadAll())
      .on("postgres_changes",{event:"*",schema:"public",table:"settings"},()=>loadAll())
      .subscribe();
    return ()=>{ window.removeEventListener("focus",onFocus); supabase.removeChannel(channel); };
  },[]);

  const saveSettings = async (patch) => {
    await supabase.from("settings").update(patch).eq("id",1);
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [teamName, setTeamName] = useState("チームマネージャー");
  const [logoUrl, setLogoUrl] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [teamOrigin, setTeamOrigin] = useState("");
  const [editTeamOrigin, setEditTeamOrigin] = useState("");
  const [showOrigin, setShowOrigin] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const logoInputRef = useRef();

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [formationEvId, setFormationEvId] = useState(1);
  const [slotRot, setSlotRot] = useState({});
  const rotateSlot = (key) => setSlotRot(p=>({...p,[key]:(p[key]||0)+1}));
  const [fieldSwaps, setFieldSwaps] = useState({});
  const [formationSel, setFormationSel] = useState({});
  const persistMoves = async (evId, all) => {
    // 管理者の配置のみDBに保存
    if(currentUser!=="manager") return;
    lastLocalSaveRef.current = Date.now();
    const obj={};
    Object.entries(all).forEach(([k,v])=>{
      if(k.startsWith(`${evId}|`)) obj[k.slice(`${evId}|`.length)]=v;
    });
    const { error } = await supabase.from("events").update({field_moves:JSON.stringify(obj)}).eq("id",evId);
    if(error){ alert("配置の保存に失敗しました: "+error.message); }
  };
  const addSwap = (key,pid,slotKey) => setFieldSwaps(p=>{
    // 同じ選手の過去の配置指定を除去してから新しい位置を追加（絶対配置・最新優先）
    const cur=(p[key]||[]).filter(([id])=>id!==pid);
    const next={...p,[key]:[...cur,[pid,slotKey]]};
    persistMoves(parseInt(key.split("|")[0]), next);
    return next;
  });
  const selectFormation = async (evId,k) => {
    setFormationSel(p=>({...p,[evId]:k}));
    if(currentUser==="manager"){
      lastLocalSaveRef.current = Date.now();
      setEvents(p=>p.map(e=>e.id===evId?{...e,formation:k}:e));
      const { error } = await supabase.from("events").update({formation:k}).eq("id",evId);
      if(error){ alert("フォーメーションの保存に失敗しました: "+error.message); }
    }
  };
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [showMemberDetail, setShowMemberDetail] = useState(null);
  const [showReminder, setShowReminder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editMemberId, setEditMemberId] = useState(null);
  const [attModal, setAttModal] = useState(null);
  const [showPositionPrompt, setShowPositionPrompt] = useState(false);

  const blankMember = { name:"",number:"" };
  const blankEvent  = { type:"match",title:"",date:"",timeFrom:"12:00",timeTo:"14:00",place:"",mapUrl:"",note:"",playerCount:11,deadline:"",deadlineTime:"",meetTime:"",uniform:"" };
  const blankAnn    = { title:"",body:"" };
  const blankPos    = { pos1:"",pos2:"",pos3:"",side1:"",side2:"",side3:"" };
  const [newMember, setNM] = useState(blankMember);
  const [newEvent,  setNE] = useState(blankEvent);
  const [newAnn,    setNA] = useState(blankAnn);
  const [editData,  setED] = useState({...blankMember,...blankPos});
  const [posData,   setPD] = useState(blankPos);
  const [placeHistory, setPlaceHistory] = useState([]);
  const [showReqError, setShowReqError] = useState(false);
  const [trashEvents, setTrashEvents] = useState([]);
  const [trashMembers, setTrashMembers] = useState([]);
  const [trashAnns, setTrashAnns] = useState([]);
  const [showTrash, setShowTrash] = useState(false);

  const isManager = currentUser === "manager";
  const TABS = [
    {key:"schedule",label:"📅 日程"},
    {key:"formation",label:"⚽ フォーメーション"},
    {key:"members",label:"👥 メンバー"},
  ];
  const todayStr = jstDateStr();
  const weekEndStr = (()=>{ const now=new Date(); const jst=new Date(now.getTime()+9*60*60000); const diff=7-jst.getUTCDay(); jst.setUTCDate(jst.getUTCDate()+diff); return jst.toISOString().slice(0,10); })();
  const isToday = (ev)=>ev.date===todayStr;
  const isThisWeek = (ev)=>ev.date>todayStr&&ev.date<=weekEndStr;
  const sortedEvents = [...events]
    .filter(ev => ev.date >= todayStr)
    .sort((a,b)=>a.date.localeCompare(b.date));
  // 自分が未回答の予定数（提案2）
  const myUnanswered = (!isManager&&currentUser)
    ? sortedEvents.filter(ev=>(attendance[ev.id]?.[currentUser]?.status||"未回答")==="未回答").length
    : 0;
  const getAtt = (evId,mId) => attendance[evId]?.[mId]||{status:"未回答"};
  const getByStatus = (evId,st) => members.filter(m=>getAtt(evId,m.id).status===st);
  const setAttStatus = async (evId,mId,status,extra={}) => {
    setAttendance(p=>({...p,[evId]:{...p[evId],[mId]:{status,...extra}}}));
    await supabase.from("attendance").upsert({
      event_id:evId, member_id:mId, status,
      decide_by:extra.decideBy||"", comment:extra.comment||""
    });
  };

  const today = jstDateStr();
  const now = new Date();
  const getDeadlineDt = (ev) => {
    if(!ev.deadline) return null;
    const dt = new Date(`${ev.deadline}T${ev.deadlineTime||"23:59"}:00`);
    return dt;
  };
  const isDeadlineSoon = (ev) => {
    const dt=getDeadlineDt(ev);
    if(!dt) return false;
    return dt>now && dt<=new Date(Date.now()+2*86400000);
  };
  const isDeadlinePast = (ev) => {
    const dt=getDeadlineDt(ev);
    if(!dt) return false;
    return dt<now;
  };

  const addMember = async () => {
    if(!newMember.name||!newMember.number) return;
    const id=Math.max(...members.map(m=>m.id),0)+1;
    const row={...blankPos,name:newMember.name,id,number:parseInt(newMember.number)};
    setMembers(p=>[...p,row]);
    setNM(blankMember); setShowAddMember(false);
    await supabase.from("members").insert({id,name:row.name,number:row.number});
  };
  const saveMember = async data => {
    const upd={...data,number:parseInt(data.number)};
    setMembers(p=>p.map(m=>m.id===editMemberId?{...m,...upd}:m));
    const id=editMemberId;
    setEditMemberId(null); setShowMemberDetail(null);
    await supabase.from("members").update({
      name:upd.name,number:upd.number,
      pos1:upd.pos1||"",pos2:upd.pos2||"",pos3:upd.pos3||"",
      side1:upd.side1||"",side2:upd.side2||"",side3:upd.side3||""
    }).eq("id",id);
  };
  const deleteMember = async id => {
    lastLocalSaveRef.current = Date.now();
    const m=members.find(x=>x.id===id);
    setMembers(p=>p.filter(x=>x.id!==id));
    if(m) setTrashMembers(p=>[m,...p]);
    await supabase.from("members").update({deleted:true}).eq("id",id);
    lastLocalSaveRef.current = Date.now();
  };
  const savePosition = async () => {
    if(!currentUser||isManager) return;
    setMembers(p=>p.map(m=>m.id===currentUser?{...m,...posData}:m));
    setShowPositionPrompt(false);
    await supabase.from("members").update({
      pos1:posData.pos1||"",pos2:posData.pos2||"",pos3:posData.pos3||"",
      side1:posData.side1||"",side2:posData.side2||"",side3:posData.side3||""
    }).eq("id",currentUser);
  };
  const addPlaceHistory = async (place, mapUrl="") => {
    if(!place) return;
    // 既存と重複しなければ追加、最大10件に保つ
    if(placeHistory.some(h=>h.place===place)){
      // 既存のmapUrlを更新
      if(mapUrl){
        const ex=placeHistory.find(h=>h.place===place);
        await supabase.from("place_history").update({map_url:mapUrl}).eq("id",ex.id);
        setPlaceHistory(p=>p.map(h=>h.place===place?{...h,mapUrl}:h));
      }
      return;
    }
    const {data}=await supabase.from("place_history").insert({place,map_url:mapUrl}).select().single();
    if(data){
      let next=[{id:data.id,place,mapUrl},...placeHistory];
      // 10件超は古いものを削除
      if(next.length>10){
        const removed=next.slice(10);
        next=next.slice(0,10);
        removed.forEach(r=>supabase.from("place_history").delete().eq("id",r.id));
      }
      setPlaceHistory(next);
    }
  };
  const deletePlaceHistory = async (id) => {
    setPlaceHistory(p=>p.filter(h=>h.id!==id));
    await supabase.from("place_history").delete().eq("id",id);
  };
  const eventToRow = (ev) => ({
    type:ev.type, title:ev.title, date:ev.date,
    time_from:ev.timeFrom||"", time_to:ev.timeTo||"", meet_time:ev.meetTime||"",
    place:ev.place||"", map_url:ev.mapUrl||"", note:ev.note||"",
    player_count:ev.playerCount||11, deadline:ev.deadline||"", deadline_time:ev.deadlineTime||"",
    uniform:ev.uniform||""
  });
  const addEvent = async () => {
    // 必須: 種別・タイトル・日付・開始・終了・場所
    if(!newEvent.type||!newEvent.title||!newEvent.date||!newEvent.timeFrom||!newEvent.timeTo||!newEvent.place){
      setShowReqError(true);
      // モーダル内を最上部へスクロール
      setTimeout(()=>{const mb=document.getElementById("event-mbox"); if(mb) mb.scrollTo({top:0,behavior:"smooth"});},0);
      return;
    }
    setShowReqError(false);
    if(newEvent.place) addPlaceHistory(newEvent.place, newEvent.mapUrl||"");
    if(editEventId){
      setEvents(p=>p.map(e=>e.id===editEventId?{...newEvent,id:editEventId}:e));
      const id=editEventId;
      setNE(blankEvent); setEditEventId(null); setShowAddEvent(false);
      await supabase.from("events").update(eventToRow(newEvent)).eq("id",id);
    } else {
      const draft={...newEvent};
      setNE(blankEvent); setEditEventId(null); setShowAddEvent(false);
      const {data} = await supabase.from("events").insert(eventToRow(draft)).select().single();
      if(data) setEvents(p=>[...p,{...draft,id:data.id}]);
    }
  };
  const deleteEvent = async id => {
    lastLocalSaveRef.current = Date.now();
    const e=events.find(x=>x.id===id);
    setEvents(p=>p.filter(x=>x.id!==id));
    if(e) setTrashEvents(p=>[e,...p]);
    await supabase.from("events").update({deleted:true}).eq("id",id);
    lastLocalSaveRef.current = Date.now();
  };
  const addAnn = async () => {
    if(!newAnn.title) return;
    const date=jstDateStr();
    const draft={...newAnn,date};
    setNA(blankAnn); setShowAddAnn(false);
    const {data} = await supabase.from("announcements").insert({date,title:draft.title,body:draft.body}).select().single();
    if(data) setAnnouncements(p=>[{...draft,id:data.id},...p]);
  };
  const deleteAnn = async id => {
    lastLocalSaveRef.current = Date.now();
    const a=announcements.find(x=>x.id===id);
    setAnnouncements(p=>p.filter(x=>x.id!==id));
    if(a) setTrashAnns(p=>[a,...p]);
    await supabase.from("announcements").update({deleted:true}).eq("id",id);
    lastLocalSaveRef.current = Date.now();
  };
  // ── 復元・完全削除 ──
  const restoreEvent = async (e)=>{ lastLocalSaveRef.current=Date.now(); setTrashEvents(p=>p.filter(x=>x.id!==e.id)); setEvents(p=>[...p,e]); await supabase.from("events").update({deleted:false}).eq("id",e.id); lastLocalSaveRef.current=Date.now(); };
  const restoreMember = async (m)=>{ lastLocalSaveRef.current=Date.now(); setTrashMembers(p=>p.filter(x=>x.id!==m.id)); setMembers(p=>[...p,m]); await supabase.from("members").update({deleted:false}).eq("id",m.id); lastLocalSaveRef.current=Date.now(); };
  const restoreAnn = async (a)=>{ lastLocalSaveRef.current=Date.now(); setTrashAnns(p=>p.filter(x=>x.id!==a.id)); setAnnouncements(p=>[a,...p]); await supabase.from("announcements").update({deleted:false}).eq("id",a.id); lastLocalSaveRef.current=Date.now(); };
  const purgeEvent = async (id)=>{ if(!window.confirm("完全に削除します。元に戻せません。よろしいですか？"))return; lastLocalSaveRef.current=Date.now(); setTrashEvents(p=>p.filter(x=>x.id!==id)); await supabase.from("events").delete().eq("id",id); lastLocalSaveRef.current=Date.now(); };
  const purgeMember = async (id)=>{ if(!window.confirm("完全に削除します。元に戻せません。よろしいですか？"))return; lastLocalSaveRef.current=Date.now(); setTrashMembers(p=>p.filter(x=>x.id!==id)); await supabase.from("members").delete().eq("id",id); lastLocalSaveRef.current=Date.now(); };
  const purgeAnn = async (id)=>{ if(!window.confirm("完全に削除します。元に戻せません。よろしいですか？"))return; lastLocalSaveRef.current=Date.now(); setTrashAnns(p=>p.filter(x=>x.id!==id)); await supabase.from("announcements").delete().eq("id",id); lastLocalSaveRef.current=Date.now(); };
  const typeLabel = (t)=> t==="match"?"試合":t==="紅白戦"?"紅白戦":t==="助っ人"?"助っ人募集":"練習";
  // 簡潔なLINE告知文（予定作成・周知用）
  const announceText = (ev) => {
    if(!ev) return "";
    const d=new Date(ev.date+"T00:00:00");
    const wd=["日","月","火","水","木","金","土"][d.getDay()];
    const md=`${parseInt(ev.date.slice(5,7))}/${parseInt(ev.date.slice(8,10))}(${wd})`;
    const time=ev.timeFrom?`${ev.timeFrom}${ev.timeTo?`〜${ev.timeTo}`:""}`:"";
    const lines=[];
    lines.push(`【${typeLabel(ev.type)}】${ev.title}`);
    lines.push(`📅 ${md}${time?` ${time}`:""}`);
    if(ev.meetTime) lines.push(`🕐 集合 ${ev.meetTime}`);
    if(ev.place) lines.push(`📍 ${ev.place}`);
    if(ev.uniform) lines.push(`👕 ${ev.uniform.split(",").join("・")}`);
    if(ev.deadline) lines.push(`⏰ 回答期限 ${parseInt(ev.deadline.slice(5,7))}/${parseInt(ev.deadline.slice(8,10))}${ev.deadlineTime?` ${ev.deadlineTime}`:""}`);
    lines.push("");
    lines.push("アプリから出欠の入力をお願いします🙏");
    return lines.join("\n");
  };
  const reminderText = evId => {
    const ev=events.find(e=>e.id===evId);
    const unans=getByStatus(evId,"未回答");
    if(!ev) return "";
    return `【出欠確認リマインド】\n📅 ${ev.date.slice(5).replace("-","/")} ${ev.timeFrom}〜${ev.timeTo} ${ev.title}\n${ev.meetTime?`🕐 集合: ${ev.meetTime}\n`:""}${ev.uniform?`👕 ユニフォーム: ${ev.uniform.split(",").join("・")}\n`:""}📍 ${ev.place}\n⏰ 回答期限: ${ev.deadline?(ev.deadline.slice(5).replace("-","/")+' '+( ev.deadlineTime||"")):"未設定"}\n\n以下のメンバーがまだ未回答です：\n${unans.map(m=>`・${m.name}`).join("\n")}\n\nご回答よろしくお願いします！`;
  };
  const handleCopy = txt => {
    navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2200);});
  };
  const handleLogoUpload = e => {
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=ev=>{
      setLogoUrl(ev.target.result);
      saveSettings({logo_url:ev.target.result});
    };
    r.readAsDataURL(file);
  };

  const S = {
    app:  {fontFamily:"'Helvetica Neue',Arial,sans-serif",maxWidth:430,margin:"0 auto",background:"#f1f5f9",minHeight:"100vh"},
    hdr:  {background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",color:"#fff",padding:"14px 16px 0",position:"sticky",top:0,zIndex:100},
    hdrTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},
    tabs: {display:"flex"},
    tab:a=>({flex:1,padding:"8px 2px",textAlign:"center",fontSize:11,fontWeight:a?800:600,
      color:a?"#0f172a":"#cbd5e1",background:a?"#fff":"rgba(255,255,255,0.08)",
      border:"none",borderRadius:8,cursor:"pointer",transition:"all 0.15s",
      boxShadow:a?"0 2px 6px rgba(0,0,0,0.25)":"none"}),
    body: {padding:"14px",paddingBottom:32},
    card: {background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"},
    badge:t=>({display:"inline-block",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,marginRight:5,
      background:t==="match"?"#dbeafe":t==="紅白戦"?"#fce7f3":t==="助っ人"?"#ffedd5":"#dcfce7",
      color:t==="match"?"#1d4ed8":t==="紅白戦"?"#be185d":t==="助っ人"?"#c2410c":"#15803d"}),
    btn:     {background:"#1e3a5f",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",touchAction:"manipulation"},
    btnSm:   {background:"#1e3a5f",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",touchAction:"manipulation"},
    btnGhost:{background:"none",border:"1.5px solid #e2e8f0",color:"#475569",borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"},
    btnLine: {background:"#06C755",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer"},
    inp:  {width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box"},
    sel:  {width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box",background:"#fff"},
    lbl:  {fontSize:12,color:"#64748b",fontWeight:600,marginBottom:4,display:"block"},
    modal:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"flex-end"},
    mbox: {background:"#fff",borderRadius:"16px 16px 0 0",padding:20,width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"88vh",overflowY:"auto"},
    row:  {display:"flex",gap:8,marginBottom:10},
  };
  const reqLbl = {fontSize:12,color:"#dc2626",fontWeight:700,marginBottom:4,display:"block"};
  const reqStyle = (val) => ({
    width:"100%",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box",
    background:val?"#fff":"#fef2f2",
    border:`1.5px solid ${val?"#e2e8f0":"#fca5a5"}`
  });

  // ── ログイン ─────────────────────────────────────────
  // 初回データ読込中はスプラッシュ表示（デフォルト名・⚽のチラ見え防止）
  if (loading) return (
    <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#1a1a1c"}}>
      <div style={{width:48,height:48,border:"4px solid rgba(255,255,255,0.2)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
    </div>
  );
  if (showLogin) return (
    <div style={{...S.app,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,minHeight:"100vh"}}>
      {logoUrl?<img src={logoUrl} alt="logo" style={{width:64,height:64,borderRadius:12,objectFit:"cover",marginBottom:8}}/>
        :<div style={{fontSize:52,marginBottom:8}}>⚽</div>}
      <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:4}}>{teamName}</div>
      <div style={{fontSize:13,color:"#94a3b8",marginBottom:10}}>Team Manager</div>
      {(()=>{
        const origin=teamOrigin==="COMPANERO_DEFAULT"?"「companero（コンパネーロ）」とは、スペイン語で「仲間」「同志」を意味する言葉です。マコさんの仲間・同志が集うチームでありたいという想いを込めて、「マコさん」の頭文字「Ma」と、仲間・同志を表す「companero」を組み合わせ、「Ma.companero FC」と名付けました。":teamOrigin;
        if(!origin) return <div style={{marginBottom:28}}/>;
        return (
          <div style={{maxWidth:380,marginBottom:24}}>
            <button onClick={()=>setShowOrigin(v=>!v)}
              style={{background:"none",border:"none",color:"#3b82f6",fontSize:12,cursor:"pointer",textDecoration:"underline"}}>
              {showOrigin?"チーム名の由来を閉じる":"ℹ️ チーム名の由来"}
            </button>
            {showOrigin&&(
              <div style={{marginTop:8,fontSize:12,color:"#64748b",lineHeight:1.7,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"12px 14px",textAlign:"left"}}>
                {origin}
              </div>
            )}
          </div>
        );
      })()}
      <div style={{width:"100%",maxWidth:380}}>
        {/* 管理者 */}
        <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:8}}>▼ 管理者としてログイン</div>
        {admins.map((name,i)=>(
          <div key={i} style={{...S.card,cursor:"pointer",borderLeft:"4px solid #f59e0b",marginBottom:8,display:"flex",alignItems:"center",gap:10}}
            onClick={()=>{setCurrentUser("manager");localStorage.setItem("teamapp_user","manager");setShowLogin(false);setTab("schedule");setSelectedEventId(null);setFormationSel({});setTimeout(()=>window.scrollTo({top:0}),0);}}>
            <span style={{fontSize:18}}>👑</span>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{name}</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>管理者</div>
            </div>
          </div>
        ))}
        {/* 選手 */}
        <div style={{fontSize:12,fontWeight:700,color:"#64748b",margin:"16px 0 8px"}}>▼ 選手としてログイン</div>
        {members.map(m=>{
          const noPos = !m.pos1;
          return (
            <div key={m.id} style={{...S.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8}}
              onClick={()=>{
                setCurrentUser(m.id);
                setFormationSel({});
                if(noPos){ setPD({pos1:"",pos2:"",pos3:"",side1:"",side2:"",side3:""}); setShowPositionPrompt(true); }
                localStorage.setItem("teamapp_user",String(m.id));
                setShowLogin(false);
                setTab("schedule");
                setSelectedEventId(null);
                setTimeout(()=>window.scrollTo({top:0}),0);
              }}>
              <div style={{width:36,height:36,borderRadius:"50%",background:m.pos1?POS_COLOR[m.pos1]:"#94a3b8",color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{m.number}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{m.name}</div>
                <div style={{fontSize:11,color:noPos?"#f59e0b":"#94a3b8"}}>
                  {noPos?"⚠️ ポジション未入力":(`${m.pos1}${m.side1?`(${m.side1})`:""}${m.pos2?` / ${m.pos2}${m.side2?`(${m.side2})`:""}`:""}`)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const currentMember = members.find(m=>m.id===currentUser);

  // ── ポジション入力促しモーダル ──────────────────────
  const PositionPrompt = () => {
    if(!showPositionPrompt) return null;
    return (
      <div style={S.modal}>
        <div style={S.mbox}>
          <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>⚽ ポジションを入力してください</div>
          <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>
            あなたのポジション適性を登録しましょう。フォーメーションの自動作成に使われます。
          </div>
          {[["pos1","side1","第1（必須）"],["pos2","side2","第2"],["pos3","side3","第3"]].map(([pKey,sKey,label])=>(
            <div key={pKey} style={{marginBottom:12,padding:"10px 12px",background:"#f8fafc",borderRadius:10}}>
              <label style={S.lbl}>{label}ポジション</label>
              <select style={{...S.sel,marginBottom:8}} value={posData[pKey]||""} onChange={e=>setPD(p=>({...p,[pKey]:e.target.value}))}>
                <option value="">{pKey==="pos1"?"選択してください":"なし"}</option>
                {POSITIONS.map(pos=><option key={pos}>{pos}</option>)}
              </select>
              {posData[pKey]&&posData[pKey]!=="GK"&&(
                <div style={{display:"flex",gap:6}}>
                  {["なし",...SIDES].map(s=>{
                    const sel=(posData[sKey]||"").split(",").filter(Boolean);
                    const checked=sel.includes(s);
                    const toggle=()=>{
                      let next;
                      if(s==="なし"){ next=checked?[]:["なし"]; }
                      else { next=checked?sel.filter(x=>x!==s):[...sel.filter(x=>x!=="なし"),s]; }
                      setPD(p=>({...p,[sKey]:next.join(",")}));
                    };
                    return (
                      <label key={s} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                        border:`1.5px solid ${checked?"#3b82f6":"#e2e8f0"}`,borderRadius:8,padding:"6px 2px",
                        cursor:"pointer",background:checked?"#eff6ff":"#fff",fontSize:11,fontWeight:checked?700:400}}>
                        <input type="checkbox" checked={checked} onChange={toggle} style={{display:"none"}}/>
                        {s}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.btn,flex:1}} onClick={savePosition}>登録する</button>
            <button style={{...S.btnGhost,flex:1}} onClick={()=>setShowPositionPrompt(false)}>あとで入力</button>
          </div>
        </div>
      </div>
    );
  };

  // ── 出欠変更モーダル ─────────────────────────────────
  const AttModal = () => {
    if(!attModal) return null;
    const {evId,memberId}=attModal;
    const ev=events.find(e=>e.id===evId);
    const m=members.find(mb=>mb.id===memberId);
    const cur=getAtt(evId,memberId);
    const [sel,setSel]=useState(cur.status==="未回答"?"出席":cur.status);
    const [decideBy,setDecideBy]=useState(cur.decideBy||"");
    const [comment,setComment]=useState(cur.comment||"");
    const save=()=>{
      const extra={};
      if(sel==="検討中"&&decideBy) extra.decideBy=decideBy;
      if(comment.trim()) extra.comment=comment.trim();
      setAttStatus(evId,memberId,sel,extra);
      setAttModal(null);
    };
    return (
      <div style={S.modal} onClick={()=>setAttModal(null)}>
        <div style={S.mbox} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>出欠を入力</div>
          <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>
            {m?.name}　{ev?.title}（{ev?.date.slice(5).replace("-","/")}）
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {["出席","欠席","検討中","療養中"].map(st=>(
              <label key={st} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
                borderRadius:10,border:`2px solid ${sel===st?ATT_COLOR[st]:"#e2e8f0"}`,
                background:sel===st?ATT_BG[st]:"#fff",cursor:"pointer"}}>
                <input type="radio" name="att" checked={sel===st} onChange={()=>setSel(st)} style={{display:"none"}}/>
                <span style={{fontSize:20}}>{ATT_ICON[st]}</span>
                <div>
                  <div style={{fontWeight:700,color:ATT_COLOR[st],fontSize:14}}>{st}</div>
                  {st==="検討中"&&<div style={{fontSize:11,color:"#94a3b8"}}>決定予定日を入力してください</div>}
                  {st==="療養中"&&<div style={{fontSize:11,color:"#94a3b8"}}>体調回復をお待ちしています🙏</div>}
                </div>
              </label>
            ))}
          </div>
          {sel==="検討中"&&(
            <div style={{marginBottom:12}}>
              <label style={S.lbl}>⏰ いつまでに決まりますか？</label>
              <input style={{...S.inp,borderColor:"#f59e0b"}} type="date" value={decideBy} onChange={e=>setDecideBy(e.target.value)}/>
            </div>
          )}
          <div style={{marginBottom:16}}>
            <label style={S.lbl}>💬 コメント（任意）</label>
            <input style={S.inp} placeholder="例: 仕事が早く終われば行けます" value={comment} onChange={e=>setComment(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.btn,flex:1}} onClick={save}>保存する</button>
            <button style={{...S.btnGhost,flex:1}} onClick={()=>setAttModal(null)}>キャンセル</button>
          </div>
        </div>
      </div>
    );
  };

  // ── 出欠グループ ─────────────────────────────────────
  const AttGroup = ({evId,status}) => {
    const group=getByStatus(evId,status);
    if(!group.length) return null;
    return (
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,fontWeight:700,color:ATT_COLOR[status],marginBottom:6}}>
          {ATT_ICON[status]} {status}（{group.length}名）
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {group.map(m=>{
            const att=getAtt(evId,m.id);
            const canEdit=isManager||currentUser===m.id;
            return (
              <div key={m.id} onClick={()=>canEdit&&setAttModal({evId,memberId:m.id})}
                style={{display:"flex",flexDirection:"column",gap:2,background:ATT_BG[status],
                  border:`1.5px solid ${ATT_COLOR[status]}`,borderRadius:10,padding:"6px 10px",
                  cursor:canEdit?"pointer":"default",opacity:canEdit?1:0.8}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:m.pos1?POS_COLOR[m.pos1]:"#94a3b8",
                    color:"#fff",fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{m.number}</div>
                  <span style={{fontSize:12,fontWeight:600}}>{m.name}</span>
                  {!canEdit&&<span style={{fontSize:9,color:"#cbd5e1"}}>🔒</span>}
                </div>
                {status==="検討中"&&att.decideBy&&(
                  <div style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>📅 {att.decideBy.slice(5).replace("-","/")}までに決定</div>
                )}
                {att.comment&&(
                  <div style={{fontSize:10,color:"#64748b",marginTop:1}}>💬 {att.comment}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── メンバーフォーム（編集用・フル） ─────────────────
  const MemberFormFull = ({data,setData,onSave,onCancel,title}) => (
    <div>
      <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>{title}</div>
      <div style={S.row}>
        <div style={{flex:2}}>
          <label style={S.lbl}>名前</label>
          <input style={S.inp} value={data.name} onChange={e=>setData(p=>({...p,name:e.target.value}))}/>
        </div>
        <div style={{flex:1}}>
          <label style={S.lbl}>背番号</label>
          <input style={S.inp} type="number" value={data.number} onChange={e=>setData(p=>({...p,number:e.target.value}))}/>
        </div>
      </div>
      {[["pos1","side1","第1"],["pos2","side2","第2"],["pos3","side3","第3"]].map(([pKey,sKey,label])=>(
        <div key={pKey} style={{marginBottom:12,padding:"10px 12px",background:"#f8fafc",borderRadius:10}}>
          <label style={S.lbl}>{label}ポジション</label>
          <select style={{...S.sel,marginBottom:8}} value={data[pKey]||""} onChange={e=>setData(p=>({...p,[pKey]:e.target.value}))}>
            <option value="">{pKey==="pos1"?"選択してください":"なし"}</option>
            {POSITIONS.map(pos=><option key={pos}>{pos}</option>)}
          </select>
          {data[pKey]&&data[pKey]!=="GK"&&(
            <div style={{display:"flex",gap:6}}>
              {["なし",...SIDES].map(s=>{
                const sel=(data[sKey]||"").split(",").filter(Boolean);
                const checked=sel.includes(s);
                const toggle=()=>{
                  let next;
                  if(s==="なし"){ next=checked?[]:["なし"]; }
                  else { next=checked?sel.filter(x=>x!==s):[...sel.filter(x=>x!=="なし"),s]; }
                  setData(p=>({...p,[sKey]:next.join(",")}));
                };
                return (
                  <label key={s} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                    border:`1.5px solid ${checked?"#3b82f6":"#e2e8f0"}`,borderRadius:8,padding:"6px 2px",
                    cursor:"pointer",background:checked?"#eff6ff":"#fff",fontSize:11,fontWeight:checked?700:400}}>
                    <input type="checkbox" checked={checked} onChange={toggle} style={{display:"none"}}/>
                    {s}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <div style={{display:"flex",gap:8}}>
        <button style={{...S.btn,flex:1}} onClick={()=>onSave(data)}>保存する</button>
        <button style={{...S.btnGhost,flex:1}} onClick={onCancel}>キャンセル</button>
      </div>
    </div>
  );

  // ── 日程タブ ─────────────────────────────────────────
  const renderSchedule = () => (
    <div style={S.body}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700}}>スケジュール</div>
        {isManager&&<button style={S.btnSm} onClick={()=>{setNE(blankEvent);setEditEventId(null);setShowReqError(false);setShowAddEvent(true);}}>＋ 追加</button>}
      </div>
      {sortedEvents.map(ev=>{
        const yes=getByStatus(ev.id,"出席").length,no=getByStatus(ev.id,"欠席").length,
              maybe=getByStatus(ev.id,"検討中").length,ill=getByStatus(ev.id,"療養中").length,
              un=getByStatus(ev.id,"未回答").length;
        const open=selectedEventId===ev.id;
        const dlSoon=isDeadlineSoon(ev),dlPast=isDeadlinePast(ev);
        const today=isToday(ev), thisWeek=isThisWeek(ev);
        const myStatus=!isManager&&currentUser?(attendance[ev.id]?.[currentUser]?.status||"未回答"):null;
        const needAnswer=myStatus==="未回答";
        return (
          <div key={ev.id} id={`ev-card-${ev.id}`} style={{...S.card,
            borderLeft:`4px solid ${ev.type==="match"?"#3b82f6":ev.type==="紅白戦"?"#ec4899":ev.type==="助っ人"?"#f97316":"#22c55e"}`,
            cursor:"pointer",position:"relative",scrollMarginTop:"110px",touchAction:"manipulation",
            ...(today?{boxShadow:"0 0 0 2px #ef4444, 0 1px 3px rgba(0,0,0,0.07)"}:
                needAnswer?{boxShadow:"0 0 0 2px #fbbf24, 0 1px 3px rgba(0,0,0,0.07)"}:{})}}
            onClick={()=>{
              if(open){
                setSelectedEventId(null);
              } else {
                setSelectedEventId(ev.id);
                // 展開した予定を画面上部へ
                setTimeout(()=>{document.getElementById(`ev-card-${ev.id}`)?.scrollIntoView({behavior:"smooth",block:"start"});},60);
              }
            }}>
            {/* 今日/今週/未回答リボン */}
            {(today||thisWeek||needAnswer)&&(
              <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
                {today&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20}}>🔥 本日開催</span>}
                {thisWeek&&<span style={{background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20}}>📆 今週</span>}
                {needAnswer&&<span style={{background:"#f59e0b",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20}}>✋ 未回答</span>}
              </div>
            )}
            <div style={{display:"flex",gap:12,alignItems:"stretch"}}>
              {/* 日付ボックス */}
              {(()=>{
                const d=new Date(ev.date+"T00:00:00");
                const wd=["日","月","火","水","木","金","土"][d.getDay()];
                const isSun=d.getDay()===0, isSat=d.getDay()===6;
                const accent=ev.type==="match"?"#3b82f6":ev.type==="紅白戦"?"#ec4899":ev.type==="助っ人"?"#f97316":"#22c55e";
                return (
                  <div style={{flexShrink:0,width:58,textAlign:"center",background:"#f8fafc",
                    border:"1.5px solid #e2e8f0",borderRadius:10,padding:"7px 4px",
                    display:"flex",flexDirection:"column",justifyContent:"center"}}>
                    <div style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>{parseInt(ev.date.slice(5,7))}月</div>
                    <div style={{fontSize:24,fontWeight:800,color:"#0f172a",lineHeight:1}}>{parseInt(ev.date.slice(8,10))}</div>
                    <div style={{fontSize:11,fontWeight:700,color:isSun?"#dc2626":isSat?"#2563eb":"#64748b"}}>（{wd}）</div>
                  </div>
                );
              })()}
              {/* タイトル・時間・場所 */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={S.badge(ev.type)}>{typeLabel(ev.type)}</span>
                  <span style={{fontSize:15,fontWeight:800,color:"#0f172a"}}>{ev.title}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:3}}>
                  🕐 {ev.timeFrom}{ev.timeTo?`〜${ev.timeTo}`:""}
                  {ev.meetTime&&<span style={{color:"#d97706",marginLeft:8,fontSize:12}}>集合{ev.meetTime}</span>}
                  <span style={{fontSize:10,color:"#94a3b8",marginLeft:8,fontWeight:600}}>{ev.playerCount}人制</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍 {ev.place}</span>
                  <a href={ev.mapUrl||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.place)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{flexShrink:0,fontSize:11,color:"#3b82f6",background:"#eff6ff",borderRadius:4,padding:"1px 6px",textDecoration:"none"}}
                    onClick={e=>e.stopPropagation()}>地図</a>
                </div>
              </div>
              {/* 右側: 出欠サマリー（余白を活用） */}
              <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"center",
                borderLeft:"1px solid #f1f5f9",paddingLeft:10,minWidth:48}}>
                <div style={{fontSize:18,fontWeight:800,color:"#22c55e",lineHeight:1}}>{yes}<span style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>人</span></div>
                <div style={{fontSize:9,color:"#94a3b8",fontWeight:600,marginTop:2}}>出席予定</div>
                {un>0&&<div style={{fontSize:9,color:"#f59e0b",fontWeight:700,marginTop:3}}>未回答{un}</div>}
              </div>
            </div>
            {ev.deadline&&(
              <div style={{marginTop:5,padding:"4px 10px",borderRadius:6,display:"inline-flex",alignItems:"center",gap:5,
                background:dlPast?"#fef2f2":dlSoon?"#fffbeb":"#f0fdf4",
                border:`1px solid ${dlPast?"#fca5a5":dlSoon?"#fcd34d":"#86efac"}`}}>
                <span style={{fontSize:11,fontWeight:700,color:dlPast?"#dc2626":dlSoon?"#d97706":"#15803d"}}>
                  {dlPast?"⚠️ 期限切れ":dlSoon?"🔔 もうすぐ締切":"📋 回答期限:"} {ev.deadline.slice(5).replace("-","/")} {ev.deadlineTime||""}
                </span>
              </div>
            )}
            {ev.uniform&&(
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}>
                <span style={{fontSize:11,color:"#64748b"}}>👕 ユニフォーム:</span>
                {ev.uniform.split(",").map(c=>(
                  <span key={c} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,fontWeight:700,
                    color:c==="赤"?"#dc2626":c==="紺"?"#1e3a5f":"#475569"}}>
                    <span style={{width:12,height:12,borderRadius:"50%",border:"1px solid #cbd5e1",
                      background:c==="赤"?"#dc2626":c==="紺"?"#1e3a5f":"#f8fafc",display:"inline-block"}}></span>
                    {c}
                  </span>
                ))}
              </div>
            )}
            {ev.note&&<div style={{fontSize:11,color:"#94a3b8",marginTop:6,whiteSpace:"pre-wrap"}}>{ev.note}</div>}
            {open&&(
              <div style={{display:"flex",gap:10,marginTop:10,paddingTop:10,borderTop:"1px solid #f1f5f9",fontSize:13,fontWeight:700,flexWrap:"wrap"}}>
                <span style={{color:"#22c55e"}}>✅ 出席 {yes}</span>
                <span style={{color:"#ef4444"}}>❌ 欠席 {no}</span>
                <span style={{color:"#f59e0b"}}>🤔 検討 {maybe}</span>
                {ill>0&&<span style={{color:"#8b5cf6"}}>🏥 療養 {ill}</span>}
                {un>0&&<span style={{color:"#94a3b8"}}>⬜ 未回答 {un}</span>}
              </div>
            )}
            {!isManager&&currentMember&&(()=>{
              const att=getAtt(ev.id,currentMember.id);
              const unanswered=att.status==="未回答";
              return (
                <div style={{marginTop:10}} onClick={e=>e.stopPropagation()}>
                  <button style={{width:"100%",
                    background:unanswered?"#1e3a5f":ATT_BG[att.status],
                    border:unanswered?"none":`2px solid ${ATT_COLOR[att.status]}`,
                    borderRadius:10,padding:"12px 14px",fontSize:14,fontWeight:800,cursor:"pointer",
                    color:unanswered?"#fff":ATT_COLOR[att.status],
                    boxShadow:unanswered?"0 2px 8px rgba(30,58,95,0.35)":"none"}}
                    onClick={()=>setAttModal({evId:ev.id,memberId:currentMember.id})}>
                    {unanswered
                      ?"✋ 出欠を入力する"
                      :`${ATT_ICON[att.status]} あなたの回答: ${att.status}（タップで変更）`}
                  </button>
                </div>
              );
            })()}
            {open&&(
              <div style={{marginTop:12,borderTop:"1px solid #f1f5f9",paddingTop:12}} onClick={e=>e.stopPropagation()}>
                <div style={{fontSize:11,color:"#94a3b8",marginBottom:10}}>
                  {isManager?"全員の出欠を管理できます":"自分の名前のみ変更可　🔒は変更不可"}
                </div>
                {ATT_STATUSES.map(st=><AttGroup key={st} evId={ev.id} status={st}/>)}
                <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                  <button style={{...S.btnSm,background:"#166534",flex:1}}
                    onClick={()=>{setFormationEvId(ev.id);setTab("formation");if(!isManager)setFormationSel({});}}>
                    ⚽ フォーメーションを確認
                  </button>
                  {isManager&&(
                    <button style={{...S.btnSm,background:"#06C755",flex:1}} onClick={()=>handleCopy(announceText(ev))}>
                      📢 告知文コピー
                    </button>
                  )}
                  {isManager&&un>0&&(
                    <button style={{...S.btnSm,background:"#06C755",flex:1}} onClick={()=>setShowReminder(ev.id)}>
                      💬 リマインド
                    </button>
                  )}
                </div>
                {isManager&&(
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button style={{...S.btnSm,flex:1}}
                      onClick={()=>{
                        setNE({...blankEvent,...ev});
                        setEditEventId(ev.id);
                        setShowAddEvent(true);
                      }}>
                      ✏️ 編集
                    </button>
                    <button style={{...S.btnSm,background:"#ef4444",flex:1}}
                      onClick={()=>{
                        if(window.confirm(`「${ev.title}」を削除しますか？`)){
                          deleteEvent(ev.id);
                          setSelectedEventId(null);
                        }
                      }}>
                      🗑️ 削除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderAnnouncements = () => (
    <div style={S.body}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700}}>お知らせ</div>
        {isManager&&<button style={S.btnSm} onClick={()=>setShowAddAnn(true)}>＋ 投稿</button>}
      </div>
      {announcements.map(a=>(
        <div key={a.id} style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <div style={{fontSize:14,fontWeight:700}}>{a.title}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>{a.date.slice(5).replace("-","/")}</div>
          </div>
          <div style={{fontSize:13,color:"#475569",lineHeight:1.7}}>{a.body}</div>
          {isManager&&(
            <button style={{...S.btnGhost,color:"#ef4444",borderColor:"#fca5a5",marginTop:8,fontSize:11}}
              onClick={()=>{
                if(window.confirm(`「${a.title}」を削除しますか？`)){
                  deleteAnn(a.id);
                }
              }}>🗑️ 削除</button>
          )}
        </div>
      ))}
    </div>
  );

  const renderFormation = () => {
    const upcomingEvents=[...events].filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date));
    const ev=upcomingEvents.find(e=>e.id===formationEvId)||upcomingEvents[0];
    if(!ev) return <div style={S.card}><div style={{textAlign:"center",color:"#94a3b8",padding:20,fontSize:13}}>これからの予定がありません</div></div>;
    const attending=members.filter(m=>getAtt(ev.id,m.id).status==="出席");
    const is紅白=ev.type==="紅白戦";
    const targetCount = ev.playerCount<=8?8:ev.playerCount;
    const availF=Object.entries(FORMATIONS).filter(([,f])=>f.min===targetCount);
    const pickable=(k)=>k&&availF.some(([kk])=>kk===k);
    const fKey = pickable(formationSel[ev.id]) ? formationSel[ev.id]
               : pickable(ev.formation) ? ev.formation
               : availF[0]?.[0]||"4-3-3";
    return (
      <div style={S.body}>
        <div style={{fontSize:15,fontWeight:700,marginBottom:10}}>フォーメーション</div>
        <div style={S.card}>
          <label style={S.lbl}>イベントを選択</label>
          <select style={S.sel} value={formationEvId} onChange={e=>{setFormationEvId(parseInt(e.target.value));if(!isManager)setFormationSel({});}}>
            {[...events].filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date)).map(e=><option key={e.id} value={e.id}>{e.date.slice(5).replace("-","/")} {e.title}（{e.playerCount}人制）</option>)}
          </select>
        </div>
        <div style={S.card}>
          <label style={S.lbl}>フォーメーション{!isManager&&<span style={{color:"#94a3b8",fontWeight:400}}>（お試し変更可・保存は管理者のみ）</span>}</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {availF.map(([k,f])=>(
              <button key={k} onClick={()=>selectFormation(ev.id,k)}
                style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:fKey===k?700:500,cursor:"pointer",
                  background:fKey===k?"#1e3a5f":"#f1f5f9",color:fKey===k?"#fff":"#475569",border:"none"}}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{fontSize:13,color:"#64748b",marginBottom:6}}>
          出席: {attending.length}名 / {members.length}名　{ev.playerCount}人制
        </div>
        {is紅白?(()=>{
          const {red,white}=splitTeams(attending);
          const teamMoveKey=`${ev.id}|teams`;
          return (
            <RedWhiteField
              redPlayers={red} whitePlayers={white} fKey={fKey}
              canDrag={isManager}
              teamMoves={fieldSwaps[teamMoveKey]||[]}
              slotMoves={fieldSwaps[`${ev.id}|${fKey}|rwslots`]||[]}
              onChange={(pid,curTeam,targetTeam,targetKey)=>{
                setFieldSwaps(p=>{
                  let next={...p};
                  if(curTeam!==targetTeam){
                    // チーム間移動：所属を上書き＋枠移動はクリア（新チームで再配置）
                    const curTeams=(next[teamMoveKey]||[]).filter(([id])=>id!==pid);
                    next[teamMoveKey]=[...curTeams,[pid,targetTeam]];
                    const slotKey=`${ev.id}|${fKey}|rwslots`;
                    next[slotKey]=(next[slotKey]||[]).filter(([id])=>id!==pid);
                  } else {
                    // 同チーム内の枠移動
                    const slotKey=`${ev.id}|${fKey}|rwslots`;
                    const cur=(next[slotKey]||[]).filter(([id])=>id!==pid);
                    next[slotKey]=[...cur,[pid,targetKey]];
                  }
                  persistMoves(ev.id,next);
                  return next;
                });
              }}
              slotRot={slotRot} onRotate={rotateSlot}/>
          );
        })():<FieldDisplay slots={assignFormation(attending,fKey)} fKey={fKey} slotRot={slotRot} onRotate={rotateSlot}
          canDrag={isManager} moves={fieldSwaps[`${ev.id}|${fKey}|`]||[]} onMove={(pid,sk)=>addSwap(`${ev.id}|${fKey}|`,pid,sk)}/>}
        {isManager&&Object.keys(fieldSwaps).some(k=>k.startsWith(`${ev.id}|`))&&(
          <button style={{...S.btnGhost,width:"100%",marginTop:8,fontSize:11}}
            onClick={()=>setFieldSwaps(p=>{
              const u={...p};
              Object.keys(u).forEach(k=>{ if(k.startsWith(`${ev.id}|`)) delete u[k]; });
              persistMoves(ev.id, u);
              return u;
            })}>
            ↩️ 配置・チーム分けを自動に戻す
          </button>
        )}
      </div>
    );
  };

  const renderMembers = () => (
    <div style={S.body}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:15,fontWeight:700}}>メンバー（{members.length}名）</div>
        {isManager&&<button style={S.btnSm} onClick={()=>{setNM(blankMember);setShowAddMember(true);}}>＋ 追加</button>}
      </div>
      {/* ポジション未入力の警告 */}
      {members.filter(m=>!m.pos1).length>0&&isManager&&(
        <div style={{...S.card,background:"#fffbeb",border:"1.5px solid #fcd34d",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:"#d97706"}}>
            ⚠️ ポジション未入力のメンバーがいます（{members.filter(m=>!m.pos1).length}名）
          </div>
          <div style={{fontSize:11,color:"#94a3b8",marginTop:2}}>本人にログインしてもらい入力をお願いしてください</div>
        </div>
      )}
      {POSITIONS.map(pos=>{
        const pm=members.filter(m=>m.pos1===pos);
        if(!pm.length) return null;
        return (
          <div key={pos} style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:POS_COLOR[pos],marginBottom:6,letterSpacing:1}}>{pos}</div>
            {pm.map(m=>(
              <div key={m.id} style={{...S.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}
                onClick={()=>setShowMemberDetail(m.id)}>
                <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:POS_COLOR[m.pos1],
                  color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>{m.number}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{m.name}</div>
                  <div style={{fontSize:11,color:"#64748b"}}>{[[m.pos1,m.side1],[m.pos2,m.side2],[m.pos3,m.side3]].filter(([p])=>p).map(([p,s])=>`${p}${s?`(${s})`:""}`).join(" › ")}</div>
                </div>
                <div style={{fontSize:18,color:"#cbd5e1"}}>›</div>
              </div>
            ))}
          </div>
        );
      })}
      {/* ポジション未設定 */}
      {members.filter(m=>!m.pos1).length>0&&(
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:6}}>未設定</div>
          {members.filter(m=>!m.pos1).map(m=>(
            <div key={m.id} style={{...S.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",opacity:0.7}}
              onClick={()=>setShowMemberDetail(m.id)}>
              <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:"#94a3b8",
                color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>{m.number}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{m.name}</div>
                <div style={{fontSize:11,color:"#f59e0b"}}>⚠️ ポジション未入力</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const memberDetail=members.find(m=>m.id===showMemberDetail);

  return (
    <div style={S.app}>
      <div style={S.hdr}>
        <div style={S.hdrTop}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {logoUrl?<img src={logoUrl} alt="logo" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>
              :<div style={{fontSize:26}}>⚽</div>}
            <div>
              <div style={{fontSize:18,fontWeight:800,letterSpacing:-0.5}}>{teamName}</div>
              <div style={{fontSize:10,color:"#94a3b8"}}>{currentMember?`👤 ${currentMember.name}`:"👑 管理者"}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {isManager&&<button style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"6px 10px",color:"#94a3b8",fontSize:12,cursor:"pointer"}}
              onClick={()=>{setEditTeamName(teamName);setEditTeamOrigin(teamOrigin==="COMPANERO_DEFAULT"?"「companero（コンパネーロ）」とは、スペイン語で「仲間」「同志」を意味する言葉です。マコさんの仲間・同志が集うチームでありたいという想いを込めて、「マコさん」の頭文字「Ma」と、仲間・同志を表す「companero」を組み合わせ、「Ma.companero FC」と名付けました。":teamOrigin);setShowSettings(true);}}>⚙️</button>}
            <button style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:8,padding:"6px 10px",color:"#e2e8f0",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}
              onClick={()=>{localStorage.removeItem("teamapp_user");setFormationSel({});setShowLogin(true);}}>
              👤 ログイン切替
            </button>
          </div>
        </div>
        <div style={{...S.tabs,gap:5,paddingBottom:10}}>
          {TABS.map(t=>(
            <button key={t.key} style={{...S.tab(tab===t.key),position:"relative"}} onClick={()=>{
              setTab(t.key);
              if(t.key==="schedule"){ setSelectedEventId(null); setTimeout(()=>window.scrollTo({top:0}),0); }
              if(t.key==="formation" && !isManager){ setFormationSel({}); }
            }}>
              {t.label}
              {t.key==="schedule"&&myUnanswered>0&&(
                <span style={{position:"absolute",top:2,right:6,background:"#ef4444",color:"#fff",
                  fontSize:9,fontWeight:800,borderRadius:10,minWidth:16,height:16,display:"flex",
                  alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{myUnanswered}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tab==="schedule"&&renderSchedule()}
        {tab==="formation"&&renderFormation()}
        {tab==="members"&&renderMembers()}
      </div>

      <PositionPrompt/>
      <AttModal/>

      {/* 設定モーダル */}
      {showSettings&&(
        <div style={S.modal} onClick={()=>setShowSettings(false)}>
          <div style={S.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:16}}>チーム設定</div>
            <div style={{marginBottom:14}}>
              <label style={S.lbl}>チーム名</label>
              <input style={S.inp} value={editTeamName} onChange={e=>setEditTeamName(e.target.value)}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={S.lbl}>チーム名の由来（ログイン画面に表示）</label>
              <textarea style={{...S.inp,minHeight:90,resize:"vertical",lineHeight:1.6}}
                value={editTeamOrigin} onChange={e=>setEditTeamOrigin(e.target.value)}
                placeholder="チーム名の由来を入力"/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={S.lbl}>ロゴ画像</label>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {logoUrl&&<img src={logoUrl} alt="logo" style={{width:48,height:48,borderRadius:8,objectFit:"cover"}}/>}
                <button style={S.btnGhost} onClick={()=>logoInputRef.current.click()}>{logoUrl?"変更":"アップロード"}</button>
                {logoUrl&&<button style={{...S.btnGhost,color:"#ef4444",borderColor:"#fca5a5"}} onClick={()=>{setLogoUrl(null);saveSettings({logo_url:""});}}>削除</button>}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleLogoUpload}/>
            </div>
            {/* 管理者管理 */}
            <div style={{marginBottom:16}}>
              <label style={S.lbl}>管理者リスト</label>
              {admins.map((name,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{flex:1,fontSize:13,padding:"8px 12px",background:"#f8fafc",borderRadius:8}}>👑 {name}</span>
                  <button style={{...S.btnGhost,color:"#ef4444",borderColor:"#fca5a5",padding:"6px 10px"}}
                    onClick={()=>{const next=admins.filter((_,j)=>j!==i);setAdmins(next);saveSettings({admins:next.join(",")});}}>削除</button>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <input style={{...S.inp,flex:1}} placeholder="管理者名を追加" value={newAdminName} onChange={e=>setNewAdminName(e.target.value)}/>
                <button style={S.btnSm} onClick={()=>{if(newAdminName){const next=[...admins,newAdminName];setAdmins(next);setNewAdminName("");saveSettings({admins:next.join(",")});}}}>追加</button>
              </div>
            </div>
            {/* ゴミ箱 */}
            <div style={{marginBottom:16,paddingTop:14,borderTop:"1px solid #e2e8f0"}}>
              <label style={S.lbl}>🗑️ ゴミ箱</label>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:8}}>削除したイベント・メンバー・お知らせを復元できます</div>
              <button style={{...S.btnGhost,width:"100%"}} onClick={()=>{setShowSettings(false);setShowTrash(true);}}>
                ゴミ箱をひらく（{trashEvents.length+trashMembers.length}件）
              </button>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1}} onClick={()=>{
                setTeamName(editTeamName);
                setTeamOrigin(editTeamOrigin);
                saveSettings({team_name:editTeamName,team_origin:editTeamOrigin,logo_url:logoUrl||"",admins:admins.join(",")});
                setShowSettings(false);
              }}>保存</button>
              <button style={{...S.btnGhost,flex:1}} onClick={()=>setShowSettings(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* ゴミ箱 */}
      {showTrash&&(
        <div style={S.modal} onClick={()=>setShowTrash(false)}>
          <div style={S.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>🗑️ ゴミ箱</div>
            <div style={{fontSize:11,color:"#94a3b8",marginBottom:16}}>「戻す」で復元、「完全削除」で永久に消去します</div>

            {/* イベント */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:"#475569"}}>📅 イベント（{trashEvents.length}）</div>
              {trashEvents.length===0&&<div style={{fontSize:12,color:"#cbd5e1"}}>なし</div>}
              {trashEvents.map(e=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"8px 10px",background:"#f8fafc",borderRadius:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{e.date}</div>
                  </div>
                  <button style={{...S.btnSm,background:"#22c55e"}} onClick={()=>restoreEvent(e)}>戻す</button>
                  <button style={{...S.btnSm,background:"#ef4444"}} onClick={()=>purgeEvent(e.id)}>完全削除</button>
                </div>
              ))}
            </div>

            {/* メンバー */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8,color:"#475569"}}>👥 メンバー（{trashMembers.length}）</div>
              {trashMembers.length===0&&<div style={{fontSize:12,color:"#cbd5e1"}}>なし</div>}
              {trashMembers.map(m=>(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"8px 10px",background:"#f8fafc",borderRadius:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600}}>{m.number?`#${m.number} `:""}{m.name}</div>
                  </div>
                  <button style={{...S.btnSm,background:"#22c55e"}} onClick={()=>restoreMember(m)}>戻す</button>
                  <button style={{...S.btnSm,background:"#ef4444"}} onClick={()=>purgeMember(m.id)}>完全削除</button>
                </div>
              ))}
            </div>

            <button style={{...S.btnGhost,width:"100%"}} onClick={()=>setShowTrash(false)}>閉じる</button>
          </div>
        </div>
      )}

      {/* メンバー追加（名前・背番号のみ） */}
      {showAddMember&&(
        <div style={S.modal} onClick={()=>setShowAddMember(false)}>
          <div style={S.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>メンバー追加</div>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>
              名前と背番号だけ入力してください。ポジションは本人がログイン後に入力します。
            </div>
            <div style={S.row}>
              <div style={{flex:2}}>
                <label style={S.lbl}>名前</label>
                <input style={S.inp} placeholder="山田 太郎" value={newMember.name} onChange={e=>setNM(p=>({...p,name:e.target.value}))}/>
              </div>
              <div style={{flex:1}}>
                <label style={S.lbl}>背番号</label>
                <input style={S.inp} type="number" placeholder="10" value={newMember.number} onChange={e=>setNM(p=>({...p,number:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1}} onClick={addMember}>追加する</button>
              <button style={{...S.btnGhost,flex:1}} onClick={()=>setShowAddMember(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* イベント追加 */}
      {showAddEvent&&(
        <div style={S.modal} onClick={()=>setShowAddEvent(false)}>
          <div id="event-mbox" style={S.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>{editEventId?"イベント編集":"イベント追加"}</div>
            {showReqError&&(
              <div style={{background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#dc2626",fontWeight:600}}>
                ⚠️ 赤色の必須項目を入力してください
              </div>
            )}
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={reqLbl}>種別 *</label>
                <select style={reqStyle(newEvent.type)} value={newEvent.type} onChange={e=>setNE(p=>({...p,type:e.target.value}))}>
                  <option value="match">試合</option><option value="practice">練習</option><option value="紅白戦">紅白戦</option><option value="助っ人">助っ人募集</option>
                </select>
              </div>
              <div style={{flex:2}}>
                <label style={reqLbl}>タイトル *</label>
                <input style={reqStyle(newEvent.title)} placeholder="例: vs FC東京" value={newEvent.title} onChange={e=>setNE(p=>({...p,title:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
              <div style={{flex:"1 1 0",minWidth:0}}>
                <label style={reqLbl}>日付 *</label>
                <input style={{...reqStyle(newEvent.date),width:"100%",minWidth:0,padding:"9px 4px",textAlign:"center"}} type="date" value={newEvent.date} onChange={e=>setNE(p=>({...p,date:e.target.value}))}/>
              </div>
              <div style={{flex:"1 1 0",minWidth:0}}>
                <label style={{...S.lbl,color:"#d97706"}}>🕐 集合時間</label>
                <TimeSelect value={newEvent.meetTime} allowEmpty onChange={v=>setNE(p=>({...p,meetTime:v}))}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
              <div style={{flex:"1 1 0",minWidth:0}}>
                <label style={reqLbl}>開始時間 *</label>
                <TimeSelect value={newEvent.timeFrom} defaultHour={12} onChange={v=>setNE(p=>{
                  const next={...p,timeFrom:v};
                  // 開始を設定/変更したら、終了を常に開始+2時間に追従させる
                  if(v){
                    const [hh,mm]=v.split(":").map(Number);
                    const eh=((hh+2)%24).toString().padStart(2,"0");
                    next.timeTo=`${eh}:${mm.toString().padStart(2,"0")}`;
                  }
                  return next;
                })} required={!newEvent.timeFrom}/>
              </div>
              <div style={{flex:"1 1 0",minWidth:0}}>
                <label style={reqLbl}>終了時間 *</label>
                <TimeSelect value={newEvent.timeTo} defaultHour={newEvent.timeFrom?(((parseInt(newEvent.timeFrom.split(":")[0])+2)%24)):14} onChange={v=>setNE(p=>({...p,timeTo:v}))} required={!newEvent.timeTo}/>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={reqLbl}>場所 *</label>
              <input style={reqStyle(newEvent.place)} placeholder="例: 谷本公園 球技場" value={newEvent.place} onChange={e=>setNE(p=>({...p,place:e.target.value}))}/>
              {placeHistory.length>0&&(
                <div style={{marginTop:6}}>
                  <div style={{fontSize:10,color:"#94a3b8",marginBottom:4}}>📌 履歴からえらぶ（×で削除）</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {placeHistory.map(h=>(
                      <div key={h.id} style={{display:"inline-flex",alignItems:"center",
                        background:newEvent.place===h.place?"#eff6ff":"#f8fafc",
                        border:`1.5px solid ${newEvent.place===h.place?"#3b82f6":"#e2e8f0"}`,
                        borderRadius:20,overflow:"hidden"}}>
                        <button type="button"
                          onClick={()=>setNE(p=>({...p,place:h.place,mapUrl:h.mapUrl||""}))}
                          style={{background:"none",border:"none",padding:"5px 4px 5px 12px",fontSize:12,cursor:"pointer",
                            color:"#475569",fontWeight:newEvent.place===h.place?700:400}}>
                          📍 {h.place}
                        </button>
                        <button type="button" onClick={()=>deletePlaceHistory(h.id)}
                          style={{background:"none",border:"none",padding:"5px 9px 5px 4px",fontSize:13,cursor:"pointer",color:"#cbd5e1"}}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {newEvent.place&&(
                <a href={newEvent.mapUrl||`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newEvent.place)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-block",marginTop:4,fontSize:11,color:"#3b82f6",textDecoration:"none"}}>
                  📍 Googleマップで確認する →
                </a>
              )}
            </div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>マップURL（位置がズレる場合）</label>
              <input style={S.inp} placeholder="Googleマップの共有リンクを貼り付け" value={newEvent.mapUrl} onChange={e=>setNE(p=>({...p,mapUrl:e.target.value}))}/>
              <div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>
                Googleマップで正しい場所を開き「共有」→「リンクをコピー」して貼り付けると、全員の地図リンクがその場所になります
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{...S.lbl,color:"#d97706"}}>⏰ 回答期限</label>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{flex:"1 1 0",minWidth:0}}>
                  <input style={{...S.inp,borderColor:"#f59e0b",background:"#fffbeb",width:"100%",minWidth:0,padding:"9px 4px",textAlign:"center"}} type="date" value={newEvent.deadline} onChange={e=>setNE(p=>({...p,deadline:e.target.value}))}/>
                </div>
                <div style={{flex:"1 1 0",minWidth:0}}>
                  <select style={{...S.sel,borderColor:"#f59e0b",background:"#fffbeb",width:"100%",minWidth:0,textAlignLast:"center"}}
                    value={newEvent.deadlineTime} onChange={e=>setNE(p=>({...p,deadlineTime:e.target.value}))}>
                    <option value="">時刻なし</option>
                    {Array.from({length:24},(_,i)=>{const h=i.toString().padStart(2,"0");return <option key={i} value={`${h}:00`}>{`${h}:00`}</option>;})}
                  </select>
                </div>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>人数（何人制）</label>
              <select style={S.sel} value={newEvent.playerCount} onChange={e=>setNE(p=>({...p,playerCount:parseInt(e.target.value)}))}>
                {[8,9,10,11].map(n=><option key={n} value={n}>{n}人制</option>)}
              </select>
            </div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>ユニフォームの色（複数選択可）</label>
              <div style={{display:"flex",gap:8}}>
                {[["赤","#dc2626","#fff"],["白","#f8fafc","#475569"],["紺","#1e3a5f","#fff"]].map(([c,bg,fg])=>{
                  const sel=(newEvent.uniform||"").split(",").filter(Boolean);
                  const checked=sel.includes(c);
                  const toggle=()=>{
                    const next=checked?sel.filter(x=>x!==c):[...sel,c];
                    setNE(p=>({...p,uniform:next.join(",")}));
                  };
                  return (
                    <label key={c} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                      border:`2px solid ${checked?"#3b82f6":"#e2e8f0"}`,borderRadius:8,padding:"9px 4px",
                      cursor:"pointer",background:checked?"#eff6ff":"#fff",fontSize:13,fontWeight:checked?700:400}}>
                      <input type="checkbox" checked={checked} onChange={toggle} style={{display:"none"}}/>
                      <span style={{width:16,height:16,borderRadius:"50%",background:bg,border:"1.5px solid #cbd5e1",display:"inline-block"}}></span>
                      {c}
                    </label>
                  );
                })}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={S.lbl}>メモ</label>
              <textarea style={{...S.inp,minHeight:70,resize:"vertical",lineHeight:1.5}} placeholder="例: ホーム戦&#10;集合場所など改行で記入できます" value={newEvent.note} onChange={e=>setNE(p=>({...p,note:e.target.value}))}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1}} onClick={addEvent}>{editEventId?"保存する":"追加する"}</button>
              <button style={{...S.btnGhost,flex:1}} onClick={()=>{setShowAddEvent(false);setEditEventId(null);}}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* お知らせ */}
      {showAddAnn&&(
        <div style={S.modal} onClick={()=>setShowAddAnn(false)}>
          <div style={S.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>お知らせを投稿</div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>タイトル</label>
              <input style={S.inp} value={newAnn.title} onChange={e=>setNA(p=>({...p,title:e.target.value}))}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={S.lbl}>内容</label>
              <textarea style={{...S.inp,minHeight:100,resize:"vertical"}} value={newAnn.body} onChange={e=>setNA(p=>({...p,body:e.target.value}))}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1}} onClick={addAnn}>投稿する</button>
              <button style={{...S.btnGhost,flex:1}} onClick={()=>setShowAddAnn(false)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* LINEリマインド */}
      {showReminder&&(
        <div style={S.modal} onClick={()=>setShowReminder(null)}>
          <div style={S.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>💬 LINEリマインド</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:12}}>
              未回答: {getByStatus(showReminder,"未回答").map(m=>m.name).join("、")}
            </div>
            <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:14,marginBottom:14,fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap",color:"#166534"}}>
              {reminderText(showReminder)}
            </div>
            <button style={{...S.btnLine,width:"100%",marginBottom:8}} onClick={()=>handleCopy(reminderText(showReminder))}>
              {copied?"✅ コピーしました！":"📋 メッセージをコピー"}
            </button>
            <p style={{fontSize:11,color:"#94a3b8",textAlign:"center",margin:"0 0 12px"}}>
              コピー後、グループLINEに貼り付けて送信してください
            </p>
            <button style={{...S.btnGhost,width:"100%"}} onClick={()=>setShowReminder(null)}>閉じる</button>
          </div>
        </div>
      )}

      {/* メンバー詳細 */}
      {showMemberDetail&&memberDetail&&(
        <div style={S.modal} onClick={()=>{setShowMemberDetail(null);setEditMemberId(null);}}>
          <div style={S.mbox} onClick={e=>e.stopPropagation()}>
            {editMemberId===memberDetail.id?(
              <MemberFormFull data={editData} setData={setED} onSave={saveMember} onCancel={()=>setEditMemberId(null)} title="メンバー編集"/>
            ):(
              <>
                <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:memberDetail.pos1?POS_COLOR[memberDetail.pos1]:"#94a3b8",
                    color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20}}>
                    {memberDetail.number}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:17,fontWeight:800}}>{memberDetail.name}</div>
                    <div style={{fontSize:12,color:"#64748b"}}>
                      {memberDetail.pos1?[[memberDetail.pos1,memberDetail.side1],[memberDetail.pos2,memberDetail.side2],[memberDetail.pos3,memberDetail.side3]].filter(([p])=>p).map(([p,s])=>`${p}${s?`(${s})`:""}`).join(" › "):"ポジション未入力"}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {(isManager||currentUser===memberDetail.id)&&(
                      <button style={S.btnSm} onClick={()=>{setED({...memberDetail});setEditMemberId(memberDetail.id);}}>編集</button>
                    )}
                    {isManager&&(
                      <button style={{...S.btnSm,background:"#ef4444"}} onClick={()=>{
                        if(window.confirm(`${memberDetail.name}を削除しますか？`)){
                          deleteMember(memberDetail.id);
                          setShowMemberDetail(null);
                        }
                      }}>削除</button>
                    )}
                  </div>
                </div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>これからの予定の出欠</div>
                {(()=>{
                  const upcoming=[...events].filter(ev=>ev.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date));
                  if(upcoming.length===0) return <div style={{fontSize:12,color:"#94a3b8",padding:"8px 0"}}>これからの予定はありません</div>;
                  return upcoming.map(ev=>{
                  const att=getAtt(ev.id,memberDetail.id);
                  return (
                    <div key={ev.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                      <div>
                        <span style={S.badge(ev.type)}>{typeLabel(ev.type)}</span>
                        <span style={{fontSize:13}}>{ev.title}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontWeight:700,color:ATT_COLOR[att.status],fontSize:12}}>{ATT_ICON[att.status]} {att.status}</span>
                        {att.decideBy&&<div style={{fontSize:10,color:"#f59e0b"}}>{att.decideBy.slice(5).replace("-","/")}までに決定</div>}
                        {att.comment&&<div style={{fontSize:10,color:"#64748b"}}>💬 {att.comment}</div>}
                      </div>
                    </div>
                  );
                  });
                })()}
                <button style={{...S.btnGhost,width:"100%",marginTop:14}} onClick={()=>setShowMemberDetail(null)}>閉じる</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
