var {o2s,s2o,tryx,tryp,myfetch,fs,date,now,md5,md5_ascii,tryRequire,gzip2s,jPath,jPathAsync,urlModule,safe,qstr,jevalx,
get_timestamp,get_time_iso,get_time_YmdHMS,
} = require('./myes')
var init_time = now()

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

module.exports = async(Application)=>{
  var {req,res,url,body,argo,app_id,reqHOST,reqPORT}=Application;

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
    res.writeHead(statusCode, headers);
    res.end(o2s({code:404,msg:url}))
    return
  }
  //console.log({url,body})
  if ('favicon.ico'==body) throw 'favicon'

  var url_rest_o = urlModule.parse(url);
  var sid = url_rest_o.pathname;
  var url_hash = url_rest_o.hash;
  console.log('app',{sid,body});

  ///////////////////

  const handler = {
    get(target, prop, receiver) {
      var objcache={};
      var rt = Reflect.get(target, prop, receiver);
      if (!rt && typeof(prop)=='string'){
        rt = new Proxy({},{
          async get(target2, prop2, receiver2) {
            if (!objcache[prop]) {
              var m = tryRequire('./api'+safe(prop));
              if (typeof(m)=='function') m= await m(Application);//DESIGN as apiXXX(Application)
              obj = objcache[prop] = m;
            }
            //var rt2 = obj[prop2];//...
            console.log('DEBUG handle2',obj,prop2);
            if(obj){
              var rt2 = Reflect.get(obj, prop2, obj);
              return rt2
            }else throw 'no '+prop;
          }
        });
      }
      console.log('DEBUG handle',prop,'=>',rt);
      return rt
    }
  };

  var ctx = {
    //quick tools:
    md5,md5_ascii,o2s,s2o,a2csv,a2tbl,init_time,now,safe,qstr,
    $:jPathAsync,//e.g. $(news.history_o(945629),'data'),
    reload:(m='aiwin')=>(typeof tryRequire('./'+m,true)),
    //myfilename:()=>require('path').basename(__filename),//
    //myfiletime:()=>fs.statSync(__filename).mtime,
    //argo,
    //app_id,

    _: new Proxy({},handler),
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
  res.writeHead(statusCode, headers);
  res.end(data);
}

