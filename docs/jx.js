//kk.datakk.com/jx.htm
let jx = (tbx=window.document)=>{
const tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}},
jev=function(){with(this)return eval(arguments[0])},
jxEval=(js,ctx)=>jev.bind(ctx)(js),
jxTryEval=(txt,ctx,h)=>tryx(()=>jxEval(txt,ctx),h),
s2o=(s,h)=>jxTryEval(`(${s})`,h),
o2s=(o,h)=>tryx(()=>JSON.stringify(o),h),
s2bdy=s=>(doc=tbx.implementation.createHTMLDocument(),doc.body.innerHTML=s,doc.body),
s2ela=s=>[...s2bdy(s).childNodes],
s2el=(s)=>s2bdy(s).childNodes[0],
jxExtend=(o)=>((typeof o=='object')?o2s(o):(o||'')),
jxCloneJs=(el)=>Object.assign(tbx.createElement(el.tagName),...['id','type','src','innerHTML'].filter(a=>el[a]).map(a=>({[a]:el[a]})));
function jxBuild(node, data={}) {
    if (node.nodeType === 3)//TEXT_NODE
      return tbx.createTextNode(node.textContent.replace(/\{\{(.*?)\}\}/g,(match,expr)=>jxExtend(jxTryEval(expr,data,ex=>'['+ex+']'))));
    if (node.tagName=='TEMPLATE'||node.tagName=='SCRIPT') node = s2bdy(node.innerHTML);
    let returnNode = node.cloneNode?.(),
hWarn = ex=>(returnNode.setAttribute?.('j-warn',''+ex),''),
hErr = ex=>(returnNode.setAttribute?.('j-err',''+ex),'['+ex+']'),
buildWithChildren=(n,dt,X)=>(n && n.childNodes.forEach(child=>X.appendChild(jxBuild(child,dt)))),
renAttribute=(d,n,v='',n2)=>(d.removeAttribute(n),d.setAttribute(n2===undefined?(n+'-'):n2,v)),
theAttribute;
    node.attributes && [...node.attributes].forEach(attr=>{
      attr.name.startsWith(':') && renAttribute(returnNode,attr.name,jxTryEval(attr.value,data,hWarn),attr.name.slice(1));
      attr.name.startsWith('@') && returnNode.addEventListener(attr.name.slice(1),function(event){
          var obj = jxTryEval(attr.value,this,true);
          return (typeof obj=='function') ? tryx(()=>obj(event),true) : obj
      });
    });
    if (theAttribute = node.getAttribute?.('j-for')) {
      const match = theAttribute.match(/^\(?(\w+)(?:,\s*(\w+))?(?:,\s*(\w+))?[\)\s]?\s*in\s*(.+)$/)
      if (!match) {
        returnNode.setAttribute?.('j-err','for')
      }else{
        const [_,valVar,keyVar,idxVar,itemsStr] = match
        const items = jxTryEval(itemsStr,data) || {}
        returnNode = tbx.createDocumentFragment() //tbx.createElement('div') //
        Object.entries(items).forEach(([key, val], idx)=>{
          const loopData={...data,[valVar]:val,...(keyVar&&{[keyVar]:key}),...(idxVar&&{[idxVar]:idx})}
          var nn = node.cloneNode();
          renAttribute(nn,'j-for',theAttribute);
          buildWithChildren(node,loopData,nn)
          returnNode.appendChild(jxBuild(nn,loopData))
        })
      }
    } else if (node.hasAttribute?.('j-else')) { //SKIP for handled in j-if branch
      renAttribute(returnNode,'j-else');
    } else if (theAttribute=node.getAttribute?.('j-if')) {
      const eval_result = !!jxTryEval(theAttribute,data,hWarn)
      renAttribute(returnNode,'j-if',eval_result);
      let resultNode = eval_result ? node:node.querySelector('[j-else]');
      buildWithChildren(resultNode,data,returnNode)
    } else if (theAttribute=node.getAttribute?.('j-text')) {
      renAttribute(returnNode,'j-text',theAttribute);
      returnNode.textContent = jxExtend(jxTryEval(theAttribute,data,hErr))
    } else if (theAttribute=node.getAttribute?.('j-html')) {
      renAttribute(returnNode,'j-html',theAttribute);
      returnNode.innerHTML = jxExtend(jxTryEval(theAttribute,data,hErr))
    } else buildWithChildren(node,data,returnNode)
    return returnNode
}
function maybeDifferent(node1, node2) {
    if (node1.nodeType !== node2.nodeType) return true;
    if (node1.nodeType === 1 && node1.tagName !== node2.tagName) return true;//ELEMENT_NODE
    if (node1.nodeType == 3 && node1.textContent != node2.textContent) return true;//TEXT_NODE
    if (node1.childNodes.length != node2.childNodes.length) return true;
    if (!node1.attributes || !node2.attributes) return false;
    if (node1.attributes.length !== node2.attributes.length) return true;
    return [...node1.attributes].some(({name}=attr)=>(node1.getAttribute(name)!==node2.getAttribute(name)))
}
//WARNING: the nn will be touched (so please make it cloned by jxBuild())
function jxUpsert(pn, nn) {
  const pca = [...pn.childNodes||[]]
  const nca = [...nn.childNodes||[]]
  const maxLength = Math.max(pca.length, nca.length)
  for (let i = 0; i < maxLength; i++) {
    let pc=pca[i],nc=nca[i]
    if (nc && nc.tagName=='SCRIPT' && (!nc.type||nc.type=='text/javascript')){
      nc = jxCloneJs(nc);
      if (pc) pn.replaceChild(nc,pc);else pn.appendChild(nc)
    }else if (!pc && nc) pn.appendChild(nc);
    else if (pc && !nc) pn.removeChild(pc);
    else if (maybeDifferent(pc,nc)) pn.replaceChild(nc, pc);
    else jxUpsert(pc, nc)
  }
}
function jxRender(tgt,src,data){
  (typeof(src)=='string') && (src= (src[0]=='#') ? tbx.querySelector(src) : s2bdy(src));
  (typeof tgt=='string') && (tgt= (tgt[0]=='#') ? tbx.querySelector(tgt) : s2bdy(tgt));
  jxUpsert(tgt,jxBuild(src,data))
  return tgt
}
return {jxRender,jxCloneJs,jxEval,jxTryEval,jxBuild,jxUpsert,tryx,s2o,o2s,s2bdy,s2el,s2ela}
}
