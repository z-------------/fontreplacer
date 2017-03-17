function log(msg, force) {
  if (force) {
    console.log(`[fontreplacer] ${msg}`);
  }

  // console.log(`[fontreplacer] ${msg}`);
}

var defaults;
var mappings = [];
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

  log("about to get mappings.")

  chrome.storage.sync.get([ "mappings" ], function(result) {
    if (result.mappings && result.mappings[0]) {
      mappings = result.mappings;
    } else {
      mappings = defaults.mappings;
    }

    log("got mappings.");

    log("about to start fontreplacing.");

    for (let i = 0; i < mappings.length; i++) {
      var from = mappings[i].from;
      var to = mappings[i].to;

      for (let j = 0; j < elements.length; j++) {
        var fontStack = getComputedStyle(elements[j]).fontFamily.toLowerCase().split(", ");

        if (from.indexOf(fontStack[0]) !== -1) { // first font in stack is in `from`
          elements[j].style.fontFamily = to;
          replacedCount += 1;
        }
      }
    }

    log(`done. fontreplaced ${replacedCount} times.`, true);
  });
});
