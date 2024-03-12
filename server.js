//TINY HTTP API SERVER FOR INNER USE

//usage e.g.
//node server /app=default /port=8000 /fwd=1
//node server /app=default /port=8001 /static_local=../docs /static=static/

const { argv2o, tryx, s2o, o2s, tryp, myfetch, http, urlModule, gzip2s, fs} = require('./myes')
const argo = argv2o();
const server = http.createServer(async(req, res) => {
    var headers = {
      'Content-Type':'application/json;charset=utf-8',
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST, OPTIONS, GET, DELETE",
      "Access-Control-Allow-Headers":"*",
    }, statusCode=200,url,body; 

    var fastReturn = ({statusCode=200,headers,data}={})=>{
      res.writeHead(statusCode, headers);
      res.end(data);
    }

    try {
      var isValidUrl = (s)=>s && (s.startsWith('https:')||s.startsWith('http:'));
      const reqHeaders = req.headers;
      const acceptEncoding = reqHeaders['accept-encoding'];
      var hasGzip = acceptEncoding && acceptEncoding.includes('gzip');
      const reqHOST = reqHeaders['host'] || 'localhost';
      if (argo.token && argo.token!=reqHeaders['dkktoken']) throw `TOKEN`
      const dkkHost = reqHeaders['dkkhost'];
      url = dkkHost ? `https://${dkkHost}${req.url}` : req.url.substring(1);
      if (req.method === 'POST') {
        body = await new Promise((resolve, reject) => {
          let data = '';
          req.on('data', (chunk) => data += chunk);
          req.on('end', () => resolve(data));
          req.on('error', (error) => reject(error));
        });
      }
      if (argo.static || argo.static_local) {
        var static = argo.static || 'static/'
        var static_local = argo.static_local || argo.static;
        if (url == 'favicon.ico') url = static + url;
        if (url.startsWith(static)){
          var url_rest = url.substring(static.length)
          var path = require('path')
          const staticBasePath = path.join(__dirname, static_local);
          const staticFilePath = path.join(staticBasePath, url_rest);
          //console.log({staticBasePath,staticFilePath,url_rest})
          if (fs.existsSync(staticFilePath)){
            const ext = path.extname(staticFilePath).toLowerCase();
            const mimeTypes = {
                '.html': 'text/html',
                '.htm': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.ico': 'image/png',//TMP
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            //console.log('contentType',{url,ext,contentType})
            headers['Content-Type'] = contentType;
            var data = fs.readFileSync(staticFilePath)
          } else {
            var data = '404 '+url
          }
          return fastReturn({statusCode,headers,data})
        }
      }
      //TODO fix the bugs!!:
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
        var app_id = (argo.app||'default')
        app = require('./app'+app_id)
        return await app({req,res,url,body,argo,app_id})
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

