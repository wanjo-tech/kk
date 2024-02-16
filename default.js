module.exports = async (opts)=>{

  var {o2s,s2o,tryx,myfetch,fs,date,now} = require('./myes')
  var {req,res,url,body}=opts;

  if (!body) body = decodeURI(url)
  if (!body){
    console.log('nobody',url)
    res.writeHead(404, {});
    res.end(o2s({code:404,msg:url}))
    return
  }
  console.log('body=>',body)

  var ctx = {
  }
  return res.end(o2s(await require('./myevalp')(body,ctx)))
}

