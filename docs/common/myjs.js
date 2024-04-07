//megadata-js-coding-simplifier

//var megadata = {
//  tryx: (f,h=null)=>{try{return f()}catch(ex){return h?(h===true?ex:h(ex)):null}}
//}

var tryx = (f,h=null)=>{try{return f()}catch(ex){return h?(h===true?ex:h(ex)):null}}
var tryp = async(f,h=null)=>{try{return await f()}catch(ex){return h?(h===true?ex:h(ex)):null}}

//TODO is_awaitable => is_promise(x) x => instanceof Promise
//TODO try_await => while(is_awaitable(fn))fn=fn()

var s2o = (s)=>tryx(()=>(new Function('return '+s))());//NOTES: JSON.parse() unable to handle single-quote(')
//var s2o = (o)=>tryx(()=>JSON.parse(o));
var o2s = (o)=>tryx(()=>JSON.stringify(o));

// P.js: promise-ensured-with-timeout
var P = (f,timeout=12345) =>
  ('function'==typeof f) ?  new Promise((resolve, reject)=>{
    setTimeout(()=>reject('P.timeout.'+timeout),timeout)
    tryx( ()=>f(resolve,reject), reject )
  }) : P.resolve(f)
P.resolve = (p)=>(async(x)=>x)(p)
P.reject = (p)=>(async(x)=>{throw(x)})(p)
P.delay = P.sleep = (s)=>P((r,j)=>setTimeout(r,s))

//sleep_async = t => new Promise(r=>setTimeout(r,t))

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
      if (part=='*'){ //TODO 或者未来再支持一下 RegExp...
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
  } else { //set mode (暂不支持 RegExp 和 *)
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

function copy_o2o(o1,o2){
  if (!o1) o1={}
  for (var k in o2) {
    o1[k] = o2[k]
  }
  return o1
}
var clone = o=>s2o(o2s(o)) //dirty.quick.clone

//promised aj
//TODO data_s support not-string later
var ajp=(u,data_s,method='GET',timeout=5555)=>P((resolve,reject)=>{
  var x=new XMLHttpRequest();
  var method_s = data_s ? 'POST':method;
  x.open(method_s,u,true);
  x.onreadystatechange=()=>(x.readyState==4)?((x.status==200)?resolve(x.responseText):reject(`${x.status} ${x.responseText}`)):null;
  setTimeout(()=>reject(`408 Request Timeout`),timeout);
  tryx(()=>x.send(data_s));
},timeout);


/////////////////// @deprecated or @oldwebsocket
//TODO NOTES: will merge ajr very soon
var aj=(u,data,callback)=>{
  var x=new XMLHttpRequest();
  var method = data ? 'POST':'GET';
  x.open(method,u,true);
  //x.onreadystatechange=()=>(x.readyState==4)?((x.status==200)?callback(x.responseText):callback(x.status)):null;
  x.onreadystatechange=()=>(x.readyState==4)?callback(x.responseText || x.status):null;
  x.onerror=(ex)=>callback(o2s({errmsg:''+ex}));
  x.send(o2s(data));
};

var ajr=(u,data_s,callback)=>{
  var x=new XMLHttpRequest();
  var method = data_s ? 'POST':'GET';
  x.open(method,u,true);
  x.onreadystatechange=()=>(x.readyState==4)?((x.status==200)?callback(x.responseText):callback(x.status)):null;
  //TODO dump and...
  //setTimeout(()=>callback('timeout'),5555);
  x.send(data_s);
};
var wc = aj;

//one-off mode, should be improved later when long-conn is needed
var protocol;
function send_once_s(api_entry,input_s, callback){
  //console.log('send_once_s protocol',protocol)
  console.log('send_once_s api_entry',api_entry)
  //if (api_entry.substr(0,2)=='ws' || 'ws'==protocol)
  if (api_entry.indexOf('ws://')==0 || api_entry.indexOf('wss://')==0)
  {
	var ws = new WebSocket(api_entry);
	var ws_status = 0;
	flg_sent = 0
	ws.onopen = function() {
		ws_status++;
		if (!flg_sent>0) {
			ws.send(input_s);
			flg_sent++;
		};
	}
	ws.onmessage = function(e) {
		s = e.data
		a = s2o(s)
		if (a && a.length>1) {
			var rt = a[1]
		}else if (a && a.length>0) {
			var rt = a[0]
		}else{
			var rt = e&&e.data ?e.data:e
		}
		callback( rt, s )
		ws.close()
		ws = null
	};
	ws.onerror = function(e) {
		callback(null,'没连上后台')
		ws.close()
		ws = null
	};
  } else {
    //wc
    ajr(api_entry,input_s,s=>{
      var a = s2o(s)
      if (a && a.length>1) {
              var rt = a[1]
      }else if (a && a.length>0) {
              var rt = a[0]
      }else{
              var rt = s
      }
      callback( rt, s )
    })
  }
}

function build_qry_str(o){
  var rt_a = [];
  for (var k in o){
    var v = encodeURIComponent(o[k]);
    rt_a.push(`${k}=${v}`)
  }
  return rt_a.join('&')
}

//localStorage
function getLocalStorageObj(){
  var rt = {}
  var keys = Object.keys(localStorage)
  var vals = Object.values(localStorage)
  for (var k in keys) {
    rt[keys[k]] = vals[k]
  }
  return rt
}

//example. write own if needed...
var build_vue_app = (o)=>{
  if (Vue && Vue.createApp){ //vue3+element-plus
    var vueApp = Vue.createApp(o)
    vueApp.use(ElementPlus);
    var ElementPlusIconsVue = window.ElementPlusIconsVue;
    if (ElementPlusIconsVue){
      for (var name in ElementPlusIconsVue) vueApp.component(name, ElementPlusIconsVue[name])
    }
    var rt = vueApp.mount(o.el || "#divApp");
    rt.vueApp = vueApp;//FOR TMP TEST
  }else{ //old vue2+element-ui
    var rt = new Vue(o)
  }
  return rt
}

var s2doc = s => (doc = document.implementation.createHTMLDocument(), doc.body.innerHTML = s, doc);
//var s2doc = s => ((doc) => (doc.body.innerHTML = s, doc))(document.implementation.createHTMLDocument());
//var s2doc = (s)=>{
//  const doc = document.implementation.createHTMLDocument();
//  const base = doc.createElement('base');
//  base.href = document.location.href;
//  doc.head.appendChild(base);
//  doc.body.innerHTML = s;
//  return doc;
//}
//var clone_el = (ele)=>{
//  if(ele.tagName!='SCRIPT') return ele.cloneNode(true);
//  var rt = document.createElement(ele.tagName); 
//  if(ele.id) rt.id=ele.id;
//  if(ele.type) rt.type=ele.type;
//  if(ele.src) rt.src=ele.src;
//  else rt.innerHTML=ele.innerHTML;
//  return rt
//}
//var clone_el = ele => ele.tagName !== 'SCRIPT' ? ele.cloneNode(true) : Object.assign(document.createElement(ele.tagName), ...['id', 'type', 'src', 'innerHTML'].filter(attr => ele[attr]).map(attr => ({[attr]: ele[attr]})));
//var clone_el = (ele) => {
//  if (ele.tagName !== 'SCRIPT') return ele.cloneNode(true);
//  const rt = document.createElement(ele.tagName);
//  ['id', 'type', 'src', 'innerHTML'].forEach(attr => {
//      if (ele[attr]) rt[attr] = ele[attr];
//      });
//  return rt;
//};

var free_el = (ele)=>{
  while (ele.firstChild) ele.removeChild(ele.firstChild);
  if(ele.parentNode) ele.parentNode.removeChild(ele)
  delete ele;
  return null;
}

var s2bdy = s => (doc = document.implementation.createHTMLDocument(), doc.body.innerHTML = s, doc.body)
var s2el = s => (el= document.createElement('div'), el.innerHTML = s, el);
var clone_el = ele => ele.tagName !== 'SCRIPT' ? ele.cloneNode(true) : Object.assign(document.createElement(ele.tagName), ...['id', 'type', 'src', 'innerHTML'].filter(attr => ele[attr]).map(attr => ({[attr]: ele[attr]})));

//DEPRECATED, should use new jx...ASAP
var render_page = (page_s, appendTo=document.body)=>Array.from(s2bdy(page_s).children).map(o=>appendTo.appendChild(clone_el(o)));
//var render_page = (page_s, appendTo=document.body)=>Array.from(s2el(page_s).children).map(o=>appendTo.appendChild(clone_el(o)));

//@deprecated
var load_page = (page_s, appendAuto=true, appendTo=document)=>{
  console.log('load_page() deprecated, using render_page()')
  var doc = s2doc(page_s)
  var c = doc.body.children;
  var ge = appendTo.createElement('DIV')
  for (var i=0, o=c[i]; i< c.length; o=c[++i]) ge.appendChild(clone_el(o))
  if (appendAuto) appendTo.body.appendChild(ge)
  doc = free_el(doc)
  if (!appendAuto) return ge
}

//function getQueryStr(){return location.search.replace(/^[\?&]/g,"")+'&'+location.hash.replace(/^[#]/g,"")}
function getQueryStr(){return (location.search+'&'+location.hash.replace(/^#/,"")).replace(/^[\?&]/,"").replace(/&$/,"")}
function getQueryVar(k){if(!this._qva){var _qva={};getQueryStr().replace(/([^?=&]+)(=([^&]*))?/g,function($0,$1,$2,$3){_qva[$1]=$3});this._qva=_qva};return k?this._qva[k]:this._qva}
function getSID(){ return getQueryVar('_s'); }
var now = ()=>(new Date()/1000)
var now_i = ()=>Math.round(now())

echart_o = {}
async function draw_echart(dom_id,opt_o){
  var dom = document.getElementById(dom_id);
  var _draw_once = async()=>{
    var cw = dom.parentNode.clientWidth;
    var ch = dom.parentNode.clientHeight;
    dom.style.width=cw;
    dom.style.height=ch;
    var inst = echart_o[dom_id]
    if (!inst){
      inst = echarts.init(dom)
      echart_o[dom_id] = inst
    }
    inst.setOption(opt_o,true)
    return inst
    //var rt = echarts.init(dom)
    //rt.setOption(opt_o,true);
    //return rt
  }
  $(window).resize(_draw_once)
  return _draw_once()
}
