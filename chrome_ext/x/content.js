function hideUsername() {
    if (document.href.includes('twitter.com')){
      document.querySelectorAll('span.css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3').forEach(n=>{if(n.innerText.trim()[0]=='@')n.style.display='none'});
    }
}

const observer = new MutationObserver(hideUsername);
observer.observe(document.body, { childList: true, subtree: true });

hideUsername();

