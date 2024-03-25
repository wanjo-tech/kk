var jx = (tbx=window.document,__='j-')=>{const VER=240324.3,DOC='kk.datakk.com',
JIF=__+'if',JELSE=__+'else',JFOR=__+'for',JTEXT=__+'text',JHTML=__+'html',JWARN=__+'warn',
tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}},
jev=function(){with(arguments[1]||this)return eval(arguments[0])},
jxEval=(js,ctx,that)=>jev.bind(that||ctx)(js,ctx),
jxTryEval=(txt,ctx,h,that)=>tryx(()=>jxEval(txt,ctx,that),h),
s2o=(s,h)=>jxTryEval(`(${s})`,h),
o2s=(o,h)=>tryx(()=>JSON.stringify(o),h),
s2frg=(s)=>(s?tbx.createRange().createContextualFragment(s):tbx.createDocumentFragment()),
frg2s=frg=>frg?[...frg.childNodes].reduce((h,n)=>(h+(n.outerHTML||n.textContent)),''):null,
s2bdy=s=>(doc=tbx.implementation.createHTMLDocument(),doc.body.innerHTML=s,doc.body),//deprecated
s2ela=s=>[...s2frg(s).childNodes],
s2el=(s)=>s2frg(s).childNodes[0],
_jxExpand=(o)=>typeof(o||'')=='string'?(o||''):o2s(o),
_findSiblingWithAttribute=(n,a)=>{while(n=n.nextSibling){if(n.hasAttribute?.(a))return n}},
frg4s=(s)=>(typeof(s)=='string')?(s[0]=='#'?tbx.querySelector(s):s2frg(s)):s;
function _jxBuild(node, data={}){
  if(node.nodeType === 3)//TEXT_NODE
    return tbx.createTextNode(node.textContent.replace(/\{\{(.*?)\}\}/g,(m,xpr)=>_jxExpand(jxTryEval(xpr,data,ex=>'['+ex+']'))));
  if(node.tagName=='TEMPLATE') node = s2frg(node.innerHTML);
  let returnNode = node.cloneNode(),hWarn=ex=>(returnNode.setAttribute?.(JWARN,''+ex),''),
    renAttribute=(d,n,v='',n2)=>(d.removeAttribute?.(n),v&&d.setAttribute?.(n2===undefined?(n+'-'):n2,v)),
    rebuildWith=(nn,attrName,attrVal,dt,rt)=>(rt=nn.cloneNode(true),renAttribute(rt,attrName,attrVal),_jxBuild(rt,dt));
  for(const{name,value}of[...node.attributes||[]]){
    if(name==JFOR){
      const match = value.match(/^\(?(\w+)(?:,\s*(\w+))?(?:,\s*(\w+))?[\)\s]?\s*in\s*(.+)$/);
      if(!match) returnNode.setAttribute?.(JWARN,'ex:'+value);
      else{
        const [_,valVar,keyVar,idxVar,itemsStr] = match;
        let items = jxTryEval(itemsStr,data) || {};
        if(typeof items=='number') items=Array.from({length:items},(_,i)=>i);
        returnNode = s2frg();
        Object.entries(items).forEach(([key,val],idx)=>returnNode.appendChild(rebuildWith(node,JFOR,value,
          {...data,[valVar]:val,...(keyVar&&{[keyVar]:key}),...(idxVar&&{[idxVar]:idx})}//loopsen-data
        )));
      };return returnNode;
    }else if(name==JIF){
      let elseNode = _findSiblingWithAttribute(node,JELSE);
      if(node.parentNode){
        elseNode && node.parentNode.removeChild(elseNode);
        node.parentNode.removeChild(node);
      }
      if(!!jxTryEval(value,data,ex=>hWarn(''+value+':'+ex))) return rebuildWith(node,JIF,value,data);
      else if(elseNode) return rebuildWith(elseNode,JELSE,value,data);
      else return s2frg();
    }else if(name==JELSE) { return s2frg();
    }else if(name==JTEXT || name==JHTML){
      renAttribute(returnNode,name,value);
      let expand_value = _jxExpand(jxTryEval(value,data,ex=>hWarn(''+value+':'+ex)));
      returnNode[name==JTEXT?'textContent':'innerHTML'] = expand_value;
      if(node.tagName=='INPUT') returnNode.setAttribute?.('value',expand_value);
    }else if(name.startsWith(':')){renAttribute(returnNode,name,jxTryEval(value,data,ex=>hWarn(''+name+':'+ex)),name.slice(1))
    }else if(name.startsWith('@')){
      renAttribute(returnNode,name,value,'ren-'+name.slice(1));
      let handler = function(event){ this.data = data; this.handler = handler;
        let obj = jxTryEval(value,data,ex=>hWarn(''+value+':'+ex),this);return (obj && obj.call)?tryx(()=>obj(event),ex=>hWarn(''+':'+ex)):obj;
      };returnNode.addEventListener(name.slice(1),handler);
    }
  }//for
  node.childNodes.forEach(child=>returnNode.appendChild(_jxBuild(child,data)))
  return returnNode
}
function _diff(n1, n2) {
  if(n1.nodeType !== n2.nodeType || n1.childNodes.length !== n2.childNodes.length) return true;
  if(n1.nodeType === 1) return n1.tagName !== n2.tagName || [...n1.attributes].some(attr => n1.getAttribute(attr.name) !== n2.getAttribute(attr.name));
  return n1.nodeType === 3 && n1.textContent !== n2.textContent;
}
function _jxUpsert(pn, nn, skipJsTag=false){
  const pca = [...pn.childNodes||[]],nca = [...nn.childNodes||[]],maxLength = Math.max(pca.length, nca.length);
  for(let i=0;i<maxLength;i++){
    let pc=pca[i],nc=nca[i];
    if(!pc && nc) pn.appendChild(nc);
    else if(pc && !nc) pn.removeChild(pc);
    else if((nc && nc.tagName=='SCRIPT'&&(!nc.type||nc.type=='text/javascript')&&!skipJsTag)||_diff(pc,nc))
      pn.replaceChild(nc, pc);
    else _jxUpsert(pc, nc, skipJsTag)
  }
  return pn
}
function jxMon(data,onAfterChange){
  setTimeout(onAfterChange,1);//landing :P
  return new Proxy(data, {
    get(target, property, receiver) {
      return tryx(()=>new Proxy(target[property], handler),(err)=>Reflect.get(target, property, receiver))
    },
    set(target, property, value) {
      let old = Reflect.get(target, property, target);
      setTimeout(()=>onAfterChange(property, value, old),1);
      return Reflect.set(target, property, value);
    }
  });
}
let jxRender=(tgt,src,data)=>_jxUpsert(tgt=frg4s(tgt),_jxBuild(src=frg4s(src),data));
return {VER,DOC,jxMon,jxRender,jxEval,jxTryEval,_jxBuild,_jxUpsert,tryx,s2o,o2s,s2bdy,s2el,s2ela,s2frg,frg2s,frg4s}
}
