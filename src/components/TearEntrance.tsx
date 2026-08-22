"use client";
/* ═══════════════════════════════════════════════════════════════
   TearEntrance — the site entrance with the hidden tearable paper.
   Amit Brin · amitbrin.com · physics calibration 2026-07-06

   WHAT THIS RENDERS
   ┌────────────────────────────────────────────┐
   │ THE PAPER  — the real entrance text (plain │
   │ selectable HTML) + a 90px curled corner    │
   │ (קרע). Grabbing the corner wakes the paper │
   │ physics; the whole page becomes tearable.  │
   ├────────────────────────────────────────────┤
   │ BENEATH IT — the full one-pager (SitePage) │
   │ portrait section first, sailing hero next. │
   │ Its videos autoplay while covered, so      │
   │ every hole opens onto a MOVING page.       │
   └────────────────────────────────────────────┘
   At 65% torn the sheet drops and the one-pager becomes the page.
   The plain link is always visible (easter egg, never a gate);
   no JS / no WebGL → a perfectly normal text page.

   NOTE: imports the production one-pager from app/site/page
   (the restructured order). When /site is promoted to the new
   order, change the import back to "../app/site/page".
═══════════════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from "react";
import SitePage from "../app/site/page";

/* ─── Amit's final physics calibration ─── */
const TUNING = {
  GRID: 140,
  GRID_MOBILE: 90,
  TEAR_THRESHOLD: 1.6,
  CUT_RADIUS: 25,
  STIFFNESS: 1,
  BEND: 0.95,
  CURL: 0.95,
  GRAVITY: 0.35,
  DAMPING: 0.85,
  ITERATIONS: 3,
  MOUSE_RADIUS: 40,
  MOUSE_STRENGTH: 0.9,
  GRAB_LIFT: 110,
  HOVER_PUSH: 1.5,
  PRESS_DEPTH: 60,
  PRESS_SHADE: 0.2,
  FLATNESS: 0.08,
  LIGHTING: 0.2,
  DROP_AT: 0.65,
  RIP_SPEED: 2.2,     /* auto-completing rip speed (lab-approved) */
  RIP_MIN_SPAN: 0.22, /* stroke span that arms an auto-rip */
};

/* ─── entrance-page CSS ───
   Self-contained (not Tailwind) because the SVG-snapshot that the
   torn canvas renders must embed the exact same stylesheet — this
   string is used twice: as a <style> tag AND inside the snapshot. */
const PAPER_CSS = `
.tear-paper-root { background:#ffffff; color:#000; direction:rtl; }
.tear-paper-inner { max-width:700px; margin:0 auto; padding:2.5rem 1.25rem; text-align:right;
  font-family: system-ui, Arial, sans-serif; font-size:1rem; line-height:1.75; }
.tear-paper-inner p { margin:0 0 1.25rem; }
.tear-paper-inner .tp-tagline { font-size:.875rem; margin-bottom:2rem; }
.tear-paper-inner .tp-services p { margin-bottom:.5rem; }
.tear-paper-inner .tp-services p.last { margin-bottom:1.25rem; }
.tear-paper-inner .tp-gap { margin-top:2.5rem; }
.tear-paper-inner a { color:#1d4ed8; text-decoration:underline; }
.tear-paper-inner a:hover { text-decoration:none; }
.tear-paper-inner .tp-footer { margin-top:2.5rem; padding-top:1.25rem; }
`;

/* ─── stage / under / canvas / dog-ear CSS (not needed in snapshot) ─── */
const STAGE_CSS = `
.tear-stage { position:relative; min-height:100vh; }
.tear-under { position:absolute; inset:0; overflow:hidden; z-index:1;
  background:#fff; filter:brightness(0.88); }
.tear-stage.revealed .tear-under { position:static; overflow:visible; filter:none; }
.tear-paper-root { position:relative; z-index:2; min-height:100vh; padding-bottom:110px; }
.tear-stage.tearing .tear-paper-root { visibility:hidden; }
html, body { overscroll-behavior:none; } /* blocks pull-to-refresh / swipe-nav hijacking the tear */
.tear-canvas { position:absolute; z-index:3; touch-action:none; cursor:grab; }
.tear-canvas.dragging { cursor:grabbing; }

.tear-dogear { position:fixed; bottom:0; inset-inline-end:0; width:clamp(190px, 26vw, 340px); height:clamp(190px, 26vw, 340px);
  cursor:grab; z-index:6; background:transparent; border:none; padding:0; will-change:transform; }
.tear-dogear svg { width:100%; height:100%; display:block; }
.tear-dogear .flapG { transform-origin:2% 98%; animation:tearPeel 2.4s ease-in-out infinite alternate; }
.tear-dogear .flapShadow { animation:tearPeelShadow 2.6s ease-in-out infinite alternate; }
@keyframes tearPeel { 0% { transform:rotate(-3deg) translate(0,0); } 50% { transform:rotate(-15deg) translate(5px,-6px); } 100% { transform:rotate(-7deg) translate(2px,-2px); } }
@keyframes tearPeelShadow { from { opacity:.14; } to { opacity:.26; } }
.tear-dogear .tp-label { position:absolute; bottom:62%; inset-inline-end:58%;
  font-size:1rem; font-weight:700; letter-spacing:.05em; color:#000; opacity:.8;
  transition:opacity .2s; pointer-events:none; font-family:system-ui, Arial, sans-serif; }
.tear-dogear:hover .tp-label, .tear-dogear:focus-visible .tp-label { opacity:1; }
.tear-dogear:active { cursor:grabbing; }
.tear-stage.tearing .tear-dogear { opacity:0; pointer-events:none; } /* stays in DOM: iOS keeps the touch stream alive */
@media (max-width:560px){ .tear-dogear { width:38vw; height:38vw; } .tear-dogear .tp-label { font-size:.82rem; } }
`;

/* ─── the paper physics, verbatim from the calibrated build,
       run in a Web Worker so the main thread never stutters ─── */
const WORKER_SRC = String.raw`
"use strict";
let N=0, X,Y,Z,PX,PY,PZ,HX,HY,PIN,DAM,DAMF,DISPF,GRABF;
let CA,CB,CREST,CR,CBROKEN,CTYPE,CJIT,CX1,CX2, CN=0;
let COLS,ROWS,W,H,PADX,PADY,cellW,cellH,maxLen,maxLenSq;
let CFG=null, brokenCount=0, dropped=false, awake=false;
let grabbed=null, grabOX=null, grabOY=null;
let hover={x:-1e9,y:-1e9,vx:0,vy:0};
let pDown=false, pX=0, pY=0;
let cutX=0, cutY=0;
let lastLoad=0;
let autoRips=[],strokeSX=0,strokeSY=0,strokeLen=0,strokes=0;
const pool=[];
function computeMaxLen(){ maxLen=Math.max(cellW,cellH)*CFG.TEAR_THRESHOLD; maxLenSq=maxLen*maxLen; }
function init(cfg){
  CFG=cfg; W=cfg.W;H=cfg.H;PADX=cfg.PADX;PADY=cfg.PADY;COLS=cfg.COLS;ROWS=cfg.ROWS;
  cellW=W/COLS; cellH=H/ROWS; computeMaxLen();
  N=(COLS+1)*(ROWS+1);
  X=new Float32Array(N);Y=new Float32Array(N);Z=new Float32Array(N);
  PX=new Float32Array(N);PY=new Float32Array(N);PZ=new Float32Array(N);
  HX=new Float32Array(N);HY=new Float32Array(N);
  PIN=new Uint8Array(N);DAM=new Uint8Array(N);DAMF=new Float32Array(N);
  DISPF=new Uint8Array(N);GRABF=new Uint8Array(N);
  const nSH=(ROWS+1)*COLS,nSV=(COLS+1)*ROWS,nSh=2*COLS*ROWS;
  const nBH=(ROWS+1)*(COLS-1),nBV=(COLS+1)*(ROWS-1);
  CN=nSH+nSV+nSh+nBH+nBV;
  CA=new Int32Array(CN);CB=new Int32Array(CN);
  CREST=new Float32Array(CN);CR=new Float32Array(CN);
  CBROKEN=new Uint8Array(CN);CTYPE=new Uint8Array(CN);CJIT=new Float32Array(CN);
  CX1=new Int32Array(CN).fill(-1);CX2=new Int32Array(CN).fill(-1);
  const idx=(r,c)=>r*(COLS+1)+c;
  const diag=Math.sqrt(cellW*cellW+cellH*cellH);
  let k=0; const shIdx={},svIdx={};
  for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS;c++){CA[k]=idx(r,c);CB[k]=idx(r,c+1);CREST[k]=cellW;CTYPE[k]=0;shIdx[r+","+c]=k;k++;}
  for(let r=0;r<ROWS;r++)for(let c=0;c<=COLS;c++){CA[k]=idx(r,c);CB[k]=idx(r+1,c);CREST[k]=cellH;CTYPE[k]=0;svIdx[r+","+c]=k;k++;}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    CA[k]=idx(r,c);CB[k]=idx(r+1,c+1);CREST[k]=diag;CTYPE[k]=1;k++;
    CA[k]=idx(r,c+1);CB[k]=idx(r+1,c);CREST[k]=diag;CTYPE[k]=1;k++;}
  for(let r=0;r<=ROWS;r++)for(let c=0;c<COLS-1;c++){
    CA[k]=idx(r,c);CB[k]=idx(r,c+2);CREST[k]=cellW*2;CTYPE[k]=2;
    const s1=shIdx[r+","+c],s2=shIdx[r+","+(c+1)];
    if(CX1[s1]<0)CX1[s1]=k;else CX2[s1]=k;
    if(CX1[s2]<0)CX1[s2]=k;else CX2[s2]=k;k++;}
  for(let r=0;r<ROWS-1;r++)for(let c=0;c<=COLS;c++){
    CA[k]=idx(r,c);CB[k]=idx(r+2,c);CREST[k]=cellH*2;CTYPE[k]=2;
    const s1=svIdx[r+","+c],s2=svIdx[(r+1)+","+c];
    if(CX1[s1]<0)CX1[s1]=k;else CX2[s1]=k;
    if(CX1[s2]<0)CX1[s2]=k;else CX2[s2]=k;k++;}
  for(let j=0;j<CN;j++)CJIT[j]=0.85+Math.random()*0.4;
  CR.set(CREST); resetSheet(); pool.length=0; pool.push(makeBuffers(),makeBuffers());
}
function resetSheet(){
  let i=0;
  for(let r=0;r<=ROWS;r++)for(let c=0;c<=COLS;c++,i++){
    HX[i]=PADX+c*cellW;HY[i]=PADY+r*cellH;
    X[i]=PX[i]=HX[i];Y[i]=PY[i]=HY[i];Z[i]=PZ[i]=0;
    PIN[i]=(r===0||r===ROWS||c===0||c===COLS)?1:0;}
  CBROKEN.fill(0);DAM.fill(0);DAMF.fill(0);DISPF.fill(0);GRABF.fill(0);CR.set(CREST);
  brokenCount=0;dropped=false;awake=false;lastLoad=0;grabbed=null;pDown=false;
}
function makeBuffers(){return{pos:new Float32Array(N*3),nor:new Float32Array(N*3),idx:new Uint16Array(COLS*ROWS*6),dam:new Float32Array(N)};}
function breakC(k){
  if(CBROKEN[k])return;
  CBROKEN[k]=1;brokenCount++;
  const a=CA[k],b=CB[k];
  const jx=cellW*0.35,jy=cellH*0.35;
  for(const p of [a,b]){
    if(!DAM[p]&&!PIN[p]){
      const ox=(Math.random()-0.5)*2*jx,oy=(Math.random()-0.5)*2*jy;
      HX[p]+=ox;HY[p]+=oy;X[p]+=ox;Y[p]+=oy;PX[p]+=ox;PY[p]+=oy;}}
  DAM[a]=1;DAM[b]=1;
  DAMF[a]=Math.min(2.0,DAMF[a]+0.18);DAMF[b]=Math.min(2.0,DAMF[b]+0.18);
  if(!PIN[a])Z[a]+=1.2+Math.random()*2.2;
  if(!PIN[b])Z[b]+=1.2+Math.random()*2.2;
  if(CTYPE[k]===0){if(CX1[k]>=0)breakC(CX1[k]);if(CX2[k]>=0)breakC(CX2[k]);}
}
function segInt(ax,ay,bx,by,cx,cy,dx,dy){
  const d1=(dx-cx)*(ay-cy)-(dy-cy)*(ax-cx);
  const d2=(dx-cx)*(by-cy)-(dy-cy)*(bx-cx);
  const d3=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);
  const d4=(bx-ax)*(dy-ay)-(by-ay)*(dx-ax);
  return ((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));
}
function cutAlong(x0,y0,x1,y1){
  const R=Math.max(2,CFG.CUT_RADIUS*0.35);
  const bound=CFG.CUT_RADIUS+Math.max(cellW,cellH);
  const minX=Math.min(x0,x1)-bound,maxX=Math.max(x0,x1)+bound;
  const minY=Math.min(y0,y1)-bound,maxY=Math.max(y0,y1)+bound;
  const sx=x1-x0,sy=y1-y0;
  const segLen2=sx*sx+sy*sy||1e-6;
  const R2=R*R;
  for(let k=0;k<CN;k++){
    if(CBROKEN[k])continue;
    const a=CA[k],b=CB[k];
    if(GRABF[a]||GRABF[b])continue;
    if(DISPF[a]&&DISPF[b])continue;
    const mx=(X[a]+X[b])*0.5,my=(Y[a]+Y[b])*0.5;
    if(mx<minX||mx>maxX||my<minY||my>maxY)continue;
    if(segInt(X[a],Y[a],X[b],Y[b],x0,y0,x1,y1)){breakC(k);continue;}
    let t=((mx-x0)*sx+(my-y0)*sy)/segLen2;
    t=t<0?0:(t>1?1:t);
    const dx=mx-(x0+sx*t),dy=my-(y0+sy*t);
    if(dx*dx+dy*dy<R2)breakC(k);}
}
function step(){
  const ramp=lastLoad<0.2?0:(lastLoad-0.2)*3;
  const g=!awake?0:dropped?Math.max(CFG.GRAVITY*5,0.35):CFG.GRAVITY*(1+ramp);
  const damp=CFG.DAMPING;
  const flatLim=2*Math.max(cellW,cellH),flat2=flatLim*flatLim;
  for(let i=0;i<N;i++){
    if(PIN[i])continue;
    const vx=(X[i]-PX[i])*damp,vy=(Y[i]-PY[i])*damp,vz=(Z[i]-PZ[i])*damp;
    PX[i]=X[i];PY[i]=Y[i];PZ[i]=Z[i];
    X[i]+=vx;Y[i]+=vy+g;Z[i]+=vz;
    if(!awake){
      X[i]+=(HX[i]-X[i])*0.08;Y[i]+=(HY[i]-Y[i])*0.08;Z[i]+=(0-Z[i])*0.06;
    } else if(!dropped&&!DAM[i]&&CFG.FLATNESS>0){
      const hx=HX[i]-X[i],hy=HY[i]-Y[i];
      if(hx*hx+hy*hy<flat2){
        X[i]+=hx*CFG.FLATNESS;Y[i]+=hy*CFG.FLATNESS;Z[i]+=(0-Z[i])*CFG.FLATNESS;}}}
  if(pDown&&grabbed){
    const s=CFG.MOUSE_STRENGTH;
    for(let j=0;j<grabbed.length;j++){
      const i=grabbed[j];
      if(PIN[i])continue;
      X[i]+=(pX+grabOX[j]-X[i])*s;
      Y[i]+=(pY+grabOY[j]-Y[i])*s;
      Z[i]+=(CFG.GRAB_LIFT-Z[i])*s*0.6;}}
  if(!pDown&&CFG.HOVER_PUSH>0&&CFG.PRESS_DEPTH>0){
    const R=Math.max(CFG.MOUSE_RADIUS,60),R2=R*R;
    for(let i=0;i<N;i++){
      if(PIN[i])continue;
      const dx=hover.x-X[i],dy=hover.y-Y[i],d2=dx*dx+dy*dy;
      if(d2<R2){
        let f=1-Math.sqrt(d2)/R;f=f*f;
        const tz=-CFG.PRESS_DEPTH*f*CFG.HOVER_PUSH;
        Z[i]+=(tz-Z[i])*0.35;
        X[i]+=hover.vx*f*0.06;Y[i]+=hover.vy*f*0.06;}}}
  if(CFG.CURL>0){
    for(let k=0;k<CN;k++){
      if(CBROKEN[k]||CTYPE[k]===0)continue;
      const a=CA[k],b=CB[k];
      const wA=DAM[a]?DAMF[a]:(DISPF[a]?0.6:0.0);
      const wB=DAM[b]?DAMF[b]:(DISPF[b]?0.6:0.0);
      if(wA>0&&wB>0){
        const local=Math.min(1.6,(wA+wB)*0.5);
        CR[k]+=(CREST[k]*(1-0.16*CFG.CURL*local)-CR[k])*0.04;}}}
  const stiff=CFG.STIFFNESS;
  for(let it=0;it<CFG.ITERATIONS;it++){
    for(let k=0;k<CN;k++){
      if(CBROKEN[k])continue;
      const a=CA[k],b=CB[k];
      const dx=X[b]-X[a],dy=Y[b]-Y[a],dz=Z[b]-Z[a];
      const d=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-4;
      if(d>CR[k]*CFG.TEAR_THRESHOLD*CJIT[k]){
        if(pDown||DAM[a]||DAM[b]){breakC(k);continue;}}
      const w=CTYPE[k]===2?CFG.BEND:1.0;
      const diff=(d-CR[k])/d*0.5*stiff*w;
      const ox=dx*diff,oy=dy*diff,oz=dz*diff;
      if(!PIN[a]){X[a]+=ox;Y[a]+=oy;Z[a]+=oz;}
      if(!PIN[b]){X[b]-=ox;Y[b]-=oy;Z[b]-=oz;}}}
}
function buildMesh(buf){
  const pos=buf.pos,nor=buf.nor,idx=buf.idx,dam=buf.dam;
  for(let i=0;i<N;i++){
    pos[i*3]=X[i];pos[i*3+1]=Y[i];pos[i*3+2]=Z[i];
    nor[i*3]=0;nor[i*3+1]=0;nor[i*3+2]=0;
    dam[i]=DAMF[i];}
  let t=0;
  const c1=COLS+1;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const A=c+c1*r,B=c+c1*(r+1),C=c+1+c1*(r+1),D=c+1+c1*r;
    if(edgeOK(A,B)&&edgeOK(A,D)){idx[t++]=A;idx[t++]=B;idx[t++]=D;acc(nor,A,B,D);}
    if(edgeOK(B,C)&&edgeOK(C,D)){idx[t++]=B;idx[t++]=C;idx[t++]=D;acc(nor,B,C,D);}}
  for(let i=0;i<N;i++){
    const n=i*3,l=Math.sqrt(nor[n]*nor[n]+nor[n+1]*nor[n+1]+nor[n+2]*nor[n+2]);
    if(l>1e-6){nor[n]/=l;nor[n+1]/=l;nor[n+2]/=l;}else nor[n+2]=1;}
  return t;
}
function edgeOK(a,b){
  const dx=X[a]-X[b],dy=Y[a]-Y[b],dz=Z[a]-Z[b];
  return dx*dx+dy*dy+dz*dz<maxLenSq;
}
function acc(nor,a,b,c){
  const ax=X[a],ay=Y[a],az=Z[a];
  const ux=X[b]-ax,uy=Y[b]-ay,uz=Z[b]-az;
  const vx=X[c]-ax,vy=Y[c]-ay,vz=Z[c]-az;
  const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  nor[a*3]+=nx;nor[a*3+1]+=ny;nor[a*3+2]+=nz;
  nor[b*3]+=nx;nor[b*3+1]+=ny;nor[b*3+2]+=nz;
  nor[c*3]+=nx;nor[c*3+1]+=ny;nor[c*3+2]+=nz;
}
let sweepT=0, UF=null;
function sweepFragments(){
  if(!UF||UF.length!==N)UF=new Int32Array(N);
  for(let i=0;i<N;i++)UF[i]=i;
  function find(x){while(UF[x]!==x){UF[x]=UF[UF[x]];x=UF[x];}return x;}
  for(let k=0;k<CN;k++){
    if(CBROKEN[k])continue;
    const ra=find(CA[k]),rb=find(CB[k]);
    if(ra!==rb)UF[ra]=rb;}
  const size={},pinned={};
  for(let i=0;i<N;i++){
    const r=find(i);
    size[r]=(size[r]||0)+1;
    if(PIN[i]||GRABF[i])pinned[r]=true;}
  for(let k=0;k<CN;k++){
    if(CBROKEN[k])continue;
    const r=find(CA[k]);
    if(!pinned[r]&&size[r]<=6){CBROKEN[k]=1;brokenCount++;}}
}
function frame(){
  step();
  for(let q=autoRips.length-1;q>=0;q--){
    const rp=autoRips[q];
    const rs=Math.max(cellW,cellH)*(CFG.RIP_SPEED||2.2);
    const nx=rp.x+rp.dx*rs, ny=rp.y+rp.dy*rs;
    cutAlong(rp.x,rp.y,nx,ny); rp.x=nx; rp.y=ny;
    if(++rp.life>110 || nx<PADX-cellW*2 || nx>PADX+W+cellW*2 || ny<PADY-cellH*2 || ny>PADY+H+cellH*2)
      autoRips.splice(q,1);
  }
  if(++sweepT>=24){sweepT=0;sweepFragments();}
  if(pool.length===0)return;
  const buf=pool.pop();
  const drawCount=buildMesh(buf);
  const maxTris=COLS*ROWS*2;
  const holeFrac=1-(drawCount/3)/maxTris;
  let fallen=0,displaced=0;
  const yLim=PADY+H+60;
  const dLim=6*Math.max(cellW,cellH),dLim2=dLim*dLim;
  const cLim=3*Math.max(cellW,cellH),cLim2=cLim*cLim;
  for(let i=0;i<N;i++){
    if(Y[i]>yLim){fallen++;DISPF[i]=1;continue;}
    const dx=X[i]-HX[i],dy=Y[i]-HY[i];
    const dd=dx*dx+dy*dy;
    DISPF[i]=dd>cLim2?1:0;
    if(dd>dLim2)displaced++;}
  lastLoad=Math.min(1,holeFrac+fallen/N);
  const tearPercent=Math.max(brokenCount/CN,
    Math.min(1,holeFrac+fallen/N+0.5*displaced/N));
  self.postMessage({type:"mesh",pos:buf.pos.buffer,nor:buf.nor.buffer,idx:buf.idx.buffer,
    dam:buf.dam.buffer,drawCount,tearPercent,awake,strokes},
    [buf.pos.buffer,buf.nor.buffer,buf.idx.buffer,buf.dam.buffer]);
}
let loop=null;
self.onmessage=(e)=>{
  const m=e.data;
  switch(m.type){
    case "init": init(m.cfg); if(!loop)loop=setInterval(frame,16); break;
    case "grab":{
      awake=true;pDown=true;pX=m.x;pY=m.y;cutX=m.x;cutY=m.y;strokeSX=m.x;strokeSY=m.y;strokeLen=0;
      const R2=CFG.MOUSE_RADIUS*CFG.MOUSE_RADIUS,g=[],gx=[],gy=[];
      GRABF.fill(0);
      for(let i=0;i<N;i++){
        const dx=X[i]-m.x,dy=Y[i]-m.y;
        if(dx*dx+dy*dy<R2){g.push(i);gx.push(dx);gy.push(dy);GRABF[i]=1;}}
      grabbed=g;grabOX=gx;grabOY=gy;
      break;}
    case "move":
      hover.vx=m.x-(pDown?pX:hover.x);
      hover.vy=m.y-(pDown?pY:hover.y);
      if(Math.abs(hover.vx)>200){hover.vx=0;hover.vy=0;}
      if(pDown&&CFG.CUT_RADIUS>0){
        const cx=m.x-cutX,cy=m.y-cutY;
        const minSeg=Math.max(cellW,cellH)*1.2;
        if(cx*cx+cy*cy>=minSeg*minSeg){
          if(strokeLen===0)strokes++;
          cutAlong(cutX,cutY,m.x,m.y);
          cutX=m.x;cutY=m.y;
          const _rx=m.x-strokeSX,_ry=m.y-strokeSY;
          strokeLen=Math.sqrt(_rx*_rx+_ry*_ry);}}
      hover.x=m.x;hover.y=m.y;pX=m.x;pY=m.y;
      break;
    case "release":{
      if(CFG.RIP_SPEED>0 && strokeLen > (CFG.RIP_MIN_SPAN||0.22)*Math.min(W,H)){
        const _dl=Math.sqrt((cutX-strokeSX)*(cutX-strokeSX)+(cutY-strokeSY)*(cutY-strokeSY))||1;
        const _dx=(cutX-strokeSX)/_dl,_dy=(cutY-strokeSY)/_dl;
        autoRips.push({x:cutX,y:cutY,dx:_dx,dy:_dy,life:0},
                      {x:strokeSX,y:strokeSY,dx:-_dx,dy:-_dy,life:0});
      }
      strokeLen=0;
      pDown=false;grabbed=null;GRABF.fill(0); break;}
    case "starter":{ awake=true; const L=Math.max(cellW,cellH)*6.0;
      cutAlong(m.x,m.y,m.x+L*0.707,m.y-L*0.707); break;}
    case "drop": awake=true;dropped=true;for(let i=0;i<N;i++)PIN[i]=0; break;
    case "buffers":
      pool.push({pos:new Float32Array(m.pos),nor:new Float32Array(m.nor),
                 idx:new Uint16Array(m.idx),dam:new Float32Array(m.dam)});
      break;
    case "pause": if(loop){clearInterval(loop);loop=null;} break;
    case "resume": if(!loop)loop=setInterval(frame,16); break;
    case "dispose": if(loop)clearInterval(loop); close(); break;
  }
};
`;

/* ─── WebGL shaders — flat white front, dark shaded back,
       fiber rims growing with damage ─── */
const VS = `attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUV; attribute float aDam;
uniform vec2 uRes; varying vec2 vUV; varying vec3 vNor; varying float vZ; varying float vDam;
const float F = 1400.0;
void main(){ vUV=aUV; vNor=aNor; vZ=aPos.z; vDam=aDam;
  float s = F/(F - aPos.z); vec2 c = uRes*0.5;
  vec2 p = c + (aPos.xy - c)*s;
  gl_Position = vec4(p.x/uRes.x*2.0-1.0, 1.0-p.y/uRes.y*2.0, -aPos.z/2000.0, 1.0); }`;
const FS = `precision mediump float;
varying vec2 vUV; varying vec3 vNor; varying float vZ; varying float vDam;
uniform sampler2D uTex; uniform float uLight; uniform float uShade;
const vec3 BACK = vec3(0.70, 0.70, 0.675);
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
void main(){
  vec4 col = texture2D(uTex, vUV);
  vec3 N = normalize(vNor);
  if(!gl_FrontFacing) N = -N;
  float dam = clamp(vDam, 0.0, 1.5);
  float L = max(dot(N, normalize(vec3(0.3,-0.4,0.85))), 0.0);
  float delta = L - 0.869;
  float n = vnoise(vUV*260.0);
  float shade;
  if (gl_FrontFacing) {
    float rim = smoothstep(0.08, 0.8, dam);
    shade = (1.0 - 0.03*uLight) + delta*uLight*(0.15 + 2.2*rim);
    float fiber = smoothstep(0.5, 1.0, dam) * (0.45 + 0.55*n);
    col.rgb = mix(col.rgb, vec3(1.0), fiber*0.9);
  } else {
    col.rgb = BACK;
    float fiber = smoothstep(0.5, 1.0, dam) * (0.45 + 0.55*n);
    col.rgb = mix(col.rgb, vec3(0.97), fiber*0.85);
    shade = mix(1.0, 0.52 + 0.62*L, uLight);
  }
  float dent = clamp(-vZ / 60.0, 0.0, 1.0);
  shade *= 1.0 - dent * uShade;
  gl_FragColor = vec4(col.rgb*shade, col.a); }`;

export default function TearEntrance() {
  const [revealed, setRevealed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const underRef = useRef<HTMLDivElement>(null);

  /* the whole tear engine lives in one effect — imperative WebGL +
     worker code identical to the validated prototype */
  useEffect(() => {
    const stage = stageRef.current, paper = paperRef.current;
    const contentEl = contentRef.current, under = underRef.current;
    if (!stage || !paper || !contentEl || !under) return;

    /* Arriving from somewhere else in the site - /#top from the blog nav,
       /#blog, /#footer - means the visitor already came in through the front
       door once. The entrance is an easter egg, not a toll gate, so a hash
       lands straight on the one-pager and the tear engine never boots. */
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      setRevealed(true);
      requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ block: "start" });
        else window.scrollTo({ top: 0 });
      });
      return;
    }

    under.toggleAttribute("inert", true);   // covered page: no tabbing into it

    let snapshotImg: HTMLImageElement | null = null;
    let snapScale = 1;
    let clothActive = false, revealTriggered = false, done = false, tearT0 = 0;
    const IS_COARSE = typeof window !== "undefined" && matchMedia("(pointer:coarse)").matches;
    let worker: Worker | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram, posBuf: WebGLBuffer, norBuf: WebGLBuffer,
        idxBuf: WebGLBuffer, damBuf: WebGLBuffer;
    let W = 0, H = 0, PADX = 90, PADY = 150, CW = 0, CH = 0, DPR = 1;
    let drawCount = 0, moveT = 0;

    function buildSnapshot() {
      try {
        const rect = paper!.getBoundingClientRect();
        const w = Math.ceil(rect.width), h = Math.ceil(rect.height);
        snapScale = Math.min(2, window.devicePixelRatio || 1, 4096 / w, 4096 / h);
        const sw = Math.floor(w * snapScale), sh = Math.floor(h * snapScale);
        const contentHTML = new XMLSerializer().serializeToString(contentEl!);
        const svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="' + sw + '" height="' + sh + '">' +
            '<foreignObject width="100%" height="100%">' +
              '<div xmlns="http://www.w3.org/1999/xhtml" lang="he" dir="rtl" ' +
                   'style="width:' + w + 'px;height:' + h + 'px;background:#ffffff;' +
                          'transform:scale(' + snapScale + ');transform-origin:0 0;">' +
                '<style>' + PAPER_CSS + '</style>' +
                '<div class="tear-paper-root" style="min-height:0;padding-bottom:0;">' + contentHTML + '</div>' +
              '</div>' +
            '</foreignObject>' +
          '</svg>';
        const img = new Image();
        img.onload = () => { snapshotImg = img; };
        img.onerror = () => {
          if (snapScale !== 1) { snapScale = 1; buildSnapshot(); }
          else console.warn("[tear] snapshot failed — effect disabled, static page intact");
        };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      } catch (e) { console.warn("[tear] snapshot failed — effect disabled", e); }
    }

    function initGL(): boolean {
      const rect = paper!.getBoundingClientRect();
      W = rect.width; H = rect.height;
      CW = W + PADX * 2; CH = H + PADY * 2;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      if (CW * CH * DPR * DPR > 22e6) DPR = Math.max(1, Math.sqrt(22e6 / (CW * CH)));
      canvas = document.createElement("canvas");
      canvas.className = "tear-canvas";
      canvas.width = Math.round(CW * DPR); canvas.height = Math.round(CH * DPR);
      canvas.style.width = CW + "px"; canvas.style.height = CH + "px";
      canvas.style.top = -PADY + "px"; canvas.style.left = -PADX + "px";
      canvas.setAttribute("aria-hidden", "true");
      const ctx = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
      if (!ctx) { console.warn("[tear] no WebGL — static page intact"); return false; }
      gl = ctx;
      stage!.appendChild(canvas);
      const sh = (t: number, s2: string) => {
        const s = gl!.createShader(t)!;
        gl!.shaderSource(s, s2); gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(s) || "shader");
        return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog); gl.useProgram(prog);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(gl.getUniformLocation(prog, "uRes"), CW, CH);
      gl.uniform1f(gl.getUniformLocation(prog, "uLight"), TUNING.LIGHTING);
      gl.uniform1f(gl.getUniformLocation(prog, "uShade"), TUNING.PRESS_SHADE);
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshotImg!);
      gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);
      posBuf = gl.createBuffer()!; norBuf = gl.createBuffer()!;
      idxBuf = gl.createBuffer()!; damBuf = gl.createBuffer()!;
      return true;
    }

    function buildUVs(COLS: number, ROWS: number) {
      const n = (COLS + 1) * (ROWS + 1);
      const uvs = new Float32Array(n * 2);
      let i = 0;
      for (let r = 0; r <= ROWS; r++)
        for (let c = 0; c <= COLS; c++, i++) { uvs[i * 2] = c / COLS; uvs[i * 2 + 1] = r / ROWS; }
      const uvBuf = gl!.createBuffer();
      gl!.bindBuffer(gl!.ARRAY_BUFFER, uvBuf);
      gl!.bufferData(gl!.ARRAY_BUFFER, uvs, gl!.STATIC_DRAW);
      const aUV = gl!.getAttribLocation(prog, "aUV");
      gl!.enableVertexAttribArray(aUV);
      gl!.vertexAttribPointer(aUV, 2, gl!.FLOAT, false, 0, 0);
    }

    function render() {
      const g = gl!;
      const aPos = g.getAttribLocation(prog, "aPos");
      const aNor = g.getAttribLocation(prog, "aNor");
      const aDam = g.getAttribLocation(prog, "aDam");
      g.bindBuffer(g.ARRAY_BUFFER, posBuf);
      g.enableVertexAttribArray(aPos); g.vertexAttribPointer(aPos, 3, g.FLOAT, false, 0, 0);
      g.bindBuffer(g.ARRAY_BUFFER, norBuf);
      g.enableVertexAttribArray(aNor); g.vertexAttribPointer(aNor, 3, g.FLOAT, false, 0, 0);
      g.bindBuffer(g.ARRAY_BUFFER, damBuf);
      g.enableVertexAttribArray(aDam); g.vertexAttribPointer(aDam, 1, g.FLOAT, false, 0, 0);
      g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, idxBuf);
      g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);
      g.drawElements(g.TRIANGLES, drawCount, g.UNSIGNED_SHORT, 0);
    }

    function onMesh(e: MessageEvent) {
      const m = e.data;
      if (m.type !== "mesh" || !gl || !worker) return;
      const g = gl;
      const pos = new Float32Array(m.pos), nor = new Float32Array(m.nor);
      const idx = new Uint16Array(m.idx), dam = new Float32Array(m.dam);
      drawCount = m.drawCount;
      g.bindBuffer(g.ARRAY_BUFFER, posBuf); g.bufferData(g.ARRAY_BUFFER, pos, g.DYNAMIC_DRAW);
      g.bindBuffer(g.ARRAY_BUFFER, norBuf); g.bufferData(g.ARRAY_BUFFER, nor, g.DYNAMIC_DRAW);
      g.bindBuffer(g.ARRAY_BUFFER, damBuf); g.bufferData(g.ARRAY_BUFFER, dam, g.DYNAMIC_DRAW);
      g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, idxBuf); g.bufferData(g.ELEMENT_ARRAY_BUFFER, idx, g.DYNAMIC_DRAW);
      render();
      worker.postMessage({ type: "buffers", pos: m.pos, nor: m.nor, idx: m.idx, dam: m.dam },
                         [m.pos, m.nor, m.idx, m.dam]);
      const autoDue = IS_COARSE && (m.strokes || 0) >= 2 && tearT0 > 0 &&
        performance.now() - tearT0 >= 5000;  /* mobile safety net: 5s + two real cuts */
      if (!revealTriggered && (m.tearPercent >= TUNING.DROP_AT || autoDue)) {
        revealTriggered = true;
        worker.postMessage({ type: "drop" });
        setTimeout(finishReveal, 1900);
      }
    }

    const canvasXY = (e: PointerEvent): [number, number] => {
      const r = canvas!.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const onDown = (e: PointerEvent) => {
      if (!worker || !canvas) return;
      const [x, y] = canvasXY(e);
      worker.postMessage({ type: "grab", x, y });
      canvas.classList.add("dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!worker || !canvas) return;
      const now = performance.now();
      if (now - moveT < 8) return;
      moveT = now;
      const [x, y] = canvasXY(e);
      worker.postMessage({ type: "move", x, y });
    };
    const onUp = () => {
      if (!worker) return;
      worker.postMessage({ type: "release" });
      canvas && canvas.classList.remove("dragging");
    };
    const onVis = () =>
      worker && worker.postMessage({ type: document.hidden ? "pause" : "resume" });

    function activateTear(startX: number, startY: number) {
      if (clothActive || !snapshotImg || typeof Worker === "undefined") return;
      if (!initGL()) return;
      clothActive = true;
      stage!.classList.add("tearing");
      /* the videos in <SitePage/> beneath are already autoplaying —
         every hole opens onto a moving page */
      const isNarrow = W < 560;
      const G = isNarrow ? TUNING.GRID_MOBILE : TUNING.GRID;
      const aspect = Math.min(2, Math.max(0.25, W / H));
      const COLS = Math.max(10, Math.round(G * aspect));
      const ROWS = G;
      worker = new Worker(URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" })));
      worker.onmessage = onMesh;
      worker.postMessage({ type: "init", cfg: {
        W, H, PADX, PADY, COLS, ROWS,
        TEAR_THRESHOLD: TUNING.TEAR_THRESHOLD, DAMPING: TUNING.DAMPING,
        STIFFNESS: TUNING.STIFFNESS, BEND: TUNING.BEND, CURL: TUNING.CURL,
        ITERATIONS: TUNING.ITERATIONS, GRAVITY: TUNING.GRAVITY,
        MOUSE_RADIUS: TUNING.MOUSE_RADIUS, MOUSE_STRENGTH: TUNING.MOUSE_STRENGTH,
        GRAB_LIFT: TUNING.GRAB_LIFT, HOVER_PUSH: TUNING.HOVER_PUSH,
        PRESS_DEPTH: TUNING.PRESS_DEPTH, CUT_RADIUS: TUNING.CUT_RADIUS,
        FLATNESS: TUNING.FLATNESS,
        RIP_SPEED: TUNING.RIP_SPEED * (IS_COARSE ? 1.25 : 1),
        RIP_MIN_SPAN: TUNING.RIP_MIN_SPAN * (IS_COARSE ? 0.55 : 1),
      }});
      buildUVs(COLS, ROWS);
      canvas!.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      document.addEventListener("visibilitychange", onVis);
      const c0 = canvas!.getBoundingClientRect();
      worker.postMessage({ type: "grab", x: startX - c0.left, y: startY - c0.top });
      worker.postMessage({ type: "starter", x: startX - c0.left, y: startY - c0.top });
      tearT0 = performance.now();
      canvas!.classList.add("dragging");
    }

    function finishReveal() {
      if (done) return;
      done = true;
      if (worker) { worker.postMessage({ type: "dispose" }); worker = null; }
      if (canvas) { canvas.remove(); canvas = null; }
      stage!.classList.remove("tearing");
      under!.toggleAttribute("inert", false);
      window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => setRevealed(true));
    }

    /* wire the affordances */
    const dogear = stage.querySelector<HTMLButtonElement>(".tear-dogear");
    const onDogear = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;               /* touchstart already handled it */
      e.preventDefault(); activateTear(e.clientX, e.clientY);
    };
    dogear?.addEventListener("pointerdown", onDogear);
    /* earliest possible capture on touch: claim the gesture before the browser's swipe/pan does */
    const onDogearTouch = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.changedTouches && e.changedTouches[0];
      if (t) activateTear(t.clientX, t.clientY);
    };
    dogear?.addEventListener("touchstart", onDogearTouch, { passive: false });
    /* while tearing, the page must not scroll under the finger */
    const onDocTouchMove = (e: TouchEvent) => { if (clothActive && !done) e.preventDefault(); };
    document.addEventListener("touchmove", onDocTouchMove, { passive: false });

    const skip = stage.querySelector<HTMLAnchorElement>(".tear-skip");
    const onSkip = (e: Event) => { e.preventDefault(); finishReveal(); };
    skip?.addEventListener("click", onSkip);

    const onLoadSnap = () => buildSnapshot();
    if (document.readyState === "complete") buildSnapshot();
    else window.addEventListener("load", onLoadSnap);
    let rT: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { if (!clothActive) buildSnapshot(); }, 300); };
    window.addEventListener("resize", onResize);

    return () => {   /* React cleanup — leave nothing running */
      worker?.terminate();
      canvas?.remove();
      dogear?.removeEventListener("pointerdown", onDogear);
      dogear?.removeEventListener("touchstart", onDogearTouch);
      document.removeEventListener("touchmove", onDocTouchMove);
      skip?.removeEventListener("click", onSkip);
      window.removeEventListener("load", onLoadSnap);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAPER_CSS + STAGE_CSS }} />

      {/* No <link rel="prefetch" as="video"> here any more. Those two tags
          were a leftover from when this route only linked to the one-pager;
          today <SitePage/> is mounted live underneath from the first frame
          and its <video preload="auto"> elements fetch themselves. A media
          element always requests byte ranges and never reuses what a plain
          prefetch downloaded, so each mp4 was arriving twice — 4.2MB of the
          page's weight, downloaded and discarded. Measured, not assumed. */}
      {/* echo_v_200 is the hero portrait of the page beneath — worth having
          early. headshot.png used to be preloaded here too, but nothing on
          this route ever displays it: 325KB downloaded and thrown away. */}
      <link rel="preload" href="/media/echo_v_200.png" as="image" />

      <div className={`tear-stage${revealed ? " revealed" : ""}`} ref={stageRef}>

        {/* ── BENEATH: the full one-pager, alive while covered ── */}
        <div className="tear-under" ref={underRef} aria-hidden={revealed ? undefined : true}>
          <SitePage />
        </div>

        {/* ── THE PAPER: the real entrance text ── */}
        {!revealed && (
          <div className="tear-paper-root" ref={paperRef}>
            <div className="tear-paper-inner" ref={contentRef}>

              <p className="tp-tagline">{"{"}כן! זה האתר של עמית ברין – מעצב עם 24 שנות ניסיון במיתוג, שיווק ודיגיטל, ומומחה UX/UI ופתרונות יצירתיים בעזרת Ai{"}"}</p>

              <p>👋🏼 <strong>שלום, ממש טוב שבאת</strong></p>

              <p>קוראים לי עמית ברין, וכבר 24 שנים שאני עושה כל מה שקשור בעיצוב גרפי בצורה מסחרית; במהלך השנים האלה צברתי פרסים – מקומיים וגם בינלאומיים – על הישגים תקדימיים באמת שהגעתי אליהם בעולמות השיווק, הפרסום והמיתוג, בעבודות על המותגים המובילים בעולם (<strong>וגם בארץ</strong> 🇮🇱!). וגם זכיתי לעבוד עם עשרות עסקים קטנים, לעזור להם להגשים חלומות – משלב החלום ועד לשלב שבו המותג שיצרתי עבורם פעיל ומצליח, ומייצר עבורם ערך משמעותי.</p>

              <p className="tp-gap"><strong>לא החליפו אותי – התווספו אלי:</strong></p>

              <p>כל אחד שנחשף לכלי הבינה המלאכותית שנוספים מדי יום יכול להעיד שזה הולך ונהיה יותר ויותר קשה להפסיק להוסיף יכולות חדשות לארגז הכלים שלנו. תבינו, אם היה באמת ארגז כלים כזה, בטח כבר הייתי צריך להחליף אותו באיזו ארונית שתהיה מספיק גדולה, אבל עם כאלה כוחות חדשים, ועם כזה שטף פנטסטי של יצירה – מי רוצה לעצור בכלל? אני הרי יותר מדי סקרן והרפתקן, נהנה מתחושת אקספרימנטליות ביצירה (אבל ממש!) שומר על מחויבות לחדשנות, להתייעלות ולאפקטיביות, ותמיד מקפיד לעשות משהו <em>אחר</em> כדי להיות בטוח שהתוצר שאני מביא יהיה שונה מכל מה שהיה כבר, מכל מה שהכירו. ביחד עם השאיפה הטרחנית ממש למצוא פתרון פשוט וקל כדי לעזור לאנשים – אלה הדברים שמנחים אותי בקבלת החלטות, בלי תלות בכלים או בדרכי הביצוע. למעשה, אפשר לומר שהניסיון, הידע והתכונות האלה – אלה הם כלי העבודה האמיתיים שלי.</p>

              <p className="tp-gap"><strong>אה! ואני גם מרצה ומלמד את כל זה:</strong></p>

              <p>כבר עשר שנים שאני גם מורה לעיצוב, מרצה ומנטור, עם מאות רבות של בוגרות מוכשרות (<em>ובוגרים מוכשרים!</em>) שיעידו על השינוי הגדול שעזרתי להם לבצע בחייהן; על סמך כל הידע הזה והניסיון בהנגשה שלו לקהלים צעירים ולא מקצועיים, אני מעביר גם הרצאות, הדרכות והסמכות בנושאי חשיבה עיצובית, כלי עיצוב ובינה מלאכותית גם במגזר העסקי – לחברות ולסטודיואים לעיצוב שמבקשים להתקדם אל העולם החדש.</p>

              <p>תודה שקראת עד פה 🙏🏻 הרי לא באת לפה בשביל לדבר עלי…</p>

              <p className="tp-gap"><strong>ובכל זאת, איך אני יכול לעזור לך?</strong></p>

              <div className="tp-services">
                <p>🎤 הדרכות מקצועיות בנושאי בינה יצירתית וחשיבה עיצובית</p>
                <p>🫵 מנטורינג למעצבים ויזמים מתחילים</p>
                <p>🎓 הוראה בנושאי עיצוב ובינה מלאכותית</p>
                <p>🖋️ עיצוב גרפי, בדיגיטל וגם בפרינט: משלב האסטרטגיה, הרעיונאות והקונספט, ועד ליצירה והגשמת חלומות 🍾</p>
                <p className="last">📚 (עם הפקות דפוס מורכבות וחדשניות!)</p>
              </div>

              <p>ואם כבר הגעת עד לאזור הכיפי שפה למטה, אני יכול רק להתוודות שבשעות הפנאי אני נהנה לקרוא, לנגן (רק על דברים עם ארבעה מיתרים), ולהשתכלל בלי סוף באפייה ובאכילה של פיצה נאפוליטנית 🍕. הופה… קיבלת תיאבון? <strong><a href="/site" className="tear-skip">כי האתר המלא הוא מעדן אמיתי</a>!</strong></p>

              <div className="tp-footer">
                <p>
                  ✉️ <a href="mailto:ahoovi@gmail.com">רוצה לפרט במייל על הבעיות והצורך שלך?</a>
                  {" | "}
                  💬 <a href="https://wa.me/972549407575" target="_blank" rel="noopener">או לשלוח הודעה קצרה אבל דחופה?</a>
                  {" | "}
                  💼 <a href="https://www.behance.net/amitbrin" target="_blank" rel="noopener">ארכיון עבודות מעשורים קודמים</a>
                </p>
              </div>
            </div>

            {/* the curled corner — the invitation */}
            <button className="tear-dogear" aria-label="קרע את הדף (אפקט ויזואלי)">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="tearFlapFill" x1="0" y1="0.4" x2="0.55" y2="1">
                    <stop offset="0" stopColor="#d6d6cf" />
                    <stop offset="0.45" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#ecece5" />
                  </linearGradient>
                  <filter id="tearSoft" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3.2" />
                  </filter>
                </defs>
                <polygon points="0,50 50,100 0,100" fill="#a9a9a2" />
                <path className="flapShadow" d="M2,52 C22,54 40,70 50,98"
                      fill="none" stroke="#000" strokeWidth="9"
                      strokeLinecap="round" opacity="0.18" filter="url(#tearSoft)" />
                <g className="flapG">
                  <path d="M0,50 C24,50 42,66 50,100 C30,80 12,66 0,50 Z" fill="url(#tearFlapFill)" />
                  <path d="M0,50 C24,50 42,66 50,100" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.9" />
                  <path d="M0,50 C12,66 30,80 50,100" fill="none" stroke="#000000" strokeWidth="0.8" opacity="0.22" />
                </g>
              </svg>
              <span className="tp-label">קרע</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
