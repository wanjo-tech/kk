//to module bizcdp.mjs
var bizcdp = async(...args)=>(await (await import('./bizcdp.mjs')).default(...args));
if (typeof module!='undefined') module.exports = bizcdp;
