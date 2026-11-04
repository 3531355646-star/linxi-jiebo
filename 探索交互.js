(() => {
  'use strict';
  const style = document.createElement('style');
  style.textContent = `
  .slide.active .slide-header{animation:reveal .45s ease both}.slide.active .figure{animation:reveal .65s ease both}
  @keyframes reveal{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .explore-launch{margin-top:18px;display:flex;gap:8px;flex-wrap:wrap}.explore-launch button{font:inherit;font-size:16px;padding:9px 13px;border:1px solid #b8cec5;background:#f2f7f4;color:#23725e;border-radius:4px}
  #explore-dialog{border:0;padding:0;width:min(1240px,94vw);max-height:92vh;color:#203640;border-radius:10px;box-shadow:0 24px 80px #0006}#explore-dialog::backdrop{background:#102329da}
  .explore-top{position:sticky;top:0;background:#fff;z-index:2;padding:20px 26px;border-bottom:1px solid #dae3e4;display:flex;justify-content:space-between;gap:12px;align-items:center}.explore-top h2{font-size:23px;margin:0}.explore-top button,.explore-tabs button{padding:9px 15px;border:1px solid #bdcfc8;background:white;color:#23725e;border-radius:5px;font:inherit;cursor:pointer}
  .explore-tabs{display:flex;gap:8px;padding:16px 26px;background:#f4f7f5;flex-wrap:wrap}.explore-tabs button[aria-selected=true]{background:#23725e;color:white}.explore-content{padding:24px 26px}.explore-content p{line-height:1.8}.explore-content h3{margin:0 0 14px;font-size:23px}.lab-grid{display:grid;grid-template-columns:300px 1fr;gap:30px}.lab-control{background:#f4f7f5;padding:20px;border-radius:6px}.lab-control label{display:block;margin:0 0 17px;line-height:1.8;font-size:14px}.lab-control input[type=range]{display:block;width:100%;accent-color:#23725e}.lab-control output{float:right;font-weight:bold;font-variant-numeric:tabular-nums}.lab-result{font-size:40px;font-weight:bold;color:#23725e;margin:10px 0}.lab-note{font-size:13px;color:#667880;border-top:1px solid #dbe4df;padding-top:12px}.lab-chart{width:100%;display:block;background:#fafcfb;max-height:330px}.lab-formula{font-family:Consolas,monospace;font-size:16px;padding:12px;background:#edf3f0}.lab-check{padding:12px 0;border-bottom:1px solid #dae3e4}.lab-check input{accent-color:#23725e}.lab-status{padding:20px;background:#edf3f0;font-size:21px;line-height:1.7;border-left:4px solid #23725e}.process-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.process-grid figure{margin:0;border:1px solid #dae3e4;padding:15px}.process-grid img{width:100%;display:block;cursor:zoom-in}.process-grid figcaption{font-size:14px;line-height:1.8;margin-top:10px}.process-step{color:#23725e;font-size:13px;font-weight:bold;letter-spacing:.1em}.process-route{display:flex;gap:12px;margin:0 0 25px;flex-wrap:wrap}.process-route span{border-bottom:2px solid #23725e;padding:10px 8px;font-size:14px}.lab-reset{margin-top:15px;padding:8px 15px;background:#fff;border:1px solid #a8bdb3;cursor:pointer}.explore-content table{border-collapse:collapse;width:100%;font-size:14px;margin-top:10px}.explore-content td,.explore-content th{padding:8px;border-bottom:1px solid #dbe4df;text-align:right}.explore-content th:first-child,.explore-content td:first-child{text-align:left}
  @media(max-width:700px){.lab-grid,.process-grid{grid-template-columns:1fr}.explore-top{padding:15px}.explore-top h2{font-size:18px}.explore-content{padding:16px}.chrome{height:auto;min-height:48px}.chrome-actions{flex-wrap:wrap}.lab-result{font-size:30px}}
  @media(prefers-reduced-motion:reduce){.slide.active .slide-header,.slide.active .figure{animation:none}}
  @media print{.explore-launch,#explore-dialog{display:none!important}}
  `;
  document.head.append(style);
  const dialog = document.createElement('dialog'); dialog.id='explore-dialog';
  dialog.setAttribute('aria-labelledby','explore-title');
  dialog.innerHTML='<div class="explore-top"><h2 id="explore-title">设计过程与实时实验</h2><button id="explore-close">返回汇报 ×</button></div><nav class="explore-tabs" aria-label="探索内容"></nav><div class="explore-content"></div>';
  document.body.append(dialog);
  const content=dialog.querySelector('.explore-content');
  const tabs=[['process','过程图册'],['demand','需求守恒'],['pressure','承载压力'],['gate','启用判定']];
  dialog.querySelector('.explore-tabs').innerHTML=tabs.map(([id,t])=>`<button data-tab="${id}" aria-selected="false">${t}</button>`).join('');
  let returnFocus;
  function close(){dialog.close();returnFocus?.focus();}
  dialog.querySelector('#explore-close').onclick=close;
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('cancel',()=>{returnFocus?.focus();});
  // The presentation's global shortcuts must not change slides while editing a laboratory.
  document.addEventListener('keydown',e=>{if(dialog.open)e.stopImmediatePropagation();},true);
  function open(tab){returnFocus=document.activeElement;render(tab);if(!dialog.open)dialog.showModal();}
  dialog.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>render(b.dataset.tab));
  const b=document.createElement('button');b.textContent='过程 / 实验';b.type='button';b.id='explore-btn';b.onclick=()=>open('process');document.querySelector('.chrome-actions').insertBefore(b,document.getElementById('fullscreen-btn'));
  document.querySelectorAll('.slide:not(.cover) .points').forEach((list,i)=>{
    const holder=document.createElement('li');holder.className='explore-launch';holder.style.cssText='padding:0;margin-top:20px';
    const process=document.createElement('button');process.textContent='展开过程图册';process.onclick=()=>open('process');holder.append(process);
    const index=i+1;const target=index===6?'pressure':index===8?'demand':index===2||index===7?'gate':null;
    if(target){const calc=document.createElement('button');calc.textContent='参数实时演算 ↗';calc.onclick=()=>open(target);holder.append(calc);}
    list.append(holder);
  });
  const slider=(id,title,min,max,step,value,unit)=>`<label for="${id}">${title}<output id="${id}-value"></output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-unit="${unit}"></label>`;
  const val=id=>Number(document.getElementById(id).value);
  function bind(update){content.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{labels();update();}));content.querySelector('.lab-reset').onclick=()=>render(activeTab);labels();update();}
  function labels(){content.querySelectorAll('input[type=range]').forEach(el=>{document.getElementById(el.id+'-value').textContent=el.value+' '+el.dataset.unit;});}
  let activeTab='process';
  function render(tab){activeTab=tab;dialog.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));if(tab==='process')process();else if(tab==='pressure')pressure();else if(tab==='demand')demand();else gate();}
  function process(){
    const cards=[
      ['01 / 先识别场地','02_真实场地证据.png','10.29反馈：场地有多少树、林下能否进入，不能由几个假设树点代替。','回到课程卫星影像与DXF，区分真实道路、水系、林缘证据与尚未实测的树位。'],
      ['02 / 从就近扩展到多条件选址','附图_01_真实影像与选址证据.png','10.29反馈：靠近原停车场有利于管理，但只是选址因素之一。','先辨识候选林隙，再叠加接入、岸线、保育与步行条件；保留外部分流选项。'],
      ['03 / 用对照实验解释林隙','05_净空与选位.png','相同树木数量，为什么可进入空间不同？','控制树木数量与场地尺度，比较均匀与聚集配置。净空比例是中心采样结果，不是车位容量。'],
      ['04 / 从排布示意到约束复核','附图_03_约束叠加与情景比较.png','旧方案必须说明道路例外如何影响结果。','并列严格岸线约束与道路例外情景，避免把“允许进入”的假设藏在结果里。'],
      ['05 / 用路径证明能否进出','06_轨迹与安全余量.png','车位画得下，不等于车辆能驶入。','重建7条固定轨迹；余量0.30 / 0.40 / 0.50m时分别保留7 / 4 / 2条。属于离线复核，不是实时路径规划。'],
      ['06 / 从停车节点到可撤系统','代表图02_节点与响应周期.png','设计还需要回答怎么铺、怎么撤、如何再次开放。','以轮迹构件、完整通行防护和配对监测串联部署—使用—撤收—复查；压力实验只展示理想均布关系。']
    ];
    content.innerHTML='<h3>将质疑转化为可以检查的设计步骤</h3><p>以下按1029课程评价整理。每一步连接问题、证据与方案修正；点击图纸可在新窗口查看原图。</p><div class="process-route"><span>现状证据</span><span>林隙筛选 →</span><span>约束与轨迹 →</span><span>可撤构件 →</span><span>监测再开放</span></div><div class="process-grid">'+cards.map(([step,img,q,a])=>`<figure><div class="process-step">${step}</div><a href="图纸/${img}" target="_blank" rel="noopener"><img src="图纸/${img}" alt="${step}" loading="lazy"></a><figcaption><strong>${q}</strong><br>${a}</figcaption></figure>`).join('')+'</div><p class="lab-note">依据：1029课程评价、原始影像与DXF、10.29方案计算及本次轨迹复核。影像不用于推断精确树干位置，假设情景不作为实测容量。</p>';
  }
  function pressure(){content.innerHTML='<h3>承载面积如何改变理想平均压力？</h3><div class="lab-grid"><div class="lab-control">'+slider('mass','车辆总质量',1000,3500,50,2000,'kg')+slider('area','单轮有效承载面积',.02,.6,.01,.3,'m²')+'<button class="lab-reset">恢复示例</button></div><div><div id="pressure-result" class="lab-result" aria-live="polite"></div><svg id="pressure-chart" class="lab-chart" viewBox="0 0 680 300" role="img" aria-label="承载面积与理想平均压力关系"></svg><p class="lab-formula">F = m × 9.81 / 4；p = F / A / 1000（kPa）</p><p id="pressure-detail"></p></div></div><p class="lab-note">四轮均分静载、均匀接触的教学模型。有效面积需由结构及接地试验确定；面积增加不能直接证明土壤安全。未计算动载、板件刚度、局部应力和土壤沉陷；图中不设置无依据的安全阈值。</p>';
    bind(()=>{const m=val('mass'),a=val('area'),f=m*9.81/4,p=f/a/1000;document.getElementById('pressure-result').textContent=p.toFixed(2)+' kPa';document.getElementById('pressure-detail').textContent=`单轮荷载 ${f.toFixed(1)} N。相对0.02m²接触面积的理想平均压力下降 ${(100*(1-.02/a)).toFixed(1)}%。`;
    const max=f/.02/1000;const x=a=>60+(a-.02)/.58*570,y=p=>245-p/max*210;
    let pts=[];for(let i=0;i<=116;i++){const a=.02+i*.005;pts.push(`${x(a)},${y(f/a/1000)}`);}
    document.getElementById('pressure-chart').innerHTML=`<path d="M60 30V245H640" fill="none" stroke="#9baea5"/><text x="60" y="20" font-size="14">p / kPa · 最大刻度 ${max.toFixed(1)}</text><text x="500" y="282" font-size="14">有效承载面积 / m²</text><text x="55" y="265" font-size="13">0.02</text><text x="620" y="265" font-size="13">0.60</text><polyline points="${pts.join(' ')}" fill="none" stroke="#23725e" stroke-width="3"/><path d="M${x(a)} 245V${y(p)}H60" fill="none" stroke="#a47b37" stroke-dasharray="5 5"/><circle cx="${x(a)}" cy="${y(p)}" r="6" fill="#a47b37"/><text x="${Math.min(500,x(a)+12)}" y="${Math.max(55,y(p)-15)}" font-size="18" fill="#23725e">${p.toFixed(2)} kPa</text>`;window.labState={tab:'pressure',mass:m,area:a,force:f,pressure:p};});
  }
  function demand(){content.innerHTML='<h3>到达、离开与既有承接的守恒关系</h3><div class="lab-grid"><div class="lab-control">'+slider('initial','初始需求',0,40,1,10,'辆')+slider('arrival','到达倍率',0,2,.1,1,'倍')+slider('existing','既有停车承接',0,50,1,20,'辆')+slider('divert','外部分流承接',0,30,1,5,'辆')+'<button class="lab-reset">恢复示例</button></div><div><div class="lab-result" id="demand-result" aria-live="polite"></div><svg id="demand-chart" class="lab-chart" viewBox="0 0 680 300" role="img" aria-label="五个时点的需求与承接量"></svg><div id="demand-table"></div><p class="lab-formula">D = Qₜ + Iₜ；O实 = min(O计划, D)；Qₜ₊₁ = D − O实<br>缺口 = max(0, Q − 既有承接 − 外部分流)</p></div></div><p class="lab-note">示例小时到达8、12、10、4辆，计划离开3、4、5、9辆；到达倍率后四舍五入。离开量受实际存量限制，防止负库存。缺口表示待管理需求，不会自动转化为林地车位，也未模拟排队、车位周转或实际交通。</p>';
    bind(()=>{const arrivals=[8,12,10,4].map(n=>Math.round(n*val('arrival'))),planned=[3,4,5,9],q=[val('initial')],out=[];arrivals.forEach((n,i)=>{out[i]=Math.min(planned[i],q[i]+n);q.push(q[i]+n-out[i]);});const capacity=val('existing')+val('divert'),gaps=q.map(n=>Math.max(0,n-capacity)),peak=Math.max(...gaps);document.getElementById('demand-result').textContent=`峰值待管理缺口 ${peak} 辆`;
      const max=Math.max(10,...q,capacity)*1.15,x=i=>60+i*140,y=n=>245-n/max*205;
      document.getElementById('demand-chart').innerHTML=`<path d="M60 30V245H640" fill="none" stroke="#9baea5"/><text x="60" y="20" font-size="14">需求 / 辆</text><line x1="60" y1="${y(capacity)}" x2="640" y2="${y(capacity)}" stroke="#a47b37" stroke-dasharray="7 5"/><text x="380" y="${y(capacity)-9}" font-size="14">承接合计 ${capacity} 辆</text><polyline points="${q.map((n,i)=>`${x(i)},${y(n)}`).join(' ')}" fill="none" stroke="#23725e" stroke-width="3"/>`+q.map((n,i)=>`<circle cx="${x(i)}" cy="${y(n)}" r="5" fill="#23725e"/><text x="${x(i)}" y="${y(n)-12}" text-anchor="middle" font-size="16">${n}</text><text x="${x(i)}" y="273" text-anchor="middle" font-size="14">${i}h</text>`).join('');
      document.getElementById('demand-table').innerHTML='<table><tr><th>时点</th>'+q.map((_,i)=>`<th>${i}h</th>`).join('')+'</tr><tr><td>未分配需求</td>'+q.map(n=>`<td>${n}</td>`).join('')+'</tr><tr><td>待管理缺口</td>'+gaps.map(n=>`<td>${n}</td>`).join('')+'</tr></table>';window.labState={tab:'demand',arrivals,departures:out,q,capacity,gaps,peak};});
  }
  function gate(){const checks=[['need','既有承接与外部分流后仍有缺口'],['survey','树位、根区与完整车辆路径已现场核验'],['ground','地面干燥稳定，承载与构件已验证'],['people','独立步行、安全引导和撤收条件已落实'],['recover','配对监测支持本轮开放']];content.innerHTML='<h3>响应不是自动扩容，而是满足条件后才部署</h3><div class="lab-grid"><div class="lab-control">'+checks.map(([id,t])=>`<label class="lab-check"><input type="checkbox" id="gate-${id}" ${id==='need'?'checked':''}> ${t}</label>`).join('')+'<button class="lab-reset">恢复未核验状态</button></div><div><div id="gate-result" class="lab-status" aria-live="polite"></div><svg class="lab-chart" viewBox="0 0 680 300" aria-label="启用逻辑流程" role="img"><path d="M65 150H615" stroke="#aec3b8" stroke-width="3"/>'+['需求','现场','承载','组织','监测'].map((t,i)=>`<circle id="gate-node-${i}" cx="${65+i*135}" cy="150" r="32" fill="#e8eeeb" stroke="#9aac9f"/><text x="${65+i*135}" y="156" text-anchor="middle" font-size="17">${t}</text>`).join('')+'</svg><p>任一条件不满足：保持关闭、调整组织或外部分流。全部勾选：仅表示本演示的逻辑条件通过。</p></div></div><p class="lab-note">勾选由使用者手动输入，不连接实时传感器；本页面不能替代现场核验、专业评估或管理许可。课程现有材料不足以确认这些条件，默认保持未核验状态。</p>';
    bind(()=>{const states=checks.map(([id])=>document.getElementById('gate-'+id).checked),missing=checks.filter((_,i)=>!states[i]).map(([,t])=>t);document.getElementById('gate-result').textContent=missing.length?`暂不部署 · ${states.filter(Boolean).length}/5 项通过。待确认：${missing.join('；')}。`:'5/5 条件通过 · 可进入部署准备评审（演示输入）';states.forEach((ok,i)=>document.getElementById('gate-node-'+i).setAttribute('fill',ok?'#b9d9c9':'#e8eeeb'));window.labState={tab:'gate',passed:states.filter(Boolean).length,eligible:missing.length===0};});
  }
})();
