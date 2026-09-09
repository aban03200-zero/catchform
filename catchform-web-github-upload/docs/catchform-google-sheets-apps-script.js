function doPost(e) {
  try {
    var raw = "";
    if (e && e.parameter && e.parameter.payload) raw = e.parameter.payload;
    else if (e && e.postData && e.postData.contents) raw = e.postData.contents;

    var payload = JSON.parse(raw || "{}");
    var spreadsheet = getSpreadsheet_(payload);
    var sheet = getTargetSheet_(spreadsheet, payload);
    var appendedRow = appendPayload_(sheet, payload);
    SpreadsheetApp.flush();

    return json_({
      ok: true,
      spreadsheetUrl: spreadsheet.getUrl(),
      sheetName: sheet.getName(),
      appendedRow: appendedRow,
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
    time: new Date().toISOString(),
  });
}

function getSpreadsheet_(payload) {
  if ((payload.mode || "existing") === "existing" && payload.sheetUrl) {
    var existing = SpreadsheetApp.openByUrl(payload.sheetUrl);
    ensureSpreadsheetAccess_(existing, payload);
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
        ensureSpreadsheetAccess_(saved, payload);
        return saved;
      } catch (err) {
        props.deleteProperty(key);
      }
    }
  }

  // mode가 "new"인데 sheetUrl이 남아 있으면 기존 시트를 열어버리므로, existing일 때만 사용합니다.
  if (payload.sheetUrl && (payload.mode || "existing") === "existing") {
    var byUrl = SpreadsheetApp.openByUrl(payload.sheetUrl);
    ensureSpreadsheetAccess_(byUrl, payload);
    return byUrl;
  }

  var spreadsheet = SpreadsheetApp.create(payload.sheetName || payload.formTitle || "CatchForm Responses");
  if (key) props.setProperty(key, spreadsheet.getId());
  ensureSpreadsheetAccess_(spreadsheet, payload);
  return spreadsheet;
}

function ensureSpreadsheetAccess_(spreadsheet, payload) {
  var email = String(payload.accountEmail || "").trim();
  if (!email || email.indexOf("@") === -1) return;
  try {
    spreadsheet.addEditor(email);
  } catch (err) {
    // 공유 드라이브 정책이나 도메인 제한 때문에 공유가 막힌 경우에도 응답 기록 자체는 계속 진행합니다.
  }
}

function getTargetSheet_(spreadsheet, payload) {
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
