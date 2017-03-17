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

var mappingFieldTemplate = "<label>\
  <span>replace these fonts (comma separated):</span>\
  <textarea class=\"from\"></textarea>\
</label>\
<label>\
  <span>with this font stack:</span>\
  <textarea class=\"to\"></textarea>\
</label>";

function addNewMappingField(from, to) {
  var div = document.createElement("div");
  div.classList.add("mapping-field");
  div.dataset.index = document.querySelectorAll(".mapping-field").length;
  div.innerHTML = mappingFieldTemplate;

  div.querySelector(".from").value = (from ? from.join(", ") : "");
  div.querySelector(".to").value = to || "";

  document.querySelector("section").appendChild(div);
}

xhr(chrome.runtime.getURL("defaults.json"), function(response) {
  var defaults = JSON.parse(response);

  chrome.storage.sync.get([ "mappings" ], function(result) {
    var mappings;

    if (result.mappings && result.mappings[0]) {
      mappings = result.mappings;
    } else {
      mappings = defaults.mappings;
    }

    for (let i = 0; i < mappings.length; i++) {
      addNewMappingField(mappings[i].from, mappings[i].to);
    }
  });
});

document.getElementById("new-mapping-field").addEventListener("click", function() {
  addNewMappingField()
});

document.getElementById("save").addEventListener("click", function() {
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
    document.getElementById("save").innerHTML = "Saved";
  });
});
