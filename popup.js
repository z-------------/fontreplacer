var hostname;
var tab;
var domainFilters = [];
var domainIsFiltered = false;

function reload() {
  chrome.tabs.reload(tab.tabId);
}

chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
  tab = tabs[0];

  var aElem = document.createElement("a");
  aElem.href = tab.url;
  hostname = aElem.hostname;

  chrome.storage.sync.get([ "domainFilters" ], function(result) {
    if (result.domainFilters) {
      domainFilters = result.domainFilters;
    }

    for (let i = 0; i < domainFilters.length; i++) {
      var regex = new RegExp(domainFilters[i], "gi");
      if (regex.test(hostname) === true) {
        domainIsFiltered = true;
        break;
      }
    }

    var toggleElem = document.querySelector("#domain-filter-toggle");
    toggleElem.checked = !domainIsFiltered;

    toggleElem.addEventListener("change", function(e) {
      var newDomainIsFiltered = !toggleElem.checked;

      if (newDomainIsFiltered === true) { // "run on this page" = false
        chrome.storage.sync.get("domainFilters", function(result) {
          var domainFilters = result.domainFilters || [];
          domainFilters.push(hostname);
          chrome.storage.sync.set({ domainFilters: domainFilters }, reload);
        });
      } else { // "run on this page" = true
        chrome.storage.sync.get("domainFilterOverrides", function(result) {
          var domainFilterOverrides = result.domainFilterOverrides || [];
          domainFilterOverrides.push(hostname);
          chrome.storage.sync.set({ domainFilterOverrides: domainFilterOverrides }, reload);
        });
      }
    });
  });
});
