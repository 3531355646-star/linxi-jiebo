(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const slides = Array.from(document.querySelectorAll('.slide'));
  const modals = Array.from(document.querySelectorAll('.modal'));
  let current = 0, running = false, elapsed = 0, started = 0, animation = 0, animating = false, playStarted = 0;
  let lastFocus = null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const format = (s) => `${s<0?'+':''}${String(Math.floor(Math.abs(s)/60)).padStart(2,'0')}:${String(Math.floor(Math.abs(s)%60)).padStart(2,'0')}`;
  function toast(msg) { $('toast').textContent=msg; $('toast').classList.add('show'); window.setTimeout(()=>$('toast').classList.remove('show'),3000); }
  const viewport = document.querySelector('.viewport');
  const paper = new URLSearchParams(location.search).has('print');
  document.documentElement.classList.toggle('paper',paper);
  if (!paper) slides.forEach(slide => {
    const stop = document.createElement('div');
    stop.className = 'sheet-stop';
    slide.before(stop);
    stop.append(slide);
  });
  function layout() {
    if (paper) return;
    const height = viewport.clientHeight;
    document.documentElement.style.setProperty('--port-h',height+'px');
    document.documentElement.style.setProperty('--sheet-scale', Math.min((viewport.clientWidth-12)/1600,(height-8)/900));
    viewport.scrollTo({top:current*height,behavior:'instant'});
  }
  let scrollTimer;
  viewport.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const page = Math.round(viewport.scrollTop / viewport.clientHeight);
      if (!paper && page !== current) show(page,false);
    },120);
  },{passive:true});
  function stopMotion(){if(animation)cancelAnimationFrame(animation);animating=false;animation=0;$('play-motion').textContent='播放驶入 / 倒出';}
  function show(index, scroll = true) {
    current=Math.max(0,Math.min(slides.length-1,index));
    if (!paper && scroll) viewport.scrollTo({top:current*viewport.clientHeight,behavior:'instant'});
    slides.forEach((s,i)=>{s.classList.toggle('active',i===current);s.setAttribute('aria-hidden',String(i!==current));});
    document.querySelectorAll('[data-nav]').forEach(b=>{const yes=Number(b.dataset.nav)===current;b.classList.toggle('active',yes);b.setAttribute('aria-current',yes?'step':'false');});
    $('page-status').textContent=`${String(current+1).padStart(2,'0')} / ${slides.length}`;
    $('prev').disabled=current===0; $('next').disabled=current===slides.length-1;
    $('live-status').textContent=`第${current+1}页，${DECK.slides[current].title}`;
    history.replaceState(null,'',`#${current+1}`);if(!slides[current].querySelector('#motion-svg'))stopMotion();
  }
  function openModal(id) { lastFocus=document.activeElement;modals.forEach(m=>m.classList.remove('open'));$(id).classList.add('open');$(id).querySelector('button')?.focus(); }
  function closeModals(){modals.forEach(m=>m.classList.remove('open'));lastFocus?.focus();}
  function timerNow(){return elapsed+(running?(performance.now()-started)/1000:0);}
  function updateTimer(){const seconds=420-timerNow();$('timer').textContent=format(Math.ceil(seconds));$('timer').classList.toggle('over',seconds<0);$('time-progress').style.width=`${Math.min(100,timerNow()/420*100)}%`;}
  function toggleTimer(){if(running){elapsed=timerNow();running=false;}else{started=performance.now();running=true;}$('toggle-timer').textContent=running?'暂停计时':'继续计时';updateTimer();}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){toast('当前内嵌浏览器不支持全屏，可在外部浏览器使用F11。');}}
  $('prev').addEventListener('click',()=>show(current-1));$('next').addEventListener('click',()=>show(current+1));
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.nav))));
  document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{show(Number(b.dataset.jump));closeModals();}));
  $('overview-btn').addEventListener('click',()=>openModal('overview-modal'));
  $('fullscreen-btn').addEventListener('click',fullscreen);
  $('toggle-timer').addEventListener('click',toggleTimer);
  $('reset-timer').addEventListener('click',()=>{elapsed=0;running=false;$('toggle-timer').textContent='开始计时';updateTimer();});
  document.querySelectorAll('.modal-close').forEach(b=>b.addEventListener('click',closeModals));
  modals.forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModals();}));
  document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{$('large-image').src=b.dataset.image;$('original-image-link').href=b.dataset.image;openModal('image-modal');}));
  $('design-plate')?.addEventListener('change', event => {
    const selector = event.currentTarget;
    const button = selector.closest('figure').querySelector('[data-image]');
    const label = selector.selectedOptions[0].textContent;
    button.dataset.image = selector.value;
    button.setAttribute('aria-label','放大'+label);
    const img = button.querySelector('img');
    img.src = selector.value;
    img.alt = label;
  });
  document.addEventListener('keydown',e=>{
    const open=document.querySelector('.modal.open');
    if(e.key==='Escape'){if(open){e.preventDefault();closeModals();}return;}
    if(open){if(e.key==='Tab'){const f=Array.from(open.querySelectorAll('button,a,select')).filter(x=>!x.disabled);if(f.length&&e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus();}else if(f.length&&!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus();}}return;}
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if((e.key===' '&&document.activeElement?.tagName==='BUTTON')||e.ctrlKey||e.metaKey||e.altKey)return;
    if(['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(current+1);}
    else if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(current-1);}
    else if(e.key==='Home'){e.preventDefault();show(0);}else if(e.key==='End'){e.preventDefault();show(slides.length-1);}
    else if(e.key.toLowerCase()==='o')openModal('overview-modal');
    else if(e.key.toLowerCase()==='f')fullscreen();
    else if(e.key.toLowerCase()==='t')toggleTimer();
  });
  const svg=$('motion-svg'),NS='http://www.w3.org/2000/svg';
  function element(tag,attrs,parent=svg){const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));parent.appendChild(el);return el;}
  const points=arr=>arr.map(x=>x.join(',')).join(' ');
  for(let x=40;x<=76;x+=5)element('line',{x1:x,y1:-48,x2:x,y2:-8,stroke:'#e3e9e6','stroke-width':'.06'});
  for(let y=-48;y<=-8;y+=5)element('line',{x1:40,y1:y,x2:76,y2:y,stroke:'#e3e9e6','stroke-width':'.06'});
  MOTION.trees.forEach(([x,y,r,crownRadius,treeId])=>{element('circle',{cx:x,cy:y,r:crownRadius,fill:'#80ac83',stroke:'#426c4b','stroke-width':'.08','data-tree':treeId});element('circle',{cx:x,cy:y,r,fill:'none',stroke:'#af5146','stroke-width':'.09','stroke-dasharray':'.35 .25'});element('circle',{cx:x,cy:y,r:'.16',fill:'#203640'});});
  const bayEls={};
  MOTION.bays.forEach(b=>{bayEls[b.id]=element('polygon',{points:points(b.corners),fill:'#f0f4f1',stroke:'#7b8c89','stroke-width':'.11'});const cx=b.corners.slice(0,4).reduce((s,a)=>s+a[0],0)/4,cy=b.corners.slice(0,4).reduce((s,a)=>s+a[1],0)/4;const label=element('text',{x:cx,y:cy,'font-size':'.72','text-anchor':'middle',fill:'#203640'});label.textContent=b.id.replace(/^N/,'C');});
  element('polyline',{points:points(MOTION.path),fill:'none',stroke:'#23725e','stroke-width':'.2'});
  const car=element('g',{'id':'animated-car'});
  element('rect',{x:'-.9',y:'-.9',width:'4.5',height:'1.8',rx:'.18',fill:'#c3d8db',stroke:'#183d43','stroke-width':'.12'},car);
  element('rect',{x:'.45',y:'-.68',width:'1.6',height:'1.36',rx:'.12',fill:'#f7faf9',stroke:'#35565b','stroke-width':'.07'},car);
  element('line',{x1:'2.8',y1:'-.65',x2:'2.8',y2:'.65',stroke:'#35565b','stroke-width':'.10'},car);
  function setCar(index){const [x,y,h]=MOTION.states[Math.min(index,MOTION.states.length-1)];car.setAttribute('transform',`translate(${x} ${y}) rotate(${h})`);}
  function clearance(){const row=MOTION.sensitivity.find(r=>r.margin_m===Number($('clearance').value));$('motion-count').textContent=`${row.surviving_count} / 7`;$('motion-ids').textContent='保留：'+row.ids.map(id=>id.replace(/^N/,'C')).join('、');MOTION.bays.forEach(b=>{const yes=row.ids.includes(b.id);bayEls[b.id].setAttribute('fill',yes?'#dcebe3':'#f8f8f6');bayEls[b.id].setAttribute('stroke',yes?'#23725e':'#bac2bf');});}
  $('clearance').addEventListener('change',clearance);
  function frame(now){if(!animating)return;const duration=16000,phase=Math.min(1,(now-playStarted)/duration);const reverse=phase>.5;const u=reverse?2*(1-phase):2*phase;setCar(Math.round(u*(MOTION.states.length-1)));$('motion-phase').textContent=phase>=1?'重放结束':reverse?'原轨迹倒出':'沿原轨迹驶入';if(phase>=1){stopMotion();return;}animation=requestAnimationFrame(frame);}
  $('play-motion').addEventListener('click',()=>{if(animating){stopMotion();$('motion-phase').textContent='动画已暂停，点击重新播放';return;}if(reduced){setCar(MOTION.states.length-1);$('motion-phase').textContent='减少动态模式：显示终点姿态';return;}animating=true;playStarted=performance.now();$('play-motion').textContent='停止播放';animation=requestAnimationFrame(frame);});
  window.addEventListener('resize',layout);window.addEventListener('fullscreenchange',layout);
  const hash=Number(location.hash.slice(1));show(Number.isFinite(hash)&&hash>=1&&hash<=slides.length?hash-1:0);
  if(new URLSearchParams(location.search).has('print'))document.body.classList.add('print-mode');
  setCar(0);clearance();layout();updateTimer();setInterval(updateTimer,200);
  window.presentationState=()=>({slide:current+1,elapsed:timerNow(),running,animationRunning:animating});
})();
