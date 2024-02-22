//TINY HTTP API SERVER FOR INNER USE
//e.g. node server /app=default /port=8000
const { argv2o, tryx, s2o, o2s, tryp, myfetch, http, urlModule} = require('./myes')
const argo = argv2o();
const server = http.createServer(async(req, res) => {
    var url,headers,statuscode,body;
    try {
        const reqHeaders = req.headers;
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

        //TODO some case that ref by page...
        //if (!(url.startsWith('https:')||url.startsWith('http:'))){
        //  var referer=reqHeaders.referer;
        //  if (referer && referer.startsWith(`http://${reqHOST}`)) {
        //    //if (url=='favicon.ico') throw 'favicon' //TMP SOL
        //    url = `${referer}${url}`
        //  }
        //}

        if (!(url.startsWith('https:')||url.startsWith('http:'))){
          if (!body) body = decodeURI(url)
          var app_id = (argo.app||'default')
          app = require('./'+app_id)
          return await app({req,res,url,body,argo,app_id})
        }
        //console.log('debug',{url,body,referer:reqHeaders.referer})
        var agent;
        //e.g. /proxy=http://127.0.0.1:7777
        if (argo.proxy) { //TO FIX
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
        if (statusCode=='431') statusCode=500;//
        res.writeHead(statusCode, headers);
        res.end(data);
    } catch (error) {
        console.error('ERR',url,statusCode,headers,'=>',error);
        //res.writeHead(500, { 'Content-Type': 'text/plain' });
        const msg = (''+error).split('\n')[0]; // Get the first line only
        const code = (error||{}).code
        res.end(o2s({msg,code}));
    }
});
server.listen(argo.port||80,argo.host||'127.0.0.1',()=>console.log('Server listening',server.address()));

