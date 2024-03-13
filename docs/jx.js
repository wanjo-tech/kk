//kk.datakk.com/jx.htm
let jx = (tbx=window.document)=>{ const tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}},
  jev=function(){with(this)return eval(arguments[0])},
  jxEval=(js,ctx)=>jev.bind(ctx)(js),
  jxTryEval=(txt,ctx,h)=>tryx(()=>jxEval(txt,ctx),h),
  s2o=(s,h)=>jxTryEval(`(${s})`,h),
  o2s=(o,h)=>tryx(()=>JSON.stringify(o),h),
  s2frg=(s)=>(s?tbx.createRange().createContextualFragment(s):tbx.createDocumentFragment()),
  s2bdy=s=>(doc=tbx.implementation.createHTMLDocument(),doc.body.innerHTML=s,doc.body),
  s2ela=s=>[...s2frg(s).childNodes],
  s2el=(s)=>s2frg(s).childNodes[0],
  jxExtend=(o)=>((''+o)==='[object Object]'?o2s(o):(o||'')),
  jxCloneJs=(el)=>Object.assign(tbx.createElement(el.tagName),...['id','type','src','innerHTML'].filter(a=>el[a]).map(a=>({[a]:el[a]})));
  function _jxBuild(node, data={}){
    if (node.nodeType === 3)//TEXT_NODE
      return tbx.createTextNode(node.textContent.replace(/\{\{(.*?)\}\}/g,(match,expr)=>jxExtend(jxTryEval(expr,data,ex=>'['+ex+']'))));
    if (node.tagName=='TEMPLATE'||node.tagName=='SCRIPT') node = s2frg(node.innerHTML);
    let returnNode = node.cloneNode(),
        hWarn = ex=>(returnNode.setAttribute?.('j-warn',''+ex),''),
        hErr = ex=>(returnNode.setAttribute?.('j-err',''+ex),'['+ex+']'),
        renAttribute=(d,n,v='',n2)=>(d.removeAttribute(n),d.setAttribute(n2===undefined?(n+'-'):n2,v)),
        rebuildWith=(nn,attrName,attrVal,dt,rt)=>(rt=nn.cloneNode(true),renAttribute(rt,attrName,attrVal),_jxBuild(rt,dt)),
        theAttribute;
    node.attributes && [...node.attributes].forEach(attr=>{
        attr.name.startsWith(':') && renAttribute(returnNode,attr.name,jxTryEval(attr.value,data,hWarn),attr.name.slice(1));
        var handler = function(event){
          this.data = data;
          this.handler = handler;
          var obj = jxTryEval(attr.value,this,true);
          return (typeof obj=='function') ? tryx(()=>obj(event),true) : obj
        };
        attr.name.startsWith('@') && returnNode.addEventListener(attr.name.slice(1),handler);
        });
    if (theAttribute = node.getAttribute?.('j-for')) {
      const match = theAttribute.match(/^\(?(\w+)(?:,\s*(\w+))?(?:,\s*(\w+))?[\)\s]?\s*in\s*(.+)$/)
        if (!match) returnNode.setAttribute?.('j-err','for');
        else{
          const [_,valVar,keyVar,idxVar,itemsStr] = match;
          const items = jxTryEval(itemsStr,data) || {}
          returnNode = s2frg();
          Object.entries(items).forEach(([key, val], idx)=>{
              const loopData={...data,[valVar]:val,...(keyVar&&{[keyVar]:key}),...(idxVar&&{[idxVar]:idx})};
              returnNode.appendChild(rebuildWith(node,'j-for',theAttribute,loopData));
              })
        }
    } else if (theAttribute=node.getAttribute?.('j-if')) {
      let eval_result = !!jxTryEval(theAttribute,data,hWarn),
            hasParentNode = !!node.parentNode,
            elseNode = hasParentNode && node.parentNode.querySelector('[j-else]');
      hasParentNode && elseNode && node.parentNode.removeChild(elseNode);
      hasParentNode && node.parentNode.removeChild(node);
      if (eval_result) return rebuildWith(node,'j-if',theAttribute,data);
      if (elseNode) return rebuildWith(node,'j-else',theAttribute,data)
    } else if (node.hasAttribute?.('j-else')) {
    } else if (theAttribute=node.getAttribute?.('j-text')) {
      renAttribute(returnNode,'j-text',theAttribute);
      returnNode.textContent = jxExtend(jxTryEval(theAttribute,data,hErr))
    } else if (theAttribute=node.getAttribute?.('j-html')) {
      renAttribute(returnNode,'j-html',theAttribute);
      returnNode.innerHTML = jxExtend(jxTryEval(theAttribute,data,hErr))
    } else (node && node.childNodes.forEach(child=>returnNode.appendChild(_jxBuild(child,data))))
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
  function _jxUpsert(pn, nn){ //WARNING: nn will be touched!
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
          else _jxUpsert(pc, nc)
      }
  }
  function jxRender(tgt,src,data){
    (typeof(src)=='string') && (src= (src[0]=='#') ? tbx.querySelector(src) : s2frg(src));
    (typeof tgt=='string') && (tgt= (tgt[0]=='#') ? tbx.querySelector(tgt) : s2frg(tgt));
    _jxUpsert(tgt,_jxBuild(src,data))
    return tgt
  }
  return {jxRender,jxCloneJs,jxEval,jxTryEval,_jxBuild,_jxUpsert,tryx,s2o,o2s,s2bdy,s2el,s2ela,s2frg}
}
