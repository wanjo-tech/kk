var post_p=(p,suffix='')=>P(resolve=>send_once_s('./?'+suffix,(p&&p!='')?o2s(p):'',(o,s)=>resolve([o,s])))
var get_p=(p)=>P(resolve=>send_once_s(p,'',(o,s)=>resolve([o,s])))
tryx(async()=>{
  var qry_o = getQueryVar()
  var tpl = qry_o['tpl'];
  var qry_s = getQueryStr()
  if ('&'==qry_s || ''==qry_s) {
    var port_part = (''==location.port || location.port==80) ? '':('_'+location.port);
    tpl = `${location.hostname}${port_part}.htm`
  }
  //
  //var key_a = Object.keys(qry_o);
  //if (!tpl && key_a.length>0){
  //  tpl = key_a[0]
  //}
  if (!tpl) tpl = qry_s
  console.log('qry_s=',qry_s)
  console.log('tpl=',tpl)

  var [o,s]=await get_p(tpl);
  //load_page(s) //init with s
  render_page(s)

  $("#divLoading").fadeOut()
  $(".divLoading").fadeOut()
});

