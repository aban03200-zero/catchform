function doPost(e) {
  try {
    var raw = "";
    if (e && e.parameter && e.parameter.payload) raw = e.parameter.payload;
    else if (e && e.postData && e.postData.contents) raw = e.postData.contents;

    var payload = JSON.parse(raw || "{}");
    var spreadsheet = getSpreadsheet_(payload);
    var sheet = getTargetSheet_(spreadsheet, payload);
    appendPayload_(sheet, payload);

    return json_({
      ok: true,
      spreadsheetUrl: spreadsheet.getUrl(),
      sheetName: sheet.getName(),
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
    return SpreadsheetApp.openByUrl(payload.sheetUrl);
  }

  var key = getSheetPropertyKey_(payload);
  var props = PropertiesService.getScriptProperties();
  if (key) {
    var savedId = props.getProperty(key);
    if (savedId) {
      try {
        return SpreadsheetApp.openById(savedId);
      } catch (err) {
        props.deleteProperty(key);
      }
    }
  }

  if (payload.sheetUrl) return SpreadsheetApp.openByUrl(payload.sheetUrl);

  var spreadsheet = SpreadsheetApp.create(payload.sheetName || payload.formTitle || "CatchForm Responses");
  if (key) props.setProperty(key, spreadsheet.getId());
  return spreadsheet;
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
