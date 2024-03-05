//the REAL SMALLEST web js template engine by Wajo; For Chrome45(ECMAScript2015)+
//DEBUG:[...document.querySelectorAll('[j-err],[j-warn]')].map(console.log)
//TODO jxRender = (tpl_s,target,data) => jxUpsert(target, s2frg(tpl_s))
//TODO jxClone4Js() to support inner-js in target
let jx = (tbx=window.document)=>{
  if (!tbx.console) tbx.console = console
  const tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}}
  const s2o=(s)=>tryx(new Function('return '+s))
  const o2s=(o)=>tryx(()=>JSON.stringify(o))
  const jxEval=(js,ctx)=>[function(){with(arguments[1]||{})return eval(arguments[0])}][0](js,ctx)
  const jxZero=()=>0
  const jxVoid=()=>undefined
  const jxTryEval=(txt,ctx,h)=>tryx(()=>jxEval(txt,ctx),h)
  function jxBuild(node, data={}) {
    if (node.nodeType === Node.TEXT_NODE) return tbx.createTextNode(node.textContent, data)
    const returnNode = node.cloneNode()
    if (!node.hasAttribute) {node.getAttribute=node.hasAttribute=jxZero}
    let hWarn = ex=>(returnNode.setAttribute('j-warn',''+ex),false)
    let hErr = ex=>(returnNode.setAttribute('j-err',''+ex),'['+ex+']')
    let theAttribute;
    if (node.hasAttribute('j-expr')){
      let resultNode= node.textContent.replace(/\{\{(.*?)\}\}/g,(match,expr)=>jxTryEval(expr,data,ex=>'['+ex+']'))
      if (resultNode) returnNode.appendChild(tbx.createTextNode(resultNode))
      else node.setAttribute('j-err','expr')
    }else if (node.hasAttribute('j-eval')){
      let txt = jxTryEval(node.textContent,data,hErr)
      let child = tbx.createTextNode(txt)
      returnNode.appendChild(child)
    } else if (theAttribute=node.getAttribute('j-text')) {
      returnNode.textContent = jxTryEval(theAttribute,data,hErr)
    } else if (theAttribute=node.getAttribute('j-html')) {
      returnNode.innerHTML = jxTryEval(theAttribute,data,hErr)
    } else if (node.hasAttribute('j-else')) { //SKIP for handled in j-if branch
    } else if (theAttribute=node.getAttribute('j-if')) {
      const eval_result = !!jxTryEval(theAttribute,data,hWarn)
      returnNode.setAttribute('j-result',eval_result)
      let resultNode = eval_result ? node:node.querySelector('[j-else]');
      resultNode && [... resultNode.childNodes].map(child=>returnNode.append(jxBuild(child, data)))
    } else if (theAttribute = node.getAttribute('j-for')) {
      const match = theAttribute.match(/^\(?(\w+)(?:,\s*(\w+))?(?:,\s*(\w+))?[\)\s]?\s*in\s*(\w+)$/)
      if (!match) {
        returnNode.setAttribute('j-err','for')
      }else{
        const [_,valVar,keyVar,idxVar,itemsVar] = match
        const items = data[itemsVar] || {}
        Object.entries(items).forEach(([key, val], idx) => {
          const loopData = { ...data, [valVar]: val, ...(keyVar && { [keyVar]: key }), ...(idxVar && { [idxVar]: idx }) }
          node.childNodes.forEach(child => {
            const renderedChild = jxBuild(child.cloneNode(true), loopData)
            if (renderedChild) returnNode.appendChild(renderedChild)
          })
        })
      }
    } else [...node.childNodes].map(child=>returnNode.append(jxBuild(child,data)))
    return returnNode
  }
  function jxUpsert(tgtNode, srcNode) {
    function maybeDifferent(node1, node2) {
      if (node1.nodeType !== node2.nodeType) return true;
      if (node1.nodeType === Node.TEXT_NODE && node1.textContent.trim() !== node2.textContent.trim()) return true;
      if (node1.nodeType === Node.ELEMENT_NODE && node1.tagName !== node2.tagName) return true;
      if (node1.childNodes.length != node2.childNodes.length) return true
      return false;
    }
    function updateRecursive(oldNode, newNode) {
      const oldChildren = Array.from(oldNode.childNodes);
      const newChildren = Array.from(newNode.childNodes);
      const maxLength = Math.max(oldChildren.length, newChildren.length);

      for (let i = 0; i < maxLength; i++) {
        const oldChild = oldChildren[i];
        const newChild = newChildren[i];
        if (!oldChild && newChild) {
          oldNode.appendChild(newChild)
        } else if (oldChild && !newChild) {
          oldNode.removeChild(oldChild);
        } else if (oldChild && newChild && maybeDifferent(oldChild, newChild)) {
          //console.log('replace',newChild)
          oldNode.replaceChild(newChild, oldChild)
        } else //to speed up more
          updateRecursive(oldChild, newChild);
      }
    }
    updateRecursive(tgtNode, srcNode);
  }
  let s2ela=s=>[...new DOMParser().parseFromString(s,'text/html').body.children]
  let s2frg=s=>s2ela(s).reduce((frg,n)=>(frg.append(n),frg),tbx.createDocumentFragment())
  let frg2s=frg=>frg?[...frg.childNodes].reduce((html, node) => (html + (node.outerHTML||node.textContent)),''):null
  let s2el=(s)=>s2frg(s).children[0]
  let jxNode=(tagName='div')=>tbx.createElement(tagName)
  let jxClone4Js = ele => ele.tagName !== 'SCRIPT' ? ele.cloneNode(true) : Object.assign(tbx.createElement(ele.tagName), ...['id', 'type', 'src', 'innerHTML'].filter(attr => ele[attr]).map(attr => ({[attr]: ele[attr]})))
  return {jxEval,jxTryEval,jxBuild,jxUpsert,jxNode,tryx,s2o,o2s,s2frg,frg2s,s2el,s2ela}
}


