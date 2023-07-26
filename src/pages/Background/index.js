// handle install
chrome.runtime.onInstalled.addListener(async (details) => {
  const { previousVersion, reason } = details;
  if (reason === 'install') {
    // check is extension already in use at other device

    addCtxMenu();

    chrome.tabs.create({ url: 'https://popupoff.org/tutorial' });
  } else if (reason === 'update') {
    try {
      if (previousVersion === '2.0.3') {
        // 2.0.3
      } else if (previousVersion === '2.0.2') {
        // 2.0.2
        chrome.storage.sync.remove(['autoModeAggr']);
      }
    } catch (e) {
      console.log('something went wrong');
      console.log(e);
    }
  }
});

chrome.runtime.setUninstallURL('https://popupoff.org/why-delete');

// handle tab switch(focus)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.query({ active: true }, (info) => {
    const url = info[0].url;
    if (url.includes('chrome://') || url.includes('chrome-extension://')) {
      chrome.action.disable(activeInfo.tabId);
    }
  });
});

const letters = {
  hardModeActive: 'A',
  easyModeActive: 'M',
  staticActive: 'D',
  whitelist: '',
};

// handle mode changed from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!sender.tab) return true;

  if (request.modeChanged) {
    const tabID = sender.tab.id;
  } else if (request.openOptPage) {
    chrome.runtime.openOptionsPage();
  } else if (request.ctxEnabled === true) {
    addCtxMenu();
  } else if (request.ctxEnabled === false) {
    chrome.contextMenus.removeAll();
  }

  return true;
});

// handle updating to set new badge and context menu
chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    const url = tab.url;

    if (url.includes('chrome://') || url.includes('chrome-extension://')) {
      chrome.action.disable(tabID);
    } else {
    }
  }
});

// content menu (right click) mechanics
const subMenu = [
  {
    title: `Aggressive`,
    mode: 'hardModeActive',
  },
  {
    title: `Moderate`,
    mode: 'easyModeActive',
  },
  {
    title: `Delicate`,
    mode: 'staticActive',
  },
  {
    title: `Turn OFF`,
    mode: 'whitelist',
  },
];

const subMenuStore = {
  hardModeActive: null,
  easyModeActive: null,
  staticActive: null,
  whitelist: null,
};

const addCtxMenu = () => {
  try {
    chrome.contextMenus.removeAll(() => {
      subMenu.map((item, index) => {
        subMenuStore[Object.keys(subMenuStore)[index]] =
          chrome.contextMenus.create({
            id: item.mode,
            title: item.title,
            type: 'checkbox',
            // checked whitelist by default
            checked: item.mode === 'whitelist',
            // works for web pages only
            documentUrlPatterns: [
              'http://*/*',
              'https://*/*',
              'http://*/',
              'https://*/',
            ],
          });
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      const tabID = tab.id;
      const tabURL = tab.url;

      chrome.tabs.sendMessage(
        tabID,
        { activeMode: info.menuItemId },
        (resp) => {
          // if (resp && resp.closePopup === true) {
          // 	chrome.tabs.update(tabID, { url: tabURL })
          // }
        }
      );
    });
  } catch (e) {
    console.log("Couldn't create context menu");
    console.log(e);
  }
};

const initCtxMenu = async () => {
  chrome.contextMenus.removeAll();
};

initCtxMenu();
