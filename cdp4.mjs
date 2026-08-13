import http from 'node:http';
const get = p => new Promise(r => http.get('http://127.0.0.1:9333'+p, x => { let d=''; x.on('data',c=>d+=c); x.on('end',()=>r(JSON.parse(d))); }));
const page = (await get('/json/list')).find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id=0; const pend=new Map();
const send=(m,p={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method:m,params:p}));});
ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result);pend.delete(m.id);}};
await new Promise(r=>ws.onopen=r);
for (const [file,label] of [['_base.html','pre-existing (40502f2)'],['index.html','current']]) {
  for (const w of [320,390]) {
    await send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:2,mobile:true});
    await send('Page.navigate',{url:'http://localhost:8899/'+file});
    await new Promise(r=>setTimeout(r,1500));
    const {result}=await send('Runtime.evaluate',{returnByValue:true,expression:
      `document.documentElement.scrollWidth + ' / ' + document.documentElement.clientWidth`});
    console.log(label.padEnd(24), 'vw='+w, 'scrollW/clientW =', result.value);
  }
}
ws.close(); process.exit(0);
