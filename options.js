/* basic functions */

var xhr = function(url, callback) {
  var oReq = new XMLHttpRequest();
  oReq.onload = function(e){
      callback(this.responseText, url, e);
  };
  oReq.open("get", url, true);
  oReq.send();
};

function stringReplaceAtIndex(string, index, replacement) {
  var array = string.split("");
  array[index] = replacement;
  return array.join("");
}

/* html template for mapping field */

var mappingFieldTemplate = "<label>\
  <span>Replace these fonts (comma separated):</span>\
  <textarea class=\"from\"></textarea>\
</label>\
<label>\
  <span>With this font stack:</span>\
  <textarea class=\"to\"></textarea>\
</label>";

/* function for adding new mapping fields */

function addNewMappingField(from, to) {
  var div = document.createElement("div");
  div.classList.add("mapping-field");
  div.dataset.index = document.querySelectorAll(".mapping-field").length;
  div.innerHTML = mappingFieldTemplate;

  div.querySelector(".from").value = (from ? from.join(", ") : "");
  div.querySelector(".to").value = to || "";

  document.querySelector(".list-mapping-fields").appendChild(div);
}

/* globals */

var optionsKeys = [ "mappings", "classFilters", "domainFilters", "domainFilterOverrides", "repeatInterval" ];
var mappings, classFilters, domainFilters, domainFilterOverrides, repeatInterval;

/* get defaults, get user options, display them */

xhr(chrome.runtime.getURL("defaults.json"), function(response) {
  var defaults = JSON.parse(response);

  chrome.storage.sync.get([ "mappings", "classFilters", "domainFilters", "domainFilterOverrides", "repeatInterval" ], function(result) {
    /* replacements */

    if (result.mappings && result.mappings[0]) {
      mappings = result.mappings;
    } else {
      mappings = defaults.mappings;
    }

    for (let i = 0; i < mappings.length; i++) {
      addNewMappingField(mappings[i].from, mappings[i].to);
    }

    /* classFilters */

    if (result.classFilters) {
      classFilters = result.classFilters;
    } else {
      classFilters = [];
    }

    document.querySelector(".input-class-filters").value = classFilters.join("\n");

    /* domainFilters */

    if (result.domainFilters) {
      domainFilters = result.domainFilters;
    } else {
      domainFilters = [];
    }

    document.querySelector(".input-domain-filters").value = domainFilters.join("\n");

    /* domainFilterOverrides */

    if (result.domainFilterOverrides) {
      domainFilterOverrides = result.domainFilterOverrides;
    } else {
      domainFilterOverrides = [];
    }

    document.querySelector(".input-domain-filter-overrides").value = domainFilterOverrides.join("\n");

    /* repeatInterval */

    if (result.repeatInterval) {
      repeatInterval = result.repeatInterval;
    } else {
      repeatInterval = defaults.repeatInterval;
    }

    document.querySelector(".input-repeat-interval").value = repeatInterval;
  });
});

/* handle new-mapping-field clicks */

document.getElementById("new-mapping-field").addEventListener("click", function() {
  addNewMappingField()
});

/* handle saving */

document.querySelectorAll(".save").forEach(function(saveButton, i) {
  saveButton.addEventListener("click", function(e) {

    /* replacements */

    var mappingFields = document.querySelectorAll(".mapping-field");
    var mappings = [];

    for (let i = 0; i < mappingFields.length; i++) {
      var mapping = {};
      mapping.from = mappingFields[i].querySelector(".from").value.toLowerCase()
                      .split(",")
                      .map(function(value) {
                        var newVal = value;
                        while (newVal[0] === " ") {
                          newVal = newVal.substring(1);
                        }
                        while (newVal[newVal.length - 1] === " ") {
                          newVal = newVal.substring(0, newVal.length - 1);
                        }

                        if (newVal[0] === "'") {
                          newVal = stringReplaceAtIndex(newVal, 0, "\"");
                        }
                        if (newVal[newVal.length - 1] === "'") {
                          newVal = stringReplaceAtIndex(newVal, newVal.length - 1, "\"");
                        }

                        return newVal;
                      });
      mapping.to = mappingFields[i].querySelector(".to").value;

      if (mapping.from.length > 0 && mapping.to.length > 0) {
        mappings.push(mapping);
      }
    }

    chrome.storage.sync.set({ mappings: mappings }, function() {
      console.log("saved replacements");
    });

    /* classFilters */

    var classFilters = document.querySelector(".input-class-filters").value.split("\n");

    if (classFilters.length > 0 && classFilters[0].length > 0) {
      chrome.storage.sync.set({ classFilters: classFilters }, function() {
        console.log("saved classFilters");
      });
    } else {
      chrome.storage.sync.remove("classFilters", function() {
        console.log("saved classFilters");
      });
    }

    /* domainFilters */

    var domainFilters = document.querySelector(".input-domain-filters").value.split("\n");

    if (domainFilters.length > 0 && domainFilters[0].length > 0) {
      chrome.storage.sync.set({ domainFilters: domainFilters }, function() {
        console.log("saved domainFilters");
      });
    } else {
      chrome.storage.sync.remove("domainFilters", function() {
        console.log("saved domainFilters");
      });
    }

    /* domainFilterOverrides */

    var domainFilterOverrides = document.querySelector(".input-domain-filter-overrides").value.split("\n");

    if (domainFilterOverrides.length > 0 && domainFilterOverrides[0].length > 0) {
      chrome.storage.sync.set({ domainFilterOverrides: domainFilterOverrides }, function() {
        console.log("saved domainFilterOverrides");
      });
    } else {
      chrome.storage.sync.remove("domainFilterOverrides", function() {
        console.log("saved domainFilterOverrides");
      });
    }

    /* repeatInterval */

    var repeatIntervalRaw = document.querySelector(".input-repeat-interval").value;

    if (Number(repeatIntervalRaw) !== NaN && Number(repeatIntervalRaw) >= 0 && Number(repeatIntervalRaw) % 1 === 0) {
      chrome.storage.sync.set({ repeatInterval: Number(repeatIntervalRaw) }, function() {
        console.log("saved repeatInterval");
      });
    } else {
      chrome.storage.sync.remove("repeatInterval", function() {
        console.log("saved repeatInterval");
      });
    }
  });
});

/* populate export box */

function populateExportBox() {
  var exportBox = document.querySelector(".input-export");

  var optionsObj = {};

  optionsObj.mappings = mappings;
  optionsObj.classFilters = classFilters;
  optionsObj.domainFilters = domainFilters;
  optionsObj.domainFilterOverrides = domainFilterOverrides;

  exportBox.value = JSON.stringify(optionsObj);
}

setTimeout(populateExportBox, 500);

chrome.storage.onChanged.addListener(function(changes, areaName) {
  var keys = Object.keys(changes);
  for (let i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === "mappings") mappings = changes[key].newValue;
    if (key === "classFilters") classFilters = changes[key].newValue;
    if (key === "domainFilters") domainFilters = changes[key].newValue;
    if (key === "domainFilterOverrides") domainFilterOverrides = changes[key].newValue;
  }
  populateExportBox();
});

/* handle import clicks */

document.querySelector(".import").addEventListener("click", function(e) {
  var importData; // from user
  var newData = {}; // validated

  try {
    importData = JSON.parse(document.querySelector(".input-import").value);
    var keys = Object.keys(importData);
    for (let i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (optionsKeys.indexOf(key) !== -1) {
        newData[key] = importData[key];
      }
    }

    chrome.storage.sync.set(newData, function() {
      alert("Import successful.");
    });
  } catch (err) {
    alert("Invalid import data.");
    console.log(err);
  }
});
