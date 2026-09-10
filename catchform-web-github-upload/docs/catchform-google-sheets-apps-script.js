function doPost(e) {
  try {
    var raw = "";
    if (e && e.parameter && e.parameter.payload) raw = e.parameter.payload;
    else if (e && e.postData && e.postData.contents) raw = e.postData.contents;

    var payload = JSON.parse(raw || "{}");

    // 탭 목록만 돌려주는 조회용 요청. 캐치폼에서 탭 선택 드롭다운을 채울 때 씁니다.
    if (payload.action === "listTabs") {
      var target = SpreadsheetApp.openByUrl(payload.sheetUrl);
      var tabsWarning = ensureCrmReaderAccess_(target);
      return json_({
        ok: true,
        crmAccessWarning: tabsWarning || "",
        spreadsheetName: target.getName(),
        spreadsheetUrl: target.getUrl(),
        tabs: target.getSheets().map(function (sh) { return sh.getName(); }),
        // 탭별 gid. 캐치폼이 `#gid=`로 해당 탭을 바로 열 때 씁니다.
        tabGids: target.getSheets().map(function (sh) { return sh.getSheetId(); }),
      });
    }

    var spreadsheet = getSpreadsheet_(payload);
    var sheet = getTargetSheet_(spreadsheet, payload);
    var appendedRow = appendPayload_(sheet, payload);
    SpreadsheetApp.flush();

    return json_({
      ok: true,
      spreadsheetUrl: spreadsheet.getUrl(),
      sheetName: sheet.getName(),
      sheetGid: sheet.getSheetId(),
      appendedRow: appendedRow,
      crmAccessWarning: CRM_ACCESS_WARNING || "",
    });
  } catch (err) {
    return json_({
      ok: false,
      message: err && err.message ? err.message : String(err),
    });
  }
}

function doGet(e) {
  var params = (e && e.parameter) || {};
  if (params.action === "open") {
    var spreadsheet = getSpreadsheet_({
      mode: params.mode || "new",
      sheetUrl: params.sheetUrl || "",
      sheetName: params.sheetName || "",
      accountEmail: params.accountEmail || "",
      formId: params.formId || "",
      formSlug: params.formSlug || "",
      formTitle: params.formTitle || "",
    });
    var url = spreadsheet.getUrl();
    return HtmlService.createHtmlOutput(
      '<!doctype html><html><head><meta charset="utf-8"><script>window.location.replace(' +
      JSON.stringify(url) +
      ');</script></head><body><a href="' +
      url.replace(/"/g, "&quot;") +
      '">스프레드시트 열기</a></body></html>'
    );
  }
  return json_({
    ok: true,
    message: "CatchForm Google Sheets Web App is running.",
    // 배포한 코드가 실제로 반영됐는지 확인할 때 씁니다.
    version: SCRIPT_VERSION,
    features: ["listTabs", "tabName", "sheetAction", "tabGid", "crmReader"],
    time: new Date().toISOString(),
  });
}

function getSpreadsheet_(payload) {
  CRM_ACCESS_WARNING = "";
  if ((payload.mode || "existing") === "existing" && payload.sheetUrl) {
    var existing = SpreadsheetApp.openByUrl(payload.sheetUrl);
    CRM_ACCESS_WARNING = ensureSpreadsheetAccess_(existing, payload);
    return existing;
  }

  var key = getSheetPropertyKey_(payload);
  var props = PropertiesService.getScriptProperties();
  // sheetAction: 관리자가 시트 이름을 바꿨을 때 무엇을 할지 캐치폼이 지정합니다.
  //   "new"    - 기억해둔 시트를 버리고 새로 만듭니다.
  //   "rename" - 기억해둔 시트의 이름만 바꿉니다.
  //   (없음)   - 기존 동작. 기억해둔 시트를 그대로 씁니다.
  var sheetAction = String(payload.sheetAction || "");
  if (key && sheetAction === "new") props.deleteProperty(key);

  if (key && sheetAction !== "new") {
    var savedId = props.getProperty(key);
    if (savedId) {
      try {
        var saved = SpreadsheetApp.openById(savedId);
        if (sheetAction === "rename") {
          var newName = String(payload.sheetName || "").trim();
          if (newName && saved.getName() !== newName) saved.rename(newName);
        }
        CRM_ACCESS_WARNING = ensureSpreadsheetAccess_(saved, payload);
        return saved;
      } catch (err) {
        props.deleteProperty(key);
      }
    }
  }

  // mode가 "new"인데 sheetUrl이 남아 있으면 기존 시트를 열어버리므로, existing일 때만 사용합니다.
  if (payload.sheetUrl && (payload.mode || "existing") === "existing") {
    var byUrl = SpreadsheetApp.openByUrl(payload.sheetUrl);
    CRM_ACCESS_WARNING = ensureSpreadsheetAccess_(byUrl, payload);
    return byUrl;
  }

  var spreadsheet = SpreadsheetApp.create(payload.sheetName || payload.formTitle || "CatchForm Responses");
  if (key) props.setProperty(key, spreadsheet.getId());
  CRM_ACCESS_WARNING = ensureSpreadsheetAccess_(spreadsheet, payload);
  return spreadsheet;
}

// CRM이 시트를 읽어가는 서비스 계정. 새로 만든 시트든 붙여넣은 기존 시트든 항상 뷰어로 넣습니다.
var SCRIPT_VERSION = "2026-09-10";
var CRM_ACCESS_WARNING = "";
var CRM_READER_EMAIL = "crm-sheets-reader@crm-sync-506918.iam.gserviceaccount.com";

function ensureSpreadsheetAccess_(spreadsheet, payload) {
  var email = String(payload.accountEmail || "").trim();
  if (email && email.indexOf("@") !== -1) {
    try {
      spreadsheet.addEditor(email);
    } catch (err) {
      // 공유 드라이브 정책이나 도메인 제한 때문에 공유가 막힌 경우에도 응답 기록 자체는 계속 진행합니다.
    }
  }
  return ensureCrmReaderAccess_(spreadsheet);
}

// 뷰어 추가에 실패하면 조용히 넘기지 않고 사유를 돌려줍니다.
// 실패를 삼키면 CRM이 시트를 못 읽는데도 관리자는 연동이 된 줄 알게 됩니다.
function ensureCrmReaderAccess_(spreadsheet) {
  try {
    var viewers = spreadsheet.getViewers().map(function (user) { return String(user.getEmail() || "").toLowerCase(); });
    var editors = spreadsheet.getEditors().map(function (user) { return String(user.getEmail() || "").toLowerCase(); });
    var target = CRM_READER_EMAIL.toLowerCase();
    if (viewers.indexOf(target) !== -1 || editors.indexOf(target) !== -1) return "";
  } catch (err) {
    // 목록을 못 읽어도 일단 추가는 시도합니다.
  }
  try {
    spreadsheet.addViewer(CRM_READER_EMAIL);
    return "";
  } catch (err) {
    return "CRM 읽기 계정(" + CRM_READER_EMAIL + ")을 뷰어로 추가하지 못했습니다: " +
      (err && err.message ? err.message : String(err));
  }
}

function getTargetSheet_(spreadsheet, payload) {
  // tabName이 오면 그 이름의 탭을 쓰고, 없으면 만듭니다.
  var wantedTab = safeSheetName_(String(payload.tabName || "").trim());
  if (String(payload.tabName || "").trim()) {
    var found = spreadsheet.getSheetByName(wantedTab);
    if (found) return found;
    return spreadsheet.insertSheet(wantedTab);
  }

  // tabName이 없으면 기존 동작: 첫 탭을 쓰고, 비어 있으면 시트 이름으로 바꿔줍니다.
  var sheets = spreadsheet.getSheets();
  var sheet = sheets && sheets.length ? sheets[0] : spreadsheet.insertSheet("Responses");
  var desiredName = String(payload.sheetName || payload.formTitle || "").trim();

  if (desiredName && sheet.getLastRow() === 0) {
    try {
      sheet.setName(safeSheetName_(desiredName));
    } catch (err) {}
  }

  return sheet;
}

function safeSheetName_(name) {
  var cleaned = String(name || "Responses")
    .replace(/[\[\]\*\?\/\\:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 90) || "Responses";
}

function getSheetPropertyKey_(payload) {
  var id = payload.formId || payload.formSlug || payload.sheetName || payload.formTitle || "";
  id = String(id).replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_");
  return id ? "catchform_sheet_" + id : "";
}

function appendPayload_(sheet, payload) {
  var row = payload.row || {};
  if (!Object.keys(row).length) {
    throw new Error("보낼 행 데이터가 비어 있습니다. action 값이 이 스크립트 버전에서 지원되는지 확인해주세요. (현재 버전 " + SCRIPT_VERSION + ")");
  }
  var preferredHeaders = Array.isArray(payload.columns) ? payload.columns.filter(Boolean) : [];

  var headers = sheet.getLastColumn()
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    : [];

  var sourceHeaders = preferredHeaders.length ? preferredHeaders : Object.keys(row);
  sourceHeaders.forEach(function (key) {
    if (headers.indexOf(key) === -1) headers.push(key);
  });

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  var values = headers.map(function (key) {
    var value = row[key];
    if (Array.isArray(value)) return value.map(stringifyValue_).join(" / ");
    return stringifyValue_(value);
  });

  sheet.appendRow(values);
  return sheet.getLastRow();
}

function stringifyValue_(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value.name && value.url) return value.name + " (" + value.url + ")";
    if (value.name) return value.name;
    if (value.url) return value.url;
    return JSON.stringify(value);
  }
  return String(value);
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
