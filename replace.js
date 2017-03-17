function log(msg, force) {
  if (force) {
    console.log(`[fontreplacer] ${msg}`);
  }

  // console.log(`[fontreplacer] ${msg}`);
}

var from, to, defaults;
var replacedCount = 0;

log("about to get elements.");

var elements = [].slice.call(document.querySelectorAll("*"));

log("got elements.");

log("about to get defaults.");

var xhr = function(url, callback) {
  var oReq = new XMLHttpRequest();
  oReq.onload = function(e){
      callback(this.responseText, url, e);
  };
  oReq.open("get", url, true);
  oReq.send();
};

xhr(chrome.runtime.getURL("defaults.json"), function(response) {
  defaults = JSON.parse(response);

  log("got defaults.");

  log("about to get settings.")

  chrome.storage.sync.get(["from", "to"], function(result) {
    if (result.from && result.from[0]) {
      from = result.from;
    } else {
      from = defaults.from;
    }

    if (result.to) {
      to = result.to;
    } else {
      to = defaults.to;
    }

    log("got settings.");

    for (let i = 0; i < elements.length; i++) {
      var fontStack = getComputedStyle(elements[i]).fontFamily.toLowerCase().split(", ");

      if (from.indexOf(fontStack[0]) !== -1) { // first font in stack is in `from`
        elements[i].style.fontFamily = to;
        replacedCount += 1;
      }
    }

    log(`done. fontreplaced ${replacedCount} elements.`, true);
  });
});
