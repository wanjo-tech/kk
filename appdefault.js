var {o2s,s2o,tryx,tryp,myfetch,fs,date,now,md5,md5_ascii,tryRequire,gzip2s,jPath,jPathAsync,urlModule,safe,qstr,jevalx,
get_timestamp,get_time_iso,get_time_YmdHMS,
} = require('./myes')
var init_time = now()
var myfilename = ()=>require('path').basename(__filename);
var myfiletime= ()=>fs.statSync(__filename).mtime;

/*
TEST CASES after /?
new Date().toLocaleDateString()
*/
//?(async()=>a2csv(await%20bk.showTable`TBL_ITEM`))
//?a2csv(_.bk.showTable`TBL_ITEM`)
async function a2csv(a) {
  var a = await a;
  var s='';
  for (var row of a){
    s+=row.join('\t')+'\n'
  }
  return s
}
//?a2tbl(_.bk.showTable`TBL_ITEM`)
async function a2tbl(a) {
  if (typeof a=='function') a = a()
  a = await a;
  var s='<table border=1>';
  for (var row of a){
    //s+='<tr><td>'+ row.join('</td><td>')+'</td></tr>'
    s+='<tr>';
    for (var cell of row){
      if (cell instanceof Date) s+='<td>' + get_time_YmdHMS(cell)+'</td>';
      else s+='<td>'+cell+'</td>';
    }
    s+'</tr>';
  }
  s+='</table>'
  return s
}

var module_exports = async(Application={})=>{
  var {req,res,url,body,argo,app_id,reqHOST,reqPORT}=Application;

  //SECURITY VULNERABLE ;)
  var reload = (m='app'+app_id,clear=true)=>{var mm = tryRequire('./'+m,clear); return (mm&&mm.init_time)?mm.init_time:typeof(mm)};

  const reqHeaders = req.headers;
  const acceptEncoding = reqHeaders['accept-encoding'];
  const hasGzip = acceptEncoding && acceptEncoding.includes('gzip');

  var headers = {
    //'Content-Type':'application/json;charset=utf-8',
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"POST, OPTIONS, GET, DELETE",
    "Access-Control-Allow-Headers":"*",
  }

  var statusCode = '200';
  if (!url || url.startsWith('?')){
    headers['Content-Type']='text/html;charset=utf-8';
    var data = Application.tryStaticFile(`${reqHOST}_${reqPORT}.htm`);//try this first
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

  var url_rest_o = urlModule.parse(url);
  var sid = url_rest_o.pathname;//TOOO FOR SESSION
  var url_hash = url_rest_o.hash;

  var ctx = {
    //quick tools:
    md5,md5_ascii,o2s,s2o,a2csv,a2tbl,init_time,now,safe,qstr,get_time_iso,get_time_YmdHMS,get_timestamp,reload,
    $:jPathAsync,//e.g. $(news.history_o(945629),'data'),
    //app_id,myfilename,myfiletime,argo,
    type:(v)=>typeof(v),
    //_:{},
  }
  for (var k of (argo.apis||'test').split(',')){
    console.log('preload api',k);
    var m = await tryRequire('./api'+k);
    if (typeof(m)=='function') m= m(Application);//DESIGN !
    //ctx._[k] = m;
    ctx[k] = m;
  }
  var rst = await jevalx(body,ctx);
  if (typeof rst == 'function') rst = await rst()
  var data = rst
  if (typeof rst != 'string') {
    data = o2s(rst)
    headers['Content-Type'] = 'application/json;charset=utf-8';
  }
  if (hasGzip) {
      headers['Content-Encoding']='gzip';
      data = await gzip2s(data)
  }
  return Application.fastReturn({statusCode,headers,data})
}
module_exports.init_time = init_time;
module.exports = module_exports;
