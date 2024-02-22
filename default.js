var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,tryRequire} = require('./myes')
var init_time = now()
module.exports = async (opts)=>{
  var {req,res,url,body,argo,app_id}=opts;

  //if (!body) body = url // let url became body,e.g. https://localhost:50080/2**3
  if (!body){
    //console.log('nobody',url)
    //res.writeHead(404, {});
    res.end(o2s({code:404,msg:url}))
    return
  }
  console.log('body=>',body)
  if ('favicon.ico'==body) throw 'favicon'

  ///////////////////

  //TODO log the wrong codes and send-back log-id

  var rst = await require('./myevalp')(body,{
    md5,md5_ascii,

    //DONT DELETE FOR REF AND DEBUG
    //myfilename:()=>require('path').basename(__filename),//
    //myfiletime:()=>fs.statSync(__filename).mtime,
    //argo,
    //app_id,
    //init_time,

    reload:(m='aiwin')=>(typeof tryRequire('./'+m,true)),
    //favicon:{ico:''},
    tool:tryRequire('./apitool'),
    news:tryRequire('./apinews'),

  })
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.end(o2s(rst))
}

