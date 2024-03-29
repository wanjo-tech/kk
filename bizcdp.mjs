/*

## cdp server example
"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server=http://127.0.0.1:7777 --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run file://%cd%/cdp_backend.html
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
async function module_exports(opts){
  var {WebSocketClass,pattern, init, url, expression, port, host, debug=false, reload=0} = opts || {}
  // NOTE: pattern is also key.
  if (!WebSocketClass) throw 'need WebSocketClass'
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
  if(ws && ws.readyState==WebSocketClass.OPEN){
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
      let rt = ws_o[ pattern ] = new WebSocketClass(webSocketDebuggerUrl)
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
  if (expression===undefined) {
    logger('CLOSE',ws.close());
  }else{
    if (reload>0 && flg_found) {
      logger('RELOAD',url)
      await cdp_call(ws,'Page.navigate',{url})
      await sleep_async(reload)
    }
    //var rst = await cdp_call(ws,'Runtime.evaluate',{expression})
    var rst = await cdp_call(ws,'Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})
    if (rst && rst.result && rst.result.className=='Promise'){
      logger('!!! Promise',rst.result);//not expecting when using awaitPromise:true ...
      var {className,description,objectId,subtype} = rst.result
      rst = await cdp_call(ws,'Runtime.awaitPromise',{promiseObjectId:objectId,returnByValue:true})
    }
    if (rst && rst.result && rst.result.value) return rst.result.value
    if (rst && rst.result && rst.result.className=='string') return rst.result.result.value
    if (rst && rst.result && rst.result.className=='function') {
      var {className,description,objectId,subtype} = rst.result
      let result = await cdp_call(ws, 'Runtime.callFunctionOn', {
          objectId: objectId,
          functionDeclaration: "function() { return JSON.stringify(this); }",
          returnByValue: true, // 设置为true以直接在响应中返回值
          awaitPromise: true  // 如果对象是一个Promise，等待它解决
      });
      let jsonString = result.result.value;
      return JSON.parse(jsonString)
    }
    logger('!!! TODO cdp rst',rst)
  }
}

export default module_exports
