function getSessions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sessions"); //"Sessions" is the name of Sheet
  formatSheet(sheet);
  var reportBegin = '2018-05-01'; //Choose your date
  writeHeader(reportBegin,sheet);
  
  
  var allAccount = Analytics.Management.Accounts.list();
  var rowNum = 2;
  for (var i = 0; i < allAccount.items.length; i++) { 
    var accountProperties = Analytics.Management.Webproperties.list(allAccount.items[i].id);
    if (accountProperties.items[0] == undefined) {
      continue;
    } else {
      if (accountProperties.items[0].defaultProfileId == undefined) {
        continue;
      } else {
        var profileId = accountProperties.items[0].defaultProfileId;
        var webUrl = accountProperties.items[0].websiteUrl;
        sheet.getRange("A"+rowNum).getCell(1,1).setValue(webUrl);
        profileLine(profileId,reportBegin,rowNum,webUrl, sheet);
        rowNum++;
      }      
    }    
  }
}



function profileLine(profileId,reportBegin,rowNum,webUrl, sheet) {
  var tableId = 'ga:' + profileId;  
  var reportEnd = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"); //Today
  var results = Analytics.Data.Ga.get(
    tableId,
    reportBegin,
    reportEnd,
    'ga:sessions',
    {'dimensions': 'ga:nthMonth'});  
  var resultsString = results.rows.toString();
  var resultsArray = resultsString.split(",");  
  var lenArray = results.rows.length;
  var range = sheet.getRange(rowNum, 2, 1, lenArray);
  var numRows = range.getNumRows();
  var numCols = range.getNumColumns();  
  //range.getCell(1,1).setValue(webUrl);
  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {
      range.getCell(i,j).setValue(resultsArray[(j*2) - 1].toString());
    
    }  
  }
  
}


function formatSheet(sheet){
  //Format the Sheet
  sheet.clear();
  sheet.getRange("A:Z").setFontFamily("Alegreya");
  sheet.getRange("A:Z").setVerticalAlignment("middle");
}


function writeHeader(reportBegin, sheet) {  
  var fromMonth = reportBegin.replace(/\d{4}-/g, "").replace(/-\d{2}/g, "");
  var fromYear = reportBegin.replace(/-\d{2}-\d{2}/g, "");    
  var thisYear = Utilities.formatDate(new Date(), "GMT+7", "yyyy");
  var thisMonth = Utilities.formatDate(new Date(), "GMT+7", "MM");
  var numberMonths = ((thisYear - fromYear) * 12) + (+thisMonth - +fromMonth) + 1;  
  var range = sheet.getRange(1, 2, 1, numberMonths);
  //sheet.setColumnWidths(2, numberMonths, 70);
  range.setHorizontalAlignment("center");
  range.setBackground("yellow");
  for (var j = 1; j <= numberMonths; j++) {    
    var month = (+j + +fromMonth) - 1;
    var year = fromYear;
    if (month > 12) {
      month = month - 12;
      year = +year + +1;
    }
    if (month < 10) {
      month = "0" + month;
    }
    var time = month + " | " + year;
    range.getCell(1,j).setValue(time);
    
  }
}
