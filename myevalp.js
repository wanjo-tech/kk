/*
MY TMP SOLUTION as TINY VM

WARNING !!! NOT FOR PUBLIC PROJECT, USE AT YOUR OWN RISK

FYR
The node:vm module is not a security mechanism. Do not use it to run untrusted code.
https://nodejs.org/api/vm.html#vm_vm_executing_javascript
https://thegoodhacker.com/posts/the-unsecure-node-vm-module/
https://snyk.io/blog/security-concerns-javascript-sandbox-node-js-vm-module/

TEST CASE
http://127.0.0.1:8080/?this.constructor.constructor(%27return%20Object.keys(this)%27)
http://127.0.0.1:8080/?this.constructor.constructor(%27return%20Object.keys(global)%27)
http://127.0.0.1:8080/?this.constructor.constructor(%27return%20process%27)
http://127.0.0.1:8080/?Array.constructor.constructor(%27return%20Object.keys(this)%27)

*/
module.exports = async(body,ctx,timeout=60000)=>{
  with (require('node:vm')) {
    return await createScript(
      //`[()=>eval(${JSON.stringify(body)})][0]()`//fail
      //`[(async function(){return await eval(arguments[0])})][0](${JSON.stringify(body)})`//trick
      `[(function(){return eval(arguments[0])})][0](${JSON.stringify(body)})`//magic
    ).runInContext(createContext(ctx),{breakOnSigint:true,timeout})
  }
}

//for webpage
//var myeval = (js,ctx) => [function(){with(arguments[1]||{}) return eval(arguments[0])}][0](js,ctx)
//function jxEval(js, context) { return Function('with(this) { return ' + js + '; }').call(context); }
