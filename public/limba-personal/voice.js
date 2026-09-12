// GPT Live WebRTC. API keys, startup configuration and account ownership stay on the server.
export class VoicePractice {
 constructor({request,onStatus=()=>{}}){this.request=request;this.onStatus=onStatus;this.state='idle';this.rows=[];this.context='';this.seconds=0;this.ready=false;this.audio=new Audio();this.audio.autoplay=true;this.audio.controls=true;this.audio.setAttribute('aria-label','שמע המלווה');this.audio.hidden=true;document.body.append(this.audio);window.addEventListener('pagehide',()=>this.abandon());}
 get active(){return ['connecting','live','paused','closing'].includes(this.state);}
 mount(host,{topic,minutes,available,demo}){
  this.host=host;this.topic=topic;this.minutes=minutes;
  host.innerHTML=`<div class="voice-heading"><strong>המלווה הקולי שלך</strong><span class="voice-state" role="status"></span></div><p class="voice-intro">מדברים ברומנית, ומקבלים הסבר בעברית כשצריך. הקול נוצר באמצעות בינה מלאכותית.</p><div class="voice-actions"><button class="primary" data-voice-start>מתחילים שיחה קולית</button><button class="secondary" data-voice-stop hidden>סיום השיחה</button><button class="text-button" data-voice-play hidden>הפעלת השמע</button></div><details class="voice-details"><summary>פרטיות וזמן שיחה</summary><p class="voice-note">השמע מועבר ל־OpenAI בזמן השיחה. אין שמירת הקלטה או תמלול אצלנו. בסיום שומרים את ההערכה שלך לתרגול.</p><p class="voice-note">עד ${minutes} דקות לשיחה במסך הזה · עד 12 התחלות ביום. השהיה לקריאה משתיקה את המיקרופון והשמע; החיבור נשאר בתשלום ונסגר אחרי דקת השהיה.</p></details><p class="voice-error" role="alert"></p><details class="voice-captions"><summary>תמלול השיחה</summary><p class="voice-note">תמלול אוטומטי עשוי לטעות ואינו ציון בהיגוי.</p><div class="voice-transcript" role="log" aria-live="off"></div></details>`;
  host.querySelector('[data-voice-start]').disabled=!available||demo;
  host.querySelector('[data-voice-start]').addEventListener('click',()=>this.start());
  host.querySelector('[data-voice-stop]').addEventListener('click',()=>this.stop());
  host.querySelector('[data-voice-play]').addEventListener('click',()=>this.audio.play().then(()=>host.querySelector('[data-voice-play]').hidden=true).catch(()=>this.error('הדפדפן עדיין לא מאפשר שמע. בדקו את הרשאת השמע.')));
  this.available=available&&!demo;
  this.render();this.renderTranscript();
 }
 render(){if(!this.host?.isConnected)return;const labels={idle:this.available?'מוכן לשיחה':'הקול ממתין להפעלה',connecting:'מתחברים למלווה…',live:'השיחה פעילה · המיקרופון פתוח',paused:'המיקרופון והשמע מושתקים',closing:'מסיימים את השיחה…',ended:'השיחה הסתיימה',error:'השיחה אינה פעילה'};this.host.querySelector('.voice-state').textContent=labels[this.state];this.host.querySelector('[data-voice-start]').hidden=this.active;this.host.querySelector('[data-voice-start]').disabled=!this.available||!!this.starting;this.host.querySelector('[data-voice-stop]').hidden=!this.active;this.host.querySelector('[data-voice-stop]').disabled=this.state==='closing';this.onStatus(this.state);}
 error(message){if(this.host?.isConnected)this.host.querySelector('.voice-error').textContent=message;}
 send(type,extra={}){if(!this.ready||this.channel?.readyState!=='open')return;const event_id=crypto.randomUUID();this.channel.send(JSON.stringify({type,event_id,...extra}));return event_id;}
 setContext(context){this.context=context.slice(0,1200);if(this.ready)this.send('session.thinking.append',{delegation_id:null,content:'Current exercise on screen: '+this.context});}
 async start(){
  if(this.active||!this.available||this.starting)return;
  this.starting=true;this.serverCreated=false;
  this.state='connecting';this.finalized=false;this.ready=false;this.seconds=0;this.rows=[];this.id=crypto.randomUUID();this.render();this.error('');this.renderTranscript();const attempt=this.id;
  try{
   if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection)throw Error('הדפדפן אינו תומך בשיחה קולית. נסו Chrome או Safari מעודכן.');
   const mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
   if(this.id!==attempt||this.state!=='connecting'){mic.getTracks().forEach(t=>t.stop());return;}
   this.mic=mic;this.peer=new RTCPeerConnection();const peer=this.peer;
   mic.getAudioTracks().forEach(track=>peer.addTrack(track,mic));
   peer.addEventListener('track',event=>{if(this.peer!==peer)return;this.audio.srcObject=new MediaStream([event.track]);this.audio.muted=this.state==='paused';this.audio.play().catch(()=>{this.host.querySelector('[data-voice-play]').hidden=false;});});
   this.channel=peer.createDataChannel('oai-events');
   this.channel.addEventListener('message',event=>{if(this.peer!==peer)return;try{this.receive(JSON.parse(event.data));}catch{this.error('אירוע שיחה לא נקרא. אם השיחה נתקעה, סיימו ונסו שוב.');}});
   this.channel.addEventListener('close',()=>{if(this.peer===peer&&!this.finalized&&this.state!=='ended'){this.error('החיבור נותק. סיום השיחה ונתוני הזמן אינם מאושרים.');void this.stop();}});
   peer.addEventListener('connectionstatechange',()=>{if(this.peer===peer&&peer.connectionState==='failed'){this.error('החיבור הקולי אבד.');void this.stop();}});
   await peer.setLocalDescription(await peer.createOffer());
   if(peer.iceGatheringState!=='complete')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{peer.removeEventListener('icegatheringstatechange',check);reject(Error('החיבור לרשת התעכב. נסו שוב.'));},10000);const check=()=>{if(peer.iceGatheringState==='complete'){clearTimeout(timer);peer.removeEventListener('icegatheringstatechange',check);resolve();}};peer.addEventListener('icegatheringstatechange',check);check();});
   if(this.id!==attempt||this.state!=='connecting')return;
   const result=await this.request('voice/start',{id:attempt,topic:this.topic.id,minutes:this.minutes,sdp:peer.localDescription.sdp});
   this.serverCreated=true;
   if(this.id!==attempt||this.state!=='connecting'){await this.request('voice/finish',{id:attempt,seconds:0,finalized:false}).catch(()=>{});this.serverCreated=false;return;}
   this.deadline=Date.now()+result.maxSeconds*1000;
   await peer.setRemoteDescription({type:'answer',sdp:result.transport.sdp});
   this.startTimer=setTimeout(()=>{if(!this.ready){this.error('המלווה לא השלים את החיבור.');void this.stop();}},20000);
   this.durationTimer=setInterval(()=>{if(Date.now()>=this.deadline){this.error('הזמן שהוקצה לשיחה הסתיים. אפשר לסכם את התרגול.');void this.stop();}},1000);
  }catch(error){this.error(error.name==='NotAllowedError'?'כדי לדבר צריך לאפשר שימוש במיקרופון בדפדפן.':error.message||'לא ניתן להתחבר כרגע.');await this.stop();}finally{this.starting=false;this.render();}
 }
 receive(event){
  if(event.type==='session.started'){
   if(this.state==='closing'||this.state==='ended')return;
   this.ready=true;clearTimeout(this.startTimer);this.state='live';this.render();
   this.greetingEvent=this.send('session.instructions.append',{delegation_id:null,content:'Begin now: briefly greet the learner in Romanian and ask them to attempt the exercise on the screen. Do not give its answer. Screen: '+this.context});
  }else if(event.type==='session.instructions.appended'&&event.client_event_id===this.greetingEvent){
   this.greetingEvent=null;this.send('session.commentary.append',{delegation_id:null,content:'Begin the conversation now, following the instructions provided.'});
  }else if(event.type==='session.input_transcript.delta'||event.type==='session.output_transcript.delta'){
   const role=event.type.includes('input_')?'user':'assistant';const last=this.rows.at(-1);
   if(last&&last.role===role&&event.start_ms>=last.end&&event.start_ms-last.end<1800){last.text=(last.text+event.delta).slice(-12000);last.end=event.end_ms;}else this.rows.push({role,text:event.delta,start:event.start_ms,end:event.end_ms});
   if(this.rows.length>120)this.rows.shift();this.renderTranscript();
  }else if(event.type==='session.usage.updated'){this.seconds=Math.max(this.seconds,Number(event.usage?.seconds)||0);
  }else if(event.type==='session.closed'){this.finalized=true;this.seconds=Number(event.usage?.seconds)||this.seconds;this.resolveClose?.();if(this.state!=='closing')void this.stop();
  }else if(event.type==='error'){const code=String(event.error?.code||'unknown').replace(/[^a-zA-Z0-9_.-]/g,'').slice(0,100);this.error('המלווה דיווח על שגיאה ('+code+'). אפשר לסיים ולנסות שוב.');}
 }
 renderTranscript(){const box=this.host?.querySelector('.voice-transcript');if(!box)return;const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<50;box.replaceChildren();for(const row of this.rows){const p=document.createElement('p');p.dir='auto';const name=document.createElement('strong');name.textContent=row.role==='user'?'את/ה: ':'המלווה: ';p.append(name,document.createTextNode(row.text));box.append(p);}if(nearBottom)box.scrollTop=box.scrollHeight;}
 pause(paused){
  if(!['live','paused'].includes(this.state))return;
  this.state=paused?'paused':'live';this.audio.muted=paused;this.mic?.getAudioTracks().forEach(t=>t.enabled=!paused);
  this.send(paused?'session.input_audio.mute':'session.input_audio.unmute');
  this.send('session.instructions.append',{delegation_id:null,content:paused?'The learner is reading the course material. Wait quietly; do not advance to another exercise.':'The learner has returned. Briefly repeat the current question without its answer and listen.'});
  clearTimeout(this.pauseTimer);if(paused)this.pauseTimer=setTimeout(()=>{this.error('השיחה נסגרה אחרי דקת קריאה. אפשר להתחיל שוב כשמוכנים.');void this.stop();},60000);this.render();
 }
 async stop(){
  if(this.stopPromise)return this.stopPromise;
  if(!this.active&&!this.serverCreated)return;
  this.stopPromise=(async()=>{
   this.state='closing';this.render();this.mic?.getAudioTracks().forEach(t=>t.enabled=false);this.audio.muted=true;
   if(this.ready&&!this.finalized&&this.channel?.readyState==='open')await new Promise(resolve=>{this.resolveClose=resolve;this.closeTimer=setTimeout(resolve,5000);this.send('session.close');});
   this.cleanup();
   if(this.serverCreated){try{await this.request('voice/finish',{id:this.id,seconds:this.seconds,finalized:this.finalized});}catch(error){this.error(error.message+' אם צריך, סגרו את הלשונית.');}}
   this.state='ended';this.serverCreated=false;this.render();
  })();await this.stopPromise;this.stopPromise=null;
 }
 cleanup(){clearTimeout(this.startTimer);clearTimeout(this.closeTimer);clearTimeout(this.pauseTimer);clearInterval(this.durationTimer);const peer=this.peer;this.peer=null;this.ready=false;this.mic?.getTracks().forEach(t=>t.stop());this.channel?.close();peer?.close();this.audio.srcObject=null;this.audio.muted=false;this.resolveClose=null;}
 abandon(){if(this.active){this.send('session.close');if(this.serverCreated)fetch('/api/limba/voice/finish',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({id:this.id,seconds:this.seconds,finalized:false})}).catch(()=>{});this.cleanup();}}
}
