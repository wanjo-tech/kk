let init_time = new Date().getTime()/1000;
let module_exports = async(Application={})=>{
  let {req,res,url,body,argo,app_id,reqHOST,reqPORT,globalThisWtf,main_pid}=Application;

let requireWtf = require;//globalThisWtf.require;
let process = requireWtf('process');//globalThisWtf.process;

let fk_idx = process.env.fk_idx;
let fk_pid = process.env.pid;

let {o2s,s2o,tryx,tryp,myfetch,fs,date,now,md5,md5_ascii,tryRequire,gzip2s,jPath,jPathAsync,urlModule,safe,qstr,get_timestamp,get_time_iso,get_time_YmdHMS,jeval
} = require('../docs/myes')
let {jevalx} = require('./jevalx')
let mydirname = require('path').dirname(__filename);//__dirname
let myfilename = ()=>require('path').basename(__filename);
let myfiletime= ()=>fs.statSync(__filename).mtime;

/*
TEST CASES after /?
new Date().toLocaleDateString()
*/
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


  //SECURITY VULNERABLE ;)
  let reload = (x='app'+app_id,clear=true)=>{let mm = tryRequire('../src/'+x,clear); return (mm&&mm.init_time)?mm.init_time:typeof(mm)};

  const reqHeaders = req.headers;
  const acceptEncoding = reqHeaders['accept-encoding'];
  const hasGzip = acceptEncoding && acceptEncoding.includes('gzip');

  var headers = {
    //'Content-Type':'application/json;charset=utf-8',
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"POST, OPTIONS, GET, DELETE",
    "Access-Control-Allow-Headers":"*",
  }
  var data=null;//TODO let..
  let statusCode = '200';
  if (!url || url.startsWith('?')){
    headers['Content-Type']='text/html;charset=utf-8';
    data = Application.tryStaticFile(`${reqHOST}_${reqPORT}.htm`);//try this first
    if (data) return Application.fastReturn({statusCode,headers,data});

    let fwd_url = `${argo.static||''}index.html`;//back to index.html by default then
    return Application.fastReturn({statusCode,headers,data:`<h2>...</h2><script>location.href='${fwd_url}';</script>`});
  }
  if (!body){
    headers['Content-Type']='application/json;charset=utf-8';
    return Application.fastReturn({statusCode,headers,data})
  }
  //console.log({url,body})
  if ('favicon.ico'==body) throw 'favicon'

  let url_rest_o = urlModule.parse(url);
  let sid = url_rest_o.pathname;//TOOO FOR SESSION
  let url_hash = url_rest_o.hash;

  let ctx = {
    //quick tools:
    fk_pid,fk_idx,main_pid,
    md5,md5_ascii,o2s,s2o,a2csv,a2tbl,init_time,now,safe,qstr,get_time_iso,get_time_YmdHMS,get_timestamp,reload,
    //log:console.log,
    $:jPathAsync,//e.g. $(news.history_o(945629),'data'),
    //mydirname,
    //app_id,myfilename,myfiletime,argo,
    type:(v)=>typeof(v),

    //web3 testing on ipfs-net:
//QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
    test_w3_readme:async()=>{
      let {data,headers:fetched_headers} = await myfetch('http://127.0.0.1:8080/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme');
      headers['content-type'] = fetched_headers['content-type'];
      return data.toString();
    },
//bafkreicysg23kiwv34eg2d7qweipxwosdo2py4ldv42nbauguluen5v6am
    test_w3_ping:async()=>{
      let s = fs.readFileSync('ipfs.json');
      let a = jeval(s);
      let rt = [];
      for (let v of a){
        let t1=now();
        let {data,headers:fetched_headers} = await myfetch(v[0]);
        let t2=now();
        rt.push(['hello\n'==data.toString(),t2-t1]);
      }
      return rt;
    },
//e.g. _("math","random")
//TODO _.math.random ? need Proxy()...trouble...later....
    _:async(...args)=>{
let args_0 = args[0];
let args_1 = args[1];
if (!(argo.apis.indexOf(args_0)>=0)) throw {message:'404'+args_0};
let c = await tryRequire('../src/api'+args_0,false,console.log);
if (typeof(c)=='function') c= await c(Application);//DESIGN !
let m = c[args[1]];
return m(...args);
      },
  }//ctx

  //TODO move argo.apis to _() !
  //for (let k of (argo.apis||'math').split(','))
  for (let k of ['ct'])
  {
    //console.log('preload api',k);
    try{
      let m = await tryRequire('../src/api'+k,false,console.log);
      if (typeof(m)=='function') m= await m(Application);//DESIGN !
      ctx[k] = m;
    }catch(ex){console.log('err',k,ex)}
  }
  //TODO or simple fwd to _(c,m,...args) later

  let rst;
  try{
    //TODO have a defender (level one) here. and add level two at the server/firewall stage.
    rst = await jevalx(body,ctx,{timeout:2999,json_output:false});
    console.log(body,'=>',rst);
    if (typeof rst=='undefined') rst = null;
  }catch(ex_evalx){
    //TODO check tag and code, if security send message to the defender.
    let {message,code,js,ex,id} = ex_evalx;
    console.log(body,'=>',ex);
    rst = {message,code,id}
  }
  data = rst || {};
  if (typeof rst != 'string') {
    data = o2s(rst)
    headers['Content-Type'] = 'application/json;charset=utf-8';
  }
  if (hasGzip && data) {
      headers['Content-Encoding']='gzip';
      data = await gzip2s(data)
  }
  return Application.fastReturn({statusCode,headers,data})
}
module_exports.init_time = init_time;
module.exports = module_exports;
