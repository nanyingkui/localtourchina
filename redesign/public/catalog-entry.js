(() => {
 const p=new URLSearchParams(location.search),lang=p.get('lang')||document.documentElement.lang,prefix=lang==='zh'?'/zh':lang==='en'?'/en':'',v=p.get('view');
 const routes={regular34:'34',regular45:'45',regular56:'56',trek34:'trek34',trek45:'trek45',trek56:'trek56',furong45:'45furong',fenghuang56:'56fh'};
 if(v==='furong'||p.has('reference')){location.replace('/legacy-flow.html'+location.search);return;}
 if(v==='recommendation'){fetch('/customer-catalog.json').then(r=>r.json()).then(c=>{const id=routes[p.get('route')]||'34';location.replace(c[id].paths[lang]||c[id].paths.ko);});return;}
 if(['consult','request'].includes(v))location.replace(prefix+'/private-tour.html');
})();