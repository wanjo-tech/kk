//to module bizcdp.mjs
var init_time = new Date().getTime();
var bizcdp = async(...args)=>(await (await import('./bizcdp.mjs?'+init_time)).default(...args));
if (typeof module!='undefined') module.exports = bizcdp;
