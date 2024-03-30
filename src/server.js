//TINY NODEJS HTTP API SERVER FOR INNER USE

//usage e.g.
//node server /app=default /port=8000 /fwd=1
//node server /app=default /port=8001 /static_local=../docs /static=static/

const { argv2o, argo, tryx, s2o, o2s, tryp, myfetch, http, urlModule, gzip2s, fs} = require('../docs/myes')
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
process.on('unhandledRejection', (reason, promise) => {
  console.error('WARNING unhandledRejection', promise, 'reason:', reason);
});
const server = http.createServer(async(req, res) => {
    var headers = {
      'Content-Type':'application/json;charset=utf-8',
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST, OPTIONS, GET, DELETE",
      "Access-Control-Allow-Headers":"*",
    }, statusCode=200,url,body; 
    let hasGzip=null;
    var data=null;//TODO let..
    let fastReturn = ({statusCode=200,headers,data}={})=>{res.writeHead(statusCode, headers);res.end(data)}
    try {
      const reqHeaders = req.headers;
      const acceptEncoding = reqHeaders['accept-encoding'];
      hasGzip = acceptEncoding && acceptEncoding.includes('gzip');
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
        let static = argo.static || '';
        let static_local = argo.static_local || argo.static;
        if (relativePath == 'favicon.ico') { relativePath = static + reqHOST + '-' + relativePath; }
        if (relativePath.startsWith(static)){
          let url_rest = relativePath.substring(static.length)
          let pathModule = require('path')
          const staticBasePath = pathModule.join(__dirname, static_local);
          //const staticFilePath = pathModule.join(staticBasePath, url_rest);
          let url_rest_o = urlModule.parse(url_rest);
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
        data = Application.tryStaticFile(req.url);
        if (data) return fastReturn({statusCode,headers,data});
      }
      if (req.method === 'POST') {
        body = await new Promise((resolve, reject) => {
          data = '';
          req.on('data', (chunk) => data += chunk);
          req.on('end', () => resolve(data));
          req.on('error', (error) => reject(error));
        });
      }
      //TODO in future, fix the bugs of the loop..
      let referer=reqHeaders.referer;
      if (argo.fwd && referer && !isValidUrl(url)){
        let referer_o = urlModule.parse(referer)
        let referer_path = referer_o.path
        if (referer_path.startsWith('/http') && referer_o.host!=reqHOST){
          //url = `${referer_path.substring(1)}/${url}`
          url = `${referer_path.substring(1)}${url}`
          reqHeaders['referer']=referer_path
        }
      }
      if (!isValidUrl(url)){
        if (!body) body = decodeURI(urlModule.parse(url).query||'')
        let app_id = (argo.app||'default');
        return await require('./app'+app_id)({...Application,...{req,res, url,body,argo,app_id,reqHOST,reqPORT}})
      }
      //////////////////// fwd 
      if (!argo.fwd) throw 'fwd'
      let agent;
      if (argo.proxy) {
        agent = new (require('https-proxy-agent').HttpsProxyAgent)(urlModule.parse(argo.proxy))
      }
      var { data:dataFetched, headers, statusCode, options } = await myfetch(url, {
          method: req.method, headers: reqHeaders, body, agent
      });
      data = dataFetched;
      let location = headers['location']
      if (location) {
          headers['location'] = isValidUrl(location)?`/${location}`:`.${location}`;
      }
      delete headers['content-length']
      delete headers['content-encoding']
      delete headers['transfer-encoding']
      let headers_set_cookie=[]
      for (let v of (headers['set-cookie']||[])){
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
        data = o2s({msg,code})
    }
    if (hasGzip && data) {
        headers['Content-Encoding']='gzip';
        data = await gzip2s(data)
    }
    return fastReturn({statusCode,headers,data})
});
server.listen(argo.port||80,argo.host||'127.0.0.1',()=>console.log('Server started',{app:(argo.app||'default'),...server.address()}));


/** TODO cluster mode ;)
    let cpus = argo.cpus || require('os').cpus().length;
    let cluster_mode = "solo";
    if(cpus>1){
      cluster_mode = "cluster"
      let cluster = require('cluster');
      if (cluster.isMaster) {//split since here.
              //cluster.on('exit', (worker, code, signal)=>{
              //	console.log('worker %d died (%s). restarting...', worker.process.pid, signal || code);
              //	cluster.fork();
              //	console.log('[REFORK] Server running at http://127.0.0.1:8000/');
              //});
              let forkWorker = (fk_id) => {
                      //NOTES: fk_id for debug only
                      const worker = cluster.fork({fk_id});//after fork() the variables is already changed...
                      worker.on('disconnect', () => {
                              logger.log(`worker${fk_id} disconnect, will auto launch again...`);
                              forkWorker(fk_id);
                      }).on('message',msgInfo=>process_on_message(msgInfo,4))
                              .on('listening', (address) => logger.log(`worker${fk_id} is listening: `,address))
                              .on('online',()=>{
                                      logger.log(`NOTICE worker${fk_id} is online`,);
                                      WorkerPool[worker.process.pid]=worker;//
                              }).on('exit', (code, signal) => {
                                      delete WorkerPool[worker.process.pid];
                                      if (signal) { logger.log(`worker${fk_id} was killed by signal: ${signal}`); }
                                      else if (code !== 0) { logger.log(`worker${fk_id} exited with error code: ${code}`); }
                                      else { logger.log(`worker${fk_id} exit success ${code},${signal}`); }
                              });
              };
              //for (let i = 1; i < cpus; i++)
              for(let j=cpus;j--;) forkWorker(j);

              setTimeout(()=>{
                      logger.log('DEBUG:',ProcPool,Object.keys(WorkerPool));
              },3333);
      }else{
              flagMaster=false;
      }
  }
*/
