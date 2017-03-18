function log(msg, force) {
  // if (force) {
  //   console.log(`[fontreplacer] ${msg}`);
  // }

  console.log(`[fontreplacer] ${msg}`);
}

function xhr(url, callback) {
  var oReq = new XMLHttpRequest();
  oReq.onload = function(e){
      callback(this.responseText, url, e);
  };
  oReq.open("get", url, true);
  oReq.send();
}

var defaults;
var mappings;
var filters = [];
var elements = [];
var replacedCount = 0;

log("about to get defaults.");

xhr(chrome.runtime.getURL("defaults.json"), function(response) {
  defaults = JSON.parse(response);

  log("got defaults.");

  log("about to get user options.")

  chrome.storage.sync.get([ "mappings", "filters" ], function(result) {
    if (result.mappings && result.mappings[0]) {
      mappings = result.mappings;
    } else {
      mappings = defaults.mappings;
    }

    if (result.filters) {
      filters = result.filters;
    }

    log("got user options.");

    log("about to get and filter elements.");

    function checkChildren(parent) {
      [].slice.call(parent.children).forEach(function(child, i) {
        var matchesASelector = false;
        for (let j = 0; j < filters.length; j++) {
          if (child.matches(filters[j])) {
            matchesASelector = true;
            break;
          }
        }
        if (matchesASelector === false) {
          elements.push(child);
          checkChildren(child)
        }
      });
    }

    checkChildren(document);

    console.log(elements);

    log("got and filtered elements.");

    log("about to start fontreplacing.");

    for (let i = 0; i < mappings.length; i++) {
      var from = mappings[i].from;
      var to = mappings[i].to;

      for (let j = 0; j < elements.length; j++) {
        var fontStack = getComputedStyle(elements[j]).fontFamily.toLowerCase().split(", ");
        console.log(elements[j], fontStack);

        if (from.indexOf(fontStack[0]) !== -1) { // first font in stack is in `from`
          elements[j].style.fontFamily = to;
          replacedCount += 1;
        }
      }
    }

    log(`done. fontreplaced ${replacedCount} times.`, true);
  });
});
