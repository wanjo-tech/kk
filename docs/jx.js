//the REAL SMALLEST web-js-template engine by Wanjo; For Chrome45(ECMAScript2015)+
//DOC&TEST https://kk.datakk.com/jx.htm
//TODO j-bind, j-model @onchange etc..
let jx = (tbx=window.document)=>{
  const tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}}
  const jev=function(){with(this)return eval(arguments[0])}
  const jxEval=(js,ctx)=>jev.bind(ctx)(js)
  const jxTryEval=(txt,ctx,h)=>tryx(()=>jxEval(txt,ctx),h)
  const s2o=(s,h)=>jxTryEval(`(${s})`,h)
  const o2s=(o,h)=>tryx(()=>JSON.stringify(o),h)
  function jxBuild(node, data={}) {
    if (node.nodeType === Node.TEXT_NODE) return tbx.createTextNode(node.textContent, data)
    if (node.tagName=='TEMPLATE'||node.tagName=='SCRIPT') node = s2bdy(node.innerHTML)
    const returnNode = node.cloneNode?.()
    let hWarn = ex=>(returnNode.setAttribute?.('j-warn',''+ex),'')
    let hErr = ex=>(returnNode.setAttribute?.('j-err',''+ex),'['+ex+']')
    let buildWithChildren=(n,dt)=>(n && n.childNodes.forEach(child=>returnNode.appendChild(jxBuild(child,dt))))
    let theAttribute
    if (theAttribute=node.getAttribute?.(':value'))
      returnNode.setAttribute?.('value',jxTryEval(theAttribute,data,hWarn))
    if (node.hasAttribute?.('j-expr')){
      let txt = node.textContent.replace(/\{\{(.*?)\}\}/g,(match,expr)=>jxTryEval(expr,data,ex=>'['+ex+']'))
      if (txt) returnNode.appendChild(tbx.createTextNode(txt))
      else node.setAttribute?.('j-err','expr')
    }else if (node.hasAttribute?.('j-eval')){
      let txt = jxTryEval(node.textContent,data,hErr)
      returnNode.appendChild(tbx.createTextNode(txt))
    } else if (theAttribute=node.getAttribute?.('j-text')) {
      returnNode.textContent = jxTryEval(theAttribute,data,hErr)
    } else if (theAttribute=node.getAttribute?.('j-html')) {
      returnNode.innerHTML = jxTryEval(theAttribute,data,hErr)
    } else if (node.hasAttribute?.('j-else')) { //SKIP for handled in j-if branch
    } else if (theAttribute=node.getAttribute?.('j-if')) {
      const eval_result = !!jxTryEval(theAttribute,data,hWarn)
      returnNode.setAttribute?.('j-result',eval_result)
      let resultNode = eval_result ? node:node.querySelector('[j-else]');
      buildWithChildren(resultNode,data)
    } else if (theAttribute = node.getAttribute?.('j-for')) {
      const match = theAttribute.match(/^\(?(\w+)(?:,\s*(\w+))?(?:,\s*(\w+))?[\)\s]?\s*in\s*(\w+)$/)
      if (!match) {
        returnNode.setAttribute?.('j-err','for')
      }else{
        const [_,valVar,keyVar,idxVar,itemsVar] = match
        const items = data[itemsVar] || {}
        Object.entries(items).forEach(([key, val], idx)=>{
          const loopData={...data,[valVar]:val,...(keyVar&&{[keyVar]:key}),...(idxVar&&{[idxVar]:idx})}
          buildWithChildren(node,loopData)
        })
      }
    } else buildWithChildren(node,data)
    return returnNode
  }
  function maybeDifferent(node1, node2) {
    if (node1.nodeType !== node2.nodeType) return true;
    if (node1.nodeType === Node.ELEMENT_NODE && node1.tagName !== node2.tagName) return true;
    if (node1.nodeType == Node.TEXT_NODE && node1.textContent != node2.textContent) return true; 
    if (node1.childNodes.length != node2.childNodes.length) return true;
    if (!node1.attributes || !node2.attributes) return false;
    if (node1.attributes.length !== node2.attributes.length) return true;
    for (let i = 0; i < node1.attributes.length; i++) {
      const attrName = node1.attributes[i].name;
      if (node1.getAttribute(attrName) !== node2.getAttribute(attrName)) return true;
    }
    return false;
  }
  //WARNING: the newNode will be touched (so please make it cloned by jxBuild())
  function jxUpsert(oldNode, newNode) {
    const oldChildren = [...oldNode.childNodes||[]]
    const newChildren = [...newNode.childNodes||[]]
    const maxLength = Math.max(oldChildren.length, newChildren.length)
    for (let i = 0; i < maxLength; i++) {
      const oldChild = oldChildren[i]
      let newChild = newChildren[i]
      if (newChild && newChild.tagName=='SCRIPT' && (!newChild.type||newChild.type=='text/javascript')){
        newChild = jxCloneJs(newChild) // trick for js el
        if (oldChild) oldNode.replaceChild(newChild,oldChild)
        else oldNode.appendChild(newChild)
      }else if (!oldChild && newChild) {
        oldNode.appendChild(newChild)
      } else if (oldChild && !newChild) {
        oldNode.removeChild(oldChild)
      } else if (maybeDifferent(oldChild,newChild)) {
        oldNode.replaceChild(newChild, oldChild)
      } else {
        jxUpsert(oldChild, newChild)
      }
    }
  }
  let s2bdy=s=>(doc=document.implementation.createHTMLDocument(),doc.body.innerHTML=s,doc.body)
  let s2ela=s=>[...s2bdy(s).childNodes]
  let s2el=(s)=>s2bdy(s).childNodes[0]
  let jxCloneJs=(el)=>Object.assign(tbx.createElement(el.tagName),...['id','type','src','innerHTML'].filter(a=>el[a]).map(a=>({[a]:el[a]})))
  return {jxCloneJs,jxEval,jxTryEval,jxBuild,jxUpsert, tryx,s2o,o2s,s2bdy,s2el,s2ela}
}

