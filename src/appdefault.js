let init_time = new Date().getTime()/1000;

let requireWtf = require;//globalThisWtf.require;
let process = requireWtf('process');//globalThisWtf.process;

let {o2s,s2o,tryx,tryp,myfetch,fs,date,now,md5,md5_ascii,tryRequire,gzip2s,jPath,jPathAsync,urlModule,safe,qstr,get_timestamp,get_time_iso,get_time_YmdHMS,jeval } = require('../docs/myes');
//let mydirname = require('path').dirname(__filename);//__dirname
//let myfilename = ()=>require('path').basename(__filename);
//let myfiletime= ()=>fs.statSync(__filename).mtime;
//?(async()=>a2csv(await%20bk.showTable`TBL_ITEM`))
//?a2csv(_.bk.showTable`TBL_ITEM`)
async function a2csv(a) {
  a = await a;
  let s='';
  for (let row of a){
    s+=row.join('\t')+'\n'
  }
  return s
}
//?a2tbl(_.bk.showTable`TBL_ITEM`)
async function a2tbl(a) {
  if (typeof a=='function') a = a()
  a = await a;
  let s='<table border=1>';
  for (let row of a){
    //s+='<tr><td>'+ row.join('</td><td>')+'</td></tr>'
    s+='<tr>';
    for (let cell of row){
      if (cell instanceof Date) s+='<td>' + get_time_YmdHMS(cell)+'</td>';
      else s+='<td>'+cell+'</td>';
    }
    s+'</tr>';
  }
  s+='</table>'
  return s
}

let reload = (x='app'+app_id,clear=true)=>{let mm = tryRequire('../src/'+x,clear); return (mm&&mm.init_time)?mm.init_time:typeof(mm)};

const { isMainThread,parentPort, workerData } = require('worker_threads');
if (!isMainThread){
  (async function(options){
    const reqHeaders = options.headers || {};
    const acceptEncoding = reqHeaders['accept-encoding'];
    const hasGzip = acceptEncoding && acceptEncoding.includes('gzip');
    var headers = {
      "Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,OPTIONS,GET,DELETE","Access-Control-Allow-Headers":"*",
      //'Content-Type':'application/json;charset=utf-8',
    };
    var data=null;
    let statusCode = '200';
    let {jevalx,jevalx_raw,X,S_SETUP} = require('./jevalx')
    let {url,body,argo,fk_idx,fk_pid,main_pid,module_init_time} = options;

//?(async()=>(await%20_("math","tmp3"))())
//?(async()=>(await%20_.math.tmp3)())
//?$(_.math,"tmp")
//?$(_,"math/tmp")
//TODO await _.math.tmp3()?

const moduleCache = {};
async function __(moduleName, propertyName) {
    if (!moduleCache[moduleName]) {
        try {
            let module = await tryRequire(`../src/api${moduleName}`, false, console.error);
            if (typeof module === 'function') {
                module = await module(options);
            }
            moduleCache[moduleName] = module;
        } catch (error) {
            console.error('Error loading module:', moduleName, error);
            throw error;
        }
    }
    const module = moduleCache[moduleName];
    return module[propertyName];
}

    let ctx = {
//init_time,module_init_time,
//fk_idx,fk_pid,main_pid,

a2csv,a2tbl,type:(v)=>typeof(v),
//Math,Date,__,
$:jPathAsync,//e.g. $(news.history_o(945629),'data'),$(math,%27tmp%27)
//wkr_pid:process.pid,
}

//mydirname,
//md5,md5_ascii,o2s,s2o,a2csv,a2tbl,now,safe,qstr,get_time_iso,get_time_YmdHMS,get_timestamp,reload,
//app_id,myfilename,myfiletime,argo,

//  let url_rest_o = urlModule.parse(url);
//  let sid = url_rest_o.pathname;//TOOO FOR SESSION
//  let url_hash = url_rest_o.hash;
////web3 testing on ipfs-net:
////QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
//    test_w3_readme:async()=>{
//      let {data,headers:fetched_headers} = await myfetch('http://127.0.0.1:8080/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme');
//      headers['content-type'] = fetched_headers['content-type'];
//      return data.toString();
//    },
////bafkreicysg23kiwv34eg2d7qweipxwosdo2py4ldv42nbauguluen5v6am
//    test_w3_ping:async()=>{
//      let s = fs.readFileSync('ipfs.json');
//      let a = jeval(s);
//      let rt = [];
//      for (let v of a){
//        let t1=now();
//        let {data,headers:fetched_headers} = await myfetch(v[0]);
//        let t2=now();
//        rt.push(['hello\n'==data.toString(),t2-t1]);
//      }
//      return rt;
//    },

    let rst;
    try{

let apis = new Set((argo.apis||'math').split(','));

let _ctx = new X;
//_ctx.init_time = init_time;

let _ = new Proxy(_ctx,{get(target,prop,receiver){ if (prop in ctx) return ctx[prop];
if(apis.has(prop)){return new Proxy(new X,{get(target2,prop2,receiver2){ return __(prop,prop2)}})}
if (_ctx[prop]) return _ctx[prop];
if ('init_time'==prop) return init_time;
if ('module_init_time'==prop) return module_init_time;
if ('fk_pid'==prop) return fk_pid;
if ('fk_idx'==prop) return fk_idx;
if ('main_pid'==prop) return main_pid;
console.error('DEBUG',prop);
}});

//plan A: do the magic from _
ctx._ = _;
//rst = await jevalx(body,ctx);

//plan B: root Proxy as _
let ctxx= require('vm').createContext(_);
await jevalx_raw(S_SETUP,ctxx);
ctx.evalx = (js)=>jevalx_raw(js,ctxx)[1];//L0
ctx.console = console;//FOR DEBUG
ctx.Math = Math;
rst = await jevalx(body,ctxx);
////

      //console.error(body,'=>',typeof rst,rst);
      if (typeof rst=='undefined') rst = null;
      else{ delete rst['Infinity']; delete rst['NaN']; }
    }catch(ex_evalx){
      //console.error(body,'!!=>',ex_evalx);
      let {message,code,js,ex,id} = ex_evalx;
      rst = {message,code,id}
    }
    data = rst;
//TODO binary ...
    if (typeof data=='string') {
      headers['Content-Type']='text/html;charset=utf-8';
    }else{
      data=JSON.stringify(data);//
      headers['Content-Type']='application/json;charset=utf-8';
    }
    console.error(fk_pid, body,'=>',data);
    if (hasGzip && data) {
        headers['Content-Encoding']='gzip';
        data = await gzip2s(data)
    }
    return {data,headers,statusCode};
  })(workerData).then(rst=>parentPort.postMessage(rst)).catch(err=>parentPort.postMessage(err));
}else{//@see server.js
  //TODO pooling for workers ;)
  module.exports = async(Application={})=>{
    let {req,res,url,body,argo,app_id,reqHOST,reqPORT,process_pid}=Application;
    let fk_idx = process.env.fk_idx;
    let fk_pid = process.pid;
    let main_pid = process.env.main_pid;
    let module_init_time = init_time;
    return await myfetch('worker://./app'+app_id,{url,body,headers:req.headers,argo,timeout:6999,fk_idx,fk_pid,main_pid,module_init_time});
  };
}
