let init_time = new Date().getTime()/1000;
let module_exports = async(Application={})=>{
  let {req,res,url,body,argo,app_id,reqHOST,reqPORT,globalThisWtf}=Application;

let requireWtf = globalThisWtf.require;

let {o2s,s2o,tryx,tryp,myfetch,fs,date,now,md5,md5_ascii,tryRequire,gzip2s,jPath,jPathAsync,urlModule,safe,qstr,get_timestamp,get_time_iso,get_time_YmdHMS,
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
    md5,md5_ascii,o2s,s2o,a2csv,a2tbl,init_time,now,safe,qstr,get_time_iso,get_time_YmdHMS,get_timestamp,reload,
    log:console.log,
    $:jPathAsync,//e.g. $(news.history_o(945629),'data'),
    //mydirname,
    //app_id,myfilename,myfiletime,argo,
    type:(v)=>typeof(v),

    //_:(...args)=>{ return args },//TODO round api... for better safety and control?!
  }

  //
  for (let k of (argo.apis||'math').split(',')){
    //console.log('preload api',k);
    try{
      let m = await tryRequire('../src/api'+k,false,console.log);
      if (typeof(m)=='function') m= await m(Application);//DESIGN !
      ctx[k] = m;
    }catch(ex){console.log('err',k,ex)}
  }
  console.log('body=>',body);
  let rst;
  try{
    rst = await jevalx(body,ctx,timeout=2999);
    if (typeof rst=='undefined') rst = null;
  }catch(ex){
let message = ex?.message || '';
let code = ex?.code || '';
//ERR_SCRIPT_EXECUTION_TIMEOUT
if (code=='ERR_SCRIPT_EXECUTION_TIMEOUT' || message.startsWith('Script execution timed out')) message = 'Timeout'
    //TODO WRITE LOG....
    console.log(ex);
    rst = {message,code}
  }
  //if (typeof rst == 'function') rst = await rst()
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
