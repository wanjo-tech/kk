//TINY NODEJS HTTP API SERVER FOR INNER USE

//usage e.g.
//node server /app=default /port=8000 /fwd=1
//node server /app=default /port=8001 /static_local=../docs /static=static/

let logger = console;

const globalThisWtf = {};
for(let k of [...Object.keys(globalThis),'require','process']){
  globalThisWtf[k] = globalThis[k];
  delete globalThis[k];
}

globalThisWtf.require = require;
let process = globalThisWtf.process;//require('process');
let process_pid = process.pid;

////global locking of __proto__... once for all...
//Object.defineProperty(Object.prototype, '__proto__', { get() { return undefined; }, set(newValue) { } });

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
//process.on('SIGINT', () => { logger.log('SIGINT') process.exit() });
process.on('SIGTERM', () => { logger.log('SIGTERM') })

process.on('unhandledRejection',(reason,promise)=>{logger.error('!!! unhandledRejection',promise,'reason:',reason);});
process.on('uncaughtException',(error)=>{logger.log('!!!!! uncaughtexception:',error);});

const createServer = ()=> http.createServer(async(req, res) => {
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
        let static_local = argo.static_local || static;
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
            } //else logger.log('skip non file',relativePath)
          }//else logger.log('fallback to app',relativePath);//let app handle
        }//else logger.log('fallback to app for',relativePath);//for static!=''
        //logger.log('DEBUG tryStaticFile',relativePath,typeof rt);
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
        let referer_o = urlModule.parse(referer) || {};
        let referer_path = referer_o.path || '';
        if (referer_path.startsWith('/http') && referer_o.host!=reqHOST){
          //url = `${referer_path.substring(1)}/${url}`
          url = `${referer_path.substring(1)}${url}`
          reqHeaders['referer']=referer_path
        }
      }

      if (!isValidUrl(url)){
        if (!body) body = decodeURI(urlModule.parse(url).query||'')
        let app_id = (argo.app||'default');
        var {data,statusCode,headers} = await require('./app'+app_id)({...Application,...{req,res, url,body,argo,app_id,reqHOST,reqPORT,globalThisWtf,process_pid}});
        return fastReturn({data,statusCode,headers})
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
      logger.log(statusCode,url)
    } catch (error) {
        logger.error('ERR',url,statusCode,headers,'=>',error);
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

let cpus = argo.cpus || require('os').cpus().length;//require('node:os').availableParallelism()
let cluster_mode = "solo";
if(cpus>1){ // start cluster mode when not solo
  cluster_mode = "cluster"
  let cluster = require('cluster');
  //if (cluster.isMaster)
  if (cluster.isPrimary)
  {//split.
          let forkWorker = (fk_idx) => {
                  const workerServer = cluster.fork({fk_idx,main_pid:process.pid});//NOTES: fork(env)
                  //logger.error('forkWorker',fk_idx);
                  workerServer.on('disconnect', () => {
                          logger.error(`workerServer${fk_idx} disconnect, will auto launch again...`);
                          forkWorker(fk_idx);
                  })
                  //.on('message',msgInfo=>process_on_message(msgInfo,4))//TODO
                  //.on('listening', (address) => logger.error(`workerServer${fk_idx} is listening: `,address))
                  //.on('online',()=>{
                  //        //logger.error(`NOTICE workerServer${fk_idx} is online`,);
                  //})
                  .on('exit', (code, signal) => {
                          if (signal) { logger.error(`workerServer${fk_idx} was killed by signal: ${signal}`); }
                          else if (code !== 0) { logger.error(`workerServer${fk_idx} exited with error code: ${code}`); }
                          else { logger.error(`workerServer${fk_idx} exit success ${code},${signal}`); }
                  });
          };
          cluster.on('exit', (workerServer, code, signal)=>{
          	logger.error('workerServer %d exit (%s). restarting...', workerServer.process.pid, signal || code);
          	//cluster.fork();
                forkWorker(workerServer.fk_idx);
          	//logger.error('[REFORK] Server');
          });
          for (let j=0; j<cpus;j++) forkWorker(1+j)
  }else{ //child
    let fk_idx = process.env.fk_idx;
    let main_pid = process.env.main_pid;
    let process_pid = process.pid;
    let server = createServer();
    server.listen(argo.port||80,argo.host||'127.0.0.1',()=>logger.error(`Server_${fk_idx}_${main_pid}_${process_pid}`,{app:(argo.app||'default'),...server.address()}));
  }
}else{
  let server = createServer();
  server.listen(argo.port||80,argo.host||'127.0.0.1',()=>logger.log('Server started',{app:(argo.app||'default'),...server.address()}));
}
