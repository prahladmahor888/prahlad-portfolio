function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sheet Tools')
    .addItem('Format Headers', 'formatHeaders')
    .addItem('Sort Sheet', 'showSortDialog')
    .addItem('Filter Data', 'showFilterDialog')
    .addItem('Add Validation', 'showValidationDialog')
    .addToUi();
}

// Sheet Management Functions
function getActiveData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  return sheet.getDataRange().getValues();
}

function formatHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  
  headerRange.setBackground('#E8EAED')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
}

function sortByColumn(columnIndex) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const sortOrder = SpreadsheetApp.SortOrder.ASCENDING;
  
  range.sort({column: columnIndex + 1, ascending: true});
}

function filterColumn(columnIndex, value) {
  const data = getActiveData();
  const filteredData = data.filter((row, index) => {
    return index === 0 || row[columnIndex] === value;
  });
  
  displayFilteredData(filteredData);
}

function addValidation(columnIndex, values) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(2, columnIndex + 1, lastRow - 1, 1);
  
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values)
    .setAllowInvalid(false)
    .build();
  
  range.setDataValidation(rule);
}

// Dialog UI Functions
function showSortDialog() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Sort Sheet',
    'Enter column number to sort (1-based):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const columnIndex = parseInt(response.getResponseText()) - 1;
    sortByColumn(columnIndex);
  }
}

function showFilterDialog() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Filter Data',
    'Enter column number and value (e.g., "2,Active"):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const [col, value] = response.getResponseText().split(',');
    filterColumn(parseInt(col) - 1, value.trim());
  }
}

function showValidationDialog() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Add Validation',
    'Enter column number and values (e.g., "2,Yes,No,Maybe"):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const [col, ...values] = response.getResponseText().split(',');
    addValidation(parseInt(col) - 1, values.map(v => v.trim()));
  }
}

// Utility Functions
function displayFilteredData(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  formatHeaders();
}

function clearFilters() {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getFilter()?.remove();
}

function autoResizeColumns() {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}

// Form Handling Functions
function doGet() {
  return HtmlService.createHtmlOutputFromFile('form')
    .setTitle('Data Entry Form')
    .setFaviconUrl('https://www.google.com/images/product/sheets_32dp.png');
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses');
  const data = e.parameter;
  const timestamp = new Date();
  
  const rowData = [
    timestamp,
    data.name,
    data.email,
    data.message
  ];
  
  sheet.appendRow(rowData);
  return HtmlService.createHtmlOutput('Data submitted successfully!');
}

function createFormSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Form Responses') || ss.insertSheet('Form Responses');
  
  const headers = ['Timestamp', 'Name', 'Email', 'Message'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeaders();
}
