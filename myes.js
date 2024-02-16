const tryx = (f, h = null) => { try { return f() } catch (ex) { return h ? h === true ? ex : h(ex) : null } };
const s2o = (s) => tryx(() => JSON.parse(s));
const o2s = (o) => JSON.stringify(o);
const tryp = async(f, h = null) => { try { return await f() } catch (ex) { return h ? h === true ? ex : h(ex) : null } };

const argv2o=a=>(a||process.argv||[]).reduce((r,e)=>((m=e.match(/^(\/|--?)([\w-]*)="?(.*)"?$/))&&(r[m[2]]=m[3]),r),{});

const sleep_async = (i)=>new Promise((r,j)=>setTimeout(r,i))

function myResponse(rt, status = 200, webSocket = null, ext_headers={}) {
  let response = new Response(rt && typeof rt != "string" ? o2s(rt) : rt, { status, webSocket });
  for (var k in {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type", ...ext_headers
      }) {
    response.headers.set(k, ext_headers[k])
  }
  return response;
}
const http = tryx(()=>require('http'));
const https = tryx(()=>require('https'));
const zlib = tryx(()=>require('zlib'));
const urlModule = tryx(()=>require('url')); // Node.js URL module
const fs = tryx(()=>require('fs'));//readFileSync,writeFileSync...
var nothing = ()=>{};
var date = () => new Date();
var now = () => date().getTime()/1000;
function decompress(response, encoding) {
  switch (encoding) {
    case 'gzip':
      return response.pipe(zlib.createGunzip());
    case 'deflate':
      return response.pipe(zlib.createInflate());
    case 'br':
      return response.pipe(zlib.createBrotliDecompress());
    default:
      return response;
  }
}
//TODO myget and mypost later
function myfetch(url, options={}) {
    const parsedUrl = urlModule.parse(url);

    //options.joinDuplicateHeaders = true //TMP
    options.headers = options.headers || {};
    options.headers['host'] = parsedUrl.host;
    if (url.startsWith('https://')) {
        options.rejectUnauthorized = false; // Disable SSL certificate validation
    } else if (url.startsWith('http://')){
        //
    } else {
        throw 'WRONGURL'
    }
    var referer = options.headers['referer'] = url;// `https://${parsedUrl.host||''}/`;
    const protocol = url.startsWith('https://') ? https : http;

    return new Promise((resolve, reject) => {
        const req = protocol.request(url, options, (response) => {
            const encoding = response.headers['content-encoding'];
            const stream = decompress(response, encoding);
            let data = [];
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
module.exports = { argv2o, tryx, s2o, o2s, myResponse,tryp, myfetch, http, https, sleep_async,fs,nothing,date,now }

