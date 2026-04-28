"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════ */
const S = `
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap');
:root{
  --navy:#1a2744;
  --gold:#c9973a;--gold-l:#e8b95a;
  --blue:#1570EF;--blue-l:#EFF8FF;--blue-d:#0e54c4;
  --bg:#F7F9FC;--surface:#fff;
  --text:#131313;--muted:#6B7280;--border:#E5E9F0;
  --green:#16a34a;--green-l:#f0fdf4;--red:#dc2626;--red-l:#fef2f2;--amber:#d97706;--amber-l:#fffbeb;--teal:#0f766e;--purple:#7c3aed;
  --sh:0 1px 8px rgba(0,0,0,.06),0 4px 16px rgba(21,112,239,.05);
  --sh-md:0 4px 20px rgba(21,112,239,.12);
  --sh-lg:0 16px 48px rgba(21,112,239,.15);
  --r:16px;--r-sm:12px;--r-xs:8px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Rubik',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;direction:rtl}
.ro-app{min-height:100vh;background:var(--bg)}

.hdr{background:var(--navy);color:#fff;padding:0 1.4rem;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:200;box-shadow:0 2px 16px rgba(21,39,100,.28)}
.hlogo{font-family:'Rubik',sans-serif;font-size:1.2rem;font-weight:700;display:flex;align-items:center;gap:.45rem;color:var(--gold);cursor:pointer;transition:opacity .2s;letter-spacing:-.01em}
.hlogo:hover{opacity:.82}
.flag{width:24px;height:16px;display:flex;border-radius:2px;overflow:hidden;flex-shrink:0}
.flag div{flex:1}
.hright{display:flex;align-items:center;gap:.6rem;cursor:pointer}
.uav{width:33px;height:33px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82rem;flex-shrink:0}
.uname{color:#ccd4e8;font-size:.86rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.stickyback{position:sticky;top:58px;z-index:150;background:var(--surface);border-bottom:1px solid var(--border);padding:.5rem 1.4rem;display:flex;align-items:center;gap:.4rem;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.backbtn{background:none;border:none;color:var(--muted);cursor:pointer;font-family:'Rubik',sans-serif;font-size:.85rem;display:flex;align-items:center;gap:.4rem;padding:0;transition:color .2s}
.backbtn:hover{color:var(--blue)}

.welcome{min-height:100vh;background:var(--navy);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;direction:rtl;background-image:radial-gradient(ellipse at 50% 0%,rgba(21,112,239,.2) 0%,transparent 60%)}
.wflag{display:flex;width:68px;height:46px;border-radius:8px;overflow:hidden;margin-bottom:1.75rem;box-shadow:0 8px 28px rgba(0,0,0,.4)}
.wflag div{flex:1}
.welcome h1{font-family:'Rubik',sans-serif;font-size:2.4rem;font-weight:700;color:#fff;text-align:center;margin-bottom:.45rem;line-height:1.2;letter-spacing:-.02em}
.welcome h1 em{color:var(--gold);font-style:normal}
.welcome>.wp{color:#a0aec0;text-align:center;margin-bottom:2.25rem;font-size:.93rem;max-width:400px;line-height:1.7}
.wcards{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}
.ucard{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:16px;padding:1.5rem 1.75rem;cursor:pointer;transition:all .3s;text-align:center;min-width:148px}
.ucard:hover{background:rgba(21,112,239,.18);border-color:var(--blue);transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,.3)}
.ucav{width:52px;height:52px;border-radius:50%;margin:0 auto .85rem;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700}
.ucard h3{color:#fff;font-size:1rem;margin-bottom:.2rem;font-weight:600}
.ucard p{color:#718096;font-size:.8rem}
.addcard{background:transparent;border:1.5px dashed rgba(255,255,255,.2);border-radius:16px;padding:1.5rem 1.75rem;cursor:pointer;text-align:center;min-width:148px;transition:all .3s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.45rem;color:#718096}
.addcard:hover{border-color:var(--blue);color:var(--blue)}

.ov{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:300;backdrop-filter:blur(6px)}
.modal{background:#fff;border-radius:20px;padding:2rem;width:100%;max-width:390px;box-shadow:var(--sh-lg);direction:rtl}
.modal h2{font-family:'Rubik',sans-serif;font-size:1.5rem;font-weight:700;color:var(--navy);margin-bottom:.2rem}
.modal>.mp{color:var(--muted);font-size:.86rem;margin-bottom:1.4rem}
.fld{margin-bottom:.9rem}
.fld label{display:block;font-size:.81rem;font-weight:600;color:var(--navy);margin-bottom:.32rem}
.fld input{width:100%;padding:.72rem 1rem;border:1.5px solid var(--border);border-radius:12px;font-family:'Rubik',sans-serif;font-size:.91rem;outline:none;direction:rtl;transition:border-color .2s}
.fld input:focus{border-color:var(--blue)}
.mact{display:flex;gap:.7rem;margin-top:1.4rem}
.pbtn{flex:1;background:var(--blue);color:#fff;border:none;padding:.82rem;border-radius:12px;font-family:'Rubik',sans-serif;font-size:.91rem;font-weight:600;cursor:pointer;transition:background .2s}
.pbtn:hover{background:var(--blue-d)}
.pbtn:disabled{background:#aaa;cursor:not-allowed}
.obtn{background:transparent;color:var(--muted);border:1.5px solid var(--border);padding:.82rem;border-radius:12px;font-family:'Rubik',sans-serif;font-size:.91rem;cursor:pointer;transition:border-color .2s}
.obtn:hover{border-color:var(--navy);color:var(--navy)}

.dash{max-width:860px;margin:0 auto;padding:1.6rem 1.4rem;direction:rtl}
.dgreet{font-size:1.75rem;font-weight:700;color:var(--navy);margin-bottom:.15rem;letter-spacing:-.02em}
.dsub{color:var(--muted);font-size:.9rem;margin-bottom:1.2rem}
.prowrap{background:var(--surface);border-radius:16px;padding:1rem 1.2rem;margin-bottom:1.6rem;box-shadow:var(--sh)}
.prorow{display:flex;justify-content:space-between;font-size:.8rem;color:var(--muted);margin-bottom:.5rem;font-weight:500}
.protrack{background:var(--blue-l);border-radius:99px;height:8px;overflow:hidden}
.profill{background:linear-gradient(90deg,var(--blue),#38bdf8);height:100%;border-radius:99px;transition:width .8s cubic-bezier(.4,0,.2,1)}

.section-label{display:flex;align-items:center;gap:.6rem;margin-bottom:.85rem}
.section-label h3{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.section-label::after{content:'';flex:1;height:1px;background:var(--border)}

.path-card{background:var(--surface);border-radius:16px;padding:1.2rem;margin-bottom:1.6rem;cursor:pointer;transition:all .22s;display:flex;align-items:center;gap:1rem;box-shadow:var(--sh)}
.path-card:hover{transform:translateY(-2px);box-shadow:var(--sh-md)}
.path-icon{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,var(--navy),#2d4a9e);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
.path-info h4{font-size:.97rem;font-weight:700;color:var(--navy);margin-bottom:.18rem}
.path-info p{font-size:.81rem;color:var(--muted)}

.sgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:.9rem;margin-bottom:1.6rem}
.scard{background:var(--surface);border-radius:16px;padding:1.2rem;cursor:pointer;transition:all .22s;box-shadow:var(--sh)}
.scard:hover{transform:translateY(-2px);box-shadow:var(--sh-md)}
.sicon{font-size:1.5rem;margin-bottom:.5rem}
.sname{font-weight:700;font-size:.93rem;color:var(--navy);margin-bottom:.1rem}
.sdesc{font-size:.78rem;color:var(--muted);margin-bottom:.75rem}
.mbar{background:var(--blue-l);border-radius:99px;height:5px;overflow:hidden}
.mfill{height:100%;background:var(--blue);border-radius:99px;transition:width .6s}
.spct{font-size:.74rem;color:var(--muted);margin-top:.32rem}

.gram-card{background:linear-gradient(135deg,#1a2744,#2d4a9e);border-radius:16px;padding:1.2rem;cursor:pointer;transition:all .22s;display:flex;align-items:center;gap:1rem;box-shadow:var(--sh)}
.gram-card:hover{transform:translateY(-2px);box-shadow:var(--sh-md)}
.gram-icon{width:46px;height:46px;border-radius:12px;background:rgba(21,112,239,.25);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
.gram-info h4{font-size:.95rem;font-weight:700;color:#fff;margin-bottom:.15rem}
.gram-info p{font-size:.79rem;color:#a8c0e8}

.tip{background:var(--blue-l);border-radius:16px;padding:1.2rem;border-right:4px solid var(--blue)}
.tip h4{font-size:.71rem;text-transform:uppercase;letter-spacing:.1em;color:var(--blue);margin-bottom:.35rem;font-weight:700}
.tip p{font-size:.84rem;line-height:1.6;color:var(--navy)}

.mod{max-width:800px;margin:0 auto;padding:1.6rem 1.4rem;direction:rtl}
.mhead{display:flex;align-items:center;gap:.85rem;margin-bottom:1.4rem}
.mico{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
.mtitle{font-size:1.6rem;font-weight:700;color:var(--navy);letter-spacing:-.02em}
.msub{font-size:.82rem;color:var(--muted)}

.profile{max-width:780px;margin:0 auto;padding:1.6rem 1.4rem;direction:rtl}
.profile-top{display:flex;align-items:center;gap:1.25rem;margin-bottom:1.4rem;background:var(--surface);border-radius:20px;padding:1.5rem;box-shadow:var(--sh)}
.profile-av{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;flex-shrink:0}
.profile-info h2{font-size:1.55rem;font-weight:700;color:var(--navy);margin-bottom:.15rem;letter-spacing:-.02em}
.profile-info p{font-size:.86rem;color:var(--muted)}
.switch-btn{margin-top:.65rem;background:transparent;border:1.5px solid var(--border);border-radius:10px;padding:.45rem .9rem;font-family:'Rubik',sans-serif;font-size:.82rem;color:var(--muted);cursor:pointer;transition:all .2s}
.switch-btn:hover{border-color:var(--blue);color:var(--blue)}

.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;margin-bottom:1.4rem}
.stat-box{background:var(--surface);border-radius:16px;padding:1rem;text-align:center;box-shadow:var(--sh)}
.stat-num{font-size:1.8rem;font-weight:700;color:var(--navy);line-height:1}
.stat-lbl{font-size:.75rem;color:var(--muted);margin-top:.3rem}

.radar-wrap{background:var(--surface);border-radius:20px;padding:1.5rem;margin-bottom:1.4rem;box-shadow:var(--sh)}
.radar-title{font-weight:700;font-size:.88rem;color:var(--navy);margin-bottom:1rem}

.skill-bars{display:flex;flex-direction:column;gap:.8rem;margin-bottom:1.4rem}
.sbar-row{background:var(--surface);border-radius:16px;padding:1rem 1.2rem;box-shadow:var(--sh)}
.sbar-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
.sbar-name{font-size:.87rem;font-weight:600;color:var(--navy)}
.sbar-pct{font-size:.82rem;font-weight:700}
.sbar-track{position:relative;background:var(--blue-l);border-radius:99px;height:10px;overflow:visible}
.sbar-fill{height:100%;border-radius:99px;transition:width .8s}
.sbar-min{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--amber);border-radius:1px}
.sbar-opt{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--green);border-radius:1px}

.vcardwrap{margin-bottom:1.1rem}
.vcard{background:var(--surface);border-radius:20px;box-shadow:0 4px 20px rgba(21,113,239,.12);overflow:hidden;position:relative}
.vcard-status{position:absolute;top:1rem;right:1rem;padding:.28rem .8rem;border-radius:99px;font-size:.76rem;font-weight:700;transition:all .3s;z-index:2}
.vs-known{background:#dcfce7;color:var(--green)}
.vs-practice{background:#fff3e0;color:var(--amber)}
.vseg{display:flex;flex-direction:column;align-items:center;padding:20px 0;gap:20px;width:100%}
.vtrans{display:flex;flex-direction:row;justify-content:space-between;align-items:center;padding:0 24px;width:100%;height:88px}
.vcol-ro{display:flex;flex-direction:column;align-items:flex-start;padding:0;width:92px}
.vcol-lbl-ro{font-size:10px;font-weight:300;line-height:12px;color:var(--muted);margin-bottom:-4px;width:100%}
.wro{font-family:'Rubik',sans-serif;font-size:30px;font-weight:700;line-height:36px;color:var(--navy);direction:ltr}
.wemoji-wrap{display:flex;justify-content:center;align-items:center;width:72px;height:88px}
.wemoji{font-size:72px;line-height:87px;text-align:center}
.vcol-he{display:flex;flex-direction:column;align-items:flex-end;padding:0 0 4px 0;width:104px}
.vcol-lbl-he{font-size:10px;font-weight:300;line-height:12px;color:var(--muted);text-align:right;margin-bottom:-4px;width:100%}
.whe{font-size:26px;font-weight:700;line-height:31px;color:var(--blue);direction:rtl;text-align:right;width:100%}
.wtype-row{display:flex;flex-direction:row;justify-content:space-between;align-items:center;width:298px}
.wtag{display:flex;align-items:center;padding:6px 8px;border-radius:99px;font-size:11px;font-weight:600;line-height:13px;color:var(--muted);border:1px solid var(--border);background:transparent;white-space:nowrap;direction:ltr}
.wtag.he{direction:rtl;color:var(--blue);border-color:rgba(21,113,239,.3)}
.vaudio-btn{display:flex;justify-content:center;align-items:center;padding:9px;width:322px;height:72px;background:var(--blue-l);border-radius:12px;border:none;cursor:pointer;font-size:16px;color:var(--blue);transition:all .2s}
.vaudio-btn:hover{background:var(--blue);color:#fff}
.ftable-hdr{display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;padding:12px 25px 11px 26px;background:var(--blue-l);font-size:11px;font-weight:700;line-height:13px;color:var(--blue);width:100%}
.frow{display:flex;flex-direction:row;justify-content:space-between;align-items:center;padding:0 24px;height:36px;width:100%}
.frow:nth-child(even){background:var(--blue-l);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.frow:nth-child(odd){background:#fff}
.fval{display:flex;flex-direction:row;align-items:center;gap:4px}
.snd-sm{display:flex;justify-content:center;align-items:center;padding:7px;width:22px;height:22px;border-radius:99px;border:none;cursor:pointer;background:transparent;font-size:8px;color:var(--blue);flex-shrink:0}
.fval-txt{font-size:13px;font-weight:600;line-height:16px;color:var(--navy);direction:ltr;white-space:nowrap}
.flbl{font-size:12px;font-weight:400;line-height:15px;color:var(--muted);direction:rtl;white-space:nowrap}
.exbox{display:flex;flex-direction:row;align-items:center;padding:2px;gap:8px;background:var(--blue-l);border-radius:10px;margin:0 16px 20px;width:calc(100% - 32px)}
.exbox-icon{display:flex;justify-content:center;align-items:center;padding:7px;width:36px;height:64px;min-width:36px;background:#fff;border-radius:8px;font-size:12px;color:var(--blue);cursor:pointer}
.exbox-text{display:flex;flex-direction:column;align-items:flex-start;gap:9px;flex:1}
.exro{font-size:14px;font-weight:400;line-height:17px;color:var(--navy);direction:ltr;width:100%}
.exhe{font-size:13px;font-weight:400;line-height:16px;color:var(--muted);direction:rtl;width:100%}
.vnav{display:flex;flex-direction:row;align-items:center;gap:20px;margin-top:16px}
.vbtn{flex:1;height:72px;border-radius:12px;cursor:pointer;font-family:'Rubik',sans-serif;font-size:14px;font-weight:700;line-height:17px;border:2px solid;transition:all .2s;display:flex;align-items:center;justify-content:center}
.vbtn.know{background:var(--blue);color:#fff;border-color:var(--blue);box-shadow:0 4px 16px rgba(21,113,239,.3)}
.vbtn.know:hover{background:var(--blue-d)}
.vbtn.prac{background:#fff;color:var(--amber);border-color:var(--amber)}
.vbtn.prac:hover{background:#fffbf0}
.vprow{display:flex;align-items:center;gap:.9rem;margin-bottom:1rem}
.vpbar{flex:1;background:var(--blue-l);border-radius:99px;height:6px;overflow:hidden}
.vpfill{background:var(--blue);height:100%;border-radius:99px;transition:width .6s cubic-bezier(.4,0,.2,1)}
.vstats{font-size:12px;color:var(--muted);white-space:nowrap}

.dcard{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden;margin-bottom:1.1rem}
.dhead{background:linear-gradient(135deg,var(--navy),#2d4a9e);padding:.9rem 1.2rem;display:flex;align-items:center;justify-content:space-between}
.dtitle{color:#fff;font-weight:700;font-size:.97rem;direction:ltr}
.dlevel{background:rgba(21,112,239,.25);color:#93c5fd;padding:.18rem .6rem;border-radius:99px;font-size:.73rem;font-weight:700}
.trans-toggle{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;padding:.22rem .65rem;border-radius:8px;cursor:pointer;font-size:.75rem;font-family:'Rubik',sans-serif;transition:background .2s}
.trans-toggle.on{background:rgba(21,112,239,.45);border-color:#93c5fd}
.dlines{padding:1.1rem 1.2rem}
.dline{margin-bottom:.8rem;direction:ltr}
.dspk{font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.15rem}
.dtxt{font-family:'Rubik',sans-serif;font-size:.94rem;color:var(--text);line-height:1.5;display:flex;align-items:center;gap:.5rem}
.dtrans{font-size:.8rem;color:var(--muted);margin-top:.18rem;direction:rtl;font-style:italic}
.dline.act .dtxt{color:var(--blue);font-weight:700}
.dline.act .dspk{color:var(--blue)}
.actrl{border-top:2px solid var(--border);padding:.9rem 1.2rem;display:flex;align-items:center;gap:.85rem}
.playbtn{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;background:var(--blue);color:#fff;transition:all .2s;flex-shrink:0}
.playbtn:hover{background:var(--blue-d);transform:scale(1.05)}
.playbtn.playing{background:var(--red)}
.atrack{flex:1}
.aprog{background:var(--blue-l);border-radius:99px;height:5px;overflow:hidden;margin-bottom:.25rem}
.afill{background:var(--blue);height:100%;border-radius:99px;transition:width .35s}
.atime{font-size:.73rem;color:var(--muted);direction:ltr}
.spdbtn{background:var(--blue-l);border:none;border-radius:6px;color:var(--navy);padding:.28rem .55rem;font-size:.76rem;cursor:pointer;font-family:'Rubik',sans-serif}
.qsec{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);padding:1.2rem}
.qhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem}
.qhdr h3{font-size:.97rem;font-weight:700;color:var(--navy)}
.qitem{background:var(--bg);border-radius:var(--r-sm);padding:.9rem;margin-bottom:.75rem}
.qro{font-family:'Rubik',sans-serif;font-size:.89rem;color:var(--navy);margin-bottom:.15rem;direction:ltr}
.qhe{font-size:.8rem;color:var(--muted);margin-bottom:.65rem}
.qans{width:100%;padding:.6rem .88rem;border:1.5px solid var(--border);border-radius:var(--r-xs);font-family:'Rubik',sans-serif;font-size:.88rem;direction:rtl;outline:none;transition:border-color .2s;background:#fff}
.qans:focus{border-color:var(--blue)}
.qfb{margin-top:.55rem;padding:.55rem .8rem;border-radius:7px;font-size:.81rem;line-height:1.5}
.qfb.ok3{background:var(--green-l);color:var(--green)}
.qfb.ok2{background:#fff8e8;color:var(--amber)}
.qfb.no{background:var(--red-l);color:var(--red)}
.ckbtn{background:var(--blue);color:#fff;border:none;padding:.55rem 1.1rem;border-radius:var(--r-sm);cursor:pointer;font-family:'Rubik',sans-serif;font-size:.82rem;font-weight:600;margin-top:.55rem}
.ckbtn:disabled{background:#aaa;cursor:not-allowed}
.newdbtn{background:var(--blue);color:#fff;border:none;padding:.65rem 1.3rem;border-radius:var(--r-sm);cursor:pointer;font-family:'Rubik',sans-serif;font-size:.88rem;font-weight:700;transition:background .2s}
.newdbtn:hover{background:var(--blue-d)}

.spcard{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);padding:1.4rem;margin-bottom:1.1rem}
.qdisplay{text-align:center;padding:1.25rem .8rem}
.qlabel{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--blue);font-weight:700;margin-bottom:.65rem}
.qtextro{font-family:'Rubik',sans-serif;font-size:1.35rem;color:var(--navy);direction:ltr;margin-bottom:.45rem;line-height:1.4}
.qtexthe{font-size:.9rem;color:var(--muted);direction:rtl}
.sqbtn{background:none;border:none;font-size:1.1rem;cursor:pointer;margin-top:.4rem;opacity:.55;transition:opacity .2s}
.sqbtn:hover{opacity:1}
.micarea{display:flex;flex-direction:column;align-items:center;gap:.9rem;padding:1.35rem}
.micbtn{width:76px;height:76px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.9rem;background:var(--blue);color:#fff;transition:all .3s;box-shadow:0 4px 18px rgba(21,112,239,.35)}
.micbtn:hover{transform:scale(1.05)}
.micbtn.rec{background:var(--red);animation:pulse 1.2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}70%{box-shadow:0 0 0 14px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}
.miclbl{font-size:.83rem;color:var(--muted)}
.micerr{background:var(--red-l);border:1px solid #fca5a5;border-radius:var(--r-sm);padding:.75rem 1rem;font-size:.83rem;color:var(--red);direction:rtl;line-height:1.5}
.sbtn{background:var(--blue);color:#fff;border:none;padding:.72rem 1.6rem;border-radius:var(--r-sm);cursor:pointer;font-family:'Rubik',sans-serif;font-size:.9rem;font-weight:700;transition:background .2s}
.sbtn:hover{background:var(--blue-d)}
.sbtn:disabled{background:#aaa;cursor:not-allowed}
.fbcard{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);padding:1.2rem;direction:rtl}
.fbhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem}
.fbhdr h4{font-size:.92rem;font-weight:700;color:var(--navy)}
.spill{padding:.22rem .8rem;border-radius:99px;font-size:.81rem;font-weight:700}
.spill.hi{background:var(--green-l);color:var(--green)}
.spill.mi{background:#fff8e8;color:var(--amber)}
.spill.lo{background:var(--red-l);color:var(--red)}
.fbbody{font-size:.86rem;line-height:1.65;color:var(--text);white-space:pre-wrap}
.nqbtn{background:var(--blue);color:#fff;border:none;padding:.68rem 1.4rem;border-radius:var(--r-sm);cursor:pointer;font-family:'Rubik',sans-serif;font-size:.86rem;font-weight:700;margin-top:.9rem;transition:background .2s}
.nqbtn:hover{background:var(--blue-d)}

.chatbox{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden}
.chatmsgs{padding:1.1rem;min-height:240px;max-height:380px;overflow-y:auto;display:flex;flex-direction:column;gap:.85rem}
.msg{display:flex;gap:.6rem;max-width:88%}
.msg.usr{align-self:flex-end;flex-direction:row-reverse}
.mav{width:29px;height:29px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;flex-shrink:0}
.msg.ai .mav{background:var(--navy);color:#fff;font-weight:700}
.msg.usr .mav{background:var(--blue);color:#fff;font-weight:700}
.mbub{padding:.75rem .9rem;border-radius:12px;font-size:.86rem;line-height:1.55;white-space:pre-wrap}
.msg.ai .mbub{background:var(--bg);color:var(--text);border-radius:4px 12px 12px 12px;direction:rtl}
.msg.usr .mbub{background:var(--blue);color:#fff;border-radius:12px 4px 12px 12px;direction:ltr;font-family:'Rubik',sans-serif}
.dots{display:flex;gap:4px;padding:.35rem 0}
.dot{width:5px;height:5px;background:var(--muted);border-radius:50%;animation:b 1.2s infinite}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes b{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
.chatinp{border-top:1px solid var(--border);padding:.85rem 1rem;display:flex;gap:.6rem;align-items:flex-end}
.chatta{flex:1;border:1.5px solid var(--border);border-radius:var(--r-xs);padding:.6rem .85rem;font-family:'Rubik',sans-serif;font-size:.86rem;resize:none;outline:none;min-height:40px;max-height:100px;transition:border-color .2s;direction:ltr}
.chatta:focus{border-color:var(--blue)}
.sendbtn{background:var(--blue);color:#fff;border:none;width:40px;height:40px;border-radius:var(--r-xs);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0}
.sendbtn:hover{background:var(--blue-d)}
.sendbtn:disabled{background:#ccc;cursor:not-allowed}
.nexbtn{display:flex;align-items:center;gap:.35rem;background:var(--blue-l);border:none;border-radius:var(--r-xs);padding:.45rem .85rem;color:var(--muted);font-family:'Rubik',sans-serif;font-size:.8rem;cursor:pointer;flex-shrink:0}
.nexbtn:hover{color:var(--blue)}

.gram-topics{display:flex;flex-direction:column;gap:.65rem;margin-bottom:1.2rem}
.gram-topic{background:var(--surface);border-radius:var(--r-sm);box-shadow:var(--sh);padding:.9rem 1.1rem;cursor:pointer;transition:all .22s;display:flex;align-items:center;gap:.75rem}
.gram-topic:hover{box-shadow:var(--sh-md);transform:translateX(-2px)}
.gram-topic.active{box-shadow:0 0 0 2px var(--blue);background:var(--blue-l)}
.gt-num{width:28px;height:28px;border-radius:50%;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;flex-shrink:0}
.gt-info h4{font-size:.88rem;font-weight:600;color:var(--navy)}
.gt-info p{font-size:.76rem;color:var(--muted)}
.gram-explain{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);padding:1.35rem;direction:rtl;line-height:1.7;font-size:.89rem}
.gram-explain h2{font-size:1.5rem;font-weight:700;color:var(--navy);margin-bottom:1rem}
.gram-explain h3{font-size:.95rem;font-weight:700;color:var(--navy);margin:1.1rem 0 .4rem}
.gram-explain p{margin-bottom:.7rem;color:var(--text)}
.gram-explain .ex{background:var(--blue-l);border-radius:var(--r-xs);padding:.6rem .85rem;margin:.4rem 0;direction:ltr;font-family:'Rubik',sans-serif;font-size:.88rem}

.curr{max-width:800px;margin:0 auto;padding:1.6rem 1.4rem;direction:rtl}
.stage{background:var(--surface);border-radius:16px;margin-bottom:.9rem;overflow:hidden;box-shadow:var(--sh)}
.stage-header{padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:background .15s}
.stage-header:hover{background:var(--blue-l)}
.stage-h-left{display:flex;align-items:center;gap:.75rem}
.stage-num{width:30px;height:30px;border-radius:50%;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;flex-shrink:0}
.stage-name{font-weight:700;font-size:.93rem;color:var(--navy)}
.stage-desc{font-size:.78rem;color:var(--muted)}
.units{border-top:1px solid var(--border)}
.unit{display:flex;align-items:center;gap:.75rem;padding:.85rem 1.25rem;cursor:pointer;transition:background .15s;border-bottom:1px solid var(--border)}
.unit:last-child{border-bottom:none}
.unit:hover{background:var(--blue-l)}
.unit-icon{font-size:1.2rem;width:32px;text-align:center;flex-shrink:0}
.unit-info{flex:1}
.unit-name{font-size:.87rem;font-weight:600;color:var(--navy)}
.unit-sub{font-size:.75rem;color:var(--muted)}
.unit-badge{font-size:.72rem;padding:.16rem .6rem;border-radius:99px;font-weight:600}
.unit-badge.new{background:var(--blue-l);color:var(--blue)}
.unit-lesson{padding:1.3rem;border-top:1px solid var(--border);background:var(--bg);direction:rtl}

.ldcard{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);padding:2.5rem;text-align:center}
.spin{width:38px;height:38px;border:4px solid var(--border);border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto .9rem}
@keyframes spin{to{transform:rotate(360deg)}}
.ldcard p{color:var(--muted);font-size:.88rem}

@media(max-width:600px){
  .sgrid{grid-template-columns:1fr}
  .wcards{flex-direction:column;align-items:center}
  .welcome h1{font-size:2.1rem}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
}
`;

/* ═══════════ AUDIO — 11Labs TTS with browser fallback ═══════════ */
const _audioCache: Record<string, string> = {};
let _currentAudio: HTMLAudioElement | null = null;

async function speakRo(txt: string, rate = 0.88, onEnd?: (() => void) | null) {
  if (!txt) return;
  stopSpeech();
  try {
    let url = _audioCache[txt];
    if (!url) {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt, voice_id: "onwK4e9ZLuTAKqWW03F9" }),
      });
      if (res.ok) {
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        _audioCache[txt] = url;
      }
    }
    if (url) {
      const audio = new Audio(url);
      audio.playbackRate = rate;
      _currentAudio = audio;
      if (onEnd) audio.onended = onEnd;
      audio.play();
      return;
    }
  } catch { /* fall through */ }
  // Browser fallback
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "ro-RO"; u.rate = rate;
    const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("ro"));
    if (v) u.voice = v;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  }
}
function stopSpeech() {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio.currentTime = 0; _currentAudio = null; }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/* ═══════════ API — calls Next.js route → Anthropic ═══════════ */
async function callAI(messages: {role:string;content:string}[], sys: string) {
  const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages, system: sys }) });
  const d = await r.json();
  return d.text || "";
}
function parseJ(raw: string) { try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { return null; } }

/* ═══════════ CONSTANTS ═══════════ */
const AV = ["#c9973a", "#1a2744", "#2563eb", "#7c3aed", "#0f766e", "#b45309"];
const SKILLS = [
  { id: "vocab", name: "אוצר מילים", ro: "Vocabular", icon: "🗂️", desc: "מילים בסיסיות עם הטיות ואודיו", color: "var(--blue)" },
  { id: "writing", name: "כתיבה", ro: "Scriere", icon: "✍️", desc: "משימות כתיבה ברמת B1", color: "var(--purple)" },
  { id: "listening", name: "הקשבה", ro: "Ascultare", icon: "🎧", desc: "דיאלוגים עם האזנה ותרגום", color: "var(--amber)" },
  { id: "speaking", name: "דיבור", ro: "Vorbire", icon: "🎙️", desc: "תרגול דיבור עם מיקרופון", color: "var(--teal)" },
];
const MIN_PCT = 60, OPT_PCT = 82;
function overall(s: Record<string, number>) { const v = Object.values(s); return Math.round(v.reduce((a, b) => a + b, 0) / v.length); }

interface User { name: string; created: number; skills: Record<string, number>; sessions: Record<string, number>; }
function initUser(name: string): User { return { name, created: Date.now(), skills: { vocab: 0, writing: 0, listening: 0, speaking: 0 }, sessions: { vocab: 0, writing: 0, listening: 0, speaking: 0 } }; }
function loadUsers(): User[] { if (typeof window === "undefined") return []; try { const d = localStorage.getItem("ro_v4"); return d ? JSON.parse(d) : []; } catch { return []; } }
function saveUsers(users: User[]) { try { localStorage.setItem("ro_v4", JSON.stringify(users)); } catch {} }

/* ═══════════ HEADER ═══════════ */
function Header({ user, onLogoClick, onAvatarClick, idx }: { user: User|null; onLogoClick:()=>void; onAvatarClick:()=>void; idx:number }) {
  return (
    <div className="hdr">
      <div className="hlogo" onClick={onLogoClick}>
        <div className="flag"><div style={{background:"#002B7F"}}/><div style={{background:"#FCD116"}}/><div style={{background:"#CE1126"}}/></div>
        Română B1
      </div>
      {user && <div className="hright" onClick={onAvatarClick}>
        <div className="uav" style={{background:AV[idx%AV.length],color:idx%2===0?"var(--navy)":"#fff"}}>{user.name[0].toUpperCase()}</div>
        <span className="uname">{user.name}</span>
        <span style={{color:"#718096",fontSize:".7rem"}}>▾</span>
      </div>}
    </div>
  );
}

/* ═══════════ RADAR CHART ═══════════ */
function RadarChart({ skills }: { skills: Record<string, number> }) {
  const cx=90,cy=90,r=68;
  const angles=[-Math.PI/2,0,Math.PI/2,Math.PI];
  const labels=["אוצר מילים","כתיבה","הקשבה","דיבור"];
  const vals=[skills.vocab,skills.writing,skills.listening,skills.speaking];
  const poly=(pct:number)=>angles.map(a=>{const d=(pct/100)*r;return`${cx+d*Math.cos(a)},${cy+d*Math.sin(a)}`;}).join(" ");
  return (
    <svg viewBox="0 0 180 180" style={{width:"100%",maxWidth:220,margin:"0 auto",display:"block"}}>
      {[25,50,75,100].map(p=>(<polygon key={p} points={poly(p)} fill="none" stroke={p===100?"#e0d8cc":"#f0ece4"} strokeWidth={p===100?1.5:1}/>))}
      <polygon points={poly(MIN_PCT)} fill="rgba(180,83,9,.08)" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="4,3"/>
      <polygon points={poly(OPT_PCT)} fill="rgba(46,125,82,.06)" stroke="var(--green)" strokeWidth={1.5} strokeDasharray="4,3"/>
      <polygon points={vals.map((v,i)=>{const d=(v/100)*r;return`${cx+d*Math.cos(angles[i])},${cy+d*Math.sin(angles[i])}`;}).join(" ")} fill="rgba(26,39,68,.18)" stroke="var(--navy)" strokeWidth={2}/>
      {angles.map((a,i)=>(<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#e0d8cc" strokeWidth={1}/>))}
      {angles.map((a,i)=>{const lx=cx+(r+14)*Math.cos(a),ly=cy+(r+14)*Math.sin(a);return<text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--muted)" fontFamily="Rubik,sans-serif">{labels[i]}</text>;})}
      {vals.map((v,i)=>{const d=(v/100)*r;return<circle key={i} cx={cx+d*Math.cos(angles[i])} cy={cy+d*Math.sin(angles[i])} r={4} fill="var(--navy)"/>;})}
    </svg>
  );
}

/* ═══════════ VOCAB MODULE ═══════════ */
const VSY=`You are a Romanian teacher generating vocabulary flashcards. Return ONLY valid JSON.
NOUN: {"word":"casă","type_ro":"substantiv feminin","type_he":"שם עצם - נקבה","translation_he":"בית","emoji":"🏠","forms":[{"lbl":"יחיד לא מוגדר","val":"o casă"},{"lbl":"יחיד מוגדר","val":"casa"},{"lbl":"רבים","val":"case"}],"example_ro":"Eu am o casă mare.","example_he":"יש לי בית גדול.","category":"locuință"}
VERB: {"word":"a merge","type_ro":"verb regulat","type_he":"פועל","translation_he":"ללכת","emoji":"🚶","forms":[{"lbl":"אני","val":"merg"},{"lbl":"אתה","val":"mergi"},{"lbl":"הוא","val":"merge"},{"lbl":"אנחנו","val":"mergem"},{"lbl":"עבר","val":"am mers"}],"example_ro":"Eu merg la piață.","example_he":"אני הולך לשוק.","category":"acțiuni"}
Vary types and categories. Start simple A1.`;

function VocabModule({onProg,topic}:{onProg:(n:number)=>void;topic?:string}) {
  const [card,setCard]=useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading,setLoading]=useState(false);
  const [known,setKnown]=useState(0);
  const [total,setTotal]=useState(0);
  const [hist,setHist]=useState<string[]>([]);
  const [status,setStatus]=useState<string|null>(null);

  const fetchCard=useCallback(async()=>{
    setLoading(true);setCard(null);setStatus(null);
    try{
      const th=topic?` Focus on: ${topic}.`:"";
      const msgs=hist.length>0
        ?[{role:"user",content:`New vocab card.${th} Already: ${hist.slice(-8).join(", ")}. Different word.`}]
        :[{role:"user",content:`First vocab card for beginner.${th} Common everyday word.`}];
      const raw=await callAI(msgs,VSY);
      const p=parseJ(raw);
      if(p){setCard(p);setTotal(t=>t+1);setHist(h=>[...h,p.word]);}
      else setCard({err:true});
    }catch{setCard({err:true});}
    setLoading(false);
  },[hist,topic]);

  useEffect(()=>{fetchCard();},[]);// eslint-disable-line react-hooks/exhaustive-deps

  const mark=(type:string)=>{
    setStatus(type);
    setTimeout(()=>{onProg(type==="known"?3:1);if(type==="known")setKnown(k=>k+1);fetchCard();},1100);
  };

  return(<div>
    <div className="vprow"><div className="vpbar"><div className="vpfill" style={{width:total>0?`${Math.min(100,(known/Math.max(total,1))*100)}%`:"0%"}}/></div><div className="vstats">{known}/{total} ידועות</div></div>
    {loading&&<div className="ldcard"><div className="spin"/><p>טוען מילה...</p></div>}
    {!loading&&card&&!card.err&&(
      <div className="vcardwrap"><div className="vcard">
        {status&&<div className={`vcard-status ${status==="known"?"vs-known":"vs-practice"}`}>{status==="known"?"✓ ידוע!":"🔄 לתרגול"}</div>}
        <div className="vseg">
          <div className="vtrans">
            <div className="vcol-ro"><div className="vcol-lbl-ro">ROM</div><div className="wro">{card.word}</div></div>
            <div className="wemoji-wrap"><span className="wemoji">{card.emoji}</span></div>
            <div className="vcol-he"><div className="vcol-lbl-he">עברית</div><div className="whe">{card.translation_he}</div></div>
          </div>
          <div className="wtype-row"><span className="wtag">{card.type_ro}</span><span className="wtag">{card.category}</span><span className="wtag he">{card.type_he}</span></div>
          <button className="vaudio-btn" onClick={()=>speakRo(card.word)}>🔊</button>
        </div>
        {card.forms?.length>0&&<div style={{width:"100%"}}>
          <div className="ftable-hdr"><span>ברומנית</span><span>צורה דקדוקית</span></div>
          {card.forms.map((f:any,i:number)=>(<div key={i} className="frow"><div className="fval"><button className="snd-sm" onClick={()=>speakRo(f.val)}>🔊</button><span className="fval-txt">{f.val}</span></div><div className="flbl">{f.lbl}</div></div>))}
        </div>}
        <div className="exbox" style={{margin:"0 16px 20px"}}><div className="exbox-icon" onClick={()=>speakRo(card.example_ro)} style={{cursor:"pointer"}}>🔊</div><div className="exbox-text"><div className="exro">{card.example_ro}</div><div className="exhe">{card.example_he}</div></div></div>
      </div>
      {!status&&<div className="vnav"><button className="vbtn prac" onClick={()=>mark("practice")}>🔁 צריך עוד תרגול</button><button className="vbtn know" onClick={()=>mark("known")}>✓ יודע!</button></div>}
    </div>)}
    {!loading&&card?.err&&<div className="ldcard"><p>שגיאה — <button className="pbtn" style={{display:"inline",padding:".4rem 1rem"}} onClick={fetchCard}>נסה שוב</button></p></div>}
  </div>);
}

/* ═══════════ LISTENING MODULE ═══════════ */
const LSY=`Romanian teacher. Return ONLY valid JSON.
{"title":"La magazin","level":"A1","lines":[{"speaker":"Vânzătoare","speaker_he":"מוכרת","text":"Bună ziua!","he":"שלום!"}],"questions":[{"q_ro":"Unde are loc?","q_he":"היכן?","ans_ro":"La magazin","ans_he":"בחנות"}]}
4-6 lines, 2-3 questions. Topics: salut, magazin, medic, restaurant, transport, familie. Start A1.`;
const LEVAL_SY=`Evaluate Romanian listening answer. Return ONLY JSON:{"score":3,"feedback_he":"..."} score: 3=correct Romanian, 2=Hebrew/minor errors, 1=partial, 0=wrong.`;

function ListenModule({onProg}:{onProg:(n:number)=>void}) {
  const [dial,setDial]=useState<any>(null);const [loading,setLoading]=useState(false);const [actLine,setActLine]=useState(-1);const [playing,setPlaying]=useState(false);const [showTrans,setShowTrans]=useState(false);const [answers,setAnswers]=useState<Record<number,string>>({});const [fb,setFb]=useState<Record<number,any>>({});const [checking,setChecking]=useState<Record<number,boolean>>({});const playRef=useRef(false);

  const fetchDial=useCallback(async()=>{setLoading(true);setDial(null);setActLine(-1);setAnswers({});setFb({});stopSpeech();playRef.current=false;setPlaying(false);try{const raw=await callAI([{role:"user",content:"Generate a new Romanian listening dialogue."}],LSY);const p=parseJ(raw);if(p){setDial(p);onProg(2);}else setDial({err:true});}catch{setDial({err:true});}setLoading(false);},[]);// eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{fetchDial();},[]);// eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>()=>{stopSpeech();playRef.current=false;},[]);

  const playDial=(spd=1)=>{if(!dial?.lines)return;if(playing){stopSpeech();setPlaying(false);setActLine(-1);playRef.current=false;return;}setPlaying(true);playRef.current=true;const next=(i:number)=>{if(!playRef.current||i>=dial.lines.length){setPlaying(false);setActLine(-1);playRef.current=false;return;}setActLine(i);speakRo(dial.lines[i].text,spd,()=>setTimeout(()=>next(i+1),350));};next(0);};

  const check=async(qi:number)=>{const ans=answers[qi];if(!ans?.trim())return;setChecking(c=>({...c,[qi]:true}));try{const q=dial.questions[qi];const raw=await callAI([{role:"user",content:`Question: "${q.q_ro}" (${q.q_he})\nExpected: "${q.ans_ro}" (${q.ans_he})\nStudent: "${ans}"`}],LEVAL_SY);const p=parseJ(raw);if(p){setFb(f=>({...f,[qi]:p}));if(p.score>=2)onProg(p.score);}}catch{setFb(f=>({...f,[qi]:{score:1,feedback_he:"שגיאה. נסה שוב."}}));}setChecking(c=>({...c,[qi]:false}));};

  return(<div>
    {loading&&<div className="ldcard"><div className="spin"/><p>מייצר דיאלוג...</p></div>}
    {!loading&&dial&&!dial.err&&(<>
      <div className="dcard">
        <div className="dhead"><span className="dtitle">{dial.title}</span><div style={{display:"flex",gap:".5rem",alignItems:"center"}}><button className={`trans-toggle${showTrans?" on":""}`} onClick={()=>setShowTrans(t=>!t)}>{showTrans?"🇮🇱 תרגום פעיל":"🇮🇱 הצג תרגום"}</button><span className="dlevel">{dial.level}</span></div></div>
        <div className="dlines">{dial.lines.map((l:any,i:number)=>(<div key={i} className={`dline${actLine===i?" act":""}`}><div className="dspk">{l.speaker}{l.speaker_he?` — ${l.speaker_he}`:""}</div><div className="dtxt">{l.text} <button style={{background:"none",border:"none",cursor:"pointer",opacity:.45,fontSize:".75rem"}} onClick={()=>speakRo(l.text)}>🔊</button></div>{showTrans&&l.he&&<div className="dtrans">↳ {l.he}</div>}</div>))}</div>
        <div className="actrl"><button className={`playbtn${playing?" playing":""}`} onClick={()=>playDial(1)}>{playing?"⏹":"▶"}</button><div className="atrack"><div className="aprog"><div className="afill" style={{width:actLine>=0?`${((actLine+1)/dial.lines.length)*100}%`:"0%"}}/></div><div className="atime">{actLine>=0?`שורה ${actLine+1}/${dial.lines.length}`:`${dial.lines.length} שורות`}</div></div><button className="spdbtn" onClick={()=>playDial(0.65)}>איטי</button><button className="spdbtn" onClick={()=>playDial(1)}>רגיל</button></div>
      </div>
      <div className="qsec">
        <div className="qhdr"><h3>שאלות הבנה</h3><button className="newdbtn" onClick={fetchDial}>דיאלוג חדש →</button></div>
        {dial.questions.map((q:any,i:number)=>(<div key={i} className="qitem"><div className="qro">{q.q_ro} <button style={{background:"none",border:"none",cursor:"pointer",opacity:.45,fontSize:".75rem"}} onClick={()=>speakRo(q.q_ro)}>🔊</button></div><div className="qhe">🇮🇱 {q.q_he}</div><input className="qans" placeholder="כתוב תשובה..." value={answers[i]||""} onChange={e=>setAnswers(a=>({...a,[i]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&!checking[i]&&check(i)} disabled={!!fb[i]}/>{!fb[i]&&<button className="ckbtn" onClick={()=>check(i)} disabled={!answers[i]?.trim()||checking[i]}>{checking[i]?"בודק...":"בדוק"}</button>}{fb[i]&&<div className={`qfb ${fb[i].score>=3?"ok3":fb[i].score>=2?"ok2":"no"}`}>{fb[i].score>=3?"✓":fb[i].score>=2?"~":"✗"} {fb[i].feedback_he}{fb[i].score<3&&<div style={{marginTop:".35rem",fontStyle:"italic",direction:"ltr"as const}}>תשובה נכונה: {q.ans_ro}</div>}</div>}</div>))}
      </div>
    </>)}
    {!loading&&dial?.err&&<div className="ldcard"><p>שגיאה — <button className="pbtn" style={{display:"inline",padding:".4rem 1rem"}} onClick={fetchDial}>נסה שוב</button></p></div>}
  </div>);
}

/* ═══════════ SPEAKING MODULE ═══════════ */
const SPSY=`Romanian oral exam evaluator. For question: {"question_ro":"Cum te numești?","question_he":"איך קוראים לך?","topic":"היכרות"} For evaluation: {"score":7,"correction_ro":"Mă numesc Dana.","feedback_he":"...","improved_ro":"..."} Topics: greetings,family,work,food,city,hobbies. B1 level.`;

function SpeakModule({user,onProg}:{user:User;onProg:(n:number)=>void}) {
  const [q,setQ]=useState<any>(null);const [loading,setLoading]=useState(false);const [recState,setRecState]=useState("idle");const [micError,setMicError]=useState("");const [trans,setTrans]=useState("");const [interim,setInterim]=useState("");const [fb,setFb]=useState<any>(null);const [evaling,setEvaling]=useState(false);const recRef=useRef<any>(null);

  const fetchQ=useCallback(async()=>{setLoading(true);setQ(null);setTrans("");setFb(null);setInterim("");setRecState("idle");setMicError("");try{const raw=await callAI([{role:"user",content:"Generate a new Romanian speaking practice question."}],SPSY);setQ(parseJ(raw)||{err:true});}catch{setQ({err:true});}setLoading(false);},[]);
  useEffect(()=>{fetchQ();},[]);// eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>()=>{recRef.current?.abort();stopSpeech();},[]);

  const startRec=()=>{const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;if(!SR){setMicError("זיהוי קול אינו נתמך — הקלד בתיבה למטה.");setRecState("error");return;}try{const r=new SR();r.lang="ro-RO";r.continuous=false;r.interimResults=true;r.onstart=()=>{setRecState("listening");setMicError("");};r.onresult=(e:any)=>{let fi="",it="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)fi+=e.results[i][0].transcript;else it+=e.results[i][0].transcript;}if(fi)setTrans(t=>t+fi+" ");setInterim(it);};r.onend=()=>{setRecState("idle");setInterim("");};r.onerror=(e:any)=>{if(e.error==="aborted")return;setRecState("error");setMicError(e.error==="not-allowed"?"המיקרופון אינו זמין.":"שגיאה: "+e.error);};recRef.current=r;r.start();}catch{setMicError("זיהוי קול אינו זמין.");setRecState("error");}};
  const stopRec=()=>{recRef.current?.stop();setRecState("idle");};
  const evaluate=async()=>{if(!trans.trim())return;setEvaling(true);try{const raw=await callAI([{role:"user",content:`Question: "${q.question_ro}"\nStudent: "${trans.trim()}"`}],SPSY);const p=parseJ(raw);if(p){setFb(p);onProg(p.score>=6?4:2);}}catch{}setEvaling(false);};

  return(<div>
    {loading&&<div className="ldcard"><div className="spin"/><p>מייצר שאלה...</p></div>}
    {!loading&&q&&!q.err&&(<>
      <div className="spcard">
        <div className="qdisplay"><div className="qlabel">שאלה — {q.topic||"B1"}</div><div className="qtextro">{q.question_ro}</div><div className="qtexthe">{q.question_he}</div><button className="sqbtn" onClick={()=>speakRo(q.question_ro,0.85)}>🔊 השמע שאלה</button></div>
        <div className="micarea">
          <button className={`micbtn${recState==="listening"?" rec":""}`} onClick={recState==="listening"?stopRec:startRec}>{recState==="listening"?"⏹":"🎙"}</button>
          <span className="miclbl">{recState==="listening"?"מקשיב... לחץ לעצירה":"לחץ לדיבור ברומנית"}</span>
          {micError&&<div className="micerr">⚠️ {micError}</div>}
          <textarea style={{width:"100%",padding:".7rem",border:"1.5px solid var(--border)",borderRadius:"9px",fontFamily:"'Rubik',sans-serif",fontSize:".93rem",direction:"ltr"as const,minHeight:"80px",resize:"vertical"as const,outline:"none"}} placeholder="כתוב תשובה ברומנית..." value={trans} onChange={e=>{setTrans(e.target.value);setInterim("");}}/>
          {interim&&<div style={{width:"100%",fontSize:".84rem",color:"var(--muted)",fontStyle:"italic",direction:"ltr"as const}}>{interim}...</div>}
          <div style={{display:"flex",gap:".65rem",flexWrap:"wrap"as const,justifyContent:"center"}}>
            {trans&&<button className="obtn" style={{padding:".5rem 1rem"}} onClick={()=>{setTrans("");setFb(null);setInterim("");}}>נקה</button>}
            <button className="sbtn" onClick={evaluate} disabled={!trans.trim()||evaling}>{evaling?"מעריך...":"שלח להערכה →"}</button>
          </div>
        </div>
      </div>
      {fb&&<div className="fbcard">
        <div className="fbhdr"><h4>הערכת AI</h4><span className={`spill ${fb.score>=7?"hi":fb.score>=5?"mi":"lo"}`}>{fb.score}/10</span></div>
        {fb.correction_ro&&<div style={{background:"#f7f4ef",borderRadius:"9px",padding:".8rem",marginBottom:".9rem",direction:"ltr"as const}}><div style={{fontSize:".7rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase"as const}}>גרסה מתוקנת</div><div style={{fontStyle:"italic",fontSize:".93rem",color:"var(--navy)"}}>{fb.correction_ro} <button style={{background:"none",border:"none",cursor:"pointer",opacity:.5}} onClick={()=>speakRo(fb.correction_ro)}>🔊</button></div></div>}
        <div className="fbbody">{fb.feedback_he}</div>
        <button className="nqbtn" onClick={fetchQ}>שאלה הבאה →</button>
      </div>}
    </>)}
    {!loading&&q?.err&&<div className="ldcard"><p>שגיאה — <button className="pbtn" style={{display:"inline",padding:".4rem 1rem"}} onClick={fetchQ}>נסה שוב</button></p></div>}
  </div>);
}

/* ═══════════ WRITING MODULE ═══════════ */
const WSY=`Romanian B1 writing teacher. If "התחל": give a writing prompt in Hebrew+Romanian. Evaluate: grammar, vocab, score/10. Reply Hebrew. Be encouraging.`;

function WriteModule({user,onProg}:{user:User;onProg:(n:number)=>void}) {
  const [msgs,setMsgs]=useState<{role:string;content:string}[]>([]);const [inp,setInp]=useState("");const [loading,setLoading]=useState(false);const sr=useRef<HTMLDivElement>(null);
  useEffect(()=>{sr.current?.scrollTo(0,sr.current.scrollHeight);},[msgs]);
  const send=async(txt:string)=>{if(!txt.trim()||loading)return;const nm=[...msgs,{role:"user",content:txt}];setMsgs(nm);setInp("");setLoading(true);try{const r=await callAI(nm,WSY);setMsgs([...nm,{role:"assistant",content:r}]);onProg(2);}catch{setMsgs([...nm,{role:"assistant",content:"שגיאה. נסה שוב."}]);}setLoading(false);};
  return(
    <div className="chatbox">
      <div className="chatmsgs" ref={sr}>
        {msgs.length===0&&<div style={{textAlign:"center",color:"var(--muted)",paddingTop:"2rem"}}><div style={{fontSize:"2.2rem",marginBottom:".6rem"}}>✍️</div><div style={{fontWeight:700,color:"var(--navy)",marginBottom:".25rem"}}>תרגול כתיבה</div><div style={{fontSize:".83rem",marginBottom:"1.1rem"}}>לחץ &quot;משימה חדשה&quot;</div><button className="pbtn" style={{maxWidth:190,margin:"0 auto",display:"block"}} onClick={()=>send("התחל")}>✏️ משימה חדשה</button></div>}
        {msgs.map((m,i)=>(<div key={i} className={`msg ${m.role==="user"?"usr":"ai"}`}><div className="mav">{m.role==="user"?user.name[0].toUpperCase():"RO"}</div><div className="mbub">{m.content}</div></div>))}
        {loading&&<div className="msg ai"><div className="mav">RO</div><div className="mbub"><div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div></div></div>}
      </div>
      <div className="chatinp">
        {msgs.length>0&&<button className="nexbtn" onClick={()=>send("התחל")} disabled={loading}>🔄</button>}
        <textarea className="chatta" value={inp} onChange={e=>setInp(e.target.value)} placeholder="כתוב ברומנית..." rows={1} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(inp);}}}/>
        <button className="sendbtn" onClick={()=>send(inp)} disabled={!inp.trim()||loading}>➤</button>
      </div>
    </div>
  );
}

/* ═══════════ GRAMMAR MODULE ═══════════ */
const GRAMMAR_TOPICS=[
  {id:"alphabet",title:"אלפבית והגייה",sub:"ă, â, î, ș, ț"},{id:"gender",title:"מגדר — 3 מינים",sub:"זכר, נקבה וניטרל"},{id:"article",title:"ה׳ הידיעה בסוף",sub:"-ul, -a, -le"},{id:"present",title:"הפועל בהווה",sub:"נטיית פועל"},{id:"past",title:"עבר מורכב",sub:"am mers..."},{id:"future",title:"עתיד",sub:"voi, vei, va..."},{id:"adjective",title:"שם תואר",sub:"הסכמה לפי מגדר"},{id:"negation",title:"שלילה",sub:"nu + פועל"},{id:"questions",title:"שאלות",sub:"ce, cine, unde, când"},{id:"numbers",title:"מספרים",sub:"1-100"},
];
const GRAM_SY=`Romanian grammar teacher for Hebrew speakers. Use clear Hebrew. Compare to Hebrew. Give 3-5 examples with translation. Use ## for topics, ### for sections.`;

function GrammarModule() {
  const [sel,setSel]=useState<typeof GRAMMAR_TOPICS[0]|null>(null);const [explain,setExplain]=useState("");const [loading,setLoading]=useState(false);
  const fetch=async(t:typeof GRAMMAR_TOPICS[0])=>{setSel(t);setLoading(true);setExplain("");try{const r=await callAI([{role:"user",content:`Explain: "${t.title}" (${t.sub}) in Romanian grammar for Hebrew speaker.`}],GRAM_SY);setExplain(r);}catch{setExplain("שגיאה.");}setLoading(false);};
  const render=(text:string)=>text.split("\n").map((line,i)=>{
    if(line.startsWith("## "))return<h2 key={i}>{line.slice(3)}</h2>;if(line.startsWith("### "))return<h3 key={i}>{line.slice(4)}</h3>;if(line.startsWith("- ")||line.startsWith("* "))return<p key={i} style={{paddingRight:"1rem"}}>• {line.slice(2)}</p>;if(!line.trim())return<div key={i} style={{height:".4rem"}}/>;return<p key={i}>{line}</p>;
  });
  return(<div>
    <div style={{marginBottom:"1.2rem",padding:".85rem",background:"#fff",border:"2px solid var(--border)",borderRadius:"11px",fontSize:".86rem",color:"var(--muted)",direction:"rtl"as const,lineHeight:1.6}}>💡 בחר נושא להסבר מפורט</div>
    <div className="gram-topics">{GRAMMAR_TOPICS.map((t,i)=>(<div key={t.id} className={`gram-topic${sel?.id===t.id?" active":""}`} onClick={()=>fetch(t)}><div className="gt-num">{i+1}</div><div className="gt-info"><h4>{t.title}</h4><p>{t.sub}</p></div><div style={{marginRight:"auto",color:"var(--muted)"}}>›</div></div>))}</div>
    {loading&&<div className="ldcard"><div className="spin"/><p>מכין הסבר...</p></div>}
    {!loading&&explain&&<div className="gram-explain">{render(explain)}</div>}
  </div>);
}

/* ═══════════ CURRICULUM MODULE ═══════════ */
const CURRICULUM=[
  {id:"s1",name:"שלב א: יסודות",desc:"מילים ראשונות וברכות",units:[{id:"u1",name:"ברכות ראשונות",sub:"Bună ziua, mulțumesc",icon:"👋",topic:"salut"},{id:"u2",name:"מספרים 1–20",sub:"unu, doi, trei...",icon:"🔢",topic:"numere"},{id:"u3",name:"צבעים",sub:"roșu, albastru, verde",icon:"🎨",topic:"culori"},{id:"u4",name:"משפחה",sub:"mamă, tată, frate",icon:"👨‍👩‍👧",topic:"familie"},{id:"u5",name:"גוף האדם",sub:"cap, mâini, picioare",icon:"🫀",topic:"corp"}]},
  {id:"s2",name:"שלב ב: משפטים ראשונים",desc:"בניית משפט בסיסי",units:[{id:"u6",name:"הצגה עצמית",sub:"Mă numesc, eu sunt",icon:"🙋",topic:"prezentare"},{id:"u7",name:"מזון ושתייה",sub:"pâine, apă, cafea",icon:"🍎",topic:"mâncare"},{id:"u8",name:"שאלות יסוד",sub:"Ce? Cine? Unde?",icon:"❓",topic:"întrebări"},{id:"u9",name:"בעיר",sub:"stradă, magazin, piață",icon:"🏙️",topic:"oraș"}]},
  {id:"s3",name:"שלב ג: סיטואציות",desc:"שפה יומיומית",units:[{id:"u10",name:"בחנות",sub:"קנייה, מחיר",icon:"🛒",topic:"cumpărături"},{id:"u11",name:"בריאות",sub:"doctor, spital",icon:"🏥",topic:"sănătate"},{id:"u12",name:"תחבורה",sub:"autobus, tren, bilet",icon:"🚌",topic:"transport"},{id:"u13",name:"עבודה",sub:"serviciu, birou",icon:"💼",topic:"muncă"},{id:"u14",name:"מסמכים ואזרחות",sub:"pașaport, cetățenie",icon:"📋",topic:"documente"}]},
];
const LESSON_SY=`Romanian teacher. Mini-lesson for Hebrew beginners. Return ONLY valid JSON:
{"vocab":[{"ro":"bun","he":"טוב","emoji":"👍"}],"sentences":[{"ro":"Bună ziua!","he":"שלום!","note":"ברכה רשמית"}],"mini_ro":"- Bună ziua!\\n- Ce mai faceți?","mini_he":"- שלום!\\n- מה שלומכם?"}
4-6 vocab, 3-4 sentences, short dialogue. A1.`;

function CurriculumModule({onProg}:{onProg:(n:number)=>void}) {
  const [openStage,setOpenStage]=useState("s1");const [activeUnit,setActiveUnit]=useState<any>(null);const [lesson,setLesson]=useState<any>(null);const [loading,setLoading]=useState(false);const [lessonView,setLessonView]=useState("vocab");

  const openUnit=async(unit:any)=>{if(activeUnit?.id===unit.id){setActiveUnit(null);setLesson(null);return;}setActiveUnit(unit);setLesson(null);setLoading(true);setLessonView("vocab");try{const raw=await callAI([{role:"user",content:`Mini-lesson for "${unit.name}" (${unit.sub}), category: ${unit.topic}. A1 level.`}],LESSON_SY);const p=parseJ(raw);if(p){setLesson(p);onProg(2);}else setLesson({err:true});}catch{setLesson({err:true});}setLoading(false);};

  return(<div className="curr">
    <div style={{background:"linear-gradient(135deg,var(--navy),#253464)",borderRadius:"14px",padding:"1.2rem",marginBottom:"1.4rem",direction:"rtl"as const}}><h3 style={{color:"var(--gold)",fontSize:".95rem",fontWeight:700,marginBottom:".35rem"}}>📚 מסלול למידה לינארי</h3><p style={{color:"#c8d4e8",fontSize:".84rem",lineHeight:1.6}}>למד בסדר הנכון — מהבסיס למתקדם.</p></div>
    {CURRICULUM.map((stage,si)=>(<div key={stage.id} className="stage">
      <div className="stage-header" onClick={()=>setOpenStage(openStage===stage.id?"":stage.id)}><div className="stage-h-left"><div className="stage-num">{si+1}</div><div><div className="stage-name">{stage.name}</div><div className="stage-desc">{stage.desc}</div></div></div><div style={{display:"flex",alignItems:"center",gap:".5rem"}}><span style={{fontSize:".76rem",color:"var(--muted)"}}>{stage.units.length} יחידות</span><span style={{color:"var(--muted)",fontSize:".85rem"}}>{openStage===stage.id?"▲":"▼"}</span></div></div>
      {openStage===stage.id&&<div className="units">{stage.units.map(unit=>(<div key={unit.id}>
        <div className="unit" onClick={()=>openUnit(unit)}><div className="unit-icon">{unit.icon}</div><div className="unit-info"><div className="unit-name">{unit.name}</div><div className="unit-sub">{unit.sub}</div></div><span className="unit-badge new">פתח שיעור</span></div>
        {activeUnit?.id===unit.id&&<div className="unit-lesson">
          {loading&&<div style={{textAlign:"center",padding:"1.5rem"}}><div className="spin" style={{margin:"0 auto .7rem"}}/><p style={{color:"var(--muted)",fontSize:".87rem"}}>מייצר שיעור...</p></div>}
          {!loading&&lesson&&!lesson.err&&(<>
            <div style={{display:"flex",gap:".55rem",marginBottom:"1.1rem",flexWrap:"wrap"as const}}>{(["vocab","sentences","dialogue"]as const).map(v=>(<button key={v} onClick={()=>setLessonView(v)} style={{padding:".42rem .9rem",borderRadius:"7px",border:"none",fontFamily:"'Rubik',sans-serif",fontSize:".82rem",cursor:"pointer",background:lessonView===v?"var(--blue)":"var(--blue-l)",color:lessonView===v?"#fff":"var(--blue)",fontWeight:lessonView===v?700:400}}>{v==="vocab"?"🗂️ מילים":v==="sentences"?"📝 משפטים":"💬 דיאלוג"}</button>))}</div>
            {lessonView==="vocab"&&<div style={{display:"flex",flexDirection:"column",gap:".55rem"}}>{lesson.vocab?.map((w:any,i:number)=>(<div key={i} style={{background:"#fff",border:"1.5px solid var(--border)",borderRadius:"9px",padding:".65rem 1rem",display:"flex",alignItems:"center",gap:".75rem"}}><span style={{fontSize:"1.5rem"}}>{w.emoji}</span><div style={{flex:1}}><div style={{fontStyle:"italic",fontWeight:700,color:"var(--navy)",direction:"ltr"as const}}>{w.ro}</div><div style={{fontSize:".84rem",color:"var(--gold)",fontWeight:600}}>{w.he}</div></div><button style={{background:"none",border:"none",cursor:"pointer",fontSize:"1rem",opacity:.5}} onClick={()=>speakRo(w.ro)}>🔊</button></div>))}</div>}
            {lessonView==="sentences"&&<div style={{display:"flex",flexDirection:"column",gap:".65rem"}}>{lesson.sentences?.map((s:any,i:number)=>(<div key={i} style={{background:"#fff",border:"1.5px solid var(--border)",borderRadius:"9px",padding:".75rem 1rem"}}><div style={{fontStyle:"italic",color:"var(--navy)",direction:"ltr"as const,marginBottom:".25rem",display:"flex",alignItems:"center",gap:".4rem"}}>{s.ro} <button style={{background:"none",border:"none",cursor:"pointer",fontSize:".8rem",opacity:.5}} onClick={()=>speakRo(s.ro)}>🔊</button></div><div style={{fontSize:".84rem",color:"var(--muted)"}}>{s.he}</div>{s.note&&<div style={{fontSize:".76rem",color:"var(--amber)",marginTop:".2rem"}}>💡 {s.note}</div>}</div>))}</div>}
            {lessonView==="dialogue"&&lesson.mini_ro&&<div style={{display:"flex",flexDirection:"column",gap:".65rem"}}><div style={{background:"#fff",border:"1.5px solid var(--border)",borderRadius:"9px",padding:".85rem 1rem"}}><div style={{fontSize:".72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase"as const,marginBottom:".5rem"}}>רומנית</div><div style={{fontStyle:"italic",fontSize:".92rem",whiteSpace:"pre-line",color:"var(--navy)",direction:"ltr"as const,lineHeight:1.7}}>{lesson.mini_ro}</div></div><div style={{background:"#faf7f3",border:"1.5px solid var(--border)",borderRadius:"9px",padding:".85rem 1rem"}}><div style={{fontSize:".72rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase"as const,marginBottom:".5rem"}}>עברית</div><div style={{fontSize:".9rem",whiteSpace:"pre-line",color:"var(--muted)",direction:"rtl"as const,lineHeight:1.7}}>{lesson.mini_he}</div></div><button style={{background:"var(--blue)",color:"#fff",border:"none",padding:".6rem 1.2rem",borderRadius:"var(--r-sm)",cursor:"pointer",fontFamily:"'Rubik',sans-serif",fontSize:".85rem",fontWeight:700,alignSelf:"flex-start"}} onClick={()=>speakRo(lesson.mini_ro,0.8)}>🔊 השמע דיאלוג</button></div>}
          </>)}
          {!loading&&lesson?.err&&<div style={{color:"var(--red)",fontSize:".85rem"}}>שגיאה — <button onClick={()=>openUnit(unit)} style={{color:"var(--blue)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>נסה שוב</button></div>}
        </div>}
      </div>))}</div>}
    </div>))}
  </div>);
}

/* ═══════════ PROFILE PAGE ═══════════ */
function ProfilePage({user,onBack,onSwitch,idx}:{user:User;onBack:()=>void;onSwitch:()=>void;idx:number}) {
  const ov=overall(user.skills);const totalSessions=Object.values(user.sessions).reduce((a,b)=>a+b,0);const examReady=ov>=MIN_PCT;
  const exportProgress=()=>{const data={version:"ro_v4",exported:new Date().toISOString(),user};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`romanian-progress-${user.name}-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);};
  return(
    <div className="ro-app" dir="rtl"><style>{S}</style>
      <Header user={user} onLogoClick={onBack} onAvatarClick={()=>{}} idx={idx}/>
      <div className="stickyback"><button className="backbtn" onClick={onBack}>← מסך ראשי</button></div>
      <div className="profile">
        <div className="profile-top"><div className="profile-av" style={{background:AV[idx%AV.length],color:idx%2===0?"var(--navy)":"#fff"}}>{user.name[0].toUpperCase()}</div><div className="profile-info"><h2>{user.name}</h2><p>מתאמן/ת לבחינת אזרחות רומנית B1</p><button className="switch-btn" onClick={onSwitch}>🔄 החלף משתמש</button></div></div>
        <div style={{background:"#fff",border:"2px solid var(--border)",borderRadius:"14px",padding:"1.2rem",marginBottom:"1.4rem"}}><div style={{fontWeight:700,fontSize:".88rem",color:"var(--navy)",marginBottom:".35rem"}}>💾 גיבוי</div><button onClick={exportProgress} style={{background:"var(--blue)",color:"#fff",border:"none",padding:".62rem 1.1rem",borderRadius:"var(--r-sm)",cursor:"pointer",fontFamily:"'Rubik',sans-serif",fontSize:".84rem",fontWeight:700}}>📥 ייצא התקדמות</button></div>
        <div className="stats-grid"><div className="stat-box"><div className="stat-num">{ov}%</div><div className="stat-lbl">התקדמות כוללת</div></div><div className="stat-box"><div className="stat-num">{totalSessions}</div><div className="stat-lbl">תרגולים</div></div><div className="stat-box"><div className="stat-num" style={{fontSize:"1.4rem",color:examReady?"var(--green)":"var(--amber)"}}>{examReady?"✓":"−"}</div><div className="stat-lbl">{examReady?"מוכן":"חסר למינימום"}</div></div></div>
        <div className="radar-wrap"><div className="radar-title">מפת התקדמות</div><RadarChart skills={user.skills}/></div>
        <div className="skill-bars">{SKILLS.map(sk=>{const pct=user.skills[sk.id];const c=pct>=OPT_PCT?"var(--green)":pct>=MIN_PCT?"var(--amber)":"var(--navy)";return(<div key={sk.id} className="sbar-row"><div className="sbar-top"><div className="sbar-name">{sk.icon} {sk.name}</div><div className="sbar-pct" style={{color:c}}>{pct}%</div></div><div className="sbar-track"><div className="sbar-fill" style={{width:`${pct}%`,background:c}}/><div className="sbar-min" style={{left:`${MIN_PCT}%`}}/><div className="sbar-opt" style={{left:`${OPT_PCT}%`}}/></div></div>);})}</div>
      </div>
    </div>
  );
}

/* ═══════════ MAIN APP ═══════════ */
export default function TranslatePage() {
  const [users,setUsers]=useState<User[]>([]);const [activeUser,setActiveUser]=useState<User|null>(null);const [activeIdx,setActiveIdx]=useState(0);const [view,setView]=useState("welcome");const [skill,setSkill]=useState<typeof SKILLS[0]|null>(null);const [showAdd,setShowAdd]=useState(false);const [newName,setNewName]=useState("");

  useEffect(()=>{setUsers(loadUsers());},[]);
  const save=(u:User[])=>saveUsers(u);
  const addUser=()=>{if(!newName.trim())return;const upd=[...users,initUser(newName.trim())];setUsers(upd);save(upd);setNewName("");setShowAdd(false);};
  const selectUser=(u:User,i:number)=>{setActiveUser(u);setActiveIdx(i);setView("dashboard");};

  const onProg=useCallback((pts:number)=>{if(!skill||!activeUser)return;setUsers(prev=>{const upd=prev.map(u=>{if(u.name!==activeUser.name)return u;const updated={...u,skills:{...u.skills,[skill.id]:Math.min(100,u.skills[skill.id]+pts)},sessions:{...u.sessions,[skill.id]:u.sessions[skill.id]+1}};setActiveUser(updated);return updated;});save(upd);return upd;});},[activeUser,skill]);// eslint-disable-line react-hooks/exhaustive-deps
  const onCurrProg=useCallback((pts:number)=>{if(!activeUser)return;setUsers(prev=>{const upd=prev.map(u=>{if(u.name!==activeUser.name)return u;const updated={...u,skills:{...u.skills,vocab:Math.min(100,u.skills.vocab+pts)},sessions:{...u.sessions,vocab:u.sessions.vocab+1}};setActiveUser(updated);return updated;});save(upd);return upd;});},[activeUser]);// eslint-disable-line react-hooks/exhaustive-deps

  const goToDash=()=>setView("dashboard");const goToProfile=()=>setView("profile");const goToWelcome=()=>setView("welcome");

  if(view==="welcome")return(
    <div className="ro-app" dir="rtl"><style>{S}</style>
      <div className="welcome">
        <div className="wflag"><div style={{background:"#002B7F"}}/><div style={{background:"#FCD116"}}/><div style={{background:"#CE1126"}}/></div>
        <h1>ברוכים הבאים ל-<em>Română B1</em></h1>
        <p className="wp">הכנה לבחינת אזרחות רומנית — מסלול לינארי, אוצר מילים, כתיבה, הקשבה ודיבור.</p>
        <div className="wcards">
          {users.map((u,i)=>(<div key={u.name} className="ucard" onClick={()=>selectUser(u,i)}><div className="ucav" style={{background:AV[i%AV.length],color:i%2===0?"var(--navy)":"#fff"}}>{u.name[0].toUpperCase()}</div><h3>{u.name}</h3><p>{overall(u.skills)}% הושלם</p></div>))}
          <div className="addcard" onClick={()=>setShowAdd(true)}><span style={{fontSize:"1.9rem"}}>＋</span><span>משתמש חדש</span></div>
        </div>
      </div>
      {showAdd&&<div className="ov" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>משתמש חדש</h2><p className="mp">הוסף שם לשמירת התקדמות</p><div className="fld"><label>שם</label><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="דנה, יואב..." autoFocus onKeyDown={e=>e.key==="Enter"&&addUser()}/></div><div className="mact"><button className="obtn" onClick={()=>setShowAdd(false)}>ביטול</button><button className="pbtn" onClick={addUser} disabled={!newName.trim()}>הוסף</button></div></div></div>}
    </div>
  );

  if(view==="profile"&&activeUser)return<ProfilePage user={activeUser} onBack={goToDash} onSwitch={goToWelcome} idx={activeIdx}/>;

  if(view==="dashboard"&&activeUser){const ov=overall(activeUser.skills);return(
    <div className="ro-app" dir="rtl"><style>{S}</style>
      <Header user={activeUser} onLogoClick={goToDash} onAvatarClick={goToProfile} idx={activeIdx}/>
      <div className="dash">
        <div className="dgreet">שלום, {activeUser.name} 👋</div><div className="dsub">בחר מה ללמוד היום:</div>
        <div className="prowrap"><div className="prorow"><span>התקדמות כוללת</span><span>{ov}%</span></div><div className="protrack"><div className="profill" style={{width:`${ov}%`}}/></div></div>
        <div className="section-label"><h3>מסלול לינארי</h3></div>
        <div className="path-card" onClick={()=>setView("curriculum")}><div className="path-icon">📚</div><div className="path-info"><h4>לימוד מהבסיס — שלב אחר שלב</h4><p>מילים → משפטים → סיטואציות</p></div><span style={{color:"var(--muted)",fontSize:"1.2rem",marginRight:"auto"}}>›</span></div>
        <div className="section-label"><h3>תרגול לפי מיומנות</h3></div>
        <div className="sgrid">{SKILLS.map(sk=>(<div key={sk.id} className="scard" onClick={()=>{setSkill(sk);setView("module");}}><div className="sicon">{sk.icon}</div><div className="sname">{sk.name} — {sk.ro}</div><div className="sdesc">{sk.desc}</div><div className="mbar"><div className="mfill" style={{width:`${activeUser.skills[sk.id]}%`}}/></div><div className="spct">{activeUser.skills[sk.id]}% · {activeUser.sessions[sk.id]} תרגולים</div></div>))}</div>
        <div className="section-label"><h3>חוקי השפה</h3></div>
        <div className="gram-card" onClick={()=>setView("grammar")}><div className="gram-icon">📖</div><div className="gram-info"><h4>חוקי הדקדוק — בעברית</h4><p>הסברים לדוברי עברית</p></div><span style={{color:"rgba(255,255,255,.4)",fontSize:"1.2rem",marginRight:"auto"}}>›</span></div>
        <div className="tip" style={{marginTop:"1.6rem"}}><h4>💡 טיפ</h4><p>התחל במסלול הלינארי, ולאחר אוצר מילים ראשוני עבור לתרגולי הקשבה ודיבור.</p></div>
      </div>
    </div>
  );}

  if(view==="curriculum"&&activeUser)return(
    <div className="ro-app" dir="rtl"><style>{S}</style>
      <Header user={activeUser} onLogoClick={goToDash} onAvatarClick={goToProfile} idx={activeIdx}/>
      <div className="stickyback"><button className="backbtn" onClick={goToDash}>← מסך ראשי</button></div>
      <CurriculumModule onProg={onCurrProg}/>
    </div>
  );

  if(view==="grammar"&&activeUser)return(
    <div className="ro-app" dir="rtl"><style>{S}</style>
      <Header user={activeUser} onLogoClick={goToDash} onAvatarClick={goToProfile} idx={activeIdx}/>
      <div className="stickyback"><button className="backbtn" onClick={goToDash}>← מסך ראשי</button></div>
      <div className="mod"><div className="mhead"><div className="mico" style={{background:"var(--navy)"}}>📖</div><div><div className="mtitle">חוקי הדקדוק</div><div className="msub">הסברים בעברית</div></div></div><GrammarModule/></div>
    </div>
  );

  if(view==="module"&&skill&&activeUser)return(
    <div className="ro-app" dir="rtl"><style>{S}</style>
      <Header user={activeUser} onLogoClick={goToDash} onAvatarClick={goToProfile} idx={activeIdx}/>
      <div className="stickyback"><button className="backbtn" onClick={goToDash}>← מסך ראשי</button></div>
      <div className="mod"><div className="mhead"><div className="mico" style={{background:skill.color}}>{skill.icon}</div><div><div className="mtitle">{skill.name} — {skill.ro}</div><div className="msub">{skill.desc}</div></div></div>
        {skill.id==="vocab"&&<VocabModule onProg={onProg}/>}
        {skill.id==="writing"&&<WriteModule user={activeUser} onProg={onProg}/>}
        {skill.id==="listening"&&<ListenModule onProg={onProg}/>}
        {skill.id==="speaking"&&<SpeakModule user={activeUser} onProg={onProg}/>}
      </div>
    </div>
  );

  return<div className="ro-app" dir="rtl"><style>{S}</style></div>;
}
