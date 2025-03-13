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
          
          var suffixes = ["xul", "xhtml"];

          // Many of these were found just by scanning the code.  They may not all be relevant.
          // Some of these may be obsolete, especially as they are being changed to tabs these days.

          // ignoring much of comm/mailnews/jar.mn for now
          // ignoring most/all of comm/suite/* for now

          // mostly comm/mail/base/jar.mn
          var prefix = "chrome://messenger/content/";
          var windows = [
            "about3Pane",                          // ??? // comm/mail/base/jar.mn
            "aboutDialog",                         // comm/mail/base/jar.mn
            "aboutMessage",                        // comm/mail/base/jar.mn
            "aboutRights",                         // comm/mail/base/jar.mn
            "aboutSupport",                        // comm/mail/components/about-support/jar.mn
            "about-support/aboutSupport",          // comm/mail/components/about-support/jar.mn
            "accountcreation/accountSetup",        // comm/mail/components/accountcreation/jar.mn
            "AccountManager",                      // comm//mailnews/jar.mn
            "AccountWizard",                       // comm//mailnews/jar.mn
            "activity",                            // comm//mail/components/activity/jar.mn
            "am-e2e",                              // comm/mail/components/unifiedtoolbar/jar.mn
            "am-im",                               // comm/mail/components/im/jar.mn
            "am-mdn",                              // comm/mail/extensions/smime/jar.mn
            "browserRequest",                      // comm/mail/base/jar.mn
            "cloudfile/selectDialog",              // comm/mail/components/cloudfile/jar.mn
            "commonDialog",                        // comm/mail/base/jar.mn ??? override global/content ???
            "compactFoldersDialog",                // comm/mail/base/jar.mn
            "customizeToolbar",                    // comm/mail/base/jar.mn
            "downloads/aboutDownloads",            // comm/mail/components/downloads/jar.mn
            "extensionPopup",                      // comm/mail/extensions/jar.mn
            "FilterEditor",                        // comm/mailnews/jar.mn  (Main Window) Tools -> Message Filters, New & Edit Buttons
            "FilterListDialog",                    // comm/mail/base/jar.mn (Main Window) Tools -> Message Filters
            "folderProps",                         // comm//mailnews/jar.mn
            "glodaFacetView",                      // comm/mail/base/jar.mn
            "glodaFacetViewWrapper",               // comm/mail/base/jar.mn
            "junkLog",                             // comm//mailnews/jar.mn
            "mailViewList",                        // comm/mail/extensions/mailviews/jar.mn
            "mailViewSetup",                       // comm/mail/extensions/mailviews/jar.mn
            "messageWindow",                       // comm/mail/base/jar.mn
            "messenger",                           // comm/mail/base/jar.mn
            "certpicker",                          // comm/mail/extensions/smime/jar.mn
            "migrationProgress",                   // comm/mail/base/jar.mn
            "multimessageview",                    // comm/mail/base/jar.mn
            "newFolderDialog",                     // comm//mailnews/jar.mn
            "newmailaccount/accountProvisioner",   // comm/mail/components/newmailaccount/jar.mn
            "newTagDialog",                        // comm/mail/base/jar.mn
            "policies/aboutPolicies",              // comm/mail/components/enterprisepolicies/jar.mn
            "profileDowngrade",                    // comm/mail/base/jar.mn
            "removeAccount",                       // comm//mailnews/jar.mn
            "renameFolderDialog",                  // comm//mailnews/jar.mn
            "sanitize",                            // comm/mail/base/jar.mn   ??? comm/suite/components/sanitize/jar.mn ???
            "SearchDialog",                        // comm/mail/base/jar.mn
            "subscribe",                           // comm//mailnews/jar.mn
            "systemIntegrationDialog",             // comm/mail/base/jar.mn
            "troubleshootMode",                    // comm/mail/base/jar.mn
            "viewLog",                             // comm/mailnews/jar.mn  (Main Window) Tools -> Message Filters: "Filter Log" Button
            "viewSource",                          // comm/mail/base/jar.mn
            "virtualFolderListEdit",               // comm//mailnews/jar.mn
            "virtualFolderProperties"              // comm//mailnews/jar.mn
          ];
          var urls = suffixes
            .map((s) => windows.map((w) => prefix + w + "." + s))
            .flat(1);

          // comm/mail/base/jar.mn - I don't understand the "Override" of "global/content" with "messenger/content"
          urls.push("chrome://global/content/commonDialog.xhtml");

          // Message Compose:
          // comm/mail/components/compose/jar.mn
          prefix = "chrome://messenger/content/messengercompose/";
          windows = [
            "EdAdvancedEdit",     /* (Message Compose) "Advanced Property Editor":            "Advanced Edit..." Button on multiple Dialogs */
            "EdColorPicker",      /* (Message Compose) "Text Color" & "Page Background Color" Color Buttons on Formatting Toolbar */
            "EdColorProps",       /* (Message Compose) "Page Colors and Background":          Format -> Page Colors and Background */
            "EdConvertToTable",   /* (Message Compose) "Convert To Table":                    Format -> Table -> Create Table from Selection */
            "EdDictionary",       /* (Message Compose) "Personal Dictionary":                 Options -> Check Spelling, "Edit..." Button */
            "EdHLineProps",       /* (Message Compose) NOT USED???                            Horizontal Line Properties? */
            "EdImageProps",       /* (Message Compose) "Image Properties":                    Insert -> Image */
            "EdInsertChars",      /* (Message Compose) "Insert Character":                    Insert -> Characters and Symbols */
            "EdInsertMath",       /* (Message Compose) "Insert Math":                         Insert -> Math */
            "EdInsertTable",      /* (Message Compose) "Insert Math":                         Insert -> Math */
            "EdInsertTOC",        /* (Message Compose) "Table of Contents":                   Insert -> Table of Contents -> Insert/Update */
            "EdInsSrc",           /* (Message Compose) "Insert HTML":                         Insert -> HTML (HTML & BODY have NO Attributes for CSS Selector) */
            "EdLinkProps",        /* (Message Compose) "Link Properties":                     Insert -> Link */
            "EdListProps",        /* (Message Compose) "List Properties":                     Format -> List -> List Properties */
            "EdNamedAnchorProps", /* (Message Compose) "Named Anchor Properties":             Insert -> Named Anchor */
            "EdReplace",          /* (Message Compose) "Find and Replace":                    Edit -> Find and Replace */
            "EdSpellCheck",       /* (Message Compose) "Check Spelling":                      Tools -> Check Spelling */
            "EdTableProps",       /* (Message Compose) "Table Properties":                    Format -> Table -> Table Properties */
            "messengercompose" 
          ];
          var mc_urls = suffixes
            .map((s) => windows.map((w) => prefix + w + "." + s))
            .flat(1);
          Array.prototype.push.apply(urls, mc_urls);

          // Calendar:
          // comm/calendar/base/jar.mn
          prefix = "chrome://calendar/content/";
          windows = [
            "calendar-alarm-dialog",
            "calendar-conflicts-dialog",
            "calendar-creation",                   /* (Main Window) File -> New -> Calendar */
            "calendar-error-prompt",
            "calendar-event-dialog",
            "calendar-event-dialog-attendees",
            "calendar-event-dialog-recurrence",
            "calendar-event-dialog-reminder",
            "calendar-event-dialog-timezone",
            "calendar-ics-file-dialog",
            "calendar-invitations-dialog",
            "calendar-itip-identity-dialog",
            "calendar-migration-dialog",
            "calendar-occurrence-prompt",
            "calendar-properties-dialog",
            "calendar-providerUninstall-dialog",
            "calendar-summary-dialog",
            "calendar-uri-redirect-dialog",
            "chooseCalendarDialog",
            "publishDialog",
            "preferences/editCategory"
          ];
          var cal_urls = suffixes
            .map((s) => windows.map((w) => prefix + w + "." + s))
            .flat(1);
          Array.prototype.push.apply(urls, cal_urls);
//          urls.push("chrome://calendar/content/calendar-event-dialog.xhtml");

          urls.push("chrome://messenger-newsblog/content/am-newsblog.xhtml");        // comm//mailnews/extensions/newsblog/jar.mn
          urls.push("chrome://messenger-newsblog/content/feed-subscriptions.xhtml"); // comm//mailnews/extensions/newsblog/jar.mn
          urls.push("chrome://messenger-newsblog/content/feedAccountWizard.xhtml");  // comm//mailnews/extensions/newsblog/jar.mn

          urls.push("chrome://messenger-smime/content/certFetchingStatus.xhtml");    // comm/mail/extensions/smime/jar.mn
          urls.push("chrome://messenger-smime/content/msgCompSecurityInfo.xhtml");   // comm/mail/extensions/smime/jar.mn

          urls.push("chrome://mozapps/content/update/history.xhtml");                // toolkit/mozapps/update/jar.mn
          urls.push("chrome://mozapps/content/update/updateElevation.xhtml");        // toolkit/mozapps/update/jar.mn

          urls.push("chrome://mozapps/content/profile/createProfileWizard.xhtml");   // toolkit/profile/jar.mn
          urls.push("chrome://mozapps/content/profile/profileDowngrade.xhtml");      // toolkit/profile/jar.mn
          urls.push("chrome://mozapps/content/profile/profileSelection.xhtml");      // toolkit/profile/jar.mn

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
