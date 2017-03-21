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
var classFilters = [];
var domainFilters = [];
var domainFilterOverrides = [];
var domainIsFiltered = false;
var domainIsFilterOverridden = false;
var installedFonts;
var replacedCount = 0;

log("getting defaults...");

xhr(chrome.runtime.getURL("defaults.json"), function(response) {
  defaults = JSON.parse(response);

  log("getting user options...");

  chrome.storage.sync.get([ "mappings", "classFilters", "domainFilters", "domainFilterOverrides", "repeatInterval" ], function(result) {
    if (result.mappings && result.mappings[0]) {
      mappings = result.mappings;
    } else {
      mappings = defaults.mappings;
    }

    if (result.classFilters) {
      classFilters = result.classFilters;
    }

    if (result.domainFilters) {
      domainFilters = result.domainFilters;
    }

    if (result.domainFilterOverrides) {
      domainFilterOverrides = result.domainFilterOverrides;
    }

    if (result.repeatInterval) {
      repeatInterval = result.repeatInterval;
    } else {
      repeatInterval = defaults.repeatInterval;
    }

    log("processing domain filters and filter overrides...");

    for (let j = 0; j < domainFilterOverrides.length; j++) {
      var regex = new RegExp(domainFilterOverrides[j], "gi");
      if (regex.test(location.hostname) === true) {
        domainIsFilterOverridden = true;
        break;
      }
    }

    if (domainIsFilterOverridden === false) {
      log("domain is not filter overridden, processing domain filters.");

      for (let i = 0; i < domainFilters.length; i++) {
        var regex = new RegExp(domainFilters[i], "gi");
        if (regex.test(location.hostname) === true) {
          domainIsFiltered = true;
          break;
        }
      }
    } else {
      log("domain is filter overridden, ignoring domain filters.");
    }

    if (domainIsFiltered === false) {
      log("getting installed fonts...");

      chrome.runtime.sendMessage("fonts please", function(fonts) {
        installedFonts = fonts;

        fontreplace();

        if (repeatInterval > 0) {
          setInterval(function() {
            startTime = new Date();
            replacedCount = 0;
            fontreplace();
          }, repeatInterval);
        }
      });
    } else {
      log("domain is filtered, aborting.");
    }
  });
});

function fontreplace() {
  var elements = [];

  log("getting and filtering elements...");

  function checkChildren(parent) {
    [].slice.call(parent.children).forEach(function(child, i) {
      var matchesASelector = false;
      for (let j = 0; j < classFilters.length; j++) {
        if (child.matches(classFilters[j])) {
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

  var typekitOrGoogleFontsUsed = (
    typeof Typekit !== "undefined" ||
    [].slice.call(document.head.querySelectorAll("link[rel=stylesheet]")).filter(function(linkElem){
      return linkElem.href.indexOf("fonts.googleapis.com") !== -1;
    }).length !== 0
  );

  for (let i = 0; i < mappings.length; i++) {
    var from = mappings[i].from;
    var to = mappings[i].to;

    for (let j = 0; j < elements.length; j++) {
      var fontStack = getComputedStyle(elements[j]).fontFamily.toLowerCase().split(", ");

      if (
        from.indexOf(fontStack[0]) !== -1 ||
        !typekitOrGoogleFontsUsed && from.indexOf(fontStack.map(function(font) {
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
}
