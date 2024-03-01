/*

MY TMP SOLUTION as TINY VM

WARNING !!! STILL NOT READY FOR PRODUCTION-PUBLIC PROJECT

The node:vm module is not a security mechanism. Do not use it to run untrusted code.

https://nodejs.org/api/vm.html#vm_vm_executing_javascript
https://thegoodhacker.com/posts/the-unsecure-node-vm-module/
https://snyk.io/blog/security-concerns-javascript-sandbox-node-js-vm-module/

h*ck cases:
typeof%20this.constructor.constructor("return%20this")().process
this.constructor.constructor("return process")().exit()
var x = this.constructor.constructor("return process.mainModule.require(\'child_process\').execSync(\'cat /etc/passwd\',{encoding:'utf-8'})")()
this.constructor.constructor('console.log(process.env)')()
http://localhost:8080/?this.constructor.constructor(%22return%20this.constructor.constructor(%27return%20require%27)()%22)()
http://localhost:8080/?this.constructor.constructor(%27console.log(global)%27)()
http://localhost:8080/?this.constructor.constructor(%27console.log(this)%27)()

*/
var debug = false
var not_safe_a = ['process','eval']
var old_o = {console}
for (var k in global) {
  if (k!='require'&&k!='global'){
    old_o[k] = global[k]
    delete global[k]
    if (debug) old_o.console.log('moved',k)
  }
}
Object.getOwnPropertyNames(global).forEach((propertyName) => {
  if (not_safe_a.indexOf(propertyName)>=0){
    old_o[propertyName] = global[propertyName]
    delete global[propertyName]
    if (debug) old_o.console.log(propertyName,'moved');
  }else{
    if (debug) old_o.console.log(propertyName,'debug');
  }
});
delete global;//

module.exports = async(body,ctx,timeout=60000)=>{
  with (require('node:vm')) {
    return await createScript(body).runInContext(createContext(ctx),{breakOnSigint:true,timeout})
  }
}

// FYI: for web:
//async function(){with(this){return await eval(arguments[0])}}
