var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,tryRequire,gzip2s} = require('./myes')
var init_time = now()
module.exports = async (opts)=>{
  var {req,res,url,body,argo,app_id}=opts;

  const reqHeaders = req.headers;
  const acceptEncoding = reqHeaders['accept-encoding'];
  const hasGzip = acceptEncoding && acceptEncoding.includes('gzip');

  var headers = {
    'Content-Type':'application/json;charset=utf-8',
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"POST, OPTIONS, GET, DELETE",
    "Access-Control-Allow-Headers":"*",
  }

  var statusCode = '200';
  if (!body){
    res.writeHead(statusCode, headers);
    res.end(o2s({code:404,msg:url}))
    return
  }
  console.log('body=>',body)
  if ('favicon.ico'==body) throw 'favicon'

  ///////////////////

  //TODO log the wrong codes and send-back log-id

  var ctx = {
    md5,
    md5_ascii,
    o2s,s2o,

    //DONT DELETE FOR REF AND DEBUG
    //myfilename:()=>require('path').basename(__filename),//
    //myfiletime:()=>fs.statSync(__filename).mtime,
    //argo,
    //app_id,
    init_time,

    reload:(m='aiwin')=>(typeof tryRequire('./'+m,true)),
    //favicon:{ico:''},
    tool:tryRequire('./apitool'),
    news:tryRequire('./apinews'),
  }
  var myevalp = await require('./myevalp') //for internal.
  var rst = await myevalp(body,ctx)
  if (typeof rst == 'function') rst = await rst()
  var data = rst
  if (typeof rst != 'string') data = o2s(rst)
  if (hasGzip) {
      headers['Content-Encoding']='gzip';
      data = await gzip2s(data)
  }
  res.writeHead(statusCode, headers);
  res.end(data);
}

