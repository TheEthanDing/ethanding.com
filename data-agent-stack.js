(() => {
  'use strict';
  const P = {
    sf:['Snowflake','#29B5E8',['run any SQL over HTTP','resize and pause compute to manage cost','schedule native SQL jobs','maintain incremental transforms','continuously ingest files','read what each role can access','see the credits it is burning','turn plain-English questions into governed SQL','semantically search your text','expose Cortex tools to your agent']],
    dbx:['Databricks','#FF4136',['ask your data questions in plain English','write and run SQL to build pipelines itself','call governed business logic as tools','run LLMs over your data','create and refresh ETL pipelines','schedule and trigger workflows','query any table over HTTP','spin compute up and down to control cost','read tables and who can touch them','trace where data came from']],
    bq:['BigQuery','#4285F4',['run SQL at petabyte scale','stream table data out fast','manage datasets and tables','train models right in SQL','call governed UDFs and routines','read who can access each dataset','see bytes scanned and what it cost']],
    rs:['Redshift','#C56B4A',['run SQL over HTTP with no driver','manage tables and schemas','query data straight from S3','tune queues to control cost','read object-level grants','see query history and usage']],
    ft:['Fivetran','#7C5CFF',['create and configure source pipelines','trigger or rebuild a load','choose which tables and columns flow','check whether a pipeline is healthy','read sync logs to diagnose failures','react to sync success or failure']],
    dbt:['dbt','#FF694B',['kick off a dbt run','poll status and read results','read your whole model graph and lineage','target dev or prod safely','query governed metrics, not raw tables','get metrics, SQL, and lineage as tools']],
    af:['Airflow','#46B27A',['read every pipeline in your estate','kick off any workflow','inspect and retry failed steps','manage concurrency and config','pass state between tasks','see what each pipeline reaches into']],
    ht:['Hightouch','#F0643C',['push modeled data back to business tools','define the audience or record to send','read straight from the warehouse','reach Salesforce, ad tools, and more','trigger and monitor activation']],
    tab:['Tableau','#2EC4B6',['query a governed source headlessly','read the data behind dashboards','keep extracts fresh','trace lineage across the BI layer','check who can view each dashboard','read your metrics and how they move']],
    pbi:['Power BI','#F2C811',['query datasets with DAX','read and refresh semantic models','read what users actually see','run Power Query ETL','map lineage and sensitivity across tenants','respect row-level security']],
    col:['Collibra','#D7468A',['find the right certified asset','trace upstream and downstream impact','resolve business terms to real columns','know what’s PII before acting','read the rules that bind the agent']],
    mc:['Monte Carlo','#9B6CF0',['know the moment data breaks','watch freshness, volume, and schema','see what a broken table affects','judge whether data is trustworthy','get alerted before users do']],
    ok:['Okta','#2D7FF0',['resolve who is actually asking','map a person to their entitlements','act on-behalf-of the requester','audit every access for compliance','respect the policies that gate access']],
    ora:['Oracle','#E0A52E',['query the system of record','call decades of PL/SQL business logic','discover schemas and constraints','read who can see what','maintain pre-aggregated views','understand load and cost'],true],
    mss:['SQL Server','#E0A52E',['read the operational database','call existing stored procedures','discover schema and lineage','read object-level permissions','trigger existing SQL Agent jobs','see what ran and how it performed'],true],
    sap:['SAP','#E0A52E',['read from the system of record via OData/RFC','query modeled CDS business data','respect SAP’s own authorization objects','pull data out in bulk','reach core ECC / S4 tables'],true]
  };
  const B = [
    ['Cloud warehouse & lakehouse','where your data lives',['sf','dbx','bq','rs'],'First — every place your data lives.'],
    ['Move · shape · orchestrate · activate','the pipelines',['ft','dbt','af','ht'],'Then everything that <b>moves and shapes</b> it.'],
    ['BI & metrics','what humans actually see',['tab','pbi'],'Then everything that <b>shows</b> it to people.'],
    ['Trust & access','catalog · observability · identity',['col','mc','ok'],'Then the layer that says what’s <b>trustworthy</b> — and <b>who’s allowed</b> to see it.'],
    ['Legacy / on-prem','the systems of record you can’t rip out',['ora','mss','sap'],'And underneath it all — the <b>systems of record you can’t move.</b>',true]
  ];
  const wall=document.getElementById('wall'), wires=document.getElementById('wires'), agent=document.getElementById('agent');
  const num=document.getElementById('num'), unit=document.getElementById('unit'), narr=document.getElementById('narr'), cap=document.getElementById('cap');
  const layer=document.getElementById('layer'), fix=document.getElementById('fixbtn');
  const records=[], bandEls=[], timers=[];
  const ns='http://www.w3.org/2000/svg';

  B.forEach((band, bandIndex) => {
    const section=document.createElement('section');
    section.className=`band${band[4]?' legacy':''}`;
    section.innerHTML=`<div class="band-label">${band[0]} <small>${band[1]}</small></div>`;
    band[2].forEach(key => {
      const platform=P[key], block=document.createElement('div');
      block.className='platform';
      block.innerHTML=`<div class="platform-head"><span class="dot" style="background:${platform[1]}"></span><span class="platform-name" style="color:${platform[1]}">${platform[0]}</span><span class="count">${platform[2].length}</span>${platform[3]?'<span class="badge">on-prem</span>':''}</div>`;
      const chips=document.createElement('div'); chips.className='chips';
      platform[2].forEach(text => {
        const button=document.createElement('button');
        button.className=`chip${platform[3]?' legacy':''}`;
        button.style.setProperty('--c',platform[1]); button.textContent=text; button.type='button';
        const record={button,key,text,path:null,on:false};
        button.addEventListener('pointerenter',()=>highlight(record)); button.addEventListener('pointerleave',clearHighlight);
        button.addEventListener('focus',()=>highlight(record)); button.addEventListener('blur',clearHighlight);
        chips.appendChild(button); records.push(record);
      });
      block.appendChild(chips); section.appendChild(block);
    });
    wall.appendChild(section); bandEls.push(section);
  });
  records.forEach(record => {
    const path=document.createElementNS(ns,'path');
    path.setAttribute('stroke',P[record.key][1]); path.setAttribute('stroke-width','1'); path.setAttribute('opacity','0');
    wires.appendChild(path); record.path=path;
  });
  const layerPaths=document.createElementNS(ns,'g'); wires.appendChild(layerPaths);
  let start={x:0,y:0}, coords=[], timerIds=[];

  function cache() {
    const box=agent.querySelector('.core').getBoundingClientRect();
    start={x:box.right,y:box.top+box.height/2};
    coords=records.map(record=>{const r=record.button.getBoundingClientRect();return{x:r.left+window.scrollX,y:r.top+window.scrollY+r.height/2};});
  }
  function curve(a,b) { const k=Math.max(40,(b.x-a.x)*.45); return `M${a.x},${a.y} C${a.x+k},${a.y} ${b.x-k},${b.y} ${b.x},${b.y}`; }
  function redraw() { records.forEach((record,index)=>{if(record.on){const c=coords[index];record.path.setAttribute('d',curve(start,{x:c.x-window.scrollX,y:c.y-window.scrollY}));}}); }
  function setNarrative(html) { narr.style.opacity=0; const id=setTimeout(()=>{narr.innerHTML=html;narr.style.opacity=1;},150); timerIds.push(id); }
  function highlight(record) {
    cap.classList.add('lit'); cap.innerHTML=`<span class="pre">${P[record.key][0]}</span>Enable your agent to <span style="color:${P[record.key][1]}">${record.text}</span>`;
    records.forEach(item=>{if(item.on){const active=item===record;item.path.setAttribute('opacity',active?'1':'.05');item.path.setAttribute('stroke-width',active?'2.4':'1');item.button.classList.toggle('active',active);}});
  }
  function clearHighlight() { records.forEach(item=>{if(item.on){item.path.setAttribute('opacity','.22');item.path.setAttribute('stroke-width','1');item.button.classList.remove('active');}}); }
  function clearTimers() { timerIds.forEach(clearTimeout); timerIds=[]; }
  function reset() {
    clearTimers(); window.scrollTo(0,0); layer.classList.remove('show'); layerPaths.innerHTML=''; fix.classList.remove('pulse');
    records.forEach(record=>{record.on=false;record.button.classList.remove('on','active');record.path.setAttribute('opacity','0');});
    num.textContent='0'; num.classList.remove('hot'); unit.innerHTML='capabilities it must be granted';
    cap.classList.remove('lit'); cap.innerHTML='<span class="pre">on hover or focus</span>Choose any capability to see what it lets your agent <b>do</b>.';
  }
  function play() {
    reset(); cache(); setNarrative('You want <b>one agent</b> that can run your whole data estate…');
    records.forEach((record,index)=>timerIds.push(setTimeout(()=>{
      record.on=true; record.button.classList.add('on'); record.path.setAttribute('opacity','.22'); redraw(); num.textContent=String(index+1);
      const bandIndex=B.findIndex(band=>band[2].includes(record.key));
      const firstInBand=records.findIndex(item=>B[bandIndex][2].includes(item.key))===index;
      if(firstInBand){setNarrative(B[bandIndex][3]);bandEls[bandIndex].scrollIntoView({behavior:'smooth',block:'center'});}
      if(index===records.length-1) finish();
    },850+index*42)));
  }
  function finish() {
    timerIds.push(setTimeout(()=>{
      window.scrollTo({top:0,behavior:'smooth'}); num.classList.add('hot');
      unit.innerHTML='wires to build, secure, monitor &amp; keep alive — <b>forever</b>';
      setNarrative(`<b>${records.length} capabilities. One agent.</b> Every wire yours to own — across ${Object.keys(P).length} systems that don’t talk to each other.`); fix.classList.add('pulse');
    },600));
    timerIds.push(setTimeout(unify,4600));
  }
  function unify() {
    clearTimers(); fix.classList.remove('pulse'); window.scrollTo({top:0,behavior:'smooth'});
    records.forEach(record=>{if(record.on){record.path.setAttribute('opacity','.05');record.path.setAttribute('stroke-width','1');}}); layer.classList.add('show');
    setTimeout(()=>{
      cache(); const rect=layer.getBoundingClientRect(), left={x:rect.left,y:rect.top+rect.height/2}, right={x:rect.right,y:rect.top+rect.height/2}; layerPaths.innerHTML='';
      const add=(a,b,color)=>{const path=document.createElementNS(ns,'path');path.setAttribute('d',curve(a,b));path.setAttribute('stroke',color);path.setAttribute('stroke-width','2.6');path.setAttribute('opacity','.95');layerPaths.appendChild(path);};
      add(start,left,'#fff'); bandEls.forEach((band,index)=>{const rect=band.querySelector('.band-label').getBoundingClientRect();add(right,{x:rect.left,y:rect.top+rect.height/2},B[index][4]?'#E0A52E':P[B[index][2][0]][1]);});
    },250);
    num.classList.remove('hot'); num.textContent=String(Object.keys(P).length);
    unit.innerHTML='connectors. <b>One</b> auth model, <b>one</b> audit log, <b>one</b> place to govern what it sees &amp; spends.';
    setNarrative(`Same agent. Same powers. The sprawl moved <b>behind one boundary</b> — secured once, not ${records.length} times.`);
    cap.classList.remove('lit'); cap.innerHTML='<span class="pre">the point</span>The agent didn’t get simpler. <b style="color:#fff">The surface you govern did.</b>';
  }
  let ticking=false;
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{redraw();ticking=false;});}},{passive:true});
  window.addEventListener('resize',()=>{cache();redraw();});
  document.getElementById('replay').addEventListener('click',play); fix.addEventListener('click',unify);
  requestAnimationFrame(()=>requestAnimationFrame(play));
})();
