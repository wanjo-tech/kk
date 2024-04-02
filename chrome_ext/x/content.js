function hideUsername(mutationsList, observer){

  document.querySelectorAll('span.css-1qaijid.r-bcqeeo.r-qvutc0.r-poiln3').forEach(n=>{if(n.innerText.trim()[0]=='@')n.style.display='none'});

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

/**
// Select the node that will be observed for mutations
const targetNode = document.getElementById('observedElement');

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
        } else if (mutation.type === 'attributes') {
            console.log(`The ${mutation.attributeName} attribute was modified.`);
        }
    }
};

// Create an instance of the MutationObserver with the callback
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
// observer.disconnect();
*/
