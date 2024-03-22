var {o2s,s2o,tryx,myfetch,fs,date,now,md5,md5_ascii,urlModule,argv2o,jPath,jPathAsync} = require('./myes')
var init_time = now()
const argo = argv2o();

module.exports = ()=>({
  init_time,
  api_name:'apitest',
});

