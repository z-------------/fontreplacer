var hostname;
var tab;
var domainFilters = [];
var domainFilterOverrides = [];
var domainIsFiltered = false;
var domainIsFilterOverridden = false;

function reload() {
  chrome.tabs.reload(tab.tabId);
}

chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
  tab = tabs[0];

  var aElem = document.createElement("a");
  aElem.href = tab.url;
  hostname = aElem.hostname;

  chrome.storage.sync.get([ "domainFilterOverrides", "domainFilters" ], function(result) {
    if (result.domainFilters) {
      domainFilters = result.domainFilters;
    }

    if (result.domainFilterOverrides) {
      domainFilterOverrides = result.domainFilterOverrides;
    }

    for (let i = 0; i < domainFilterOverrides.length; i++) {
      var regex = new RegExp(domainFilterOverrides[i], "gi");
      if (regex.test(hostname) === true) {
        domainIsFilterOverridden = true;
        break;
      }
    }

    for (let i = 0; i < domainFilters.length; i++) {
      var regex = new RegExp(domainFilters[i], "gi");
      if (regex.test(hostname) === true) {
        domainIsFiltered = true;
        break;
      }
    }

    var toggleElem = document.querySelector("#domain-filter-toggle");
    if (domainIsFilterOverridden === true || domainIsFiltered === false) {
      toggleElem.checked = true;
    } else {
      toggleElem.checked = false;
    }

    toggleElem.addEventListener("change", function(e) {
      var newDomainIsFiltered = !toggleElem.checked;

      if (newDomainIsFiltered === true) { // "run on this page" = false
        if (domainFilterOverrides.indexOf(hostname) !== -1) { // this domain is in domainFilterOverrides
          domainFilterOverrides.splice(domainFilterOverrides.indexOf(hostname), 1);
          chrome.storage.sync.set({ domainFilterOverrides: domainFilterOverrides }, reload);
        } else {
          domainFilters.push(hostname);
          chrome.storage.sync.set({ domainFilters: domainFilters }, reload);
        }
      } else { // "run on this page" = true
        if (domainFilters.indexOf(hostname) !== -1) { // this domain is in domainFilters
          domainFilters.splice(domainFilters.indexOf(hostname), 1);
          chrome.storage.sync.set({ domainFilters: domainFilters }, reload);
        } else {
          domainFilterOverrides.push(hostname);
          chrome.storage.sync.set({ domainFilterOverrides: domainFilterOverrides }, reload);
        }
      }
    });
  });
});

document.querySelector("#options-link").addEventListener("click", function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});

/* i18n */

var i18nElems = document.querySelectorAll("[data-msg]");
for (let i = 0; i < i18nElems.length; i++) {
  var elem = i18nElems[i];
  elem.innerHTML = chrome.i18n.getMessage(elem.dataset.msg);
}
