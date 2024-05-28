/*

## cdp server example
"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server=http://127.0.0.1:7777 --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run --auto-open-devtools-for-tabs file://%cd%/cdp_backend.html
"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server=http://127.0.0.1:7777 --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run https://api.ipify.org
"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server=http://127.0.0.1:7777 --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run --app=https://api.ipify.org

"%ProgramFiles%\Google\Chrome\Application\chrome.exe" --proxy-server=http://127.0.0.1:7777 --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run https://api.ipify.org
"%ProgramFiles%\Google\Chrome\Application\chrome.exe" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run https://api.ipify.org

## QUICK TEST CASE AND EXAMPLE
await require('./bizcdp')({pattern:'https://api.ipify.org',expression:`location.href`})
*/


var ws_o = {}
var ws_cache_o = {}
var id = 0;

var cdp_call = (ws,method,params)=>new Promise((resolve,reject)=>{
    id = (id+1) % 8192;
    ws_cache_o[id] = (rst,err)=>{(rst)?resolve(rst):reject(err)}
    ws.send(JSON.stringify({id, method, params}));
})

const sleep_async = (i)=>new Promise((r,j)=>setTimeout(r,i))
function findFreePort(startPort=19222,range=1024,maxAttempts=99) {
  let attempts = 0; // 尝试的次数计数器
  return new Promise((resolve,reject)=>{
      // 生成一个随机起始端口号。这里我们假设一个基本安全的起始端口号范围1024到65535之间
      // 使用取模运算确保端口号加上范围不会超过65535
      const startingPort = 19222 + Math.floor(Math.random() * range);

      // 定义一个内部函数，尝试监听端口，如果失败，则顺序尝试下一个
      function tryListen(port) {
          const net = require('net');

          if (attempts >= maxAttempts) {
              return reject(new Error('无法找到可用端口'));
          }
          attempts++;
          const server = net.createServer();
          server.listen(port, () => {
              server.once('close', () => resolve(port));
              server.close();
          });
          server.on('error', () => {
              const nextPort = startPort + (port - startPort + 1) % range;
              tryListen(nextPort);
          });
      }
      tryListen(startingPort);
  });
}
async function module_exports(opts){
  var {WebSocket,pattern, init, url, expression, port, host, debug=false, reload=0} = opts || {}
  // NOTE: pattern is also key.
  if (!WebSocket) throw 'need WebSocket'
  if (!port) port=9222
  if (!host) host='127.0.0.1'
  if (!pattern) throw 'need pattern'
  if (!url) url = ''+pattern
  var logger = (debug) ? console.log : (()=>null)
  logger('pattern',pattern)

  var url_entry = `http://${host}:${port}`
  var url_list = `${url_entry}/json/list`
  var url_new = `${url_entry}/json/new`
  var cdp_a = await (await fetch(url_list)).json()
  var found_o = null
  var flg_found = false
  for (var cdp_o of cdp_a){
    if (url == cdp_o.url || cdp_o.url.match( pattern )){
      found_o = cdp_o
      flg_found = true
      logger('FOUND',cdp_o.url,url)
      break;
    } else {
      //logger('DEBUG NOT MATCH',cdp_o.url,url, cdp_o.url == url)
    }
  }
  if (!found_o) {
    delete ws_o[ pattern ];
    found_o = await(await fetch(url_new,{method:'PUT'})).json()
    logger('found_o from url_new',found_o,url_new)
    await sleep_async(666)//let have time to connect to the websocket
  }
  var webSocketDebuggerUrl = found_o.webSocketDebuggerUrl
  //logger('webSocketDebuggerUrl',webSocketDebuggerUrl)

  var ws = ws_o[ pattern ]
  //logger('typeof ws',typeof ws, 'readyState',(ws?ws.readyState:null))
  if(ws && ws.readyState==WebSocket.OPEN){
    logger('OK ws', pattern)
  }else{
    if (ws) {
      logger('DEL ws', pattern)
      ws.onopen=null
      ws.onmessage=null
      //delete ws
    }
    logger('INIT ws', pattern)
    ws = await new Promise(async(resolve,reject)=>{
      let rt = ws_o[ pattern ] = new WebSocket(webSocketDebuggerUrl)
      rt.onmessage = (evt) =>{
          const response = JSON.parse(evt.data);
          var {id,result,error} = response
          var cb = ws_cache_o[id]
          if (cb) {
            cb(result,error)
            delete ws_cache_o[id]
          }
      };
      rt.onopen = async()=>{
        logger('ONOPEN',pattern,flg_found,url);
        if (!flg_found) {
          await cdp_call(rt,'Page.navigate',{url})
          flg_found = true;
        }
        resolve(rt)
      }
      if (!flg_found) await sleep_async(6666)
      else await sleep_async(1234)
      reject('CONNECT WS TIMEOUT?')
    })
  }

//'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}
//DOM.getDocument
//Page.captureScreenshot
//Performance.enable and Performance.getMetrics, like window.performance.memory
  var raw = async(...args)=>{
    var rst = await cdp_call(ws,...args);
    if (rst && rst.result && rst.result.className=='Promise'){
      logger('return Promise? HINT using {awaitPromise:true}',rst.result)
      throw 'todo strange promise';
    }
    if (rst && rst.result && rst.result.value) return rst.result.value
    if (rst && rst.result && rst.result.className=='string') return rst.result.result.value
    if (rst && rst.result && rst.result.className=='function') {
      console.log('return function? HINT using (...)()')
      //  var {className,description,objectId,subtype} = rst.result
      //  let result = await cdp_call(ws, 'Runtime.callFunctionOn', {
      //      objectId: objectId,
      //      functionDeclaration: "function() { return JSON.stringify(this); }",
      //      returnByValue: true, // 设置为true以直接在响应中返回值
      //      awaitPromise: true  // 如果对象是一个Promise，等待它解决
      //  });
      //  let jsonString = result.result.value;
      //  console.log('debug raw()',jsonString);
      //  return JSON.parse(jsonString)
    }
    return rst;
  };
  var exec = async(expression)=>{
    if (expression===undefined) {
      logger('CLOSE',ws.close());
    }else{
      if (reload>0 && flg_found) {
        logger('RELOAD',url)
        await cdp_call(ws,'Page.navigate',{url})
        await sleep_async(reload)
      }
      //var rst = await cdp_call(ws,'Runtime.evaluate',{expression})
      //var rst = await cdp_call(ws,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})
      //if (rst && rst.result && rst.result.className=='Promise'){
      //  logger('!!! Promise',rst.result);//not expecting when using awaitPromise:true ...
      //  var {className,description,objectId,subtype} = rst.result
      //  rst = await cdp_call(ws,'Runtime.awaitPromise',{promiseObjectId:objectId,returnByValue:true})
      //}
      //if (rst && rst.result && rst.result.value) return rst.result.value
      //if (rst && rst.result && rst.result.className=='string') return rst.result.result.value
      //if (rst && rst.result && rst.result.className=='function') {
      //  var {className,description,objectId,subtype} = rst.result
      //  let result = await cdp_call(ws, 'Runtime.callFunctionOn', {
      //      objectId: objectId,
      //      functionDeclaration: "function() { return JSON.stringify(this); }",
      //      returnByValue: true, // 设置为true以直接在响应中返回值
      //      awaitPromise: true  // 如果对象是一个Promise，等待它解决
      //  });
      //  let jsonString = result.result.value;
      //  return JSON.parse(jsonString)
      //}
      return await raw('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    }
  };
  if (expression) await exec(expression);
  return ({exec,raw})
}

  let spawn_cdp = async(cdp_port,proxy_server='http://127.0.0.1:7777')=>{
      if (!cdp_port) {
        cdp_port = await findFreePort();
      }else{

//TODO 可以重复listen???
let test=await new Promise((resolve,reject)=>{
            const net = require('net');
            const server = net.createServer();
        server.once('listening', () => {
            server.close(() => {
                resolve(`Port ${cdp_port} is available.`);
            });
        });

        server.once('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                reject(new Error(`Port ${cdp_port} is already in use.`));
            } else {
                reject(new Error(`Error checking port ${cdp_port}: ${error.message}`));
            }
        });
        server.listen(cdp_port);
//            server.listen(cdp_port, () => {
//                server.once('close', () => resolve(cdp_port));
//                server.close();
//            });
//            server.on('error',(ex) => { reject(ex) });
        });
console.error('test=',test);

      }
      const { spawn } = require('child_process');
      const path = require('path');
      const os = require('os');
      const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
      //TODO "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" 

      //TODO custom userDataDir...
      const userDataDir = path.join(os.tmpdir(), 'cdp'+cdp_port +'_'+ new Date().toISOString().slice(0,10).replace(/-/g, ''));

      const args = [
          '--test-type',
          '--disable-web-security',
          `--user-data-dir=${userDataDir}`,
          '--remote-debugging-port='+cdp_port,
          '--remote-allow-origins=*',
          '--disable-features=Translate',
          '--no-first-run',
          //'--auto-open-devtools-for-tabs',//TODO
          //`file://${path.join(process.cwd(), 'cdp_backend.html')}` // 使用当前工作目录下的 cdp_backend.html 文件
      ];
      if (proxy_server) {
        args.push(`--proxy-server=${proxy_server}`);
        args.push('--host-resolver-rules="MAP * 0.0.0.0 , EXCLUDE 127.0.0.1"');
      }
      // TODO headless
      const child = spawn(edgePath, args);
      return [child.pid, cdp_port, userDataDir];
  }

module_exports.spawn_cdp = spawn_cdp;

export default module_exports

//TODO
//var bizcdp1 = (expression,reload) => bizcdp({WebSocket,pattern:web_entry+'/zh-hans/balance/analysis',reload,expression,debug:true});
//var bizcdp1 = (expression,reload) => bizcdp({WebSocket,pattern:'https://api.ipify.org/',reload,expression,debug:true});
//await (await bizcdp1(null,3333)).raw('Memory.getDOMCounters')
//  if(!token || force) token=await (await bizcdp1()).exec('localStorage["token"]')
//var s = await (await bizcdp1(null,3333)).exec(`(document.querySelector('.main .est .value')||{}).innerText`)
//var bizcdp = require('./bizcdp')
//return await bizcdp({WebSocket:require('ws'),pattern:u,expression:`document.body.innerText`,reload:1234,debug:false})
//  var rt = s2o(await history_s(id,interval,pointscount,reload))

/*
bizcdp = require('./bizcdp')//when node
var bizcdp = (await import('./bizcdp.mjs')).default;//or..
await bizcdp.spawn_cdp(9222);
var biz=(await bizcdp({port:9222,WebSocket:require('ws'),pattern:'https://api.ipify.org/',reload:1234,debug:false}))
await biz.exec(`document.body.innerText`)
*/
