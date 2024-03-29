//TINY NODEJS HTTP API SERVER FOR INNER USE

//usage e.g.
//node server /app=default /port=8000 /fwd=1
//node server /app=default /port=8001 /static_local=../docs /static=static/

const { argv2o, argo, tryx, s2o, o2s, tryp, myfetch, http, urlModule, gzip2s, fs} = require('./myes')
const isValidUrl = (s)=>s && (s.startsWith('https:')||s.startsWith('http:'));
const mimeTypes = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/png',//TMP
};
const server = http.createServer(async(req, res) => {
    var headers = {
      'Content-Type':'application/json;charset=utf-8',
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST, OPTIONS, GET, DELETE",
      "Access-Control-Allow-Headers":"*",
    }, statusCode=200,url,body; 
    let fastReturn = ({statusCode=200,headers,data}={})=>{res.writeHead(statusCode, headers);res.end(data)}
    try {
      const reqHeaders = req.headers;
      const acceptEncoding = reqHeaders['accept-encoding'];
      var hasGzip = acceptEncoding && acceptEncoding.includes('gzip');
      if (argo.token && argo.token!=reqHeaders['dkktoken']) throw `TOKEN`
      let reqHOST = reqHeaders['host'] || 'localhost';
      let reqHOST_a = reqHOST.split(':');
      let reqPORT='';
      if (reqHOST_a.length>1) {
        reqHOST = reqHOST_a[0];
        reqPORT = reqHOST_a[1];
      }
      const dkkHost = reqHeaders['dkkhost'];
      url = dkkHost ? `https://${dkkHost}${req.url}` : req.url.substring(1);

      let Application = {fastReturn};
      Application.tryStaticFile = (relativePath)=>{
        let rt;
        var static = argo.static || '';
        var static_local = argo.static_local || argo.static;
        if (relativePath == 'favicon.ico') { relativePath = static + reqHOST + '-' + relativePath; }
        if (relativePath.startsWith(static)){
          var url_rest = relativePath.substring(static.length)
          var pathModule = require('path')
          const staticBasePath = pathModule.join(__dirname, static_local);
          //const staticFilePath = pathModule.join(staticBasePath, url_rest);
          var url_rest_o = urlModule.parse(url_rest);
          let pathname = url_rest_o.pathname;
          const staticFilePath = pathModule.join(staticBasePath, url_rest_o.pathname||'');
          if (fs.existsSync(staticFilePath)){
            const stats = fs.statSync(staticFilePath);
            if (stats.isFile()) {
              const ext = pathModule.extname(staticFilePath).toLowerCase();
              const contentType = mimeTypes[ext] || 'application/octet-stream';
              headers['Content-Type'] = contentType;
              rt = fs.readFileSync(staticFilePath)
            } //else console.log('skip non file',relativePath)
          }//else console.log('fallback to app',relativePath);//let app handle
        }//else console.log('fallback to app for',relativePath);//for static!=''
        //console.log('DEBUG tryStaticFile',relativePath,typeof rt);
        return rt;
      };
      if ( (argo.static || argo.static_local) && (req.method == 'GET')) {
        var data = Application.tryStaticFile(req.url);
        if (data) return fastReturn({statusCode,headers,data});
      }
      if (req.method === 'POST') {
        body = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', (chunk) => data += chunk);
          req.on('end', () => resolve(data));
          req.on('error', (error) => reject(error));
        });
      }
      //TODO in future, fix the bugs of the loop..
      var referer=reqHeaders.referer;
      if (argo.fwd && referer && !isValidUrl(url)){
        var referer_o = urlModule.parse(referer)
        var referer_path = referer_o.path
        if (referer_path.startsWith('/http') && referer_o.host!=reqHOST){
          //url = `${referer_path.substring(1)}/${url}`
          url = `${referer_path.substring(1)}${url}`
          reqHeaders['referer']=referer_path
        }
      }
      if (!isValidUrl(url)){
        if (!body) body = decodeURI(urlModule.parse(url).query||'')
        var app_id = (argo.app||'default');
        return await require('./app'+app_id)({...Application,...{req,res, url,body,argo,app_id,reqHOST,reqPORT}})
      }
      //////////////////// fwd 
      if (!argo.fwd) throw 'fwd'
      var agent;
      if (argo.proxy) {
        agent = new (require('https-proxy-agent').HttpsProxyAgent)(urlModule.parse(argo.proxy))
      }
      var { data, headers, statusCode, options } = await myfetch(url, {
          method: req.method, headers: reqHeaders, body, agent
      });
      var location = headers['location']
      if (location) {
          headers['location'] = isValidUrl(location)?`/${location}`:`.${location}`;
      }
      delete headers['content-length']
      delete headers['content-encoding']
      delete headers['transfer-encoding']
      var headers_set_cookie=[]
      for (var v of (headers['set-cookie']||[])){
        headers_set_cookie.push(v.replace(/Domain=.*$/gi,"Domain="+reqHOST))
      }
      if (headers_set_cookie.length>0){
        headers['set-cookie'] = headers_set_cookie
      }
      console.log(statusCode,url)
    } catch (error) {
        console.error('ERR',url,statusCode,headers,'=>',error);
        const msg = (''+error).split('\n')[0]; // Get the first line only
        const code = (error||{}).code
        var data = o2s({msg,code})
    }
    if (hasGzip) {
        headers['Content-Encoding']='gzip';
        data = await gzip2s(data)
    }
    return fastReturn({statusCode,headers,data})
});
server.listen(argo.port||80,argo.host||'127.0.0.1',()=>console.log('Server started',{app:(argo.app||'default'),...server.address()}));

