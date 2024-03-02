/*
"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server=http://127.0.0.1:7777 --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run --app=https://api.ipify.org
"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server=http://127.0.0.1:7777 --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run https://api.ipify.org
"%ProgramFiles%\Google\Chrome\Application\chrome.exe" --proxy-server=http://127.0.0.1:7777 --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run https://api.ipify.org
"%ProgramFiles%\Google\Chrome\Application\chrome.exe" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run https://api.ipify.org
*/

const WebSocket = require('ws');
const sleep_async = (i)=>new Promise((r,j)=>setTimeout(r,i))

var ws_o = {}
var ws_cache_o = {}
var id = 0;

/* TEST CASE
await require('./bizcdp')({pattern:'https://api.ipify.org',expression:`location.href`})
*/

async function cdp_call(ws,method,params){
  return new Promise((resolve,reject)=>{
    id = (id+1) % 8192;
    ws_cache_o[id] = (rst,err)=>{(rst)?resolve(rst):reject(err)}
    ws.send(JSON.stringify({id, method, params}));
  })
}

var module_exports = async(opts)=>{
  var {pattern, init, url, expression, port, host, debug=false, reload=0} = opts || {}
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
      logger('MATCH',cdp_o.url,url)
      break;
    } else {
      //logger('DEBUG NOT MATCH',cdp_o.url,url, cdp_o.url == url)
    }
  }
  if (!found_o) {
    found_o = await(await fetch(url_new,{method:'PUT'})).json()
  }
  var webSocketDebuggerUrl = found_o.webSocketDebuggerUrl
  logger('webSocketDebuggerUrl',webSocketDebuggerUrl)

  var ws = ws_o[ pattern ]
  logger('ws',typeof ws, (ws?ws.readyState:null))
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
      rt = ws_o[ pattern ] = new WebSocket(webSocketDebuggerUrl)
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
          await sleep_async(1234)
        }
        resolve(rt)
      }
      if (!flg_found) await sleep_async(3333)
      else await sleep_async(1234)
      reject('CONNECT WS TIMEOUT')
    })
  }
  if (expression===undefined) {
    logger('CLOSE',ws.close());
  }else{
    if (reload>0 && flg_found) {
      logger('RELOAD',url)
      await cdp_call(ws,'Page.navigate',{url})
      await sleep_async(reload)
    }
    //eval_js
    var rst = await cdp_call(ws,'Runtime.evaluate',{expression})
    if (rst && rst.result && rst.result.className=='Promise'){
      var {className,description,objectId,subtype} = rst.result
      rst = await cdp_call('Runtime.awaitPromise',{promiseObjectId:objectId,returnByValue:true})
    }
    if (rst && rst.result && rst.result.value) {
      return rst.result.value
    } else {
      logger('TODO',rst)
    }
  }
}

module.exports = module_exports
