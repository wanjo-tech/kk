var tryx=(f,h=null)=>{try{return(f())}catch(ex){return(h?h===true?ex:h(ex):null)}},
s2o=(s)=>tryx(()=>JSON.parse(s)),
o2s=(o)=>JSON.stringify(o),
tryp=async(f,h=null)=>{try{return(await f())}catch(ex){return(h?h===true?ex:h(ex):null)}};

var argv2o=(a,m)=>(a||require('process').argv||[]).reduce((r,e)=>((m=e.match(/^(\/|--?)([\w-]*)="?(.*)"?$/))&&(r[m[2]]=m[3]),r),{});
var argo = tryx(argv2o);

var sleep_async = (i)=>new Promise((r,j)=>setTimeout(r,i))

var jev=function(){with(arguments[1]||this)return eval('const globalThis=undefined;'+arguments[0])},
jeval=(js,ctx,that)=>jev.bind(that||ctx)(js,ctx);

//for backend:
var dirtyPause=(i=11)=>(require('child_process').execSync(`"${process.execPath}" -e "setTimeout(()=>true,${i})"`),true);

//for cf worker...
function myResponse(rt, status = 200, webSocket = null, ext_headers={}) {
  var response = new Response(rt && typeof rt != "string" ? o2s(rt) : rt, { status, webSocket });
  for (var k in {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type", ...ext_headers
      }) {
    response.headers.set(k, ext_headers[k])
  }
  return response;
}
var tryImport = async(mmm,name='default',hdl=false)=>(await import(mmm))[name];
var tryRequire = (mmm,fff=false,hdl=false)=>{
  if(fff){ delete require.cache[require.resolve(mmm)] }
  return tryx(()=>require(mmm),hdl)
}

var http = tryRequire('http')
var https = tryRequire('https')
var zlib = tryRequire('zlib')
var urlModule = tryRequire('url')
var fs = tryRequire('fs')

var nothing = ()=>{};

var date =()=>new Date();
var get_timestamp = (d)=>(d||date()).getTime();
var get_time_iso = (d)=>((d||date())).toISOString();
var get_time_YmdHMS = (d)=>get_time_iso(d).slice(0,19).replace('T',' ');
var now = (d) => get_timestamp(d)/1000;

function decompress(response, encoding) {
  switch (encoding) {
    case 'gzip': return response.pipe(zlib.createGunzip());
    case 'deflate': return response.pipe(zlib.createInflate());
    case 'br': return response.pipe(zlib.createBrotliDecompress());
    default: return response;
  }
}
function handleWorkerProtocol(url, options) {
    const timers = require('timers');
    let {setTimeout,clearTimeout} = timers;
    const { Worker } = require('worker_threads');
    //const filePath = urlModule.fileURLToPath(url.replace('worker://', 'file://'));
    const filePath = url.replace('worker://', '');
    let p = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(()=>{
            reject({'message':'Timeout'})
            worker.terminate();
        },options.timeout||666);
        const worker = new Worker(filePath, { workerData: options });
        worker.on('message', message=>{
            clearTimeout(timeoutId);
            resolve(message);
            worker.terminate();
        });
        worker.on('error',(error) => {
            clearTimeout(timeoutId);
            reject(error);
            worker.terminate();
        }); 
        worker.on('exit', (code) => {
            clearTimeout(timeoutId);
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
            worker.terminate();
        });
    });
    return p;
}
//in case no fetch() but https or http do.
function myfetch(url, options={}) {
    var parsedUrl = urlModule.parse(url);

    //options.joinDuplicateHeaders = true //TMP
    options.headers = options.headers || {};
    options.headers['host'] = parsedUrl.host;
    if (url.startsWith('worker://')) {
        return handleWorkerProtocol(url, options);
    } else if (url.startsWith('https://')) {
        options.rejectUnauthorized = false; // Disable SSL certificate validation
    } else if (url.startsWith('http://')){
        //
    } else {
        throw 'WRONGURL'
    }
    var referer = options.headers['referer'] = url;// `https://${parsedUrl.host||''}/`;
    var webModule = url.startsWith('https://') ? https : http;

    return new Promise((resolve, reject) => {
        var req = webModule.request(url, options, (response) => {
            var encoding = response.headers['content-encoding'];
            var stream = decompress(response, encoding);
            var data = [];
            stream.on('data', (chunk) => data.push(chunk));
            stream.on('end', () => {
                resolve({ data: Buffer.concat(data), headers: response.headers, statusCode:response.statusCode, options });
            });
            stream.on('error', (error) => reject(error));
        });
        req.on('error', (error) => reject(error));
        if (options.body) req.write(options.body);
        req.end();
    });
}
var gzip2s=(s)=>new Promise((r,j)=>zlib.gzip(s,(e,t)=>(e)?j('gzip2s:'+e):r(t)));
function jPath(obj,path,val){
  var curObj = obj || {}
  var path_a = (path||'').split('/')
  var path_a_length = path_a.length
  var rt_a = []
  var part = path;
  if (val == undefined) { //get mode
    for (var slice_i=0;slice_i<path_a_length;slice_i++) {
      if (path_a[slice_i]=='') continue //skip empty...
      part = path_a[slice_i]
      if (part=='*'){ //TODO RegExp...
        var sub_path_a = path_a.slice(slice_i+1)
        var sub_path = sub_path_a.join('/')
        if (sub_path==''){
          rt_a = Object.values(curObj)
        }else{
          for (var subval of Object.values(curObj)){
            rt_a=rt_a.concat(jPath(subval, sub_path) || [])
          }
        }
      }else{
        curObj = (curObj||{})[part]
      }
    }
    return (part=='*'||rt_a.length>0) ? rt_a : curObj;
  } else { //set mode (TODO RegExp and *)
    var key = path_a.slice(-1)
    for (var part of path_a.slice(0,-1)) {
      if (part=='') continue
      if (part=='*') throw Error('not support * in jPath for set mode')
      if (!curObj[part]) curObj[part] = {}
      curObj = curObj[part]
    }
    if (curObj[key]!=val)
      curObj[key] = val
    return obj //for chain
  }
}
//var jPathAsync = async(obj,path,val)=>jPath(await obj,path,val);
var jPathAsync = async(obj,path,val)=>jPath((obj instanceof Promise)?(await obj):obj,path,val);

var system = async(command, encoding='utf-8', chcp='65001')=>{
  var { exec } = require('child_process');
  var isWindows = require('process').platform === 'win32';
  var fullCommand = isWindows ? `chcp 65001 >nul && ${command}` : command;
  var shell = isWindows ? 'cmd.exe' : '/bin/sh';
  return new Promise((resolve, reject) => exec(
    fullCommand, { encoding, shell }, (error, stdout, stderr) => {
      if (error) reject(`exec error: ${error}`);
      else if (stderr) reject(`stderr: ${stderr}`);
      else resolve(stdout.trim());
    })
  );
}
var safe = str=>(""+str).replace(/[^0-9a-z_\.\*]+/gi, '');
var qstr = str=>`'${safe(str)}'`;

var myes={argv2o,argo,tryx,s2o,o2s,myResponse,tryp,myfetch,http,https,urlModule,sleep_async,
fs,nothing,date,now,get_time_iso,get_timestamp,get_time_YmdHMS,tryRequire,zlib,gzip2s,jPath,jPathAsync,system,jev,jeval,safe,qstr,dirtyPause,tryImport,
  //@ref https://cnodejs.org/topic/504061d7fef591855112bab5
  md5: (s) => require('crypto').createHash('md5').update(s).digest('hex'),
  md5_ascii : function(){for(var m=[],l=0;64>l;)m[l]=0|4294967296*Math.abs(Math.sin(++l));return function(c){var e,g,f,a,h=[];c=unescape(encodeURI(c));for(var b=c.length,k=[e=1732584193,g=-271733879,~e,~g],d=0;d<=b;)h[d>>2]|=(c.charCodeAt(d)||128)<<8*(d++%4);h[c=16*(b+8>>6)+14]=8*b;for(d=0;d<c;d+=16){b=k;for(a=0;64>a;)b=[f=b[3],(e=b[1]|0)+((f=b[0]+[e&(g=b[2])|~e&f,f&e|~f&g,e^g^f,g^(e|~f)][b=a>>4]+(m[a]+(h[[a,5*a+1,3*a+5,7*a][b]%16+d]|0)))<<(b=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21][4*b+a++%4])|f>>>32-b),e,g];for(a=4;a;)k[--a]=k[a]+b[a]}for(c="";32>a;)c+=(k[a>>3]>>4*(1^a++&7)&15).toString(16);return c}}(),
  base64_encode: t => Buffer.from(t).toString('base64'),
  base64_decode: t => Buffer.from(t, 'base64').toString(),
  sha1: (s) => require('crypto').createHash('sha1').update(s).digest('hex'),
  sha1_ascii: function (d){var l=0,a=0,f=[],b,c,g,h,p,e,m=[b=1732584193,c=4023233417,~b,~c,3285377520],n=[],k=unescape(encodeURI(d));for(b=k.length;a<=b;)n[a>>2]|=(k.charCodeAt(a)||128)<<8*(3-a++%4);for(n[d=b+8>>2|15]=b<<3;l<=d;l+=16){b=m;for(a=0;80>a;b=[[(e=((k=b[0])<<5|k>>>27)+b[4]+(f[a]=16>a?~~n[l+a]:e<<1|e>>>31)+1518500249)+((c=b[1])&(g=b[2])|~c&(h=b[3])),p=e+(c^g^h)+341275144,e+(c&g|c&h|g&h)+882459459,p+1535694389][0|a++/20]|0,k,c<<30|c>>>2,g,h])e=f[a-3]^f[a-8]^f[a-14]^f[a-16];for(a=5;a;)m[--a]=m[a]+b[a]|0}for(d="";40>a;)d+=(m[a>>3]>>4*(7-a++%8)&15).toString(16);return d},
  aesEncode:(data, key="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=")=>{
    var crypto = require('crypto');
    var cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  aesDecode:(encrypted, key="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=")=>{
    var crypto = require('crypto');
    var decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },
  uuid: () => {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  },
}
if (typeof module!='undefined') module.exports = myes
//export default myes;
