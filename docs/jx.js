//the REAL SMALLEST web js template engine around 100 lines by Wajo; [browser need ECMAScript 2015+]
var jx = (tbx=window.document)=>{
  const tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}}
  const o2s=(o,h)=>tryx(()=>JSON.stringify(o,h))
  const s2o=(s,h)=>tryx(()=>JSON.parse(s,h))
  const jxEval=(js,ctx)=>[function(){with(arguments[1]||{})return eval(arguments[0])}][0](js,ctx)
  const jxEvalText=(txt,ctx)=>tryx(()=>jxEval(txt,ctx),ex=>o2s({err:''+ex}))
  const jxRepl=(node,data)=>tbx.createTextNode(jxEvalText(node.textContent,data))
  const jxTextRepl = (text, data) => text.replace(/\{\{(.*?)\}\}/g, (match, expr)=>jxEvalText(expr,data))
  function _jxLoop(node, data) {
    const loopDeclaration = node.getAttribute('j-for')
    const match = loopDeclaration.match(/^\(?(\w+)(?:,\s*(\w+))?(?:,\s*(\w+))?[\)\s]?\s*in\s*(\w+)$/)
    const returnNode = node.cloneNode()
    if (!match) {
      returnNode.appendChild(tbx.createTextNode(o2s({err:loopDeclaration})))
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
    return returnNode
  }
  function jxRender(node, data) {
    if (node instanceof DocumentFragment) { //IMPORTANT For DocumentFragment
      return [...node.childNodes].map(child => jxRender(child, data))
        .reduce((frg, n) => (frg.append(n), frg), tbx.createDocumentFragment())
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const cloneNode = node.cloneNode(false)
      if (node.hasAttribute('j-expr')){
        var txt = jxTextRepl(node.textContent, data)
        var rt = tbx.createTextNode(txt)
        cloneNode.removeAttribute('j-repl')
        const fragment = cloneNode
        fragment.appendChild(rt)
        return fragment
      }else if (node.hasAttribute('j-eval')){
        const replNode = jxRepl(node, data)
          cloneNode.removeAttribute('j-repl')
          const fragment = cloneNode
          fragment.appendChild(replNode)
          return fragment
      } else if (node.hasAttribute('j-text')) {
        const htmlContent = node.getAttribute('j-text')
        const evalHtmlContent = jxEvalText(htmlContent)
        cloneNode.textContent = evalHtmlContent
        cloneNode.removeAttribute('j-text')
        return cloneNode
      } else if (node.hasAttribute('j-html')) {
        const htmlContent = node.getAttribute('j-html')
        const evalHtmlContent = jxEvalText(htmlContent)
        cloneNode.innerHTML = evalHtmlContent
        cloneNode.removeAttribute('j-html')
        return cloneNode
      } else if (node.hasAttribute('j-else')) { //SKIP, as it should be handled in the j-if branch
      } else if (node.hasAttribute('j-if')) {
        const condition = node.getAttribute('j-if')
        const eval_result = jxEval(condition, data)
        cloneNode.removeAttribute('j-if')
        cloneNode.setAttribute('j-if-'+(eval_result?'yes':'no'),condition)
        var resultNode = eval_result ? node:node.querySelector('[j-else]')
        return [... resultNode?resultNode.childNodes:[]].map(child => jxRender(child, data))
          .reduce((frg, n) => (frg.append(n), frg), cloneNode)
      } else if (node.hasAttribute('j-for')) {
        return _jxLoop(node, data)
      } else {
        [...node.childNodes].forEach(child => {
          const renderedChild = jxRender(child, data)
          if (renderedChild) cloneNode.appendChild(renderedChild)
        })
        return cloneNode
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      return tbx.createTextNode(node.textContent, data)
    } else console.warn('TODO nodeType', node.nodeType, node)
    return tbx.createDocumentFragment()
  }
  var s2ela=s=>[...new DOMParser().parseFromString(s,'text/html').body.children]
  var s2frg=s=>s2ela(s).reduce((frg,n)=>(frg.append(n),frg),tbx.createDocumentFragment())
  var frg2s=frg=>frg?[...frg.childNodes].reduce((html, node) => (html + (node.outerHTML||node.textContent)),''):null
  var s2el=(s)=>s2frg(s).children[0]
  var jxNode=(tagName='div')=>tbx.createElement(tagName)
  var jxClone4Render = ele => ele.tagName !== 'SCRIPT' ? ele.cloneNode(true) : Object.assign(tbx.createElement(ele.tagName), ...['id', 'type', 'src', 'innerHTML'].filter(attr => ele[attr]).map(attr => ({[attr]: ele[attr]})))
  return {jxEval,jxRender,jxNode,tryx,s2o,o2s,s2frg,frg2s,s2el}
}
