(() => {
  'use strict';
  const groups = [
    { title:'Today · late 2025 observed mix', rows:[['Programming / coding',50,'#4ca6d8'],['Roleplay / creative',33,'#9a7bdc'],['Technology / other',17,'#52636f']] },
    { title:'Steady state · 2029 model', rows:[['Software engineering',32,'#4ca6d8'],['Data analytics & engineering',20,'#50c878',true],['Enterprise productivity',18,'#e7b74f'],['Customer-facing AI',15,'#ef6f6c'],['Creative / entertainment',10,'#9a7bdc'],['Legal / medical / research',5,'#52636f']] }
  ];
  document.getElementById('mix-bars').innerHTML = groups.map(group => `<div class="bar-group"><h3>${group.title}</h3>${group.rows.map(([label,value,color,analytics]) => `<div class="bar-row${analytics?' analytics':''}"><span class="bar-label">${analytics?'★ ':''}${label}</span><span class="bar-track"><span class="bar" style="width:${value}%;background:${color}">${value >= 15 ? `${value}%` : ''}</span></span><span class="bar-value">${value}%</span></div>`).join('')}</div>`).join('');
  const total=document.getElementById('total-tokens'), share=document.getElementById('analytics-share'), price=document.getElementById('token-price');
  const totalOutput=document.getElementById('total-output'), shareOutput=document.getElementById('share-output'), priceOutput=document.getElementById('price-output');
  const formula=document.getElementById('formula'), spend=document.getElementById('spend'), tokens=document.getElementById('analytics-tokens');
  function update() {
    const totalQ=Number(total.value), sharePct=Number(share.value), pricePerM=Number(price.value);
    const analyticsQ=totalQ*sharePct/100;
    const spendB=analyticsQ*pricePerM;
    totalOutput.textContent=`${totalQ.toLocaleString()} Q/yr`; shareOutput.textContent=`${sharePct}%`; priceOutput.textContent=`$${pricePerM.toFixed(2)}`;
    formula.textContent=`${totalQ.toLocaleString()}Q × ${sharePct}% × $${pricePerM.toFixed(2)}/M`;
    tokens.textContent=`${Number.isInteger(analyticsQ)?analyticsQ:analyticsQ.toFixed(1)}Q`;
    spend.textContent=spendB >= 1000 ? `$${(spendB/1000).toFixed(2)}T` : `$${Number.isInteger(spendB)?spendB:spendB.toFixed(1)}B`;
  }
  [total,share,price].forEach(input=>input.addEventListener('input',update));
  update();
})();
