"use strict";

var { ExtensionSupport } = ChromeUtils.importESModule(
  "resource:///modules/ExtensionSupport.sys.mjs",
);
var { ExtensionParent } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionParent.sys.mjs",
);

const EXTENSION_NAME = "userChromeJS@kamens.us";
var extension = ExtensionParent.GlobalManager.getExtension(EXTENSION_NAME);

// Implements the functions defined in the experiments section of schema.json.
var userChromeJS = class extends ExtensionCommon.ExtensionAPI {
  onStartup() {}

  onShutdown(isAppShutdown) {
    if (isAppShutdown) return;
    // Looks like we got uninstalled. Maybe a new version will be installed
    // now. Due to new versions not taking effect
    // (https://bugzilla.mozilla.org/show_bug.cgi?id=1634348)
    // we invalidate the startup cache. That's the same effect as starting
    // with -purgecaches (or deleting the startupCache directory from the
    // profile).
    Services.obs.notifyObservers(null, "startupcache-invalidate");
  }

  getAPI(context) {
    context.callOnClose(this);
    return {
      userChromeJS: {
        addWindowListener() {
          var prefix = "chrome://messenger/content/";
          var windows = [
            "addressbook/addressbook",
            "messenger",
            "messageWindow",
            "messengercompose/messengercompose",
          ];
          var suffixes = ["xul", "xhtml"];
          var urls = suffixes
            .map((s) => windows.map((w) => prefix + w + "." + s))
            .flat(1);
          urls.push("chrome://calendar/content/calendar-event-dialog.xhtml");
          // Adds a listener to detect new windows.
          ExtensionSupport.registerWindowListener(EXTENSION_NAME, {
            chromeURLs: urls,
            onLoadWindow: paint,
          });
        },
        reload(windowId) {
          let window = context.extension.windowManager.get(windowId);
          console.log(window);
          paint(window.window);
        },
      },
    };
  }

  close() {
    ExtensionSupport.unregisterWindowListener(EXTENSION_NAME);
  }
};

function paint(win) {
  if (!win.document.location || win.document.location.protocol != "chrome:") {
    return;
  }
  var file = Services.dirsvc.get("UChrm", Components.interfaces.nsIFile);
  file.append("userChrome.js");
  if (!file.exists()) {
    return;
  }
  var url = Services.io
    .getProtocolHandler("file")
    .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
    .getURLSpecFromActualFile(file);
  Services.scriptloader.loadSubScriptWithOptions(url, {
    target: win.document.defaultView,
    charset: "UTF-8",
    ignoreCache: true,
  });
}
