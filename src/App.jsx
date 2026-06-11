import { useState, useRef } from "react";

const POSITIONS = ["GK","DF","MF","FW"];
const SIDES = ["センター","左","右"];
const POS_COLOR = { GK:"#f59e0b", DF:"#3b82f6", MF:"#22c55e", FW:"#ef4444" };
const ATT_STATUSES = ["出席","欠席","検討中","療養中","未回答"];
const ATT_COLOR = { "出席":"#22c55e","欠席":"#ef4444","検討中":"#f59e0b","療養中":"#8b5cf6","未回答":"#94a3b8" };
const ATT_BG    = { "出席":"#f0fdf4","欠席":"#fef2f2","検討中":"#fffbeb","療養中":"#f5f3ff","未回答":"#f8fafc" };
const ATT_ICON  = { "出席":"✅","欠席":"❌","検討中":"🤔","療養中":"🤒","未回答":"⬜" };

const FORMATIONS = {
  "4-3-3":  { label:"4-3-3",       gk:1,df:4,mf:3,fw:3,min:11 },
  "4-4-2":  { label:"4-4-2",       gk:1,df:4,mf:4,fw:2,min:11 },
  "4-5-1":  { label:"4-5-1",       gk:1,df:4,mf:5,fw:1,min:11 },
  "4-2-3-1":{ label:"4-2-3-1",     gk:1,df:4,mf:5,fw:1,min:11 },
  "3-5-2":  { label:"3-5-2",       gk:1,df:3,mf:5,fw:2,min:11 },
  "3-4-3":  { label:"3-4-3",       gk:1,df:3,mf:4,fw:3,min:11 },
  "5-3-2":  { label:"5-3-2",       gk:1,df:5,mf:3,fw:2,min:11 },
  "3-3-1":  { label:"3-3-1 (8人)", gk:1,df:3,mf:3,fw:1,min:8  },
  "2-3-2":  { label:"2-3-2 (8人)", gk:1,df:2,mf:3,fw:2,min:8  },
  "3-2-2":  { label:"3-2-2 (8人)", gk:1,df:3,mf:2,fw:2,min:8  },
};

const initialMembers = [
  { id:1,  name:"今野",       number:1,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:2,  name:"裕作",       number:2,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:3,  name:"工藤チャゲ", number:3,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:4,  name:"しん",       number:4,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:5,  name:"鈴木",       number:5,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:6,  name:"福本",       number:6,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:7,  name:"とも",       number:7,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:8,  name:"ちいかわ",   number:8,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:9,  name:"りょう",     number:9,  pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:10, name:"マコ",       number:10, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:11, name:"タカ",       number:11, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:12, name:"南",         number:12, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:13, name:"舛田",       number:13, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:14, name:"浅葉",       number:14, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:15, name:"田代",       number:15, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:16, name:"しょう",     number:16, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:17, name:"沢海",       number:17, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:18, name:"武井",       number:18, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:19, name:"松ちゃん",   number:19, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:20, name:"たつや",     number:20, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:21, name:"Yusuke Mori",number:21, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:22, name:"柿澤",       number:22, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:23, name:"カズ",       number:23, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:24, name:"ナラタカ",   number:24, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:25, name:"椎葉",       number:25, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:26, name:"金指",       number:26, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:27, name:"山崎りんた", number:27, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:28, name:"香川",       number:28, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:29, name:"森部",       number:29, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:30, name:"榊原",       number:32, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:31, name:"ヒロ",       number:33, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:32, name:"井上",       number:37, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:33, name:"たくま",     number:38, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:34, name:"サク",       number:39, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:35, name:"藤本",       number:43, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:36, name:"国",         number:92, pos1:"", pos2:"", pos3:"", side:"センター" },
  { id:37, name:"やぎ",       number:89, pos1:"", pos2:"", pos3:"", side:"センター" },
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

function assignFormation(players, fKey, forceAll) {
  const f = FORMATIONS[fKey];
  if (!f) return { GK:[],DF:[],MF:[],FW:[],SUB:[] };
  const result = { GK:[],DF:[],MF:[],FW:[],SUB:[] };
  const used = new Set();
  const pick = (pos,n) => {
    ["pos1","pos2","pos3"].forEach(pr => {
      players.forEach(p => {
        if (!used.has(p.id) && p[pr]===pos && result[pos].length<n) {
          result[pos].push(p); used.add(p.id);
        }
      });
    });
  };
  pick("GK",f.gk); pick("DF",f.df); pick("MF",f.mf); pick("FW",f.fw);
  players.forEach(p => {
    if (!used.has(p.id)) {
      if (forceAll) { const bp=[p.pos1,p.pos2,p.pos3].find(Boolean)||"MF"; result[bp].push(p); }
      else result.SUB.push(p);
    }
  });
  return result;
}

function splitTeams(players) {
  const red=[],white=[];
  POSITIONS.forEach(pos => players.filter(p=>p.pos1===pos).forEach((p,i)=>(i%2===0?red:white).push(p)));
  return { red, white };
}

function FieldDisplay({ formation, accentColor }) {
  const Dot = ({ p, small }) => (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",background:"rgba(255,255,255,0.13)",
      borderRadius:7,padding:small?"3px 5px":"5px 8px",minWidth:small?34:44 }}>
      <div style={{ width:small?22:28,height:small?22:28,borderRadius:"50%",
        background:accentColor||POS_COLOR[p.pos1]||"#64748b",
        display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:small?9:12 }}>
        {p.number}
      </div>
      <div style={{ fontSize:small?7:9,color:"#e2e8f0",marginTop:2,textAlign:"center" }}>{p.name.split(" ")[0]}</div>
    </div>
  );
  return (
    <div style={{ background:accentColor?`linear-gradient(180deg,${accentColor}22 0%,#15803d 100%)`
      :"linear-gradient(180deg,#166534 0%,#15803d 50%,#16a34a 100%)",
      borderRadius:12,padding:"12px 8px",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:8,border:"1.5px solid rgba(255,255,255,0.18)",borderRadius:6,pointerEvents:"none" }} />
      <div style={{ position:"absolute",top:"50%",left:8,right:8,height:1,background:"rgba(255,255,255,0.12)",pointerEvents:"none" }} />
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:40,height:40,border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:"50%",pointerEvents:"none" }} />
      <div style={{ position:"relative",zIndex:1 }}>
        {["FW","MF","DF","GK"].map(pos=>formation[pos]?.length>0&&(
          <div key={pos} style={{ marginBottom:6 }}>
            <div style={{ fontSize:9,color:"rgba(255,255,255,0.45)",textAlign:"center",marginBottom:3 }}>{pos}</div>
            <div style={{ display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap" }}>
              {formation[pos].map((p,i)=><Dot key={`${p.id}-${i}`} p={p} />)}
            </div>
          </div>
        ))}
        {Object.values(formation).flat().length===0&&(
          <div style={{ color:"rgba(255,255,255,0.4)",textAlign:"center",padding:24,fontSize:13 }}>出席者がいません</div>
        )}
        {formation.SUB?.length>0&&(
          <div style={{ marginTop:10,borderTop:"1px dashed rgba(255,255,255,0.25)",paddingTop:8 }}>
            <div style={{ fontSize:9,color:"rgba(255,255,255,0.45)",textAlign:"center",marginBottom:4 }}>控え</div>
            <div style={{ display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap" }}>
              {formation.SUB.map((p,i)=><Dot key={`sub-${p.id}-${i}`} p={p} small />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("schedule");
  const [members, setMembers] = useState(initialMembers);
  const [events, setEvents] = useState(initialEvents);
  const [attendance, setAttendance] = useState(initAtt());
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [admins, setAdmins] = useState(initialAdmins);

  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [teamName, setTeamName] = useState("チームマネージャー");
  const [logoUrl, setLogoUrl] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const logoInputRef = useRef();

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [formationEvId, setFormationEvId] = useState(1);
  const [formationKey, setFormationKey] = useState("4-3-3");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [showMemberDetail, setShowMemberDetail] = useState(null);
  const [showReminder, setShowReminder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editMemberId, setEditMemberId] = useState(null);
  const [attModal, setAttModal] = useState(null);
  const [showPositionPrompt, setShowPositionPrompt] = useState(false);

  const blankMember = { name:"",number:"" };
  const blankEvent  = { type:"match",title:"",date:"",timeFrom:"",timeTo:"",place:"",note:"",playerCount:11,deadline:"",deadlineTime:"" };
  const blankAnn    = { title:"",body:"" };
  const blankPos    = { pos1:"MF",pos2:"",pos3:"",side:"センター" };
  const [newMember, setNM] = useState(blankMember);
  const [newEvent,  setNE] = useState(blankEvent);
  const [newAnn,    setNA] = useState(blankAnn);
  const [editData,  setED] = useState({...blankMember,...blankPos});
  const [posData,   setPD] = useState(blankPos);

  const isManager = currentUser === "manager";
  const todayStr = new Date().toISOString().slice(0,10);
  const sortedEvents = [...events]
    .filter(ev => ev.date >= todayStr)
    .sort((a,b)=>a.date.localeCompare(b.date));
  const getAtt = (evId,mId) => attendance[evId]?.[mId]||{status:"未回答"};
  const getByStatus = (evId,st) => members.filter(m=>getAtt(evId,m.id).status===st);
  const setAttStatus = (evId,mId,status,extra={}) =>
    setAttendance(p=>({...p,[evId]:{...p[evId],[mId]:{status,...extra}}}));

  const today = new Date().toISOString().slice(0,10);
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

  const addMember = () => {
    if(!newMember.name||!newMember.number) return;
    const id=Math.max(...members.map(m=>m.id))+1;
    setMembers(p=>[...p,{...blankPos,name:newMember.name,id,number:parseInt(newMember.number)}]);
    setAttendance(p=>{const u={...p};events.forEach(e=>{u[e.id]={...u[e.id],[id]:{status:"未回答"}};});return u;});
    setNM(blankMember); setShowAddMember(false);
  };
  const saveMember = data => {
    setMembers(p=>p.map(m=>m.id===editMemberId?{...m,...data,number:parseInt(data.number)}:m));
    setEditMemberId(null); setShowMemberDetail(null);
  };
  const savePosition = () => {
    if(!currentUser||isManager) return;
    setMembers(p=>p.map(m=>m.id===currentUser?{...m,...posData}:m));
    setShowPositionPrompt(false);
  };
  const addEvent = () => {
    if(!newEvent.title||!newEvent.date) return;
    const id=Math.max(...events.map(e=>e.id))+1;
    setEvents(p=>[...p,{...newEvent,id}]);
    const att={}; members.forEach(m=>{att[m.id]={status:"未回答"};});
    setAttendance(p=>({...p,[id]:att}));
    setNE(blankEvent); setShowAddEvent(false);
  };
  const addAnn = () => {
    if(!newAnn.title) return;
    const id=Math.max(...announcements.map(a=>a.id))+1;
    setAnnouncements(p=>[{...newAnn,id,date:new Date().toISOString().slice(0,10)},...p]);
    setNA(blankAnn); setShowAddAnn(false);
  };
  const reminderText = evId => {
    const ev=events.find(e=>e.id===evId);
    const unans=getByStatus(evId,"未回答");
    if(!ev) return "";
    return `【出欠確認リマインド】\n📅 ${ev.date.slice(5).replace("-","/")} ${ev.timeFrom}〜${ev.timeTo} ${ev.title}\n📍 ${ev.place}\n⏰ 回答期限: ${ev.deadline?(ev.deadline.slice(5).replace("-","/")+' '+( ev.deadlineTime||"")):"未設定"}\n\n以下のメンバーがまだ未回答です：\n${unans.map(m=>`・${m.name}`).join("\n")}\n\nご回答よろしくお願いします！`;
  };
  const handleCopy = txt => {
    navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2200);});
  };
  const handleLogoUpload = e => {
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader(); r.onload=ev=>setLogoUrl(ev.target.result); r.readAsDataURL(file);
  };

  const S = {
    app:  {fontFamily:"'Helvetica Neue',Arial,sans-serif",maxWidth:430,margin:"0 auto",background:"#f1f5f9",minHeight:"100vh"},
    hdr:  {background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",color:"#fff",padding:"14px 16px 0",position:"sticky",top:0,zIndex:100},
    hdrTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},
    tabs: {display:"flex"},
    tab:a=>({flex:1,padding:"9px 2px",textAlign:"center",fontSize:11,fontWeight:a?700:500,color:a?"#fff":"#94a3b8",background:"none",border:"none",borderBottom:a?"2.5px solid #38bdf8":"2px solid transparent",cursor:"pointer"}),
    body: {padding:"14px",paddingBottom:32},
    card: {background:"#fff",borderRadius:12,padding:"12px 14px",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"},
    badge:t=>({display:"inline-block",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,marginRight:5,
      background:t==="match"?"#dbeafe":t==="紅白戦"?"#fce7f3":"#dcfce7",
      color:t==="match"?"#1d4ed8":t==="紅白戦"?"#be185d":"#15803d"}),
    btn:     {background:"#1e3a5f",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer"},
    btnSm:   {background:"#1e3a5f",color:"#fff",border:"none",borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"},
    btnGhost:{background:"none",border:"1.5px solid #e2e8f0",color:"#475569",borderRadius:6,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"},
    btnLine: {background:"#06C755",color:"#fff",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer"},
    inp:  {width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box"},
    sel:  {width:"100%",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box",background:"#fff"},
    lbl:  {fontSize:12,color:"#64748b",fontWeight:600,marginBottom:4,display:"block"},
    modal:{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"flex-end"},
    mbox: {background:"#fff",borderRadius:"16px 16px 0 0",padding:20,width:"100%",maxWidth:430,margin:"0 auto",maxHeight:"88vh",overflowY:"auto"},
    row:  {display:"flex",gap:8,marginBottom:10},
  };

  // ── ログイン ─────────────────────────────────────────
  if (showLogin) return (
    <div style={{...S.app,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,minHeight:"100vh"}}>
      {logoUrl?<img src={logoUrl} alt="logo" style={{width:64,height:64,borderRadius:12,objectFit:"cover",marginBottom:8}}/>
        :<div style={{fontSize:52,marginBottom:8}}>⚽</div>}
      <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:4}}>{teamName}</div>
      <div style={{fontSize:13,color:"#94a3b8",marginBottom:28}}>Team Manager</div>
      <div style={{width:"100%",maxWidth:380}}>
        {/* 管理者 */}
        <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:8}}>▼ 管理者としてログイン</div>
        {admins.map((name,i)=>(
          <div key={i} style={{...S.card,cursor:"pointer",borderLeft:"4px solid #f59e0b",marginBottom:8,display:"flex",alignItems:"center",gap:10}}
            onClick={()=>{setCurrentUser("manager");setShowLogin(false);}}>
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
                if(noPos){ setPD({pos1:"MF",pos2:"",pos3:"",side:"センター"}); setShowPositionPrompt(true); }
                setShowLogin(false);
              }}>
              <div style={{width:36,height:36,borderRadius:"50%",background:m.pos1?POS_COLOR[m.pos1]:"#94a3b8",color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{m.number}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{m.name}</div>
                <div style={{fontSize:11,color:noPos?"#f59e0b":"#94a3b8"}}>
                  {noPos?"⚠️ ポジション未入力":(`${m.pos1}${m.pos2?" / "+m.pos2:""} / ${m.side}`)}
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
            あなたのポジション適性を登録しましょう。布陣の自動作成に使われます。
          </div>
          <div style={S.row}>
            {[["pos1","第1（必須）"],["pos2","第2"],["pos3","第3"]].map(([key,label])=>(
              <div key={key} style={{flex:1}}>
                <label style={S.lbl}>{label}</label>
                <select style={S.sel} value={posData[key]} onChange={e=>setPD(p=>({...p,[key]:e.target.value}))}>
                  {key!=="pos1"&&<option value="">なし</option>}
                  {POSITIONS.map(pos=><option key={pos}>{pos}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <label style={S.lbl}>サイド適性</label>
            <div style={{display:"flex",gap:8}}>
              {SIDES.map(s=>(
                <label key={s} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                  border:`1.5px solid ${posData.side===s?"#3b82f6":"#e2e8f0"}`,borderRadius:8,padding:"8px 4px",
                  cursor:"pointer",background:posData.side===s?"#eff6ff":"#fff",fontSize:13,fontWeight:posData.side===s?700:400}}>
                  <input type="radio" name="pside" checked={posData.side===s} onChange={()=>setPD(p=>({...p,side:s}))} style={{display:"none"}}/>
                  {s}
                </label>
              ))}
            </div>
          </div>
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
      <div style={S.row}>
        {[["pos1","第1"],["pos2","第2"],["pos3","第3"]].map(([key,label])=>(
          <div key={key} style={{flex:1}}>
            <label style={S.lbl}>{label}</label>
            <select style={S.sel} value={data[key]||""} onChange={e=>setData(p=>({...p,[key]:e.target.value}))}>
              {key!=="pos1"&&<option value="">なし</option>}
              {POSITIONS.map(pos=><option key={pos}>{pos}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{marginBottom:14}}>
        <label style={S.lbl}>サイド適性</label>
        <div style={{display:"flex",gap:8}}>
          {SIDES.map(s=>(
            <label key={s} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
              border:`1.5px solid ${data.side===s?"#3b82f6":"#e2e8f0"}`,borderRadius:8,padding:"8px 4px",
              cursor:"pointer",background:data.side===s?"#eff6ff":"#fff",fontSize:13,fontWeight:data.side===s?700:400}}>
              <input type="radio" name="side" checked={data.side===s} onChange={()=>setData(p=>({...p,side:s}))} style={{display:"none"}}/>
              {s}
            </label>
          ))}
        </div>
      </div>
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
        {isManager&&<button style={S.btnSm} onClick={()=>setShowAddEvent(true)}>＋ 追加</button>}
      </div>
      {sortedEvents.map(ev=>{
        const yes=getByStatus(ev.id,"出席").length,no=getByStatus(ev.id,"欠席").length,
              maybe=getByStatus(ev.id,"検討中").length,ill=getByStatus(ev.id,"療養中").length,
              un=getByStatus(ev.id,"未回答").length;
        const open=selectedEventId===ev.id;
        const dlSoon=isDeadlineSoon(ev),dlPast=isDeadlinePast(ev);
        return (
          <div key={ev.id} style={{...S.card,borderLeft:`4px solid ${ev.type==="match"?"#3b82f6":ev.type==="紅白戦"?"#ec4899":"#22c55e"}`,cursor:"pointer"}}
            onClick={()=>setSelectedEventId(open?null:ev.id)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <span style={S.badge(ev.type)}>{ev.type==="match"?"試合":ev.type==="紅白戦"?"紅白戦":"練習"}</span>
                <span style={{fontSize:15,fontWeight:700}}>{ev.title}</span>
              </div>
              <div style={{fontSize:12,color:"#64748b",textAlign:"right"}}>
                {ev.date.slice(5).replace("-","/")}
                <div style={{fontSize:11,color:"#94a3b8"}}>{ev.timeFrom}{ev.timeTo?`〜${ev.timeTo}`:""}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{ev.playerCount}人制</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <span style={{fontSize:12,color:"#64748b"}}>📍 {ev.place}</span>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.place)}`}
                target="_blank" rel="noopener noreferrer"
                style={{fontSize:11,color:"#3b82f6",background:"#eff6ff",borderRadius:4,padding:"1px 6px",textDecoration:"none"}}
                onClick={e=>e.stopPropagation()}>地図</a>
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
            {ev.note&&<div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>{ev.note}</div>}
            <div style={{display:"flex",gap:8,marginTop:8,fontSize:12,fontWeight:700,flexWrap:"wrap"}}>
              <span style={{color:"#22c55e"}}>✅ {yes}</span>
              <span style={{color:"#ef4444"}}>❌ {no}</span>
              <span style={{color:"#f59e0b"}}>🤔 {maybe}</span>
              {ill>0&&<span style={{color:"#8b5cf6"}}>🤒 {ill}</span>}
              {un>0&&<span style={{color:"#94a3b8"}}>⬜ {un}</span>}
            </div>
            {!isManager&&currentMember&&(()=>{
              const att=getAtt(ev.id,currentMember.id);
              return (
                <div style={{marginTop:8}} onClick={e=>e.stopPropagation()}>
                  <button style={{background:ATT_BG[att.status],border:`1.5px solid ${ATT_COLOR[att.status]}`,
                    borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",color:ATT_COLOR[att.status]}}
                    onClick={()=>setAttModal({evId:ev.id,memberId:currentMember.id})}>
                    {ATT_ICON[att.status]} 自分の出欠: {att.status}　（タップで変更）
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
                    onClick={()=>{setFormationEvId(ev.id);setTab("formation");}}>
                    ⚽ 布陣を確認
                  </button>
                  {isManager&&un>0&&(
                    <button style={{...S.btnSm,background:"#06C755",flex:1}} onClick={()=>setShowReminder(ev.id)}>
                      💬 LINEリマインド
                    </button>
                  )}
                </div>
                {isManager&&(
                  <button style={{...S.btnSm,background:"#ef4444",width:"100%",marginTop:8}}
                    onClick={()=>{
                      if(window.confirm(`「${ev.title}」を削除しますか？`)){
                        setEvents(p=>p.filter(e=>e.id!==ev.id));
                        setSelectedEventId(null);
                      }
                    }}>
                    🗑️ このイベントを削除
                  </button>
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
        </div>
      ))}
    </div>
  );

  const renderFormation = () => {
    const ev=events.find(e=>e.id===formationEvId)||events[0];
    if(!ev) return null;
    const attending=members.filter(m=>getAtt(ev.id,m.id).status==="出席");
    const forceAll=attending.length>=12;
    const is紅白=ev.type==="紅白戦";
    const availF=Object.entries(FORMATIONS).filter(([,f])=>ev.playerCount<=8?f.min<=8:f.min===11);
    const fKey=availF.find(([k])=>k===formationKey)?formationKey:availF[0]?.[0]||"4-3-3";
    return (
      <div style={S.body}>
        <div style={{fontSize:15,fontWeight:700,marginBottom:10}}>布陣</div>
        <div style={S.card}>
          <label style={S.lbl}>イベントを選択</label>
          <select style={S.sel} value={formationEvId} onChange={e=>setFormationEvId(parseInt(e.target.value))}>
            {events.map(e=><option key={e.id} value={e.id}>{e.date.slice(5).replace("-","/")} {e.title}（{e.playerCount}人制）</option>)}
          </select>
        </div>
        <div style={S.card}>
          <label style={S.lbl}>フォーメーション</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {availF.map(([k,f])=>(
              <button key={k} onClick={()=>setFormationKey(k)}
                style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:fKey===k?700:500,cursor:"pointer",
                  background:fKey===k?"#1e3a5f":"#f1f5f9",color:fKey===k?"#fff":"#475569",border:"none"}}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{fontSize:13,color:"#64748b",marginBottom:6}}>
          出席: {attending.length}名 / {members.length}名　{ev.playerCount}人制
          {forceAll&&<span style={{marginLeft:6,color:"#f59e0b",fontWeight:700}}>⚠️ 12名以上：全員起用</span>}
        </div>
        {is紅白?(()=>{
          const {red,white}=splitTeams(attending);
          return (
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"#dc2626",marginBottom:6}}>🔴 紅チーム（{red.length}名）</div>
              <FieldDisplay formation={assignFormation(red,fKey,red.length>=12)} accentColor="#dc2626"/>
              <div style={{fontSize:13,fontWeight:700,color:"#475569",margin:"12px 0 6px"}}>⚪ 白チーム（{white.length}名）</div>
              <FieldDisplay formation={assignFormation(white,fKey,white.length>=12)} accentColor="#475569"/>
            </div>
          );
        })():<FieldDisplay formation={assignFormation(attending,fKey,forceAll)}/>}
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
                  <div style={{fontSize:11,color:"#64748b"}}>{[m.pos1,m.pos2,m.pos3].filter(Boolean).join(" › ")}　{m.side}</div>
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
              onClick={()=>{setEditTeamName(teamName);setShowSettings(true);}}>⚙️</button>}
            <button style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"6px 10px",color:"#94a3b8",fontSize:12,cursor:"pointer"}}
              onClick={()=>setShowLogin(true)}>🔄</button>
          </div>
        </div>
        <div style={S.tabs}>
          {[{key:"schedule",label:"日程"},{key:"announcements",label:"お知らせ"},{key:"formation",label:"布陣"},{key:"members",label:"メンバー"}].map(t=>(
            <button key={t.key} style={S.tab(tab===t.key)} onClick={()=>setTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab==="schedule"&&renderSchedule()}
      {tab==="announcements"&&renderAnnouncements()}
      {tab==="formation"&&renderFormation()}
      {tab==="members"&&renderMembers()}

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
            <div style={{marginBottom:16}}>
              <label style={S.lbl}>ロゴ画像</label>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {logoUrl&&<img src={logoUrl} alt="logo" style={{width:48,height:48,borderRadius:8,objectFit:"cover"}}/>}
                <button style={S.btnGhost} onClick={()=>logoInputRef.current.click()}>{logoUrl?"変更":"アップロード"}</button>
                {logoUrl&&<button style={{...S.btnGhost,color:"#ef4444",borderColor:"#fca5a5"}} onClick={()=>setLogoUrl(null)}>削除</button>}
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
                    onClick={()=>setAdmins(p=>p.filter((_,j)=>j!==i))}>削除</button>
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <input style={{...S.inp,flex:1}} placeholder="管理者名を追加" value={newAdminName} onChange={e=>setNewAdminName(e.target.value)}/>
                <button style={S.btnSm} onClick={()=>{if(newAdminName){setAdmins(p=>[...p,newAdminName]);setNewAdminName("");}}}>追加</button>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1}} onClick={()=>{setTeamName(editTeamName);setShowSettings(false);}}>保存</button>
              <button style={{...S.btnGhost,flex:1}} onClick={()=>setShowSettings(false)}>キャンセル</button>
            </div>
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
          <div style={S.mbox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:14}}>イベント追加</div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>種別</label>
              <select style={S.sel} value={newEvent.type} onChange={e=>setNE(p=>({...p,type:e.target.value}))}>
                <option value="match">試合</option><option value="practice">練習</option><option value="紅白戦">紅白戦</option>
              </select>
            </div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>タイトル</label>
              <input style={S.inp} placeholder="例: vs FC東京" value={newEvent.title} onChange={e=>setNE(p=>({...p,title:e.target.value}))}/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>日付</label>
              <input style={S.inp} type="date" value={newEvent.date} onChange={e=>setNE(p=>({...p,date:e.target.value}))}/>
            </div>
            <div style={S.row}>
              <div style={{flex:1}}>
                <label style={S.lbl}>開始時間</label>
                <select style={S.sel} value={newEvent.timeFrom} onChange={e=>setNE(p=>({...p,timeFrom:e.target.value}))}>
                  <option value="">--:--</option>
                  {Array.from({length:144},(_,i)=>{const h=Math.floor(i/6).toString().padStart(2,"0"),m=(i%6*10).toString().padStart(2,"0");return <option key={i} value={`${h}:${m}`}>{`${h}:${m}`}</option>;})}
                </select>
              </div>
              <div style={{flex:1}}>
                <label style={S.lbl}>終了時間</label>
                <select style={S.sel} value={newEvent.timeTo} onChange={e=>setNE(p=>({...p,timeTo:e.target.value}))}>
                  <option value="">--:--</option>
                  {Array.from({length:144},(_,i)=>{const h=Math.floor(i/6).toString().padStart(2,"0"),m=(i%6*10).toString().padStart(2,"0");return <option key={i} value={`${h}:${m}`}>{`${h}:${m}`}</option>;})}
                </select>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <label style={S.lbl}>場所（Googleマップ連動）</label>
              <input style={S.inp} placeholder="例: 代々木公園グラウンド" value={newEvent.place} onChange={e=>setNE(p=>({...p,place:e.target.value}))}/>
              {newEvent.place&&(
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newEvent.place)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-block",marginTop:4,fontSize:11,color:"#3b82f6",textDecoration:"none"}}>
                  📍 Googleマップで確認する →
                </a>
              )}
            </div>
            <div style={{marginBottom:10}}>
              <label style={{...S.lbl,color:"#d97706"}}>⏰ 回答期限</label>
              <div style={S.row}>
                <div style={{flex:1}}>
                  <input style={{...S.inp,borderColor:"#f59e0b",background:"#fffbeb"}} type="date" value={newEvent.deadline} onChange={e=>setNE(p=>({...p,deadline:e.target.value}))}/>
                </div>
                <div style={{flex:1}}>
                  <select style={{...S.sel,borderColor:"#f59e0b",background:"#fffbeb"}} value={newEvent.deadlineTime} onChange={e=>setNE(p=>({...p,deadlineTime:e.target.value}))}>
                    <option value="">時間指定なし</option>
                    {Array.from({length:144},(_,i)=>{const h=Math.floor(i/6).toString().padStart(2,"0"),m=(i%6*10).toString().padStart(2,"0");return <option key={i} value={`${h}:${m}`}>{`${h}:${m}`}</option>;})}
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
            <div style={{marginBottom:16}}>
              <label style={S.lbl}>メモ</label>
              <input style={S.inp} placeholder="例: ホーム戦" value={newEvent.note} onChange={e=>setNE(p=>({...p,note:e.target.value}))}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1}} onClick={addEvent}>追加する</button>
              <button style={{...S.btnGhost,flex:1}} onClick={()=>setShowAddEvent(false)}>キャンセル</button>
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
                      {memberDetail.pos1?`${[memberDetail.pos1,memberDetail.pos2,memberDetail.pos3].filter(Boolean).join(" › ")}　${memberDetail.side}`:"ポジション未入力"}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {(isManager||currentUser===memberDetail.id)&&(
                      <button style={S.btnSm} onClick={()=>{setED({...memberDetail});setEditMemberId(memberDetail.id);}}>編集</button>
                    )}
                    {isManager&&(
                      <button style={{...S.btnSm,background:"#ef4444"}} onClick={()=>{
                        if(window.confirm(`${memberDetail.name}を削除しますか？`)){
                          setMembers(p=>p.filter(m=>m.id!==memberDetail.id));
                          setShowMemberDetail(null);
                        }
                      }}>削除</button>
                    )}
                  </div>
                </div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>出欠履歴</div>
                {events.map(ev=>{
                  const att=getAtt(ev.id,memberDetail.id);
                  return (
                    <div key={ev.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
                      <div>
                        <span style={S.badge(ev.type)}>{ev.type==="match"?"試合":ev.type==="紅白戦"?"紅白戦":"練習"}</span>
                        <span style={{fontSize:13}}>{ev.title}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontWeight:700,color:ATT_COLOR[att.status],fontSize:12}}>{ATT_ICON[att.status]} {att.status}</span>
                        {att.decideBy&&<div style={{fontSize:10,color:"#f59e0b"}}>{att.decideBy.slice(5).replace("-","/")}までに決定</div>}
                        {att.comment&&<div style={{fontSize:10,color:"#64748b"}}>💬 {att.comment}</div>}
                      </div>
                    </div>
                  );
                })}
                <button style={{...S.btnGhost,width:"100%",marginTop:14}} onClick={()=>setShowMemberDetail(null)}>閉じる</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
