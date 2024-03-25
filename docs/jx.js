//kk.datakk.com/jx.htm
var jx = (tbx=window.document,__='j-')=>{const VER=240324.3,
JIF=__+'if',JELSE=__+'else',JFOR=__+'for',JTEXT=__+'text',JHTML=__+'html',JWARN=__+'warn',JERR=__+'err',
tryx=(f,h)=>{try{return f()}catch(ex){return h?h===true?ex:h(ex):h}},
jev=function(){with(arguments[1]||this)return eval(arguments[0])},
jxEval=(js,ctx,that)=>jev.bind(that||ctx)(js,ctx),
jxTryEval=(txt,ctx,h,that)=>tryx(()=>jxEval(txt,ctx,that),h),
s2o=(s,h)=>jxTryEval(`(${s})`,h),
o2s=(o,h)=>tryx(()=>JSON.stringify(o),h),
s2frg=(s)=>(s?tbx.createRange().createContextualFragment(s):tbx.createDocumentFragment()),
frg2s=frg=>frg?[...frg.childNodes].reduce((h,n)=>(h+(n.outerHTML||n.textContent)),''):null,
s2bdy=s=>(doc=tbx.implementation.createHTMLDocument(),doc.body.innerHTML=s,doc.body),
s2ela=s=>[...s2frg(s).childNodes],
s2el=(s)=>s2frg(s).childNodes[0],
_jxExpand=(o)=>typeof(o||'')=='string'?(o||''):o2s(o),
_findSiblingWithAttribute=(n,a)=>{while(n=n.nextSibling){if(n.hasAttribute?.(a))return n}},
frg4s=(s)=>(typeof(s)=='string')?(s[0]=='#'?tbx.querySelector(s):s2frg(s)):s;
function _jxBuild(node, data={}){
  if (node.nodeType === 3)//TEXT_NODE
    return tbx.createTextNode(node.textContent.replace(/\{\{(.*?)\}\}/g,(m,xpr)=>_jxExpand(jxTryEval(xpr,data,ex=>'['+ex+']'))));
  if (node.tagName=='TEMPLATE') node = s2frg(node.innerHTML);
  var returnNode = node.cloneNode(),hWarn=ex=>(returnNode.setAttribute?.(JWARN,''+ex),''),
    renAttribute=(d,n,v='',n2)=>(d.removeAttribute?.(n),v&&d.setAttribute?.(n2===undefined?(n+'-'):n2,v)),
    rebuildWith=(nn,attrName,attrVal,dt,rt)=>(rt=nn.cloneNode(true),renAttribute(rt,attrName,attrVal),_jxBuild(rt,dt));
  for(const{name,value}of[...node.attributes||[]]){
      if (name==JFOR){
        const match = value.match(/^\(?(\w+)(?:,\s*(\w+))?(?:,\s*(\w+))?[\)\s]?\s*in\s*(.+)$/);
        if (!match) returnNode.setAttribute?.(JERR,'for');
        else{
          const [_,valVar,keyVar,idxVar,itemsStr] = match;
          var items = jxTryEval(itemsStr,data) || {}
          if (typeof items=='number') items = Array.from({ length: items }, (_, i) => i);
          returnNode = s2frg();
          Object.entries(items).forEach(([key, val], idx)=>{
            const loopData={...data,[valVar]:val,...(keyVar&&{[keyVar]:key}),...(idxVar&&{[idxVar]:idx})};
            returnNode.appendChild(rebuildWith(node,JFOR,value,loopData));
          })
        }
        return returnNode;
      } else if (name==JIF){
        var elseNode = _findSiblingWithAttribute(node,JELSE);
        if (node.parentNode){
          elseNode && node.parentNode.removeChild(elseNode);
          node.parentNode.removeChild(node);
        }
        if (!!jxTryEval(value,data,hWarn)) return rebuildWith(node,JIF,value,data);
        else if (elseNode) return rebuildWith(elseNode,JELSE,value,data);
        else return s2frg();
      } else if (name==JELSE) { return s2frg();
      } else if (name==JTEXT || name==JHTML){
        renAttribute(returnNode,name,value);
        var expand_value = _jxExpand(jxTryEval(value,data,hWarn));
        returnNode[name==JTEXT?'textContent':'innerHTML'] = expand_value;
        if (node.tagName=='INPUT') returnNode.setAttribute?.('value',expand_value);
      } else if (name.startsWith(':')){renAttribute(returnNode,name,jxTryEval(value,data,hWarn),name.slice(1))
      } else if (name.startsWith('@')){
        renAttribute(returnNode,name,value,'ren-'+name.slice(1));
        var handler = function(event){ this.data = data; this.handler = handler;
          var obj = jxTryEval(value,data,hWarn,this);return (obj && obj.call)?tryx(()=>obj(event),hWarn):obj;
        };returnNode.addEventListener(name.slice(1),handler);
      }
    }//for
    node.childNodes.forEach(child=>returnNode.appendChild(_jxBuild(child,data)))
    return returnNode
}
function _mayDifferent(node1, node2) {
  if (node1.nodeType !== node2.nodeType) return true;
  if (node1.nodeType === 1 && node1.tagName !== node2.tagName) return true;//ELEMENT_NODE
  if (node1.nodeType == 3 && node1.textContent != node2.textContent) return true;//TEXT_NODE
  if (node1.childNodes.length != node2.childNodes.length) return true;
  if (!node1.attributes || !node2.attributes) return false;
  if (node1.attributes.length !== node2.attributes.length) return true;
  return [...node1.attributes].some(({name}=attr)=>(node1.getAttribute(name)!==node2.getAttribute(name)))
}
function _jxUpsert(pn, nn, skipJsTag=false){
  const pca = [...pn.childNodes||[]],nca = [...nn.childNodes||[]],maxLength = Math.max(pca.length, nca.length);
  for(var i=0;i<maxLength;i++){
    var pc=pca[i],nc=nca[i];
    if (!pc && nc) pn.appendChild(nc);
    else if (pc && !nc) pn.removeChild(pc);
    else if ((nc && nc.tagName=='SCRIPT'&&(!nc.type||nc.type=='text/javascript')&&!skipJsTag)||_mayDifferent(pc,nc))
      pn.replaceChild(nc, pc);
    else _jxUpsert(pc, nc, skipJsTag)
  }
  return pn
}
function jxMon(data,onChange){
  setTimeout(onChange,1);//landing;)
  return new Proxy(data, {
    get(target, property, receiver) {
      return tryx(()=>new Proxy(target[property], handler),(err)=>Reflect.get(target, property, receiver))
    },
    set(target, property, value) {
      setTimeout(()=>onChange(property, value, Reflect.get(target, property, target)),1);
      return Reflect.set(target, property, value);
    }
  });
}
var jxRender=(tgt,src,data)=>_jxUpsert(tgt=frg4s(tgt),_jxBuild(src=frg4s(src),data));
return {VER,jxRender,jxEval,jxTryEval,_jxBuild,_jxUpsert,tryx,s2o,o2s,s2bdy,s2el,s2ela,s2frg,frg2s,frg4s,jxMon}
}
