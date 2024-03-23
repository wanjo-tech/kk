function hideUsername() {
  document.querySelectorAll('span.css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3').forEach(n=>{if(n.innerText.trim()[0]=='@')n.style.display='none'});
  console.warn('YES',new Date());
}

const observer = new MutationObserver(hideUsername);

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});

hideUsername();

window.addEventListener('focus', hideUsername);
window.addEventListener('resize', hideUsername);
