var xhr = function(url, callback) {
  var oReq = new XMLHttpRequest();
  oReq.onload = function(e){
      callback(this.responseText, url, e);
  };
  oReq.open("get", url, true);
  oReq.send();
};

chrome.storage.sync.get(["from", "to"], function(result) {
  console.log(result);

  if (result.from) {
    document.getElementById("from").value = result.from.join(", ");
  }

  if (result.to) {
    document.getElementById("to").value = result.to;
  }
});

xhr(chrome.runtime.getURL("defaults.json"), function(response) {
  var defaults = JSON.parse(response);
  document.getElementById("from").setAttribute("placeholder", defaults.from.join(", "));
  document.getElementById("to").setAttribute("placeholder", defaults.to);
});

document.getElementById("save").addEventListener("click", function() {
  var fromInput = document.getElementById("from");
  var toInput = document.getElementById("to");

  var newFrom = fromInput.value.split(/,\s|,/ig);
  console.log(newFrom);
  var newTo = toInput.value;
  console.log(newTo);

  if (newFrom && newFrom[0].length >= 1) {
    console.log("will write new from");
    chrome.storage.sync.set({ from: newFrom });
  }

  if (newTo && newTo.length >= 1) {
    console.log("will write new to");
    chrome.storage.sync.set({ to: newTo });
  }
});
