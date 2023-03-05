chrome.action.onClicked.addListener(() => {
  var jsonH_url = chrome.runtime.getURL('./tsToJSON.html');
  chrome.windows.create({
    url: jsonH_url,
    type: 'popup',
    width: 1024,
    height: 768,
  });
});
