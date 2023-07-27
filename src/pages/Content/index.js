console.log('这是内容脚本执行的');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('chrome extension', request);
  if (request.type === 'getPageInfo') {
    var regex =
      /&lt;i data-key='(.*?)' data-appid='(.*?)'&gt;(.*?)&lt;\/i&gt;/g;
    var matches = document.body.innerHTML.matchAll(regex);

    var resultMap = {};

    for (var match of matches) {
      var dataKey = match[1];
      var dataAppId = match[2];

      if (!resultMap[dataAppId]) {
        resultMap[dataAppId] = [];
      }

      resultMap[dataAppId].push(dataKey);
    }
    console.log('resultMap', resultMap);
    sendResponse(resultMap);
  }
  if (request.type === 'console') {
    console.log(request.tips);
  }
  return true;
});
