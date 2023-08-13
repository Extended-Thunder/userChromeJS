"use strict";

/* globals browser */

var init = async () => {
  browser.userChromeJS.addWindowListener();
  messenger.browserAction.onClicked.addListener(reload);
  messenger.composeAction.onClicked.addListener(reload);
};

function reload(tab, info) {
  browser.userChromeJS.reload(tab.windowId);
}

init();
