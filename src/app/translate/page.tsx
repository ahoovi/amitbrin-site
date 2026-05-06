'use client';

/**
 * Romanian B1 Learning App — "Salutări bunicii!"
 *
 * Architecture v3 — merged navigation + real modules
 * - Login → 2 known users (Amit / Neta)
 * - App Shell: 4 tabs — בית | מילון | התקדמות | הגדרות
 * - Home tab: Lesson path map (6 nodes, session dots, lesson colors)
 * - Dictionary tab: Curriculum path + Grammar rules
 * - Progress tab: Layered radar chart (skills × lessons)
 * - Lesson screen: real Claude API + 11Labs modules
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DESIGN_TOKENS as T } from './design-system';
import {
  House, BookOpen, ChartPolar, GearSix, Star, LockKey,
  Check, ArrowCounterClockwise, SpeakerHigh, Play, Stop,
  HandWaving, Palette, UsersThree, Heart, Question,
  Buildings, ShoppingCart, Stethoscope, Bus, Briefcase,
  IdentificationCard, ForkKnife, ChatCircle, Cards,
} from '@phosphor-icons/react';

// ============= CSS (module styles — Rubik font + all className-based styles) =============

const S = `
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap');
:root{
  --navy:#1a2744;
  --gold:#c9973a;--gold-l:#e8b95a;
  --blue:#1F5FBF;--blue-l:#EFF8FF;--blue-d:#0e54c4;
  --bg:#F7F2EA;--surface:#fff;
  --text:#131313;--muted:#6B7280;--border:#E5E9F0;
  --green:#16a34a;--green-l:#f0fdf4;--red:#dc2626;--red-l:#fef2f2;--amber:#d97706;--amber-l:#fffbeb;--teal:#0f766e;--purple:#7c3aed;
  --sh:0 1px 8px rgba(0,0,0,.06),0 4px 16px rgba(21,112,239,.05);
  --sh-md:0 4px 20px rgba(21,112,239,.12);
  --r:16px;--r-sm:12px;--r-xs:8px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Rubik',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}

.ldcard{background:var(--surface);border-radius:var(--r);box-shadow:var(--sh);padding:2.5rem;text-align:center}
.spin{width:38px;height:38px;border:4px solid var(--border);border-top-color:var(--blue);border-radius:50%;animation:spin .7s linear infinite;margin:0 auto .9rem}
@keyframes spin{to{transform:rotate(360deg)}}
.ldcard p{color:var(--muted);font-size:.88rem}
.pbtn{flex:1;background:var(--blue);color:#fff;border:none;padding:.82rem;border-radius:12px;font-family:'Rubik',sans-serif;font-size:.91rem;font-weight:600;cursor:pointer;transition:background .2s}
.pbtn:hover{background:var(--blue-d)}
.pbtn:disabled{background:#aaa;cursor:not-allowed}
.obtn{background:transparent;color:var(--muted);border:1.5px solid var(--border);padding:.82rem;border-radius:12px;font-family:'Rubik',sans-serif;font-size:.91rem;cursor:pointer;transition:border-color .2s}
.obtn:hover{border-color:var(--navy);color:var(--navy)}

/* ── Vocab module ── */
.vcardwrap{margin-bottom:1.1rem}
.vcard{background:var(--surface);border-radius:20px;box-shadow:0 4px 20px rgba(21,113,239,.12);overflow:hidden;position:relative}
.vcard-status{position:absolute;top:1rem;right:1rem;padding:.28rem .8rem;border-radius:99px;font-size:.76rem;font-weight:700;transition:all .3s;z-index:2}
.vs-known{background:#dcfce7;color:var(--green)}
.vs-practice{background:#fff3e0;color:var(--amber)}
.vseg{display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:14px;width:100%}
.vtrans{display:flex;flex-direction:row;justify-content:space-between;align-items:center;padding:0 16px;width:100%;gap:8px}
.vcol-ro{display:flex;flex-direction:column;align-items:flex-start;flex:1;min-width:0}
.vcol-lbl-ro{font-size:10px;font-weight:300;line-height:12px;color:var(--muted);margin-bottom:2px;width:100%}
.wro{font-family:'Rubik',sans-serif;font-size:clamp(18px,5.5vw,28px);font-weight:700;line-height:1.2;color:var(--navy);direction:ltr;overflow-wrap:break-word;word-break:break-word;width:100%}
.wemoji-wrap{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:52px;height:52px}
.vcol-he{display:flex;flex-direction:column;align-items:flex-end;flex:1;min-width:0}
.vcol-lbl-he{font-size:10px;font-weight:300;line-height:12px;color:var(--muted);text-align:right;margin-bottom:2px;width:100%}
.whe{font-size:clamp(16px,5vw,24px);font-weight:700;line-height:1.2;color:var(--blue);direction:rtl;text-align:right;width:100%;overflow-wrap:break-word}
.wtype-row{display:flex;flex-direction:row;justify-content:flex-end;align-items:center;gap:6px;width:calc(100% - 32px);flex-wrap:wrap}
.wtag{display:flex;align-items:center;padding:5px 8px;border-radius:99px;font-size:11px;font-weight:600;line-height:13px;color:var(--muted);border:1px solid var(--border);background:transparent;white-space:nowrap;direction:ltr}
.wtag.he{direction:rtl;color:var(--blue);border-color:rgba(21,113,239,.3)}
.vaudio-row{display:flex;gap:8px;padding:0 16px;width:100%}
.vaudio-pill{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border:none;border-radius:10px;cursor:pointer;font-family:'Rubik',sans-serif;font-size:13px;font-weight:600;transition:all .2s}
.vaudio-pill.f{background:var(--blue-l);color:var(--blue)}
.vaudio-pill.f:hover{background:var(--blue);color:#fff}
.vaudio-pill.m{background:var(--navy);color:#fff;opacity:.85}
.vaudio-pill.m:hover{opacity:1}
/* keep old .vaudio-btn for backwards compat */
.vaudio-btn{display:none}
.ftable-hdr{display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;padding:12px 25px 11px 26px;background:var(--blue-l);font-size:11px;font-weight:700;line-height:13px;color:var(--blue);width:100%}
.frow{display:flex;flex-direction:row;justify-content:space-between;align-items:center;padding:0 24px;height:36px;width:100%}
.frow:nth-child(even){background:var(--blue-l);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.frow:nth-child(odd){background:#fff}
.fval{display:flex;flex-direction:row;align-items:center;gap:4px}
.snd-sm{display:flex;justify-content:center;align-items:center;padding:7px;width:22px;height:22px;border-radius:99px;border:none;cursor:pointer;background:transparent;font-size:8px;color:var(--blue);flex-shrink:0}
.fval-txt{font-size:13px;font-weight:600;line-height:16px;color:var(--navy);direction:ltr;white-space:nowrap}
.flbl{font-size:12px;font-weight:400;line-height:15px;color:var(--muted);direction:rtl;white-space:nowrap}
.exbox{display:flex;flex-direction:row;align-items:center;padding:2px;gap:8px;background:var(--blue-l);border-radius:10px;margin:0 16px 20px;width:calc(100% - 32px)}
.exbox-icon{display:flex;justify-content:center;align-items:center;padding:7px;width:36px;min-width:36px;background:transparent;border-radius:8px;color:var(--blue);cursor:pointer;align-self:center}
.exbox-text{display:flex;flex-direction:column;align-items:flex-start;gap:9px;flex:1}
.exro{font-size:14px;font-weight:400;line-height:17px;color:var(--navy);direction:ltr;width:100%}
.exhe{font-size:13px;font-weight:400;line-height:16px;color:var(--muted);direction:rtl;width:100%}
.vnav{display:flex;flex-direction:row;align-items:center;gap:20px;margin-top:16px}
.vbtn{flex:1;height:72px;border-radius:12px;cursor:pointer;font-family:'Rubik',sans-serif;font-size:14px;font-weight:700;line-height:17px;border:2px solid;transition:all .2s;display:flex;align-items:center;justify-content:center}
.vbtn.know{background:var(--blue);color:#fff;border-color:var(--blue);box-shadow:0 4px 16px rgba(21,113,239,.3)}
.vbtn.know:hover{background:var(--blue-d)}
.vbtn.prac{background:#fff;color:var(--amber);border-color:var(--amber)}
.vbtn.prac:hover{background:#fffbf0}
.vprow{display:flex;align-items:center;gap:.9rem;margin-bottom:.75rem}
.vpbar{flex:1;background:var(--blue-l);border-radius:99px;height:8px;overflow:hidden;display:flex}
.vpfill{background:var(--blue);height:100%;border-radius:99px;transition:width .6s cubic-bezier(.4,0,.2,1)}
.vpfill-review{background:var(--red);height:100%;transition:width .6s cubic-bezier(.4,0,.2,1)}
.vstats{font-size:12px;color:var(--muted);white-space:nowrap}
.tutor-banner{display:flex;align-items:center;gap:10px;margin-bottom:10px;min-height:60px}
.tutor-bubble{border-radius:12px 12px 12px 4px;padding:9px 13px;font-size:13px;font-weight:600;direction:rtl;flex:1;line-height:1.45;transition:all .3s}
.tutor-bubble.ok{background:#dcfce7;color:#16a34a}
.tutor-bubble.coach{background:#fff3e0;color:#d97706}
.tutor-bubble.info{background:var(--blue-l);color:var(--blue)}
.tutor-bubble.proud{background:linear-gradient(135deg,#fef3c7,#dcfce7);color:#15803d;font-size:14px}

/* ── Listening module ── */
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

/* ── Speaking module ── */
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

/* ── Writing module (chat) ── */
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

/* ── Grammar module ── */
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

/* ── Curriculum module ── */
.curr{direction:rtl}
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

@media(max-width:600px){
  .wcards{flex-direction:column;align-items:center}
}
`;

// ============= VOICES + AUDIO =============

const VOICE_MALE    = "onwK4e9ZLuTAKqWW03F9";  // default male
const VOICE_FEMALE  = "XB0fDUnXU5powFXDhCwa";  // Charlotte — female multilingual
const VOICE_MALE2   = "TX3LPaxmHKxFdv7VOQHJ";  // Liam — second male
const VOICE_FEMALE2 = "br0MPoLVxuslVxf61qHn";  // Lizy — second female

// Returns one of 4 voices. Female detected by name pattern, second voice by speaker index parity.
const _speakerVoiceMap: Record<string, string> = {};
let _speakerCount = 0;

function pickVoice(speaker?: string): string {
  if (!speaker) return VOICE_MALE;
  const s = speaker.toLowerCase().trim();
  if (_speakerVoiceMap[s]) return _speakerVoiceMap[s];

  const femalePatterns = [
    /ă$/, /a$/, /ea$/, /ina$/, /ela$/, /ana$/, /oar[eă]/, /toare$/,
    /vânzătoare/, /profesoar/, /asistent/, /recepționist/,
    /maria/, /elena/, /ioana/, /mihaela/, /andreea/, /cristina/,
    /dana/, /laura/, /alina/, /carmen/, /roxana/, /diana/, /gabriela/,
    /soția/, /mama/, /bunica/, /fata/, /fiica/, /sora/, /prietena/,
    /clienta/, /colega/, /vecina/, /doamna/,
  ];
  const isFemale = femalePatterns.some(p => p.test(s));
  const idx = _speakerCount++;
  // Alternate between two voices of the correct gender
  const voice = isFemale
    ? (idx % 2 === 0 ? VOICE_FEMALE : VOICE_FEMALE2)
    : (idx % 2 === 0 ? VOICE_MALE  : VOICE_MALE2);
  _speakerVoiceMap[s] = voice;
  return voice;
}

const _audioCache: Record<string, string> = {};
let _currentAudio: HTMLAudioElement | null = null;

async function speakRo(txt: string, rate = 0.88, onEnd?: (() => void) | null, voiceId?: string) {
  if (!txt) return;
  stopSpeech();
  const vid = voiceId || VOICE_MALE;
  const cacheKey = `${vid}::${txt}`;
  try {
    let url = _audioCache[cacheKey];
    if (!url) {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt, voice_id: vid }),
      });
      if (res.ok) {
        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        _audioCache[cacheKey] = url;
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
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "ro-RO"; u.rate = rate;
    const v = window.speechSynthesis.getVoices().find(x => x.lang.startsWith("ro"));
    if (v) u.voice = v;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  }
}

function stopSpeech() {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio.currentTime = 0; _currentAudio = null; }
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

// ============= AI =============

async function callAI(messages: { role: string; content: string }[], sys: string) {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system: sys }),
  });
  const d = await r.json();
  return d.text || "";
}

function parseJ(raw: string) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { return null; }
}

/** Strip Arabic Unicode block chars that sometimes sneak into AI-generated Hebrew text */
function sanitizeHe(text: string): string {
  if (!text) return text ?? '';
  return text.replace(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g, '').replace(/\s+/g, ' ').trim();
}

// ============= TYPES =============

type Tab = 'home' | 'dictionary' | 'progress' | 'settings';
type AppScreen = 'login' | 'app' | 'lesson';
type LessonModule = 'vocabulary' | 'listening' | 'speaking' | 'writing' | 'grammar';

interface SkillScores {
  vocabulary: number;
  listening: number;
  speaking: number;
  writing: number;
  grammar: number;
}

interface LessonProgress {
  sessions: number;
  skills: SkillScores;
}

interface User {
  id: string;
  name: string;
  lessonProgress: { [lessonId: number]: LessonProgress };
  currentLesson: number;
  totalSessions: number;
}

// Minimal type for modules that need user.name
type ModuleUser = { name: string };

// ============= CONSTANTS =============

const LESSONS = [
  { id: 1, topic: 'הצגה עצמית',   topicRo: 'Prezentare personală', color: '#2B5CAB' },
  { id: 2, topic: 'אוכל ומשקאות', topicRo: 'Mâncare și băuturi',  color: '#C96E34' },
  { id: 3, topic: 'העיר',          topicRo: 'Orașul',               color: '#38818D' },
  { id: 4, topic: 'עבודה ושגרה',  topicRo: 'Muncă și rutină',      color: '#713D99' },
  { id: 5, topic: 'בריאות',        topicRo: 'Sănătate',             color: '#3A7530' },
  { id: 6, topic: 'תרבות ומסורת', topicRo: 'Cultură și tradiții',  color: '#B23D70' },
] as const;

const SKILL_LABELS: Record<LessonModule, string> = {
  vocabulary: 'אוצר מילים',
  listening:  'האזנה',
  speaking:   'דיבור',
  writing:    'כתיבה',
  grammar:    'דקדוק',
};

const EMPTY_SKILLS: SkillScores = { vocabulary: 0, listening: 0, speaking: 0, writing: 0, grammar: 0 };

const KNOWN_USERS: User[] = [
  {
    id: 'amit',
    name: 'Amit',
    lessonProgress: {},
    currentLesson: 1,
    totalSessions: 0,
  },
  {
    id: 'neta',
    name: 'Neta',
    lessonProgress: {},
    currentLesson: 1,
    totalSessions: 0,
  },
];

// ============= MAIN APP =============

export default function TranslateApp() {
  const [users, setUsers]               = useState<User[]>(KNOWN_USERS);
  const [currentUser, setCurrentUser]   = useState<User | null>(null);
  const [appScreen, setAppScreen]       = useState<AppScreen>('login');
  const [activeTab, setActiveTab]       = useState<Tab>('home');
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<LessonModule>('vocabulary');

  useEffect(() => {
    const saved = localStorage.getItem('ro_v4_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        setUsers(KNOWN_USERS.map(u => parsed.find(s => s.id === u.id) ?? u));
      } catch {}
    }
  }, []);

  const saveUsers = (updated: User[]) => {
    setUsers(updated);
    localStorage.setItem('ro_v4_users', JSON.stringify(updated));
  };

  const updateUser = (updated: User) => {
    setCurrentUser(updated);
    saveUsers(users.map(u => u.id === updated.id ? updated : u));
  };

  const selectUser = (user: User) => {
    setCurrentUser(user);
    setAppScreen('app');
    setActiveTab('home');
  };

  const openLesson = (lessonId: number) => {
    setActiveLesson(lessonId);
    setActiveModule('vocabulary');
    setAppScreen('lesson');
    stopSpeech();
  };

  const backToApp = () => {
    setAppScreen('app');
    setActiveLesson(null);
    stopSpeech();
  };

  // Called by a module to record progress for a specific skill
  const handleProgress = useCallback((module: LessonModule, pts: number) => {
    if (!currentUser || activeLesson === null) return;
    setCurrentUser(prev => {
      if (!prev) return prev;
      const existing = prev.lessonProgress[activeLesson] ?? { sessions: 0, skills: { ...EMPTY_SKILLS } };
      const newScore = Math.min(100, (existing.skills[module] ?? 0) + pts);
      const updated: User = {
        ...prev,
        totalSessions: prev.totalSessions + 1,
        lessonProgress: {
          ...prev.lessonProgress,
          [activeLesson]: {
            sessions: Math.min(existing.sessions + 1, 3),
            skills: { ...existing.skills, [module]: newScore },
          },
        },
      };
      saveUsers(users.map(u => u.id === updated.id ? updated : u));
      return updated;
    });
  }, [currentUser, activeLesson, users]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{S}</style>
      {appScreen === 'login' && (
        <LoginScreen users={users} onSelectUser={selectUser} onRestoreProgress={(userId, code) => {
          try {
            const progress = JSON.parse(atob(code));
            const updated = users.map(u => u.id === userId ? { ...u, lessonProgress: progress } : u);
            saveUsers(updated);
            return true;
          } catch { return false; }
        }} />
      )}
      {appScreen === 'app' && currentUser && (
        <AppShell
          user={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenLesson={openLesson}
          onUserChange={() => { setAppScreen('login'); stopSpeech(); }}
        />
      )}
      {appScreen === 'lesson' && currentUser && activeLesson !== null && (
        <LessonScreen
          lesson={LESSONS.find(l => l.id === activeLesson)!}
          module={activeModule}
          user={currentUser}
          onModuleChange={setActiveModule}
          onBack={backToApp}
          onProgress={handleProgress}
        />
      )}
    </>
  );
}

// ============= LOGIN SCREEN =============

function LoginScreen({ users, onSelectUser, onRestoreProgress }: {
  users: User[];
  onSelectUser: (u: User) => void;
  onRestoreProgress: (userId: string, code: string) => boolean;
}) {
  const [showRestore, setShowRestore] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [restoreMsg, setRestoreMsg] = useState<{ok: boolean; text: string} | null>(null);

  const handleRestore = () => {
    const clean = restoreCode.trim();
    const m = clean.match(/^RO-([a-z]+)-(.+)$/i);
    if (!m) { setRestoreMsg({ ok: false, text: 'הקוד לא נראה תקין — ודאי שהעתקת את כולו' }); return; }
    const ok = onRestoreProgress(m[1].toLowerCase(), m[2]);
    if (ok) {
      setRestoreMsg({ ok: true, text: '✅ ההתקדמות שוחזרה! עכשיו בחרי את השם שלך מעלה' });
      setRestoreCode('');
    } else {
      setRestoreMsg({ ok: false, text: 'משהו לא הסתדר — נסי שוב' });
    }
  };

  const bgStyle: React.CSSProperties = {
    background: '#172A46',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: '"Rubik", system-ui',
    gap: '24px',
  };

  return (
    <div style={bgStyle}>
      <div style={{ textAlign: 'center' }}>
        {/* Logo */}
        <img src="/avatar/salutari_bunicii-logo@3x.png" alt="Salutări bunicii!" width={200} style={{ display: 'block', margin: '0 auto 20px' }} />
        <p style={{ color: '#a0aec0', fontSize: 15, margin: 0, direction: 'rtl' }}>מי לומד היום?</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              background: 'rgba(255,255,255,.07)',
              border: '1.5px solid rgba(255,255,255,.12)',
              borderRadius: 16,
              padding: '18px 20px',
              fontSize: 18,
              fontWeight: 500,
              fontFamily: '"Rubik", system-ui',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all .25s',
            }}
          >
            <span>{user.name}</span>
            <span style={{ color: '#718096', fontSize: 13 }}>{user.totalSessions} פגישות</span>
          </button>
        ))}
      </div>

      {/* Restore progress */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <button
          onClick={() => { setShowRestore(v => !v); setRestoreMsg(null); }}
          style={{
            width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#718096', fontSize: 13, fontFamily: '"Rubik", system-ui',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '6px 0',
          }}
        >
          <ArrowCounterClockwise size={13} />
          {showRestore ? 'סגור' : 'יש לי קוד גיבוי — שחזר התקדמות'}
        </button>

        {showRestore && (
          <div style={{
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 12,
            padding: 16,
            marginTop: 8,
            direction: 'rtl',
          }}>
            <p style={{ color: '#a0aec0', fontSize: 12, margin: '0 0 10px', lineHeight: 1.6 }}>
              הדביקי כאן את הקוד שקיבלת מהגדרות ← ומאשרת:
            </p>
            <textarea
              value={restoreCode}
              onChange={e => { setRestoreCode(e.target.value); setRestoreMsg(null); }}
              placeholder="RO-neta-eyJ..."
              rows={3}
              style={{
                width: '100%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 11,
                fontFamily: 'monospace', resize: 'none', direction: 'ltr',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleRestore}
              disabled={!restoreCode.trim()}
              style={{
                marginTop: 8, width: '100%', background: restoreCode.trim() ? '#1F5FBF' : 'rgba(255,255,255,.1)',
                color: '#fff', border: 'none', borderRadius: 8, padding: '9px 0',
                fontFamily: '"Rubik", system-ui', fontSize: 14, fontWeight: 600, cursor: restoreCode.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              שחזר
            </button>
            {restoreMsg && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: restoreMsg.ok ? '#68d391' : '#fc8181', lineHeight: 1.5 }}>
                {restoreMsg.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============= APP SHELL + TAB BAR =============

const TABS: { id: Tab; label: string }[] = [
  { id: 'home',       label: 'בית'      },
  { id: 'dictionary', label: 'מילון'    },
  { id: 'progress',   label: 'התקדמות' },
  { id: 'settings',   label: 'הגדרות'  },
];

function AppShell({
  user, activeTab, onTabChange, onOpenLesson, onUserChange,
}: {
  user: User;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onOpenLesson: (id: number) => void;
  onUserChange: () => void;
}) {
  return (
    <div style={{
      background: '#F7F2EA',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Rubik", system-ui',
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 68 }}>
        {activeTab === 'home'       && <LessonMapScreen user={user} onOpenLesson={onOpenLesson} />}
        {activeTab === 'dictionary' && <DictionaryScreen />}
        {activeTab === 'progress'   && <ProgressScreen user={user} />}
        {activeTab === 'settings'   && <SettingsScreen user={user} onUserChange={onUserChange} />}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        background: '#fff',
        borderTop: '1px solid #E5E9F020',
        display: 'flex',
        zIndex: 100,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: '8px 0 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: active ? '#1F5FBF' : '#6B7280',
                fontFamily: '"Rubik", system-ui',
                transition: 'color 0.15s',
              }}
            >
              <TabIcon tabId={tab.id} active={active} />
              <span style={{
                fontSize: 11,
                fontWeight: active ? 700 : 400,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabIcon({ tabId, active }: { tabId: Tab; active: boolean }) {
  const color = active ? '#1F5FBF' : '#6B7280';
  const weight = active ? 'fill' : 'regular';
  const size = 24;
  if (tabId === 'home')       return <House       size={size} color={color} weight={weight} />;
  if (tabId === 'dictionary') return <BookOpen    size={size} color={color} weight={weight} />;
  if (tabId === 'progress')   return <ChartPolar  size={size} color={color} weight={weight} />;
  if (tabId === 'settings')   return <GearSix     size={size} color={color} weight={weight} />;
  return null;
}

// ============= TUTOR AVATAR =============

type AvatarMood = 'greeting' | 'approve' | 'cheer' | 'coaching' | 'listening' |
                  'asking' | 'thinking' | 'neutral' | 'showing' | 'proud' | 'learning';

const AVATAR_SRC: Record<AvatarMood, string> = {
  greeting: '/avatar/tutor/avatar-tutor-greeting.png',
  approve:  '/avatar/tutor/avatar-tutor-approve.png',
  cheer:    '/avatar/tutor/avatar-tutor-cheering1.png',
  coaching: '/avatar/tutor/avatar-tutor-coaching.png',
  listening:'/avatar/tutor/avatar-tutor-listening.png',
  asking:   '/avatar/tutor/avatar-tutor-asking.png',
  thinking: '/avatar/tutor/avatar-tutor-thinking.png',
  neutral:  '/avatar/tutor/avatar-tutor-neutral.png',
  showing:  '/avatar/tutor/avatar-tutor-showing.png',
  proud:    '/avatar/tutor/avatar-tutor-proud.png',
  learning: '/avatar/tutor/avatar-tutor-learning.png',
};

function TutorAvatar({ mood, size = 100, style }: {
  mood: AvatarMood;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={AVATAR_SRC[mood]}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block', ...style }}
    />
  );
}

// ============= UNIT ICON HELPER =============

function UnitIcon({ emoji, size = 20, color = 'var(--blue)' }: { emoji: string; size?: number; color?: string }) {
  const map: Record<string, React.ReactElement> = {
    '👋': <HandWaving size={size} color={color} />,
    '🎨': <Palette    size={size} color={color} />,
    '👨‍👩‍👧': <UsersThree size={size} color={color} />,
    '🫀': <Heart      size={size} color={color} />,
    '❓': <Question   size={size} color={color} />,
    '🏙️': <Buildings  size={size} color={color} />,
    '🛒': <ShoppingCart size={size} color={color} />,
    '🏥': <Stethoscope  size={size} color={color} />,
    '🚌': <Bus          size={size} color={color} />,
    '💼': <Briefcase    size={size} color={color} />,
    '🗂️': <Cards        size={size} color={color} />,
    '📝': <ForkKnife    size={size} color={color} />,
    '💬': <ChatCircle   size={size} color={color} />,
  };
  return map[emoji] ?? <span style={{ fontSize: size * 0.75 }}>{emoji}</span>;
}

// ============= TWO-VOICE AUDIO BUTTON =============

function DualSpeaker({ textRo, speakFn, color = 'var(--blue)' }: {
  textRo: string;
  speakFn: (text: string, rate?: number, onEnd?: null, voice?: string) => void;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.55, padding: 2, display: 'flex', alignItems: 'center' }}
        title="קול נשי"
        onClick={() => speakFn(textRo, 0.88, null, VOICE_FEMALE)}
      >
        <SpeakerHigh size={16} color={color} weight="regular" />
      </button>
      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.55, padding: 2, display: 'flex', alignItems: 'center' }}
        title="קול גברי"
        onClick={() => speakFn(textRo, 0.88, null, VOICE_MALE)}
      >
        <SpeakerHigh size={16} color={color} weight="fill" />
      </button>
    </div>
  );
}

// ============= LESSON MAP SCREEN (HOME TAB) =============

function LessonMapScreen({ user, onOpenLesson }: { user: User; onOpenLesson: (id: number) => void }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Bună,</p>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#1A1A1A' }}>{user.name}</h2>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1F5FBF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
          {user.name[0]}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LESSONS.map(lesson => {
          const progress   = user.lessonProgress[lesson.id];
          const sessions   = progress?.sessions ?? 0;
          const isUnlocked = lesson.id === 1 || (user.lessonProgress[lesson.id - 1]?.sessions ?? 0) >= 1;

          return (
            <button
              key={lesson.id}
              onClick={() => isUnlocked && onOpenLesson(lesson.id)}
              disabled={!isUnlocked}
              style={{
                position: 'relative',
                height: 62,
                borderRadius: 14,
                border: `2px solid ${lesson.color}`,
                background: '#faf8f4',
                overflow: 'hidden',
                cursor: isUnlocked ? 'pointer' : 'default',
                opacity: isUnlocked ? 1 : 0.4,
                fontFamily: '"Rubik", system-ui',
                width: '100%',
                padding: 0,
              }}
            >
              {/* כוכבי התקדמות — שמאל */}
              <div style={{
                position: 'absolute', left: 16, top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex', gap: 2, alignItems: 'center',
              }}>
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    size={28}
                    color={lesson.color}
                    weight={i <= sessions ? 'duotone' : 'regular'}
                  />
                ))}
              </div>

              {/* שם נושא — מרכז ימין */}
              <div style={{
                position: 'absolute',
                right: 74, left: 110,
                top: '50%', transform: 'translateY(-50%)',
                textAlign: 'right',
                direction: 'rtl' as const,
                fontSize: 16, fontWeight: 700,
                color: isUnlocked ? '#1A1A1A' : '#9CA3AF',
                whiteSpace: 'nowrap',
              }}>
                {lesson.topic}
              </div>

              {/* Badge — קצה ימין */}
              <div style={{
                position: 'absolute', right: -2, top: -2,
                width: 62, height: 62,
                background: lesson.color,
                borderRadius: '0 14px 14px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isUnlocked
                  ? <span style={{ color: '#fff', fontSize: 20, fontWeight: 600, fontFamily: '"Rubik", system-ui' }}>{lesson.id}</span>
                  : <LockKey size={28} color="#fff" weight="regular" />
                }
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============= RADAR CHART =============

type RadarLayer = { lesson: typeof LESSONS[number]; skills: SkillScores };

function RadarChart({ layers }: { layers: RadarLayer[] }) {
  const cx = 155, cy = 165, R = 110;
  const skillKeys: LessonModule[] = ['speaking', 'listening', 'writing', 'vocabulary', 'grammar'];
  const skillLabels = ['דיבור', 'האזנה', 'כתיבה', 'אוצר', 'דקדוק'];
  const n = skillKeys.length;
  const angles = skillKeys.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);
  const toXY = (angle: number, r: number) => ({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });

  const gridRings = [0.25, 0.5, 0.75, 1].map(s => {
    const pts = angles.map(a => { const p = toXY(a, R * s); return `${p.x},${p.y}`; }).join(' ');
    return <polygon key={s} points={pts} fill="none" stroke="#E5E7EB" strokeWidth="1" />;
  });
  const axisLines = angles.map((a, i) => {
    const end = toXY(a, R);
    return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E5E7EB" strokeWidth="1" />;
  });
  const axisLabels = angles.map((a, i) => {
    const pos = toXY(a, R + 20);
    return <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#6B7280">{skillLabels[i]}</text>;
  });
  const polygons = layers.map(({ lesson, skills }) => {
    const pts = angles.map((a, i) => {
      const val = (skills[skillKeys[i]] ?? 0) / 100;
      const { x, y } = toXY(a, R * val);
      return `${x},${y}`;
    }).join(' ');
    return <polygon key={lesson.id} points={pts} fill={lesson.color} fillOpacity={0.15} stroke={lesson.color} strokeWidth="2" strokeOpacity={0.8} />;
  });

  return (
    <svg width="310" height="330" viewBox="0 0 310 330" style={{ display: 'block', margin: '0 auto' }}>
      {gridRings}{axisLines}{polygons}{axisLabels}
    </svg>
  );
}

// ============= PROGRESS SCREEN =============

function ProgressScreen({ user }: { user: User }) {
  const layers: RadarLayer[] = LESSONS
    .map(lesson => {
      const p = user.lessonProgress[lesson.id];
      if (!p || p.sessions === 0) return null;
      return { lesson, skills: p.skills };
    })
    .filter((l): l is RadarLayer => l !== null);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, color: '#1A1A1A', margin: '0 0 24px', textAlign: 'right' }}>
        התקדמות
      </h2>

      {layers.length === 0 ? (
        <p style={{ color: '#6B7280', textAlign: 'center', marginTop: 32 }}>
          השלם שיעור ראשון כדי לראות את הרדאר
        </p>
      ) : (
        <>
          <RadarChart layers={layers} />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
            {layers.map(({ lesson, skills }) => {
              const avg = Math.round(Object.values(skills).reduce((a, b) => a + b, 0) / 5);
              return (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: 12, direction: 'rtl' }}>
                  <div style={{ width: 28, height: 3, background: lesson.color, borderRadius: 2, opacity: 0.75 }} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{lesson.topic}</span>
                  <span style={{ fontSize: 13, color: lesson.color, fontWeight: 500 }}>{avg}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ============= DICTIONARY SCREEN =============

function DictionaryScreen() {
  const [view, setView] = useState<'curriculum' | 'grammar'>('curriculum');
  return (
    <div style={{ padding: 16, direction: 'rtl' as const }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, color: '#1A1A1A', margin: '0 0 16px' }}>
        מילון וחוקים
      </h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['curriculum', 'grammar'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: view === v ? '#1F5FBF' : '#E8F0FE',
            color: view === v ? '#fff' : '#1F5FBF',
            fontFamily: '"Rubik", system-ui', fontSize: 13, fontWeight: view === v ? 700 : 400,
          }}>
            {v === 'curriculum'
              ? <><BookOpen size={14} style={{ marginLeft: 5 }} /> מסלול לימוד</>
              : <><Cards    size={14} style={{ marginLeft: 5 }} /> דקדוק</>
            }
          </button>
        ))}
      </div>
      {view === 'curriculum' && <CurriculumModule onProg={() => {}} />}
      {view === 'grammar'    && <GrammarModule />}
    </div>
  );
}

// ============= SETTINGS SCREEN =============

function SettingsScreen({ user, onUserChange }: { user: User; onUserChange: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const backupCode = `RO-${user.id}-${btoa(JSON.stringify(user.lessonProgress))}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(backupCode);
    } catch {
      // fallback: select text
      const el = document.getElementById('backup-code-text');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const card: React.CSSProperties = {
    background: '#fff',
    border: '1.5px solid #E5E9F0',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,.05)',
    marginBottom: 12,
  };

  return (
    <div style={{ padding: 16, direction: 'rtl' as const }}>
      <h2 style={{ fontSize: 20, fontWeight: 500, color: '#1A1A1A', margin: '0 0 20px' }}>הגדרות</h2>

      {/* User card */}
      <div style={card}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6B7280' }}>משתמש נוכחי</p>
        <p style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 500, color: '#1A1A1A' }}>{user.name}</p>
        <button
          onClick={onUserChange}
          style={{
            width: '100%', padding: '10px 16px',
            background: 'transparent', border: '1.5px solid #E5E9F0',
            borderRadius: 8, cursor: 'pointer',
            fontFamily: '"Rubik", system-ui', fontSize: 14, color: '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <ArrowCounterClockwise size={14} /> החלף משתמש
        </button>
      </div>

      {/* Backup card */}
      <div style={card}>
        <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>💾 קוד גיבוי</p>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
          שמרי את הקוד הזה ← ותוכלי לשחזר את ההתקדמות שלך בכל מכשיר.
        </p>

        {/* Steps */}
        <div style={{ background: '#F7F2EA', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
          {[
            'לחצי "העתק קוד" 👇',
            'פתחי פתקים (Notes) ← הדביקי שם',
            'הפתק יסתנך לכל המכשירים שלך',
            'בכניסה הבאה: "יש לי קוד גיבוי" ← הדביקי',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 3 ? 6 : 0, alignItems: 'flex-start' }}>
              <span style={{ background: '#1F5FBF', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Code preview toggle */}
        <button
          onClick={() => setShowCode(v => !v)}
          style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer', padding: '0 0 8px', fontFamily: '"Rubik", system-ui' }}
        >
          {showCode ? '▲ הסתר קוד' : '▼ הצג קוד'}
        </button>
        {showCode && (
          <div
            id="backup-code-text"
            style={{
              background: '#F3F4F6', borderRadius: 8, padding: '8px 10px',
              fontSize: 10, fontFamily: 'monospace', wordBreak: 'break-all',
              color: '#374151', direction: 'ltr', marginBottom: 10,
              maxHeight: 60, overflow: 'auto', lineHeight: 1.4,
            }}
          >
            {backupCode}
          </div>
        )}

        <button
          onClick={copyCode}
          style={{
            width: '100%', background: copied ? '#16a34a' : '#1F5FBF',
            color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0',
            fontFamily: '"Rubik", system-ui', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'background .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {copied ? <><Check size={15} /> הועתק!</> : <><SpeakerHigh size={0} style={{display:'none'}} />📋 העתק קוד</>}
        </button>
      </div>
    </div>
  );
}

// ============= LESSON SCREEN =============

function LessonScreen({
  lesson, module, user, onModuleChange, onBack, onProgress,
}: {
  lesson: typeof LESSONS[number];
  module: LessonModule;
  user: User;
  onModuleChange: (m: LessonModule) => void;
  onBack: () => void;
  onProgress: (module: LessonModule, pts: number) => void;
}) {
  const modules: LessonModule[] = ['vocabulary', 'listening', 'speaking', 'writing', 'grammar'];
  const moduleUser: ModuleUser = { name: user.name };
  const onProg = (pts: number) => onProgress(module, pts);

  return (
    <div style={{
      background: '#172A46',
      minHeight: '100vh',
      fontFamily: '"Rubik", system-ui',
      maxWidth: 430,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: `1px solid ${lesson.color}30`,
        direction: 'rtl' as const,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}
        >→</button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, color: lesson.color }}>שיעור {lesson.id}</p>
          <p style={{ margin: 0, fontSize: 15, color: '#fff', fontWeight: 500 }}>{lesson.topic}</p>
        </div>
        <span style={{ fontSize: 14, color: '#a0aec0', fontStyle: 'italic', direction: 'ltr' as const }}>
          {lesson.topicRo}
        </span>
      </div>

      {/* Module tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.1)', overflowX: 'auto' as const, direction: 'rtl' as const }}>
        {modules.map(m => {
          const active = module === m;
          return (
            <button key={m} onClick={() => onModuleChange(m)} style={{
              flex: 1, padding: '8px 4px',
              background: 'none', border: 'none',
              borderBottom: active ? `2px solid ${lesson.color}` : '2px solid transparent',
              color: active ? lesson.color : '#6B7280',
              cursor: 'pointer', fontSize: 11,
              fontFamily: '"Rubik", system-ui',
              whiteSpace: 'nowrap' as const,
              transition: 'color 0.15s, border-color 0.15s',
            }}>
              {SKILL_LABELS[m]}
            </button>
          );
        })}
      </div>

      {/* Module content */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' as const }}>
        {/* Avatar strip — vocabulary manages its own; show for other modules */}
        {module !== 'vocabulary' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            {module === 'listening'  && <TutorAvatar mood="listening" size={72} />}
            {module === 'speaking'   && <TutorAvatar mood="asking"    size={72} />}
            {module === 'writing'    && <TutorAvatar mood="learning"  size={72} />}
            {module === 'grammar'    && <TutorAvatar mood="thinking"  size={72} />}
          </div>
        )}
        {module === 'vocabulary' && <VocabModule onProg={onProg} topic={lesson.topicRo} />}
        {module === 'listening'  && <ListenModule onProg={onProg} />}
        {module === 'speaking'   && <SpeakModule user={moduleUser} onProg={onProg} />}
        {module === 'writing'    && <WriteModule user={moduleUser} onProg={onProg} />}
        {module === 'grammar'    && <GrammarModule />}
      </div>
    </div>
  );
}

// ============= VOCAB MODULE =============

const VSY = `You are a Romanian teacher generating vocabulary flashcards. Return ONLY valid JSON.
NOUN: {"word":"casă","type_ro":"substantiv feminin","type_he":"שם עצם - נקבה","translation_he":"בית","emoji":"🏠","forms":[{"lbl":"יחיד לא מוגדר","val":"o casă"},{"lbl":"יחיד מוגדר","val":"casa"},{"lbl":"רבים","val":"case"}],"example_ro":"Eu am o casă mare.","example_he":"יש לי בית גדול.","example2_ro":"Casa noastră este albă.","example2_he":"הבית שלנו לבן.","category":"locuință"}
VERB: {"word":"a merge","type_ro":"verb regulat","type_he":"פועל","translation_he":"ללכת","emoji":"🚶","forms":[{"lbl":"אני","val":"merg"},{"lbl":"אתה","val":"mergi"},{"lbl":"הוא","val":"merge"},{"lbl":"אנחנו","val":"mergem"},{"lbl":"עבר","val":"am mers"}],"example_ro":"Eu merg la piață.","example_he":"אני הולך לשוק.","example2_ro":"Noi mergem la școală.","example2_he":"אנחנו הולכים לבית הספר.","category":"acțiuni"}
IMPORTANT: Always include example2_ro and example2_he. Hebrew fields must use only Hebrew characters. emoji must be a single common emoji that clearly illustrates the word. Vary types and categories. Start simple A1.`;

const SESSION_TARGET = 10;

function VocabModule({ onProg, topic }: { onProg: (n: number) => void; topic?: string }) {
  // ── Session model ───────────────────────────────────────────────────────────
  const [phase, setPhase]             = useState<'new' | 'review' | 'done'>('new');
  const [newLeft, setNewLeft]         = useState(SESSION_TARGET);
  const [knownCards, setKnownCards]   = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [reviewQueue, setReviewQueue] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any

  // ── Current card ────────────────────────────────────────────────────────────
  const [card, setCard]               = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [nextCard, setNextCard]       = useState<any>(null); // prefetched // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading]         = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [status, setStatus]           = useState<'known' | 'review' | null>(null);

  // ── Avatar messaging ────────────────────────────────────────────────────────
  const [avatarMood, setAvatarMood]   = useState<AvatarMood>('showing');
  const [avatarMsg, setAvatarMsg]     = useState<string | null>(null);

  const hist = useRef<string[]>([]);

  const knownCount  = knownCards.length;
  const reviewCount = reviewQueue.length;
  const pctKnown    = Math.round((knownCount  / SESSION_TARGET) * 100);
  const pctReview   = Math.round((reviewCount / SESSION_TARGET) * 100);

  // ── Fetch one new card from AI ───────────────────────────────────────────────
  const fetchCard = useCallback(async (): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const th      = topic ? ` Focus on: ${topic}.` : '';
    const recent  = hist.current.slice(-8).join(', ');
    const prompt  = hist.current.length
      ? `New vocab card.${th} Already shown: ${recent}. Use a different word.`
      : `First vocab card for beginner.${th} Choose a common, everyday word.`;
    const raw = await callAI([{ role: 'user', content: prompt }], VSY);
    const p   = parseJ(raw);
    if (p) {
      p.translation_he = sanitizeHe(p.translation_he ?? '');
      p.example_he     = sanitizeHe(p.example_he  ?? '');
      p.example2_he    = sanitizeHe(p.example2_he ?? '');
      hist.current.push(p.word);
    }
    return p || null;
  }, [topic]);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const c = await fetchCard().catch(() => null);
      setCard(c ?? { err: true });
      setLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Prefetch while user reads the current card ────────────────────────────
  useEffect(() => {
    if (!card || card.err || nextCard || prefetching || phase !== 'new' || newLeft <= 1) return;
    setPrefetching(true);
    fetchCard()
      .then(c => { if (c) setNextCard(c); setPrefetching(false); })
      .catch(() => setPrefetching(false));
  }, [card, nextCard, prefetching, phase, newLeft, fetchCard]);

  // ── Mark current card and advance ────────────────────────────────────────────
  const mark = (verdict: 'known' | 'review') => {
    if (!card || status) return;

    // capture current state to avoid stale closures in setTimeout
    const cur       = card;
    const curPhase  = phase;
    const curKnown  = knownCards;
    const curReview = reviewQueue;
    const curLeft   = newLeft;
    const prefetched = nextCard;

    setStatus(verdict);
    setAvatarMood(verdict === 'known' ? 'approve' : 'coaching');
    setAvatarMsg(verdict === 'known' ? 'מעולה! המילה שלך ✅' : 'אל דאגה — נחזור עליה 💪');
    onProg(verdict === 'known' ? 3 : 1);

    setTimeout(() => {
      setStatus(null);
      setAvatarMood('showing');
      setAvatarMsg(null);

      const updKnown  = verdict === 'known'  ? [...curKnown, cur]  : curKnown;

      if (curPhase === 'new') {
        const updReview  = verdict === 'review' ? [...curReview, cur] : curReview;
        const updNewLeft = curLeft - 1;

        setKnownCards(updKnown);
        setNewLeft(updNewLeft);

        if (updNewLeft > 0) {
          setReviewQueue(updReview);
          if (prefetched) { setCard(prefetched); setNextCard(null); }
          else {
            setLoading(true); setCard(null);
            fetchCard()
              .then(c => { setCard(c ?? { err: true }); setLoading(false); })
              .catch(() => { setCard({ err: true }); setLoading(false); });
          }
        } else {
          // all new cards shown → enter review phase
          setPhase('review');
          if (updReview.length > 0) {
            setCard(updReview[0]);
            setReviewQueue(updReview.slice(1));
          } else {
            // no reviews: session complete
            setPhase('done');
            setCard(null);
            setAvatarMood('proud');
            setAvatarMsg('כל המילים ידועות! 🏆');
            onProg(15);
          }
        }
      } else {
        // phase = 'review'
        const updReview = verdict === 'review' ? [...curReview, cur] : curReview;
        setKnownCards(updKnown);
        if (updReview.length > 0) {
          setCard(updReview[0]);
          setReviewQueue(updReview.slice(1));
        } else {
          setPhase('done');
          setCard(null);
          setAvatarMood('proud');
          setAvatarMsg('כל המילים ידועות! 🏆');
          onProg(15);
        }
      }
    }, 1200);
  };

  // ── Session complete screen ───────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        <TutorAvatar mood="proud" size={110} style={{ margin: '0 auto 16px' }} />
        <div style={{ background: 'linear-gradient(135deg,#dcfce7,#d1fae5)', borderRadius: 16, padding: '18px 20px', marginBottom: 20, direction: 'rtl' }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🏆</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>כל המילים ידועות!</div>
          <div style={{ fontSize: 14, color: '#16a34a', lineHeight: 1.5 }}>
            השלמת {SESSION_TARGET} מילים — כוכב ראשון שלך הושג!
          </div>
        </div>
        <button className="pbtn" onClick={() => {
          setPhase('new'); setNewLeft(SESSION_TARGET);
          setKnownCards([]); setReviewQueue([]);
          setCard(null); setNextCard(null);
          setAvatarMood('showing'); setAvatarMsg(null);
          hist.current = [];
          setLoading(true);
          fetchCard().then(c => { setCard(c ?? { err: true }); setLoading(false); });
        }}>
          סיבוב נוסף →
        </button>
      </div>
    );
  }

  // ── Normal card view ─────────────────────────────────────────────────────
  const emojiSize = (card?.word?.length ?? 0) > 9 ? 32 : 44;

  return (
    <div>
      {/* Avatar banner */}
      <div className="tutor-banner">
        <TutorAvatar mood={avatarMood} size={58} />
        {avatarMsg ? (
          <div className={`tutor-bubble ${avatarMood === 'approve' ? 'ok' : avatarMood === 'coaching' ? 'coach' : 'proud'}`}>
            {avatarMsg}
          </div>
        ) : (
          <div className="tutor-bubble info" style={{ opacity: 0.7 }}>
            {phase === 'review'
              ? `חזרה על ${reviewCount + 1} ${reviewCount === 0 ? 'מילה' : 'מילים'}`
              : `${SESSION_TARGET - newLeft + 1}/${SESSION_TARGET} מילה`}
          </div>
        )}
      </div>

      {/* Two-color progress bar */}
      <div className="vprow">
        <div className="vpbar">
          <div className="vpfill"        style={{ width: `${pctKnown}%` }} />
          <div className="vpfill-review" style={{ width: `${pctReview}%` }} />
        </div>
        <div className="vstats">{knownCount}/{SESSION_TARGET} ידועות</div>
      </div>

      {loading && <div className="ldcard"><div className="spin" /><p>טוען מילה...</p></div>}

      {!loading && card && !card.err && (
        <div className="vcardwrap">
          <div className="vcard">
            {/* Status badge */}
            {status && (
              <div className={`vcard-status ${status === 'known' ? 'vs-known' : 'vs-practice'}`}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {status === 'known'
                  ? <><Check size={12} weight="bold" /> ידוע!</>
                  : <><ArrowCounterClockwise size={12} /> לתרגול</>}
              </div>
            )}

            <div className="vseg">
              {/* Word + emoji + translation row — flex, no fixed widths */}
              <div className="vtrans">
                <div className="vcol-he">
                  <div className="vcol-lbl-he">עברית</div>
                  <div className="whe">{card.translation_he}</div>
                </div>
                <div className="wemoji-wrap">
                  <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{card.emoji}</span>
                </div>
                <div className="vcol-ro">
                  <div className="vcol-lbl-ro">ROM</div>
                  <div className="wro">{card.word}</div>
                </div>
              </div>

              {/* Tags row — Hebrew tag RTL, Romanian tags LTR */}
              <div className="wtype-row">
                <span className="wtag he">{card.type_he}</span>
                {card.category && <span className="wtag">{card.category}</span>}
                <span className="wtag">{card.type_ro}</span>
              </div>

              {/* Compact dual audio row */}
              <div className="vaudio-row">
                <button className="vaudio-pill f" onClick={() => speakRo(card.word, 0.88, null, VOICE_FEMALE)}>
                  <SpeakerHigh size={15} weight="regular" /> קול נשי
                </button>
                <button className="vaudio-pill m" onClick={() => speakRo(card.word, 0.88, null, VOICE_MALE)}>
                  <SpeakerHigh size={15} weight="fill" /> קול גברי
                </button>
              </div>
            </div>

            {/* Inflection table — max 5 rows */}
            {card.forms?.length > 0 && (
              <div style={{ width: '100%' }}>
                <div className="ftable-hdr"><span>ברומנית</span><span>צורה דקדוקית</span></div>
                {card.forms.slice(0, 5).map((f: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                  <div key={i} className="frow">
                    <div className="fval">
                      <button className="snd-sm" onClick={() => speakRo(f.val)}><SpeakerHigh size={16} /></button>
                      <span className="fval-txt">{f.val}</span>
                    </div>
                    <div className="flbl">{f.lbl}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Example sentence 1 */}
            <div className="exbox">
              <div className="exbox-icon" onClick={() => speakRo(card.example_ro)}><SpeakerHigh size={16} /></div>
              <div className="exbox-text">
                <div className="exro">{card.example_ro}</div>
                <div className="exhe">{card.example_he}</div>
              </div>
            </div>

            {/* Example sentence 2 */}
            {card.example2_ro && (
              <div className="exbox" style={{ marginTop: -10 }}>
                <div className="exbox-icon" onClick={() => speakRo(card.example2_ro)}><SpeakerHigh size={16} /></div>
                <div className="exbox-text">
                  <div className="exro">{card.example2_ro}</div>
                  <div className="exhe">{sanitizeHe(card.example2_he || '')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Know / Practice buttons */}
          {!status && (
            <div className="vnav">
              <button className="vbtn prac" onClick={() => mark('review')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <ArrowCounterClockwise size={16} /> צריך עוד תרגול
              </button>
              <button className="vbtn know" onClick={() => mark('known')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Check size={16} weight="bold" /> יודע!
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && card?.err && (
        <div className="ldcard">
          <p>שגיאה — <button className="pbtn" style={{ display: 'inline', padding: '.4rem 1rem' }} onClick={() => {
            setLoading(true); setCard(null);
            fetchCard().then(c => { setCard(c ?? { err: true }); setLoading(false); })
              .catch(() => { setCard({ err: true }); setLoading(false); });
          }}>נסה שוב</button></p>
        </div>
      )}
    </div>
  );
}

// ============= LISTEN QUESTIONS COMPONENT =============

function ListenQuestions({ questions, answers, fb, checking, onAnswer, onCheck, onNewDial }: {
  questions: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  answers: Record<number, string>;
  fb: Record<number, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  checking: Record<number, boolean>;
  onAnswer: (i: number, v: string) => void;
  onCheck: (i: number) => void;
  onNewDial: () => void;
}) {
  const [qi, setQi] = useState(0);
  const total  = questions.length;
  const doneCount = Object.keys(fb).length;
  const q = questions[qi];

  if (!q) return null;

  const goNext = () => { if (qi < total - 1) setQi(qi + 1); };
  const goPrev = () => { if (qi > 0) setQi(qi - 1); };
  const allDone = doneCount === total;

  return (
    <div className="qsec">
      {/* Header: counter + new dialog */}
      <div className="qhdr">
        <h3>שאלות הבנה</h3>
        <button className="newdbtn" onClick={onNewDial}>דיאלוג חדש →</button>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, justifyContent: 'flex-end' }}>
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setQi(i)}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
              fontFamily: '"Rubik", system-ui', fontSize: 11, fontWeight: 700,
              background: fb[i]
                ? (fb[i].score >= 3 ? 'var(--green)' : fb[i].score >= 2 ? 'var(--amber)' : 'var(--red)')
                : i === qi ? 'var(--blue)' : 'var(--blue-l)',
              color: fb[i] || i === qi ? '#fff' : 'var(--blue)',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <div className="qitem">
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, direction: 'rtl' }}>
          שאלה {qi + 1} מתוך {total}
        </div>
        <div className="qro">
          {q.q_ro}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .45, padding: 2, display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
            onClick={() => speakRo(q.q_ro)}><SpeakerHigh size={16} /></button>
        </div>
        <div className="qhe">🇮🇱 {q.q_he}</div>
        <input
          className="qans"
          placeholder="כתוב תשובה..."
          value={answers[qi] || ''}
          onChange={e => onAnswer(qi, e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !checking[qi] && onCheck(qi)}
          disabled={!!fb[qi]}
        />
        {!fb[qi] && (
          <button className="ckbtn" onClick={() => onCheck(qi)} disabled={!answers[qi]?.trim() || checking[qi]}>
            {checking[qi] ? 'בודק...' : 'בדוק'}
          </button>
        )}
        {fb[qi] && (
          <div className={`qfb ${fb[qi].score >= 3 ? 'ok3' : fb[qi].score >= 2 ? 'ok2' : 'no'}`}>
            {fb[qi].score >= 3 ? '✓' : fb[qi].score >= 2 ? '~' : '✗'} {fb[qi].feedback_he}
            {fb[qi].score < 3 && (
              <div style={{ marginTop: '.35rem', fontStyle: 'italic', direction: 'ltr' as const }}>
                תשובה נכונה: {q.ans_ro}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={goPrev} disabled={qi === 0}
          style={{ flex: 1, padding: '9px', border: '1.5px solid var(--border)', background: '#fff', borderRadius: 10, cursor: qi > 0 ? 'pointer' : 'not-allowed', opacity: qi > 0 ? 1 : 0.4, fontFamily: '"Rubik", system-ui', fontSize: 13 }}>
          ← הקודמת
        </button>
        {!allDone && qi < total - 1 && (
          <button onClick={goNext}
            style={{ flex: 1, padding: '9px', border: 'none', background: 'var(--blue)', color: '#fff', borderRadius: 10, cursor: 'pointer', fontFamily: '"Rubik", system-ui', fontSize: 13, fontWeight: 700 }}>
            הבאה →
          </button>
        )}
        {allDone && (
          <button onClick={onNewDial}
            style={{ flex: 2, padding: '9px', border: 'none', background: 'var(--green)', color: '#fff', borderRadius: 10, cursor: 'pointer', fontFamily: '"Rubik", system-ui', fontSize: 13, fontWeight: 700 }}>
            ✓ סיימנו — דיאלוג חדש →
          </button>
        )}
      </div>
    </div>
  );
}

// ============= LISTENING MODULE =============

const LSY = `Romanian teacher. Return ONLY valid JSON.
{"title":"La magazin","level":"A1","lines":[{"speaker":"Vânzătoare","speaker_he":"מוכרת","text":"Bună ziua!","he":"שלום!"}],"questions":[{"q_ro":"Unde are loc?","q_he":"היכן?","ans_ro":"La magazin","ans_he":"בחנות"}]}
4-6 lines, 2-3 questions. Topics: salut, magazin, medic, restaurant, transport, familie. Start A1.`;
const LEVAL_SY = `Evaluate Romanian listening answer. Return ONLY JSON:{"score":3,"feedback_he":"..."} score: 3=correct Romanian, 2=Hebrew/minor errors, 1=partial, 0=wrong.`;

function ListenModule({ onProg }: { onProg: (n: number) => void }) {
  const [dial, setDial] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);
  const [actLine, setActLine] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [showTrans, setShowTrans] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [fb, setFb] = useState<Record<number, any>>({}); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [checking, setChecking] = useState<Record<number, boolean>>({});
  const playRef = useRef(false);

  const fetchDial = useCallback(async () => {
    setLoading(true); setDial(null); setActLine(-1); setAnswers({}); setFb({}); stopSpeech(); playRef.current = false; setPlaying(false);
    try {
      const raw = await callAI([{ role: "user", content: "Generate a new Romanian listening dialogue." }], LSY);
      const p = parseJ(raw);
      if (p) { setDial(p); onProg(2); } else setDial({ err: true });
    } catch { setDial({ err: true }); }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchDial(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { stopSpeech(); playRef.current = false; }, []);

  const playDial = (spd = 1) => {
    if (!dial?.lines) return;
    if (playing) { stopSpeech(); setPlaying(false); setActLine(-1); playRef.current = false; return; }
    setPlaying(true); playRef.current = true;
    const next = (i: number) => {
      if (!playRef.current || i >= dial.lines.length) { setPlaying(false); setActLine(-1); playRef.current = false; return; }
      setActLine(i);
      speakRo(dial.lines[i].text, spd, () => setTimeout(() => next(i + 1), 350), pickVoice(dial.lines[i].speaker));
    };
    next(0);
  };

  const check = async (qi: number) => {
    const ans = answers[qi]; if (!ans?.trim()) return;
    setChecking(c => ({ ...c, [qi]: true }));
    try {
      const q = dial.questions[qi];
      const raw = await callAI([{ role: "user", content: `Question: "${q.q_ro}" (${q.q_he})\nExpected: "${q.ans_ro}" (${q.ans_he})\nStudent: "${ans}"` }], LEVAL_SY);
      const p = parseJ(raw);
      if (p) { setFb(f => ({ ...f, [qi]: p })); if (p.score >= 2) onProg(p.score); }
    } catch { setFb(f => ({ ...f, [qi]: { score: 1, feedback_he: "שגיאה. נסה שוב." } })); }
    setChecking(c => ({ ...c, [qi]: false }));
  };

  return (
    <div>
      {loading && <div className="ldcard"><div className="spin" /><p>מייצר דיאלוג...</p></div>}
      {!loading && dial && !dial.err && (<>
        <div className="dcard">
          <div className="dhead">
            <span className="dtitle">{dial.title}</span>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
              <button className={`trans-toggle${showTrans ? " on" : ""}`} onClick={() => setShowTrans(t => !t)}>
                {showTrans ? "🇮🇱 תרגום פעיל" : "🇮🇱 הצג תרגום"}
              </button>
              <span className="dlevel">{dial.level}</span>
            </div>
          </div>
          <div className="dlines">
            {dial.lines.map((l: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <div key={i} className={`dline${actLine === i ? " act" : ""}`}>
                <div className="dspk">{l.speaker}{l.speaker_he ? ` — ${l.speaker_he}` : ""}</div>
                <div className="dtxt">
                  {l.text}
                  <button style={{ background: "none", border: "none", cursor: "pointer", opacity: .45, padding: 2, display: 'flex', alignItems: 'center' }} onClick={() => speakRo(l.text, 0.88, null, pickVoice(l.speaker))}><SpeakerHigh size={16} /></button>
                </div>
                {showTrans && l.he && <div className="dtrans">↳ {l.he}</div>}
              </div>
            ))}
          </div>
          <div className="actrl">
            <button className={`playbtn${playing ? " playing" : ""}`} onClick={() => playDial(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>{playing ? <Stop size={16} weight="fill" /> : <Play size={16} weight="fill" />}</button>
            <div className="atrack">
              <div className="aprog"><div className="afill" style={{ width: actLine >= 0 ? `${((actLine + 1) / dial.lines.length) * 100}%` : "0%" }} /></div>
              <div className="atime">{actLine >= 0 ? `שורה ${actLine + 1}/${dial.lines.length}` : `${dial.lines.length} שורות`}</div>
            </div>
            <button className="spdbtn" onClick={() => playDial(0.65)}>איטי</button>
            <button className="spdbtn" onClick={() => playDial(1)}>רגיל</button>
          </div>
        </div>
        <ListenQuestions
          questions={dial.questions}
          answers={answers}
          fb={fb}
          checking={checking}
          onAnswer={(i, v) => setAnswers(a => ({ ...a, [i]: v }))}
          onCheck={check}
          onNewDial={fetchDial}
        />
      </>)}
      {!loading && dial?.err && <div className="ldcard"><p>שגיאה — <button className="pbtn" style={{ display: "inline", padding: ".4rem 1rem" }} onClick={fetchDial}>נסה שוב</button></p></div>}
    </div>
  );
}

// ============= SPEAKING MODULE =============

const SPSY = `Romanian oral exam evaluator. For question: {"question_ro":"Cum te numești?","question_he":"איך קוראים לך?","topic":"היכרות"} For evaluation: {"score":7,"correction_ro":"Mă numesc Dana.","feedback_he":"...","improved_ro":"..."} Topics: greetings,family,work,food,city,hobbies. B1 level.`;

function SpeakModule({ user, onProg }: { user: ModuleUser; onProg: (n: number) => void }) {
  const [q, setQ] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);
  const [recState, setRecState] = useState("idle");
  const [micError, setMicError] = useState("");
  const [trans, setTrans] = useState("");
  const [interim, setInterim] = useState("");
  const [fb, setFb] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [evaling, setEvaling] = useState(false);
  const recRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const fetchQ = useCallback(async () => {
    setLoading(true); setQ(null); setTrans(""); setFb(null); setInterim(""); setRecState("idle"); setMicError("");
    try {
      const raw = await callAI([{ role: "user", content: "Generate a new Romanian speaking practice question." }], SPSY);
      setQ(parseJ(raw) || { err: true });
    } catch { setQ({ err: true }); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchQ(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { recRef.current?.abort(); stopSpeech(); }, []);

  const startRec = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) { setMicError("זיהוי קול אינו נתמך — הקלד בתיבה למטה."); setRecState("error"); return; }
    try {
      const r = new SR();
      r.lang = "ro-RO"; r.continuous = false; r.interimResults = true;
      r.onstart = () => { setRecState("listening"); setMicError(""); };
      r.onresult = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        let fi = "", it = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) fi += e.results[i][0].transcript;
          else it += e.results[i][0].transcript;
        }
        if (fi) setTrans(t => t + fi + " ");
        setInterim(it);
      };
      r.onend = () => { setRecState("idle"); setInterim(prev => { if (prev) { setTrans(t => (t + prev + " ").replace(/^\s+/, "")); } return ""; }); };
      r.onerror = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (e.error === "aborted") return;
        setRecState("error");
        const msgs: Record<string, string> = {
          "not-allowed": "המיקרופון חסום — אנא אשר גישה למיקרופון בהגדרות הדפדפן.",
          "network": "שגיאת רשת.",
          "no-speech": "לא זוהה דיבור — נסה שוב.",
          "audio-capture": "לא נמצא מיקרופון.",
        };
        setMicError(msgs[e.error] || "שגיאה: " + e.error);
      };
      recRef.current = r; r.start();
    } catch { setMicError("זיהוי קול אינו זמין."); setRecState("error"); }
  };

  const stopRec = () => { recRef.current?.stop(); setRecState("idle"); };

  const evaluate = async () => {
    if (!trans.trim()) return;
    setEvaling(true);
    try {
      const raw = await callAI([{ role: "user", content: `Question: "${q.question_ro}"\nStudent: "${trans.trim()}"` }], SPSY);
      const p = parseJ(raw);
      if (p) { setFb(p); onProg(p.score >= 6 ? 4 : 2); }
    } catch {}
    setEvaling(false);
  };

  return (
    <div>
      {loading && <div className="ldcard"><div className="spin" /><p>מייצר שאלה...</p></div>}
      {!loading && q && !q.err && (<>
        <div className="spcard">
          <div className="qdisplay">
            <div className="qlabel">שאלה — {q.topic || "B1"}</div>
            <div className="qtextro">{q.question_ro}</div>
            <div className="qtexthe">{q.question_he}</div>
            <button className="sqbtn" onClick={() => speakRo(q.question_ro, 0.85)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><SpeakerHigh size={16} /> השמע שאלה</button>
          </div>
          <div className="micarea">
            <button className={`micbtn${recState === "listening" ? " rec" : ""}`} onClick={recState === "listening" ? stopRec : startRec}>
              {recState === "listening" ? "⏹" : "🎙"}
            </button>
            <span className="miclbl">{recState === "listening" ? "מקשיב... לחץ לעצירה" : "לחץ לדיבור ברומנית"}</span>
            {micError && <div className="micerr">⚠️ {micError}</div>}
            <textarea
              style={{ width: "100%", padding: ".7rem", border: "1.5px solid var(--border)", borderRadius: "9px", fontFamily: "'Rubik',sans-serif", fontSize: ".93rem", direction: "ltr" as const, minHeight: "80px", resize: "vertical" as const, outline: "none" }}
              placeholder="כתוב תשובה ברומנית..."
              value={trans}
              onChange={e => { setTrans(e.target.value); setInterim(""); }}
            />
            {interim && <div style={{ width: "100%", fontSize: ".84rem", color: "var(--muted)", fontStyle: "italic", direction: "ltr" as const }}>{interim}...</div>}
            <div style={{ display: "flex", gap: ".65rem", flexWrap: "wrap" as const, justifyContent: "center" }}>
              {trans && <button className="obtn" style={{ padding: ".5rem 1rem" }} onClick={() => { setTrans(""); setFb(null); setInterim(""); }}>נקה</button>}
              <button className="sbtn" onClick={evaluate} disabled={!trans.trim() || evaling}>{evaling ? "מעריך..." : "שלח להערכה →"}</button>
            </div>
          </div>
        </div>
        {fb && (
          <div className="fbcard">
            <div className="fbhdr">
              <h4>הערכת AI</h4>
              <span className={`spill ${fb.score >= 7 ? "hi" : fb.score >= 5 ? "mi" : "lo"}`}>{fb.score}/10</span>
            </div>
            {fb.correction_ro && (
              <div style={{ background: "#f7f4ef", borderRadius: "9px", padding: ".8rem", marginBottom: ".9rem", direction: "ltr" as const }}>
                <div style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const }}>גרסה מתוקנת</div>
                <div style={{ fontStyle: "italic", fontSize: ".93rem", color: "var(--navy)" }}>
                  {fb.correction_ro}
                  <button style={{ background: "none", border: "none", cursor: "pointer", opacity: .5, padding: 2, display: 'flex', alignItems: 'center' }} onClick={() => speakRo(fb.correction_ro)}><SpeakerHigh size={16} /></button>
                </div>
              </div>
            )}
            <div className="fbbody">{fb.feedback_he}</div>
            <button className="nqbtn" onClick={fetchQ}>שאלה הבאה →</button>
          </div>
        )}
      </>)}
      {!loading && q?.err && <div className="ldcard"><p>שגיאה — <button className="pbtn" style={{ display: "inline", padding: ".4rem 1rem" }} onClick={fetchQ}>נסה שוב</button></p></div>}
    </div>
  );
}

// ============= WRITING MODULE =============

const WSY = `Romanian B1 writing teacher. If "התחל": give a writing prompt in Hebrew+Romanian. Evaluate: grammar, vocab, score/10. Reply Hebrew. Be encouraging.`;

function WriteModule({ user, onProg }: { user: ModuleUser; onProg: (n: number) => void }) {
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const sr = useRef<HTMLDivElement>(null);

  useEffect(() => { sr.current?.scrollTo(0, sr.current.scrollHeight); }, [msgs]);

  const send = async (txt: string) => {
    if (!txt.trim() || loading) return;
    const nm = [...msgs, { role: "user", content: txt }];
    setMsgs(nm); setInp(""); setLoading(true);
    try {
      const r = await callAI(nm, WSY);
      setMsgs([...nm, { role: "assistant", content: r }]);
      onProg(2);
    } catch { setMsgs([...nm, { role: "assistant", content: "שגיאה. נסה שוב." }]); }
    setLoading(false);
  };

  return (
    <div className="chatbox">
      <div className="chatmsgs" ref={sr}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--muted)", paddingTop: "2rem" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: ".6rem" }}>✍️</div>
            <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: ".25rem" }}>תרגול כתיבה</div>
            <div style={{ fontSize: ".83rem", marginBottom: "1.1rem" }}>לחץ &quot;משימה חדשה&quot;</div>
            <button className="pbtn" style={{ maxWidth: 190, margin: "0 auto", display: "block" }} onClick={() => send("התחל")}>✏️ משימה חדשה</button>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "usr" : "ai"}`}>
            <div className="mav">{m.role === "user" ? user.name[0].toUpperCase() : "RO"}</div>
            <div className="mbub">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="msg ai">
            <div className="mav">RO</div>
            <div className="mbub"><div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div></div>
          </div>
        )}
      </div>
      <div className="chatinp">
        {msgs.length > 0 && <button className="nexbtn" onClick={() => send("התחל")} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowCounterClockwise size={16} /></button>}
        <textarea
          className="chatta"
          value={inp}
          onChange={e => setInp(e.target.value)}
          placeholder="כתוב ברומנית..."
          rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(inp); } }}
        />
        <button className="sendbtn" onClick={() => send(inp)} disabled={!inp.trim() || loading}>➤</button>
      </div>
    </div>
  );
}

// ============= GRAMMAR MODULE =============

const GRAMMAR_TOPICS = [
  { id: "alphabet", title: "אלפבית והגייה",      sub: "ă, â, î, ș, ț" },
  { id: "gender",   title: "מגדר — 3 מינים",     sub: "זכר, נקבה וניטרל" },
  { id: "article",  title: "ה׳ הידיעה בסוף",      sub: "-ul, -a, -le" },
  { id: "present",  title: "הפועל בהווה",          sub: "נטיית פועל" },
  { id: "past",     title: "עבר מורכב",            sub: "am mers..." },
  { id: "future",   title: "עתיד",                 sub: "voi, vei, va..." },
  { id: "adjective",title: "שם תואר",              sub: "הסכמה לפי מגדר" },
  { id: "negation", title: "שלילה",                sub: "nu + פועל" },
  { id: "questions",title: "שאלות",                sub: "ce, cine, unde, când" },
  { id: "numbers",  title: "מספרים",               sub: "1-100" },
];
const GRAM_SY = `Romanian grammar teacher for Hebrew speakers. Use clear Hebrew. Compare to Hebrew. Give 3-5 examples with translation. Use ## for topics, ### for sections.`;

function GrammarModule() {
  const [sel, setSel] = useState<typeof GRAMMAR_TOPICS[0] | null>(null);
  const [explain, setExplain] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGrammar = async (t: typeof GRAMMAR_TOPICS[0]) => {
    setSel(t); setLoading(true); setExplain("");
    try {
      const r = await callAI([{ role: "user", content: `Explain: "${t.title}" (${t.sub}) in Romanian grammar for Hebrew speaker.` }], GRAM_SY);
      setExplain(r);
    } catch { setExplain("שגיאה."); }
    setLoading(false);
  };

  const render = (text: string) => text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
    if (line.startsWith("- ") || line.startsWith("* ")) return <p key={i} style={{ paddingRight: "1rem" }}>• {line.slice(2)}</p>;
    if (!line.trim()) return <div key={i} style={{ height: ".4rem" }} />;
    return <p key={i}>{line}</p>;
  });

  return (
    <div>
      <div style={{ marginBottom: "1.2rem", padding: ".85rem", background: "#fff", border: "2px solid var(--border)", borderRadius: "11px", fontSize: ".86rem", color: "var(--muted)", direction: "rtl" as const, lineHeight: 1.6 }}>
        💡 בחר נושא להסבר מפורט
      </div>
      <div className="gram-topics">
        {GRAMMAR_TOPICS.map((t, i) => (
          <div key={t.id} className={`gram-topic${sel?.id === t.id ? " active" : ""}`} onClick={() => fetchGrammar(t)}>
            <div className="gt-num">{i + 1}</div>
            <div className="gt-info"><h4>{t.title}</h4><p>{t.sub}</p></div>
            <div style={{ marginRight: "auto", color: "var(--muted)" }}>›</div>
          </div>
        ))}
      </div>
      {loading && <div className="ldcard"><div className="spin" /><p>מכין הסבר...</p></div>}
      {!loading && explain && <div className="gram-explain">{render(explain)}</div>}
    </div>
  );
}

// ============= CURRICULUM MODULE =============

const CURRICULUM = [
  { id: "s1", name: "שלב א: יסודות", desc: "מילים ראשונות וברכות", units: [
    { id: "u1", name: "ברכות ראשונות", sub: "Bună ziua, mulțumesc", icon: "👋", topic: "salut" },
    { id: "u2", name: "מספרים 1–20",   sub: "unu, doi, trei...",    icon: "🔢", topic: "numere" },
    { id: "u3", name: "צבעים",          sub: "roșu, albastru, verde", icon: "🎨", topic: "culori" },
    { id: "u4", name: "משפחה",          sub: "mamă, tată, frate",    icon: "👨‍👩‍👧", topic: "familie" },
    { id: "u5", name: "גוף האדם",       sub: "cap, mâini, picioare", icon: "🫀", topic: "corp" },
  ]},
  { id: "s2", name: "שלב ב: משפטים ראשונים", desc: "בניית משפט בסיסי", units: [
    { id: "u6", name: "הצגה עצמית", sub: "Mă numesc, eu sunt", icon: "🙋", topic: "prezentare" },
    { id: "u7", name: "מזון ושתייה", sub: "pâine, apă, cafea",  icon: "🍎", topic: "mâncare" },
    { id: "u8", name: "שאלות יסוד", sub: "Ce? Cine? Unde?",     icon: "❓", topic: "întrebări" },
    { id: "u9", name: "בעיר",        sub: "stradă, magazin, piață", icon: "🏙️", topic: "oraș" },
  ]},
  { id: "s3", name: "שלב ג: סיטואציות", desc: "שפה יומיומית", units: [
    { id: "u10", name: "בחנות",          sub: "קנייה, מחיר",         icon: "🛒", topic: "cumpărături" },
    { id: "u11", name: "בריאות",          sub: "doctor, spital",       icon: "🏥", topic: "sănătate" },
    { id: "u12", name: "תחבורה",          sub: "autobus, tren, bilet", icon: "🚌", topic: "transport" },
    { id: "u13", name: "עבודה",           sub: "serviciu, birou",      icon: "💼", topic: "muncă" },
    { id: "u14", name: "מסמכים ואזרחות", sub: "pașaport, cetățenie",  icon: "📋", topic: "documente" },
  ]},
];

const LESSON_SY = `Romanian teacher. Mini-lesson for Hebrew beginners. Return ONLY valid JSON:
{"vocab":[{"ro":"bun","he":"טוב","emoji":"👍"}],"sentences":[{"ro":"Bună ziua!","he":"שלום!","note":"ברכה רשמית"}],"mini_ro":"- Bună ziua!\\n- Ce mai faceți?","mini_he":"- שלום!\\n- מה שלומכם?"}
4-6 vocab, 3-4 sentences, short dialogue. A1.`;

function CurriculumModule({ onProg }: { onProg: (n: number) => void }) {
  const [openStage, setOpenStage] = useState("s1");
  const [activeUnit, setActiveUnit] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [lesson, setLesson] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);
  const [lessonView, setLessonView] = useState("vocab");

  // Play a pre-generated static MP3; falls back to TTS API if file missing
  const playStatic = (unitId: string, key: string, voiceSuffix: string, fallbackText: string) => {
    const url = `/audio/${unitId}/${key}_${voiceSuffix}.mp3`;
    const audio = new Audio(url);
    audio.onerror = () => speakRo(fallbackText);
    audio.play().catch(() => speakRo(fallbackText));
  };

  const openUnit = async (unit: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (activeUnit?.id === unit.id) { setActiveUnit(null); setLesson(null); return; }
    setActiveUnit(unit); setLesson(null); setLoading(true); setLessonView("vocab");
    // Try static content first (pre-generated for שלב א)
    try {
      const res = await fetch(`/audio/${unit.id}/content.json`);
      if (res.ok) {
        const data = await res.json();
        setLesson(data);
        setLoading(false);
        return;
      }
    } catch {}
    // Fallback: generate via Claude
    try {
      const raw = await callAI([{ role: "user", content: `Mini-lesson for "${unit.name}" (${unit.sub}), category: ${unit.topic}. A1 level.` }], LESSON_SY);
      const p = parseJ(raw);
      if (p) { setLesson(p); onProg(2); } else setLesson({ err: true });
    } catch { setLesson({ err: true }); }
    setLoading(false);
  };

  return (
    <div className="curr">
      {CURRICULUM.map((stage, si) => (
        <div key={stage.id} className="stage">
          <div className="stage-header" onClick={() => setOpenStage(openStage === stage.id ? "" : stage.id)}>
            <div className="stage-h-left">
              <div className="stage-num">{si + 1}</div>
              <div><div className="stage-name">{stage.name}</div><div className="stage-desc">{stage.desc}</div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>{stage.units.length} יחידות</span>
              <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{openStage === stage.id ? "▲" : "▼"}</span>
            </div>
          </div>
          {openStage === stage.id && (
            <div className="units">
              {stage.units.map(unit => (
                <div key={unit.id}>
                  <div className="unit" onClick={() => openUnit(unit)}>
                    <div className="unit-icon"><UnitIcon emoji={unit.icon} size={20} /></div>
                    <div className="unit-info"><div className="unit-name">{unit.name}</div><div className="unit-sub">{unit.sub}</div></div>
                    <span className="unit-badge new">פתח שיעור</span>
                  </div>
                  {activeUnit?.id === unit.id && (
                    <div className="unit-lesson">
                      {loading && <div style={{ textAlign: "center", padding: "1.5rem" }}><div className="spin" style={{ margin: "0 auto .7rem" }} /><p style={{ color: "var(--muted)", fontSize: ".87rem" }}>מייצר שיעור...</p></div>}
                      {!loading && lesson && !lesson.err && (<>
                        <div style={{ display: "flex", gap: ".55rem", marginBottom: "1.1rem", flexWrap: "wrap" as const }}>
                          {(["vocab", "sentences", "dialogue"] as const).map(v => (
                            <button key={v} onClick={() => setLessonView(v)} style={{
                              padding: ".42rem .9rem", borderRadius: "7px", border: "none",
                              fontFamily: "'Rubik',sans-serif", fontSize: ".82rem", cursor: "pointer",
                              background: lessonView === v ? "var(--blue)" : "var(--blue-l)",
                              color: lessonView === v ? "#fff" : "var(--blue)",
                              fontWeight: lessonView === v ? 700 : 400,
                            }}>
                              {v === "vocab" ? "🗂️ מילים" : v === "sentences" ? "📝 משפטים" : "💬 דיאלוג"}
                            </button>
                          ))}
                        </div>
                        {lessonView === "vocab" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
                            {lesson.vocab?.map((w: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                              <div key={i} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: "9px", padding: ".65rem 1rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
                                <span style={{ fontSize: "1.5rem" }}>{w.emoji}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontStyle: "italic", fontWeight: 700, color: "var(--navy)", direction: "ltr" as const }}>{w.ro}</div>
                                  <div style={{ fontSize: ".84rem", color: "var(--gold)", fontWeight: 600 }}>{w.he}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button style={{ background: "none", border: "none", cursor: "pointer", opacity: .5, padding: 2, display: 'flex', alignItems: 'center' }} title="נקבה" onClick={() => playStatic(activeUnit.id, `vocab_${i}`, 'f1', w.ro)}><SpeakerHigh size={16} weight="regular" /></button>
                                  <button style={{ background: "none", border: "none", cursor: "pointer", opacity: .5, padding: 2, display: 'flex', alignItems: 'center' }} title="זכר" onClick={() => playStatic(activeUnit.id, `vocab_${i}`, 'm1', w.ro)}><SpeakerHigh size={16} weight="fill" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {lessonView === "sentences" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
                            {lesson.sentences?.map((s: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                              <div key={i} style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: "9px", padding: ".75rem 1rem" }}>
                                <div style={{ fontStyle: "italic", color: "var(--navy)", direction: "ltr" as const, marginBottom: ".25rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
                                  {s.ro}
                                  <button style={{ background: "none", border: "none", cursor: "pointer", opacity: .5, padding: 2, display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }} title="נקבה" onClick={() => playStatic(activeUnit.id, `sent_${i}`, 'f1', s.ro)}><SpeakerHigh size={16} weight="regular" /></button>
                                  <button style={{ background: "none", border: "none", cursor: "pointer", opacity: .5, padding: 2, display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }} title="זכר" onClick={() => playStatic(activeUnit.id, `sent_${i}`, 'm1', s.ro)}><SpeakerHigh size={16} weight="fill" /></button>
                                </div>
                                <div style={{ fontSize: ".84rem", color: "var(--muted)" }}>{s.he}</div>
                                {s.note && <div style={{ fontSize: ".76rem", color: "var(--amber)", marginTop: ".2rem" }}>💡 {s.note}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                        {lessonView === "dialogue" && lesson.mini_ro && (
                          <div style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
                            <div style={{ background: "#fff", border: "1.5px solid var(--border)", borderRadius: "9px", padding: ".85rem 1rem" }}>
                              <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, marginBottom: ".5rem" }}>רומנית</div>
                              <div style={{ fontStyle: "italic", fontSize: ".92rem", whiteSpace: "pre-line", color: "var(--navy)", direction: "ltr" as const, lineHeight: 1.7 }}>{lesson.mini_ro}</div>
                            </div>
                            <div style={{ background: "#faf7f3", border: "1.5px solid var(--border)", borderRadius: "9px", padding: ".85rem 1rem" }}>
                              <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" as const, marginBottom: ".5rem" }}>עברית</div>
                              <div style={{ fontSize: ".9rem", whiteSpace: "pre-line", color: "var(--muted)", direction: "rtl" as const, lineHeight: 1.7 }}>{lesson.mini_he}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button style={{ background: "var(--blue)", color: "#fff", border: "none", padding: ".6rem 1.2rem", borderRadius: "var(--r-sm)", cursor: "pointer", fontFamily: "'Rubik',sans-serif", fontSize: ".85rem", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => playStatic(activeUnit.id, 'dial_0', 'f1', lesson.mini_ro)}>
                                <SpeakerHigh size={16} weight="regular" /> נקבה
                              </button>
                              <button style={{ background: "var(--navy)", color: "#fff", border: "none", padding: ".6rem 1.2rem", borderRadius: "var(--r-sm)", cursor: "pointer", fontFamily: "'Rubik',sans-serif", fontSize: ".85rem", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => playStatic(activeUnit.id, 'dial_0', 'm1', lesson.mini_ro)}>
                                <SpeakerHigh size={16} weight="fill" /> זכר
                              </button>
                            </div>
                          </div>
                        )}
                      </>)}
                      {!loading && lesson?.err && (
                        <div style={{ color: "var(--red)", fontSize: ".85rem" }}>
                          שגיאה — <button onClick={() => openUnit(unit)} style={{ color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>נסה שוב</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
