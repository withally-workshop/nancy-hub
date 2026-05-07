// ══════════════════════════════════════════════════════
//  NANCY HUB — Google Apps Script Backend
//  Copy this entire file into your GAS editor.
//  File → Save → Deploy → New deployment (Web App)
//  Execute as: Me | Who has access: Anyone
// ══════════════════════════════════════════════════════

// ── CONFIG ──
// Your Google Drive folder where uploads are stored.
// Leave as '' to use root Drive. Or paste a folder ID from the URL:
// drive.google.com/drive/folders/THIS_IS_THE_ID
var DRIVE_FOLDER_ID = '';

// ── ENTRY POINT ──
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'usage')        return respond(getDriveUsage());
    if (action === 'upload')       return respond(uploadFile(payload));
    if (action === 'fetchEmails')  return respond(fetchEmails(payload));
    if (action === 'sendEmail')    return respond(sendEmail(payload));

    return respond({ success: false, error: 'Unknown action: ' + action });
  } catch(err) {
    return respond({ success: false, error: err.message });
  }
}

// Also handle GET so the health check ping works
function doGet(e) {
  return respond({ success: true, message: 'Nancy Hub GAS is running' });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ══════════════════════════════════════════════════════
//  ACTION: usage
//  Returns Google Drive storage info.
// ══════════════════════════════════════════════════════
function getDriveUsage() {
  try {
    var quota = DriveApp.getStorageUsed();
    var limit = 15 * 1024 * 1024 * 1024; // 15 GB free tier
    var pct = Math.round((quota / limit) * 100);

    function formatBytes(bytes) {
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    return {
      success: true,
      used: quota,
      total: limit,
      percentage: pct,
      usedFormatted: formatBytes(quota),
      totalFormatted: formatBytes(limit)
    };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════
//  ACTION: upload
//  Uploads a base64-encoded file to Google Drive.
//  Expects: { fileName, mimeType, fileData (base64), section }
// ══════════════════════════════════════════════════════
function uploadFile(payload) {
  try {
    var fileName = payload.fileName;
    var mimeType = payload.mimeType || 'application/octet-stream';
    var fileData = payload.fileData;
    var section  = payload.section || 'uploads';

    if (!fileName || !fileData) {
      return { success: false, error: 'Missing fileName or fileData' };
    }

    // Decode base64 — strip data URI prefix if present
    var base64 = fileData.replace(/^data:[^;]+;base64,/, '');
    var decoded = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);

    // Get or create folder
    var folder = getRootFolder();
    if (section) {
      var parts = section.split('/');
      for (var i = 0; i < parts.length; i++) {
        folder = getOrCreateSubfolder(folder, parts[i]);
      }
    }

    var file = folder.createFile(blob);

    return {
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      viewUrl: 'https://drive.google.com/file/d/' + file.getId() + '/view'
    };
  } catch(err) {
    return { success: false, error: err.message };
  }
}

function getRootFolder() {
  if (DRIVE_FOLDER_ID) {
    return DriveApp.getFolderById(DRIVE_FOLDER_ID);
  }
  var folders = DriveApp.getFoldersByName('Nancy Hub');
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder('Nancy Hub');
}

function getOrCreateSubfolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

// ══════════════════════════════════════════════════════
//  ACTION: fetchEmails
//  Searches Gmail and returns matching messages.
//  Expects: { label, hours, includeRead? }
//    label: 'inbox' | 'unread' | 'starred' | 'all'
//    hours: 4 | 8 | 24 | 48 | 168 | 720 ...
//    includeRead: bool — if true and label='unread' returns 0, retry with read+unread
//
//  Query strategy: we explicitly EXCLUDE trash/spam but DO NOT require in:inbox.
//  This catches emails Gmail auto-routes to Important/Updates/Promotions tabs
//  which were getting silently dropped before.
// ══════════════════════════════════════════════════════
function fetchEmails(payload) {
  try {
    var label  = payload.label  || 'unread';
    var hours  = parseInt(payload.hours) || 24;
    var maxResults = 50;

    var cutoff = new Date(Date.now() - hours * 3600 * 1000);
    var dateStr = Utilities.formatDate(cutoff, 'GMT', 'yyyy/MM/dd');

    var queryMap = {
      'inbox':   '-in:trash -in:spam -in:sent after:' + dateStr,
      'unread':  'is:unread -in:trash -in:spam -in:sent after:' + dateStr,
      'starred': 'is:starred -in:trash -in:spam after:' + dateStr,
      'all':     '-in:trash -in:spam -in:sent after:' + dateStr
    };
    var query = queryMap[label] || queryMap['unread'];

    var threads = GmailApp.search(query, 0, maxResults);

    // If unread search returns nothing, fall back to all-mail (read+unread)
    // so the user at least sees recent emails — they can mark unread in the UI later.
    var fallbackUsed = false;
    if (threads.length === 0 && label === 'unread' && payload.includeRead !== false) {
      query = queryMap['all'];
      threads = GmailApp.search(query, 0, maxResults);
      fallbackUsed = true;
    }

    var emails = [];
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var messages = thread.getMessages();
      var lastMsg = messages[messages.length - 1];
      emails.push({
        id:      thread.getId(),
        subject: thread.getFirstMessageSubject() || '(no subject)',
        from:    lastMsg.getFrom(),
        date:    lastMsg.getDate().toISOString(),
        snippet: lastMsg.getPlainBody().substring(0, 400).replace(/\s+/g, ' ').trim(),
        unread:  thread.isUnread(),
        starred: thread.isInStarred()
      });
    }

    return {
      success: true,
      emails: emails,
      count: emails.length,
      // Diagnostics so the hub can show what actually happened
      _debug: {
        queryUsed: query,
        fallbackUsed: fallbackUsed,
        cutoffDate: dateStr,
        hoursRequested: hours
      }
    };
  } catch(err) {
    if (err.message && err.message.indexOf('authorization') !== -1) {
      return { success: false, error: 'Gmail not authorized. Run testGmail() in the GAS editor to grant permission.' };
    }
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════
//  ACTION: sendEmail
//  Replies to a Gmail thread.
//  Expects: { threadId, body, replyAll? }
// ══════════════════════════════════════════════════════
function sendEmail(payload) {
  try {
    var threadId = payload.threadId;
    var body     = payload.body;
    var replyAll = !!payload.replyAll;

    if (!threadId) return { success: false, error: 'Missing threadId' };
    if (!body)     return { success: false, error: 'Missing reply body' };

    var thread = GmailApp.getThreadById(threadId);
    if (!thread) return { success: false, error: 'Thread not found (may have been deleted)' };

    if (replyAll) thread.replyAll(body);
    else          thread.reply(body);

    return { success: true };
  } catch(err) {
    if (err.message && err.message.indexOf('authorization') !== -1) {
      return { success: false, error: 'Gmail send not authorized. Run testGmail() in the GAS editor to grant permission.' };
    }
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════
//  TEST FUNCTIONS
//  Run these manually in the GAS editor to authorize
//  each service and confirm they work.
// ══════════════════════════════════════════════════════

// Run this first — triggers Gmail OAuth popup
function testGmail() {
  var threads = GmailApp.search('in:inbox', 0, 1);
  Logger.log('Gmail OK — found ' + threads.length + ' thread(s)');
}

// Run this to confirm Drive access works
function testDrive() {
  var result = getDriveUsage();
  Logger.log('Drive OK — ' + result.usedFormatted + ' used (' + result.percentage + '%)');
}

// Run this to do a full email fetch test
function testFetchEmails() {
  var result = fetchEmails({ label: 'inbox', hours: 24 });
  Logger.log('Emails fetched: ' + result.count);
  if (result.emails && result.emails.length > 0) {
    Logger.log('First subject: ' + result.emails[0].subject);
  }
}
