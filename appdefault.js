var {o2s,s2o,tryx,tryp,myfetch,fs,date,now,md5,md5_ascii,tryRequire,gzip2s,jPath,jPathAsync} = require('./myes')
var init_time = now()
var get_timestamp = (d)=>(d||new Date()).getTime();
var get_time_iso = (d)=>((d||new Date())).toISOString();
var get_time_YmdHMS = (d)=>get_time_iso(d).slice(0,19).replace('T',' ');

/*
TEST CASES after /?
new Date().toLocaleDateString()
*/
//?(async()=>a2csv(await%20bk.showTable`TBL_ITEM`))
//?a2csv(bk.showTable`TBL_ITEM`)
async function a2csv(a) {
  var a = await a;
  var s='';
  for (var row of a){
    s+=row.join('\t')+'\n'
  }
  return s
}
//?a2tbl(bk.showTable`TBL_ITEM`)
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

module.exports = async (opts)=>{
  var {req,res,url,body,argo,app_id}=opts;

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
    let fwd_url = `${argo.static||''}index.html?${Math.random()}`; //TODO fwd to the ${host} etc
    res.writeHead(statusCode, headers);
    res.end(`<h2>...</h2><script>location.href='${fwd_url}';</script>`)
    return
  }
  if (!body){
    headers['Content-Type']='application/json;charset=utf-8';
    res.writeHead(statusCode, headers);
    res.end(o2s({code:404,msg:url}))
    return
  }
  //console.log({url,body})
  console.log(url)
  if ('favicon.ico'==body) throw 'favicon'

  ///////////////////

  var ctx = {
    md5, md5_ascii, o2s,s2o, a2csv,a2tbl,

    //DONT DELETE FOR REF AND DEBUG
    //myfilename:()=>require('path').basename(__filename),//
    //myfiletime:()=>fs.statSync(__filename).mtime,
    //argo,
    //app_id,
    init_time,
    now,
    $:jPathAsync,//e.g. $(news.history_o(945629),'data')

    reload:(m='aiwin')=>(typeof tryRequire('./'+m,true)),
    //favicon:{ico:''},
    tool:tryRequire('./apitool'),
    news:tryRequire('./apinews'),
  }
  var myevalp = await require('./myevalp') //for internal.
  var rst = await myevalp(body,ctx)
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

