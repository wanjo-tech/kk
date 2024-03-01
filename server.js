//TINY HTTP API SERVER FOR INNER USE
// fwd + app

//usage e.g.
//node server /app=default /port=8000 /fwd=1

const { argv2o, tryx, s2o, o2s, tryp, myfetch, http, urlModule, zlib} = require('./myes')
const argo = argv2o();
const server = http.createServer(async(req, res) => {
    try {
        var url,headers,statuscode,body;
        const reqHeaders = req.headers;
        const acceptEncoding = reqHeaders['accept-encoding'];
        const hasGzip = acceptEncoding && acceptEncoding.includes('gzip');
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

        //TODO not fix the bugs...
        var referer=reqHeaders.referer;
        if (!(url.startsWith('https:')||url.startsWith('http:')) && referer){
          var referer_o = urlModule.parse(referer)
          var referer_path = referer_o.path
          if (referer_path.startsWith('/http') && referer_o.host!=reqHOST){
            //url = `${referer_path.substring(1)}/${url}`
            url = `${referer_path.substring(1)}${url}`
            reqHeaders['referer']=referer_path
          }
        }

        if (!(url.startsWith('https:')||url.startsWith('http:'))){
          //if (!body) body = decodeURI(url)
          if (!body) body = decodeURI(urlModule.parse(url).query) // parse(url).pathname => kinda config
          var app_id = (argo.app||'default')
          app = require('./'+app_id)
          return await app({req,res,url,body,argo,app_id})
        }
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
            headers['location'] = (location.startsWith('https:')||location.startsWith('http:'))?`/${location}`:`.${location}`;
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
    } catch (error) {
        console.error('ERR',url,statusCode,headers,'=>',error);
        const msg = (''+error).split('\n')[0]; // Get the first line only
        const code = (error||{}).code
        res.writeHead(200, {
          'Content-Type':'application/json;charset=utf-8',
          "Access-Control-Allow-Origin":"*",
          "Access-Control-Allow-Methods":"POST, OPTIONS, GET, DELETE",
          //"Access-Control-Allow-Headers":"Content-Type",
          "Access-Control-Allow-Headers":"*",
        });
        res.end(o2s({msg,code}));
    }
});
server.listen(argo.port||80,argo.host||'127.0.0.1',()=>console.log('Server listening',server.address()));

