var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,urlModule,argv2o,jPath,jPathAsync,tryImport} = require('../docs/myes')
var init_time = now()
const argo = argv2o();

let mydirname = require('path').dirname(__filename);//__dirname

//TODO ext math to support vector, alike NumPy, hopefully NumJs
//github/scijs

let bizmath;

let module_exports = async(Application={})=>{
  if (!bizmath) bizmath = await tryImport('../docs/bizmath.mjs?'+init_time,'default',console.log) //(await import('./bizmath.mjs?'+init_time)).default;
  console.log('bizmath',bizmath);
  return bizmath
};
module.exports = module_exports

