import{initializeApp}from'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import{getFirestore,collection,getDocs,doc,getDoc,setDoc,addDoc,updateDoc,query,orderBy,limit,where,increment}from'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import{getAuth,onAuthStateChanged,signOut}from'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import{getFunctions,httpsCallable}from'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';

const app=initializeApp({apiKey:"AIzaSyD7BVxbfGskF10IcifVxyvWwAaAYPb-frw",authDomain:"classmind-9a22a.firebaseapp.com",projectId:"classmind-9a22a",storageBucket:"classmind-9a22a.firebasestorage.app",messagingSenderId:"893980768351",appId:"1:893980768351:web:972e20a662054f29c483ea"});
const db=getFirestore(app),auth=getAuth(app),fns=getFunctions(app);
const aiSummaryFn=httpsCallable(fns,'aiSummary');
const aiTranscribeFn=httpsCallable(fns,'aiTranscribe');
// H-2 (SA_2026-04-24): public web logs go through the server callable so
// userName is pinned from the profile doc + PII is redacted. Direct client
// writes to /appLogs let any authed user forge "Riley Edds (admin)" rows.
const writeClientLogFn=httpsCallable(fns,'writeClientLog');

const COLORS=['#1a6bff','#a855f7','#22c55e','#f59e0b','#ec4899','#06b6d4','#ef4444','#8b5cf6'];
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const APP_VERSION='web-1.0.0';

function esc(t){const d=document.createElement('div');d.textContent=t||'';return d.innerHTML;}
function sameDay(a,b){return a.toDateString()===b.toDateString();}
function timeMin(t){if(!t)return 9999;const m=t.match(/(\d+):(\d+)\s*(AM|PM)?/i);if(!m)return 9999;let h=+m[1],mn=+m[2];if(m[3]){if(m[3].toUpperCase()==='PM'&&h!==12)h+=12;if(m[3].toUpperCase()==='AM'&&h===12)h=0;}return h*60+mn;}
function getSun(d){const c=new Date(d);c.setDate(c.getDate()-c.getDay());c.setHours(0,0,0,0);return c;}
function fmtDate(ts){return ts?new Date(ts*1000).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—';}

// ============ ERROR LOGGING ============
let _uid='',_userName='';

// Sampling (2026-04-27): info/success log at 1%, error/warn at 100%.
// Cuts /appLogs write volume ~95% per page load. Same change in admin-shared.js + ErrorLogger.swift.
const APPLOG_SAMPLE_RATE=0.01;
function _shouldLog(level){
  if(level==='error'||level==='warn')return true;
  return Math.random()<APPLOG_SAMPLE_RATE;
}
async function appLog(level,message,context){
  if(!_shouldLog(level))return;
  try{
    const page=window.location.pathname.split('/').pop()||'unknown';
    await writeClientLogFn({
      level,
      message:String(message).substring(0,1000),
      context:context||page,
      userName:_userName||'unknown',
      platform:'web',
      appVersion:APP_VERSION,
      url:window.location.href,
      userAgent:navigator.userAgent.substring(0,200)
    });
  }catch(e){console.error('Failed to write log:',e);}
}

function logError(message,context){console.error('[CM Error]',context,message);appLog('error',message,context);}
function logSuccess(message,context){console.log('[CM Success]',context,message);appLog('success',message,context);}
function logInfo(message,context){console.log('[CM Info]',context,message);appLog('info',message,context);}

// Global error handlers
window.onerror=function(msg,src,line,col,err){
  const file=(src||'').split('/').pop();
  logError(`${msg} (${file}:${line}:${col})`,'window.onerror');
};
window.onunhandledrejection=function(e){
  const msg=e.reason?.message||e.reason?.code||String(e.reason);
  logError(msg,'unhandledrejection');
};

// ============ SIDEBAR ============
function renderSidebar(isAdmin){
  const slot=document.getElementById('sidebarSlot');
  if(!slot)return;
  const page=window.location.pathname.split('/').pop()||'home.html';
  const items=[
    ['home.html',        '🏠', 'Home'],
    ['classes.html',     '📚', 'Classes'],
    ['record.html',      '🎙', 'Record'],
    ['study.html',       '🃏', 'Study'],
    ['assignments.html', '📋', 'Assignments'],
    ['tutor.html',       '✨', 'Tutor'],
    ['chat.html',        '💬', 'Chat']
  ];
  slot.className='sidebar';
  slot.innerHTML=`
    <div class="cm"><img src="/WebsiteLogo.png" alt="ClassMinds"/></div>
    <nav>
      ${items.map(([href,emoji,label])=>`
        <a class="ni${page===href?' active':''}" href="${href}" title="${label}">${emoji}<span class="sb-tt">${label}</span></a>
      `).join('')}
      ${isAdmin?'<a class="ni" href="admin/admin.html" title="Admin">🛡<span class="sb-tt">Admin</span></a>':''}
    </nav>
    <div class="spacer"></div>
    <a class="avatar" id="avBtn" href="settings.html" title="Settings"></a>
  `;
  // Sign-out moves to settings.html per canvas design; no click handler here.
}

function requireUser(){
  return new Promise((resolve)=>{
    onAuthStateChanged(auth,async(user)=>{
      if(!user){window.location.href='login.html';return;}
      try{
        const snap=await getDoc(doc(db,'users',user.uid));
        const data=snap.exists()?snap.data():{};
        const isAdmin=!!data.isAdmin;
        _uid=user.uid;
        _userName=(data.firstName||'')+' '+(data.lastName||'');
        document.body.style.display='block';
        renderSidebar(isAdmin);
        const av=document.getElementById('avBtn');
        if(av)av.textContent=(data.firstName||data.email||'?').charAt(0).toUpperCase();
        logInfo('Page loaded','auth');
        resolve({user,profile:data,uid:user.uid,isAdmin});
      }catch(e){
        logError('Auth check failed: '+e.message,'requireUser');
        window.location.href='login.html';
      }
    });
  });
}

// Defensive render-side dedup (2026-04-27): if a user re-imports their
// schedule and the server creates new /classes docs (recordParsedSchedule
// dedup miss), they end up with two joinedClasses entries for the same
// course. Collapse them here on read so the UI doesn't show pairs.
// Canonical key: lowercased+whitespace-stripped courseCode|section|term.
// Tie-break: keep the most recently joined doc (highest joinedAt).
function _classDedupKey(c){
  return [c.courseCode||'',c.section||'',c.term||'']
    .join('|').replace(/\s+/g,'').toLowerCase();
}
function _joinedAtMs(c){
  const v=c.joinedAt;
  if(!v) return 0;
  if(typeof v==='number') return v*1000;
  if(typeof v==='object'&&typeof v.seconds==='number') return v.seconds*1000;
  if(typeof v==='string'){const t=Date.parse(v);return Number.isFinite(t)?t:0;}
  return 0;
}
async function loadClasses(uid){
  try{
    const s=await getDocs(collection(db,'users',uid,'joinedClasses'));
    const raw=s.docs.map(d=>({id:d.id,...d.data()})).filter(c=>c.courseCode||c.courseName);

    const byKey=new Map();
    let droppedDupes=0;
    for(const c of raw){
      const k=_classDedupKey(c);
      const prev=byKey.get(k);
      if(!prev){byKey.set(k,c);continue;}
      droppedDupes++;
      if(_joinedAtMs(c)>=_joinedAtMs(prev)) byKey.set(k,c);
    }
    if(droppedDupes>0){
      logInfo(`loadClasses: collapsed ${droppedDupes} duplicate joinedClasses entries for uid=${uid}`,'loadClasses');
    }

    const classes=[...byKey.values()];
    classes.sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
    const colorMap={};
    classes.forEach((c)=>{colorMap[c.classId||c.id]=COLORS[(c.colorIndex||0)%COLORS.length];});
    return{classes,colorMap};
  }catch(e){
    logError('Failed to load classes: '+e.message,'loadClasses');
    return{classes:[],colorMap:{}};
  }
}

async function loadAssignments(uid){
  try{
    const s=await getDocs(collection(db,'users',uid,'assignments'));
    return s.docs.map(d=>{const x=d.data();return{id:d.id,...x,status:x.completed?'done':(x.status||'notStarted'),isExam:false};}).filter(a=>a.title);
  }catch(e){
    logError('Failed to load assignments: '+e.message,'loadAssignments');
    return[];
  }
}

async function loadTests(uid){
  try{
    const s=await getDocs(collection(db,'users',uid,'tests'));
    return s.docs.map(d=>{const x=d.data();return{id:d.id,...x,status:x.completed?'done':(x.status||'notStarted'),isExam:true};}).filter(a=>a.title);
  }catch(e){
    logError('Failed to load tests: '+e.message,'loadTests');
    return[];
  }
}

export{
  app,db,auth,fns,aiSummaryFn,aiTranscribeFn,
  COLORS,DAYS,APP_VERSION,
  esc,sameDay,timeMin,getSun,fmtDate,
  renderSidebar,requireUser,
  loadClasses,loadAssignments,loadTests,
  logError,logSuccess,logInfo,appLog,
  collection,getDocs,doc,getDoc,setDoc,addDoc,updateDoc,query,orderBy,limit,where,increment,signOut
};