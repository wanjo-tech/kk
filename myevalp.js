/// for web tmp usage:
//async function(){var exports,module,myeval,require,global,console,window,document,fetch,setTimeout,setInterval,setImmediate,structuredClone,performance;with(this){return await eval(arguments[0])}}
//vm version
module.exports = async(body,ctx)=>{
  with (require('vm')) {
    return await createScript(body).runInContext(createContext(ctx),{breakOnSigint:true,timeout:60000})
  }
}
