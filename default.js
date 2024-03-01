var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,tryRequire,zlib} = require('./myes')
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
      //"Access-Control-Allow-Headers":"Content-Type",
      "Access-Control-Allow-Headers":"*",
    }

  //if (!body) body = url // let url became body,e.g. https://localhost:50080/2**3
  if (!body){
    //console.log('nobody',url)
    //res.writeHead(404, {});
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
  var data = o2s(rst)
  var statusCode = '200';

  if (statusCode=='200' && hasGzip) {
      zlib.gzip(data, (error, result) => {
          if (error) {
              res.writeHead(500);
              res.end('Server Error GZIP');
              return;
          }
          headers['Content-Encoding']='gzip';
          res.writeHead(statusCode, headers);
          res.end(result);
      });
  } else {
      res.writeHead(statusCode, headers);
      res.end(data);
  }
}

