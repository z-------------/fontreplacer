var installedFonts = [];

chrome.fontSettings.getFontList(function(fonts) {
  for (let i = 0; i < fonts.length; i++) {
    installedFonts.push(fonts[i].fontId.toLowerCase());
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse(installedFonts);
});
