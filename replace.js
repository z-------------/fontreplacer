var startTime = new Date();

function log(msg, force) {
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
var installedFonts;
var elements = [];
var replacedCount = 0;

log("getting defaults...");

xhr(chrome.runtime.getURL("defaults.json"), function(response) {
  defaults = JSON.parse(response);

  log("getting user options...")

  chrome.storage.sync.get([ "mappings", "filters" ], function(result) {
    if (result.mappings && result.mappings[0]) {
      mappings = result.mappings;
    } else {
      mappings = defaults.mappings;
    }

    if (result.filters) {
      filters = result.filters;
    }

    log("getting installed fonts...");

    chrome.runtime.sendMessage("fonts please", function(fonts) {
      installedFonts = fonts;

      log("getting and filtering elements...");

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

      log("starting fontreplacement...");

      for (let i = 0; i < mappings.length; i++) {
        var from = mappings[i].from;
        var to = mappings[i].to;

        for (let j = 0; j < elements.length; j++) {
          var fontStack = getComputedStyle(elements[j]).fontFamily.toLowerCase().split(", ");

          if (
            from.indexOf(fontStack[0]) !== -1 ||
            from.indexOf(fontStack.map(function(font) {
              var fontNoQuotes = font;
              if (font[0] === "\"" && font[font.length - 1] === "\"" ||
                  font[0] === "'" && font[font.length - 1] === "'"
              ) {
                fontNoQuotes = font.substring(1, font.length - 1);
              }
              return fontNoQuotes;
            }).filter(function(font) {
              if (installedFonts.indexOf(font) !== -1) {
                return true;
              } else {
                return false;
              }
            })[0]) !== -1
          ) {
            elements[j].style.fontFamily = to;
            replacedCount += 1;
          }
        }
      }

      log(`done. fontreplaced ${replacedCount} times. took ${new Date() - startTime}ms in total.`, true);
    });
  });
});
