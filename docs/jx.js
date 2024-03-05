//the REAL SMALLEST web js template engine by Wajo; For Chrome45(ECMAScript2015)+
//DEBUG:[...document.querySelectorAll('[j-err],[j-warn]')].map(console.log)
let jx = (tbx=window.document)=>{
  if (!tbx.console) tbx.console = console
  const tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}}
  const jxEval=(js,ctx)=>[function(){with(arguments[1]||{})return eval(arguments[0])}][0](js,ctx)
  const jxZero=()=>0
  const jxVoid=()=>undefined
  const jxTryEval=(txt,ctx,h)=>tryx(()=>jxEval(txt,ctx),h)
  function jxRender(node, data) {
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
      let txt = jxTryEval(theAttribute,data,hErr)
      if (txt) returnNode.textContent = txt
    } else if (theAttribute=node.getAttribute('j-html')) {
      let txt = jxTryEval(theAttribute,data,hErr)
      if (txt) returnNode.innerHTML = txt
    } else if (node.hasAttribute('j-else')) { //SKIP, as handled in j-if branch
    } else if (theAttribute=node.getAttribute('j-if')) {
      const eval_result = !!jxTryEval(theAttribute,data,hWarn)
      returnNode.setAttribute('j-result',eval_result)
      let resultNode = eval_result ? node:node.querySelector('[j-else]');
      resultNode && [... resultNode.childNodes].map(child=>returnNode.append(jxRender(child, data)))
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
            const renderedChild = jxRender(child.cloneNode(true), loopData)
            if (renderedChild) returnNode.appendChild(renderedChild)
          })
        })
      }
    } else [...node.childNodes].map(child=>returnNode.append(jxRender(child,data)))
    return returnNode
  }
  let s2ela=s=>[...new DOMParser().parseFromString(s,'text/html').body.children]
  let s2frg=s=>s2ela(s).reduce((frg,n)=>(frg.append(n),frg),tbx.createDocumentFragment())
  let frg2s=frg=>frg?[...frg.childNodes].reduce((html, node) => (html + (node.outerHTML||node.textContent)),''):null
  let s2el=(s)=>s2frg(s).children[0]
  let jxNode=(tagName='div')=>tbx.createElement(tagName)
  let jxClone4Render = ele => ele.tagName !== 'SCRIPT' ? ele.cloneNode(true) : Object.assign(tbx.createElement(ele.tagName), ...['id', 'type', 'src', 'innerHTML'].filter(attr => ele[attr]).map(attr => ({[attr]: ele[attr]})))
  return {jxEval,jxTryEval,jxRender,jxNode,tryx,s2frg,frg2s,s2el}
}
