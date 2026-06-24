const SCHOOL_INFO = {
  'El Cajon Valley': { logoUrl: 'https://braves.guhsd.net/images/logo.png',      primaryColor: '#C70011', sheetID: '1QSr6AtR3acDrLi-gjtf321zQvRLj9jldZcUngrvh4uY', abbreviatedName: 'ECVHS' },
  'El Capitan':      { logoUrl: 'https://elcapitan.guhsd.net/images/logo.png',   primaryColor: '#FFB618', sheetID: '',                                             abbreviatedName: 'ECHS'  },
  'Granite Hills':   { logoUrl: 'https://granite.guhsd.net/images/logo.png',     primaryColor: '#75B2DD', sheetID: '',                                             abbreviatedName: 'GHHS'  },
  'Grossmont':       { logoUrl: 'https://www.foothillers.com/images/logo.png',   primaryColor: '#2c66b8', sheetID: '1RFDxXhCJP_5wXgHMsiwQdUAeBS_jgwZ0NLlRVvSqa1o', abbreviatedName: 'GHS'   },
  'Monte Vista':     { logoUrl: 'https://montevista.guhsd.net/images/logo.png',  primaryColor: '#AC1818', sheetID: '',                                             abbreviatedName: 'MVHS'  },
  'Mount Miguel':    { logoUrl: 'https://mountmiguel.guhsd.net/images/logo.png', primaryColor: '#CF0A2C', sheetID: '',                                             abbreviatedName: 'MMHS'  },
  'Santana':         { logoUrl: 'https://santana.guhsd.net/images/logo.png',     primaryColor: '#9807e0', sheetID: '',                                             abbreviatedName: 'SHS'   },
  'Valhalla':        { logoUrl: 'https://valhalla.guhsd.net/images/logo.png',    primaryColor: '#FF5F00', sheetID: '1nyg93-qFXGkcpukxISU1k0ZFTln0kZnNh_CWRFz_yIM', abbreviatedName: 'VHS'   },
  'West Hills':      { logoUrl: 'https://wolfpack.guhsd.net/images/logo.png',    primaryColor: '#1f52c2', sheetID: '1E4w20cV3plZjgHS39CUNnLmTMRVqgxY2JfdJnrXByGc', abbreviatedName: 'WHHS'  }
};

const SEASON_DATA = {
  "FALL":   { icon: "fa-leaf",      sports: ["Cheer", "Cross Country", "Flag Football", "Football", "Golf - Girls", "Tennis - Girls", "Volleyball - Girls", "Water Polo - Boys"] },
  "WINTER": { icon: "fa-snowflake", sports: ["Basketball - Boys", "Basketball - Girls", "Competition Cheer", "Soccer - Boys", "Soccer - Girls", "Water Polo - Girls", "Wrestling - Boys", "Wrestling - Girls"] },
  "SPRING": { icon: "fa-droplet",   sports: ["Baseball", "Golf - Boys", "Lacrosse - Boys", "Lacrosse - Girls", "Softball", "Swim & Dive", "Tennis - Boys", "Track & Field", "Volleyball - Boys"] }
};

const MASTER_DIRECTORY_ID = '1oV4hTFizvmNz6r5JkVx8ko1wbG86pXCglaLtswuW5HM';

// UPDATED: Now perfectly matches the "Skinny Roster" format
const SPORT_SHEET_HEADERS = [
  ['Student Name', 'Student ID', 'Level', 'Date Added', 'Date Moved', 'Date Dropped'] 
];

// UPDATED: Column mappings for the new Skinny Roster (0-indexed)
const COL_DATE_ADDED   = 3; // Col D
const COL_DATE_MOVED   = 4; // Col E
const COL_DATE_DROPPED = 5; // Col F

const HISTORY_HEADERS = [
  ['Timestamp', 'Student ID', 'Student Name', 'Sport', 'Action', 'From Level', 'To Level', 'Action Date', 'Logged By']
];

function doGet(e) {
  const selectedSchool = (e && e.parameter && e.parameter.school) || "Valhalla";
  const schoolConfig   = SCHOOL_INFO[selectedSchool] || SCHOOL_INFO['Valhalla'];
  const template       = HtmlService.createTemplateFromFile('Index');
  
  // 1. Capture the verified logged-in email
  const userEmail = Session.getActiveUser().getEmail().toLowerCase();
  
  let userRole = 'Unauthorized';
  let coachSports = [];

  // 2. Are they an Athletic Secretary (Admin)?
  const adminCheck = validateAdminEmail(selectedSchool, userEmail);
  if (adminCheck) {
    userRole = 'Secretary';
  } else {
    // 3. Are they a Coach?
    const coachCheck = validateCoachEmail(selectedSchool, userEmail);
    if (coachCheck) {
      userRole = 'Coach';
      coachSports = coachCheck.sports; // Save the specific sports they are allowed to see
    }
  }

  const activeSports = getSportsForSchool(selectedSchool);

  // 4. Pass everything to the frontend
  template.currentSchool  = selectedSchool;
  template.activeSports   = activeSports;
  template.seasonData     = SEASON_DATA;
  template.calendarData   = getDynamicCalendar();
  template.userRole       = userRole;
  template.userEmail      = userEmail;
  template.coachSports    = coachSports; // Pass the coach's authorized sports
  template.config = {
    name:            selectedSchool,
    logoUrl:         schoolConfig.logoUrl,
    primaryColor:    schoolConfig.primaryColor,
    abbreviatedName: schoolConfig.abbreviatedName
  };

  return template.evaluate()
    .setTitle('Rosters | ' + selectedSchool)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSportsForSchool(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return buildFallbackSports();

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Sports');
  if (!sheet) return buildFallbackSports();

  const data   = sheet.getDataRange().getValues().slice(1); 
  const result = { FALL: [], WINTER: [], SPRING: [] };

  data.forEach(row => {
    const season = String(row[0]).trim().toUpperCase();
    const sport  = String(row[1]).trim();
    const active = String(row[2]).trim().toUpperCase();
    if (sport && active === 'Y' && result[season] !== undefined) {
      result[season].push(sport);
    }
  });

  Object.keys(result).forEach(season => result[season].sort());
  return result;
}

function buildFallbackSports() {
  const result = {};
  Object.keys(SEASON_DATA).forEach(season => {
    result[season] = SEASON_DATA[season].sports.slice();
  });
  return result;
}

function getDashboardData(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss = SpreadsheetApp.openById(config.sheetID);

  const sportsSheet = ss.getSheetByName('Sports');
  const sports = sportsSheet
    ? sportsSheet.getDataRange().getValues().slice(1)
        .filter(r => String(r[1]).trim())
        .map(r => ({ season: String(r[0]).trim(), name: String(r[1]).trim(), active: String(r[2]).trim().toUpperCase() === 'Y' }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const coachesSheet = ss.getSheetByName('Coaches');
  const coaches = coachesSheet
    ? coachesSheet.getDataRange().getValues().slice(1)
        .filter(r => String(r[0]).trim())
        .map(r => ({ name: String(r[0]).trim(), email: String(r[1]).trim(), sports: String(r[2]).trim(), type: String(r[3] || 'Head').trim() }))
    : [];

  return { sports, coaches };
}

function addSport(schoolName, season, sportName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss = SpreadsheetApp.openById(config.sheetID);
  let sportsTab = ss.getSheetByName('Sports');
  if (!sportsTab) {
    sportsTab = ss.insertSheet('Sports');
    sportsTab.appendRow(['Season', 'Sport Name', 'Active']);
  }

  const existing = sportsTab.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (String(existing[i][1]).trim().toLowerCase() === sportName.trim().toLowerCase()) {
      if (String(existing[i][2]).trim().toUpperCase() === 'N') {
        sportsTab.getRange(i + 1, 3).setValue('Y');
        const archivedSheet = ss.getSheetByName('ARCHIVED - ' + sportName);
        if (archivedSheet) archivedSheet.setName(sportName);
        return { success: true, message: sportName + ' has been re-activated.' };
      }
      return { success: false, message: sportName + ' is already active.' };
    }
  }

  sportsTab.appendRow([season.toUpperCase(), sportName, 'Y']);
  if (!ss.getSheetByName(sportName)) {
    const newSheet = ss.insertSheet(sportName);
    newSheet.getRange(1, 1, 1, SPORT_SHEET_HEADERS[0].length).setValues(SPORT_SHEET_HEADERS);
    newSheet.appendRow(new Array(SPORT_SHEET_HEADERS[0].length).fill(''));

    const targetIndex = Math.min(5, ss.getNumSheets() - 1);
    ss.moveActiveSheet(targetIndex + 1); 
  }

  return { success: true, message: sportName + ' has been added successfully.' };
}

function archiveSport(schoolName, sportName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss         = SpreadsheetApp.openById(config.sheetID);
  const sportsTab  = ss.getSheetByName('Sports');
  if (!sportsTab) throw new Error('Sports tab not found.');

  const data = sportsTab.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === sportName.trim().toLowerCase()) {
      sportsTab.getRange(i + 1, 3).setValue('N');
      break;
    }
  }

  const sportSheet = ss.getSheetByName(sportName);
  if (sportSheet) sportSheet.setName('ARCHIVED - ' + sportName);

  return { success: true, message: sportName + ' has been archived.' };
}

function addCoach(schoolName, name, email, sports, type) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss = SpreadsheetApp.openById(config.sheetID);
  let coachesTab = ss.getSheetByName('Coaches');
  if (!coachesTab) {
    coachesTab = ss.insertSheet('Coaches');
    coachesTab.appendRow(['Name', 'Email', 'Sports', 'Type']);
  }

  const data = coachesTab.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === String(email).trim().toLowerCase()) {
      return { success: false, message: 'Email ' + email + ' is already in use by ' + data[i][0] + '.' };
    }
  }

  coachesTab.appendRow([name, email, sports, type || 'Head']);
  return { success: true, message: name + ' has been added.' };
}

function removeCoach(schoolName, email) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss         = SpreadsheetApp.openById(config.sheetID);
  const coachesTab = ss.getSheetByName('Coaches');
  if (!coachesTab) throw new Error('Coaches tab not found.');

  const data = coachesTab.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === String(email).trim().toLowerCase()) {
      coachesTab.deleteRow(i + 1);
      return { success: true, message: data[i][0] + ' has been removed.' };
    }
  }
  return { success: false, message: 'Coach with email ' + email + ' not found.' };
}

function updateCoach(schoolName, currentEmail, name, newEmail, sports, type) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss         = SpreadsheetApp.openById(config.sheetID);
  const coachesTab = ss.getSheetByName('Coaches');
  if (!coachesTab) throw new Error('Coaches tab not found.');

  const data = coachesTab.getDataRange().getValues();
  
  if (String(newEmail).trim().toLowerCase() !== String(currentEmail).trim().toLowerCase()) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toLowerCase() === String(newEmail).trim().toLowerCase()) {
        return { success: false, message: 'Email ' + newEmail + ' is already in use by ' + data[i][0] + '.' };
      }
    }
  }

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === String(currentEmail).trim().toLowerCase()) {
      coachesTab.getRange(i + 1, 1, 1, 4).setValues([[name, newEmail, sports, type || 'Head']]);
      return { success: true, message: name + ' has been updated.' };
    }
  }

  return { success: false, message: 'Coach with email ' + currentEmail + ' not found.' };
}

function getHistoryLog(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss   = SpreadsheetApp.openById(config.sheetID);
  const tab  = ss.getSheetByName('History');
  if (!tab) return [];

  const rows = tab.getDataRange().getValues().slice(1) 
    .filter(r => r[0]) 
    .map(r => r.map(cell => cell instanceof Date ? cell.toISOString() : cell));
    
  return rows.reverse();
}

function validateCoachEmail(schoolName, email) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return null;

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Coaches');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  const inputEmail = String(email).trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const rowEmail  = String(data[i][1]).trim().toLowerCase(); 
    const rowSports = String(data[i][2]).trim();
    if (rowEmail === inputEmail) {
      return {
        name:   String(data[i][0]).trim(),
        sports: rowSports.split(',').map(s => s.trim()).filter(s => s.length > 0)
      };
    }
  }
  return null;
}

function validateAdminEmail(schoolName, email) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return null;

  const ss = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  const inputEmail = String(email).trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const rowEmail = String(data[i][1]).trim().toLowerCase();
    if (rowEmail === inputEmail) {
      return {
        name: String(data[i][0]).trim(), 
        role: String(data[i][2]).trim()  
      };
    }
  }
  return null;
}

function getDirectoryData(schoolName) {
  const config = SCHOOL_INFO[schoolName] || SCHOOL_INFO['Valhalla'];
  const ss     = SpreadsheetApp.openById(MASTER_DIRECTORY_ID);
  const sheet  = ss.getSheetByName(config.abbreviatedName);
  
  if (!sheet) return { headers: [], rows: [] };
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return { headers: [], rows: [] };
  
  // Pluck the headers off the top so we can send them separately
  const headers = data.shift(); 
  const rows = data.map(row => row.map(cell =>
    cell instanceof Date ? cell.toLocaleDateString() : cell
  ));
  
  // Send the structured package
  return { headers: headers, rows: rows };
}

// UPDATED: This function restores the proper data package {masterHeaders, roster}
// AND correctly reads the columns based on the new Skinny Roster format
function getMergedSportData(schoolName, sport) {
  const config = SCHOOL_INFO[schoolName];
  if (!config) return { masterHeaders: [], roster: [] };

  const ss = SpreadsheetApp.openById(config.sheetID);
  const sportSheet = ss.getSheetByName(sport);
  if (!sportSheet) return { masterHeaders: [], roster: [] };
  const rosterData = sportSheet.getDataRange().getValues();

  const masterSS = SpreadsheetApp.openById(MASTER_DIRECTORY_ID);
  const masterSheet = masterSS.getSheetByName(config.abbreviatedName);
  if (!masterSheet) return { masterHeaders: [], roster: [] };
  const masterData = masterSheet.getDataRange().getValues();
  const masterHeaders = masterData[0];

  const masterDict = {};
  const studentIdIndex = masterHeaders.indexOf('Student Number');
  for (let i = 1; i < masterData.length; i++) {
    const row = masterData[i];
    const sId = String(row[studentIdIndex]).trim();
    masterDict[sId] = row;
  }

  const mergedRoster = [];
  
  // Start loop at index 1 because Skinny Rosters only have ONE header row!
  for (let i = 1; i < rosterData.length; i++) {
    const rRow = rosterData[i];
    const sId  = String(rRow[1]).trim(); // Col B is Student ID
    if (!sId) continue;

    const level       = String(rRow[2]).trim(); // Col C is Level
    const dateAdded   = rRow[COL_DATE_ADDED];
    const dateMoved   = rRow[COL_DATE_MOVED];
    const dateDropped = rRow[COL_DATE_DROPPED];

    const mRow = masterDict[sId] || [];

    mergedRoster.push({
      id:          sId,
      level:       level,
      dateAdded:   dateAdded instanceof Date ? dateAdded.toLocaleDateString() : dateAdded,
      dateMoved:   dateMoved instanceof Date ? dateMoved.toLocaleDateString() : dateMoved,
      dateDropped: dateDropped instanceof Date ? dateDropped.toLocaleDateString() : dateDropped,
      masterData:  mRow
    });
  }

  return {
    masterHeaders: masterHeaders,
    roster: mergedRoster
  };
}

// UPDATED: Fixes the column indices so level changes, drops, and restores work correctly
function updateStudentData(p) {
  if (!p || !p.school) throw new Error('Parameters missing.');
  const config = SCHOOL_INFO[p.school];
  if (!config)          throw new Error('School not found.');
  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName(p.sport);
  if (!sheet)           throw new Error('Sport sheet not found.');
  const data     = sheet.getDataRange().getValues();
  
  // Find ID in Col B (Index 1) instead of Col A
  const rowIndex = data.findIndex(row => String(row[1]).trim() === String(p.id).trim());
  if (rowIndex === -1)  throw new Error('Student ID ' + p.id + ' not found.');
  const sheetRow = rowIndex + 1;

  // Force update to Level column (Col 3)
  sheet.getRange(sheetRow, 3).setValue(p.value);
  
  const actionDate = p.actionDate || new Date().toLocaleDateString('en-US');
  if (p.action === 'DROP') {
    sheet.getRange(sheetRow, COL_DATE_DROPPED + 1).setValue(actionDate);
  } else if (p.action === 'MOVE') {
    sheet.getRange(sheetRow, COL_DATE_MOVED + 1).setValue(actionDate);
  } else if (p.action === 'RESTORE') {
    sheet.getRange(sheetRow, COL_DATE_DROPPED + 1).setValue('');
    sheet.getRange(sheetRow, COL_DATE_MOVED + 1).setValue(actionDate);
  }

  // Name is now in Col A (Index 0)
  const studentName = String(data[rowIndex][0] || '');
  logHistoryEntry(p.school, {
    studentId:   p.id,
    studentName: studentName.trim(),
    sport:       p.sport,
    action:      p.action || 'UPDATE',
    fromLevel:   String(data[rowIndex][2] || ''), // Level is Col C (Index 2)
    toLevel:     p.value,
    actionDate:  actionDate,
    loggedBy:    p.loggedBy || ''
  });
  return getMergedSportData(p.school, p.sport);
}

function logHistoryEntry(schoolName, entry) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return;

  const ss = SpreadsheetApp.openById(config.sheetID);
  let historyTab = ss.getSheetByName('History');
  if (!historyTab) {
    historyTab = ss.insertSheet('History');
    historyTab.getRange(1, 1, 1, HISTORY_HEADERS[0].length).setValues(HISTORY_HEADERS);
    historyTab.setFrozenRows(1);
    historyTab.getRange(1, 1, 1, HISTORY_HEADERS[0].length).setFontWeight('bold');
  }

  historyTab.appendRow([
    new Date(),
    entry.studentId,
    entry.studentName,
    entry.sport,
    entry.action,
    entry.fromLevel,
    entry.toLevel,
    entry.actionDate, 
    entry.loggedBy
  ]);
  scheduleNotificationEmail(schoolName, entry);
}

function getNotificationRecipients(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return [];

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues().slice(1); 
  return data
    .filter(row => {
      const email      = String(row[1] || '').trim();
      const receivesUp = String(row[4] || '').trim().toUpperCase();
      return email && receivesUp === 'Y';
    })
    .map(row => String(row[1]).trim());
}

const NOTIFICATIONS_HEADERS = [[
  'School', 'Sport', 'Action', 'Student Name', 'Student ID',
  'From Level', 'To Level', 'Action Date', 'Logged By', 'Queued At', 'Sent'
]];

function scheduleNotificationEmail(schoolName, entry) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return;

  const ss = SpreadsheetApp.openById(config.sheetID);

  let notifTab = ss.getSheetByName('Notifications');
  if (!notifTab) {
    notifTab = ss.insertSheet('Notifications');
    notifTab.getRange(1, 1, 1, NOTIFICATIONS_HEADERS[0].length).setValues(NOTIFICATIONS_HEADERS);
    notifTab.setFrozenRows(1);
    notifTab.getRange(1, 1, 1, NOTIFICATIONS_HEADERS[0].length).setFontWeight('bold');
  }

  notifTab.appendRow([
    schoolName,
    entry.sport,
    entry.action || 'UPDATE',
    entry.studentName,
    entry.studentId,
    entry.fromLevel || '',
    entry.toLevel   || '',
    entry.actionDate,
    entry.loggedBy  || '',
    new Date(),  
    'N'           
  ]);

  const props    = PropertiesService.getScriptProperties();
  const propKey  = 'notif_trigger_' + config.sheetID;
  const existing = props.getProperty(propKey);
  if (existing) return;

  const trigger = ScriptApp.newTrigger('sendPendingNotifications')
    .timeBased()
    .after(65 * 60 * 1000)
    .create();
  props.setProperty(propKey, trigger.getUniqueId());
}

function sendPendingNotifications() {
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();

  const triggerKeys = Object.keys(allProps).filter(k => k.startsWith('notif_trigger_'));
  triggerKeys.forEach(propKey => {
    const sheetID = propKey.replace('notif_trigger_', '');

    const schoolName = Object.keys(SCHOOL_INFO).find(
      name => SCHOOL_INFO[name].sheetID === sheetID
    );
    if (!schoolName) { props.deleteProperty(propKey); return; }

    const config = SCHOOL_INFO[schoolName];
    let ss;
    try { ss = SpreadsheetApp.openById(sheetID); }
    catch (e) { props.deleteProperty(propKey); return; }

    const notifTab = ss.getSheetByName('Notifications');
    if (!notifTab)  { props.deleteProperty(propKey); return; }

    const data = notifTab.getDataRange().getValues();
    if (data.length <= 1) { props.deleteProperty(propKey); return; }

    const unsentRows    = [];
    const unsentIndices = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][10]).trim().toUpperCase() === 'N') {
        unsentRows.push(data[i]);
        unsentIndices.push(i + 1);
      }
    }

    if (unsentRows.length === 0) { props.deleteProperty(propKey); return; }

    const recipients = getNotificationRecipients(schoolName);
    if (recipients.length > 0) {
      const subject = schoolName + ' Roster Manager — ' + unsentRows.length + ' update' +
                      (unsentRows.length !== 1 ? 's' : '') + ' in the last hour';
      const body = buildNotificationEmailBody(schoolName, unsentRows);
      MailApp.sendEmail({
        to:      recipients.join(','),
        subject: subject,
        htmlBody: body,
        name: schoolName + " Roster Manager"
      });
    }

    unsentIndices.forEach(rowNum => {
      notifTab.getRange(rowNum, 11).setValue('Y');
    });

    props.deleteProperty(propKey);
    const triggerId = allProps[propKey];
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getUniqueId() === triggerId) ScriptApp.deleteTrigger(t);
    });
  });
}

function buildNotificationEmailBody(schoolName, rows) {
  const config     = SCHOOL_INFO[schoolName];
  const color      = config ? config.primaryColor : '#2c66b8';
  const logoUrl    = config ? config.logoUrl       : '';
  const now        = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
  
  const bySport = {};
  rows.forEach(row => {
    const sport = String(row[1] || 'Unknown').trim();
    if (!bySport[sport]) bySport[sport] = [];
    bySport[sport].push(row);
  });

  const actionLabel = { ADD: 'Added', MOVE: 'Moved', DROP: 'Dropped', RESTORE: 'Restored' };
  const actionColor = { ADD: '#15803d', MOVE: '#1d4ed8', DROP: '#b91c1c', RESTORE: '#7e22ce' };
  const actionBg    = { ADD: '#f0fdf4', MOVE: '#eff6ff', DROP: '#fef2f2', RESTORE: '#fdf4ff' };

  let sportsHtml = '';
  Object.keys(bySport).sort().forEach(sport => {
    const sportRows = bySport[sport];
    const rowsHtml  = sportRows.map(row => {
      const action    = String(row[2] || '').toUpperCase();
      const student   = String(row[3] || '').trim();
      const studentId = String(row[4] || '').trim();
      const from      = String(row[5] || '').trim();
      const to        = String(row[6] || '').trim();
      let date        = String(row[7] || '').trim();
      
      if (date && date!== '') {
        try {
          date = Utilities.formatDate(new Date(date), "America/Los_Angeles", "MM/dd/yyyy");
        } catch (e) {
          console.warn("Could not format date:", date);
        }
      }
      const loggedBy  = String(row[8] || '').trim();
      const label     = actionLabel[action] || action;
      const aColor    = actionColor[action] || '#475569';
      const aBg       = actionBg[action]    || '#f1f5f9';
      const levelChange = action === 'ADD'
        ? `<span style="color:#475569;">&rarr; ${to}</span>`
        : `<span style="color:#94a3b8; text-decoration:line-through;">${from}</span>
           &nbsp;&rarr;&nbsp;
           <span style="color:#1e293b; font-weight:600;">${to}</span>`;

      return `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 12px;">
            <span style="display:inline-block; padding:2px 8px; border-radius:4px;
                         font-size:11px; font-weight:700; letter-spacing:0.04em;
                         background:${aBg}; color:${aColor}; border:1px solid ${aColor}30;">
              ${label}
            </span>
          </td>
          <td style="padding:10px 12px;">
            <span style="font-weight:600; color:#1e293b;">${student}</span>
            <span style="color:#94a3b8; font-size:12px; margin-left:6px;">ID: ${studentId}</span>
          </td>
          <td style="padding:10px 12px; color:#475569;">${levelChange}</td>
          <td style="padding:10px 12px; color:#64748b; font-size:13px;">${date}</td>
          <td style="padding:10px 12px; color:#94a3b8; font-size:12px;">${loggedBy || '—'}</td>
        </tr>`;
    }).join('');

    sportsHtml += `
      <div style="margin-bottom:24px;">
        <div style="background:${color}; color:white; padding:8px 16px; border-radius:6px 6px 0 0;
                    font-weight:700; font-size:14px; letter-spacing:0.03em;">
          ${sport}
          <span style="font-weight:400; font-size:12px; opacity:0.85; margin-left:8px;">
            ${sportRows.length} change${sportRows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <table style="width:100%; border-collapse:collapse; background:white;
                      border:1px solid #e2e8f0; border-top:none; border-radius:0 0 6px 6px; overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 12px; text-align:left; font-size:11px; font-weight:700;
                         text-transform:uppercase; color:#64748b; border-bottom:1px solid #e2e8f0;">Action</th>
              <th style="padding:8px 12px; text-align:left; font-size:11px; font-weight:700;
                         text-transform:uppercase; color:#64748b; border-bottom:1px solid #e2e8f0;">Student</th>
              <th style="padding:8px 12px; text-align:left; font-size:11px; font-weight:700;
                         text-transform:uppercase; color:#64748b; border-bottom:1px solid #e2e8f0;">Level</th>
              <th style="padding:8px 12px; text-align:left; font-size:11px; font-weight:700;
                         text-transform:uppercase; color:#64748b; border-bottom:1px solid #e2e8f0;">Date</th>
              <th style="padding:8px 12px; text-align:left; font-size:11px; font-weight:700;
                         text-transform:uppercase; color:#64748b; border-bottom:1px solid #e2e8f0;">Logged By</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
  });

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#f1f5f9; margin:0; padding:24px;">
      <div style="max-width:1000px; margin:0 auto;">
        <div style="background:${color}; border-radius:12px 12px 0 0; padding:20px 24px; display:flex; align-items:center; gap:16px;">
          ${logoUrl ? `<img src="${logoUrl}" style="height:48px; object-fit:contain; filter:drop-shadow(0 0 4px rgba(0,0,0,0.3));">` : ''}
          <div>
            <div style="color:white; font-size:18px; font-weight:800; letter-spacing:0.02em;">
              ${schoolName} Roster Manager
            </div>
            <div style="color:rgba(255,255,255,0.8); font-size:13px; margin-top:2px;">
              Roster Update Summary · ${now}
            </div>
          </div>
        </div>
        <div style="background:#f8fafc; padding:24px; border:1px solid #e2e8f0; border-top:none; border-radius:0 0 12px 12px;">
          <p style="color:#475569; margin:0 0 20px 0; font-size:14px;">
            The following roster changes were recorded in the past hour:
          </p>
          ${sportsHtml}
          <p style="color:#94a3b8; font-size:12px; margin:16px 0 0 0; text-align:center;">
            This is an automated summary from the ${schoolName} Roster Manager.
            All changes are also recorded in the History Log.
          </p>
        </div>
      </div>
    </body>
    </html>`;
}

// UPDATED: Fixes the column indices so newly added students land in the right columns
function addBulkStudentsToSport(schoolName, sportName, studentArray, level, actionDate, loggedBy) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School config missing.');

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName(sportName);
  if (!sheet) throw new Error('Sport sheet not found.');

  const date = actionDate || new Date().toLocaleDateString('en-US');

  studentArray.forEach(student => {
    const lastRow = sheet.getLastRow();
    
    // Format Name as "Last, First" for Column A
    const studentName = String(student[2] || '') + ', ' + String(student[1] || '');
    
    sheet.getRange(lastRow + 1, 1).setValue(studentName); // Col A: Name
    sheet.getRange(lastRow + 1, 2).setValue(student[0]);  // Col B: ID
    sheet.getRange(lastRow + 1, 3).setValue(level);       // Col C: Level       
    sheet.getRange(lastRow + 1, COL_DATE_ADDED + 1).setValue(date); // Col D: Date Added

    logHistoryEntry(schoolName, {
      studentId:   student[0],
      studentName: studentName.trim(),
      sport:       sportName,
      action:      'ADD',
      fromLevel:   '',
      toLevel:     level,
      actionDate:  date,
      loggedBy:    loggedBy || ''
    });
  });

  return true;
};

function getDynamicCalendar() {
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('calendar_settings');
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const ss = SpreadsheetApp.openById(MASTER_DIRECTORY_ID);
  const sheet = ss.getSheetByName('Settings');
  if (!sheet) throw new Error("Settings tab missing in Master Directory");
  
  const data = sheet.getDataRange().getDisplayValues(); 
  
  const dynamicPeriods = [];
  const dynamicSeasons = {};
  const dynamicSeasonPeriods = {};

  for (let i = 1; i < data.length; i++) {
    
    if (data[i][0]) {
      dynamicPeriods.push({
        key:    String(data[i][0]).trim(),
        label:  String(data[i][1]).trim(),
        start:  String(data[i][2]).trim(),
        end:    String(data[i][3]).trim(),
        prefix: String(data[i][4]).trim()
      });
    }

    if (data[i][6]) {
      const seasonName = String(data[i][6]).trim().toUpperCase();
      
      dynamicSeasons[seasonName] = {
        start: String(data[i][7]).trim(),
        end:   String(data[i][8]).trim()
      };

      const periodsString = String(data[i][9]).trim();
      dynamicSeasonPeriods[seasonName] = periodsString.split(',').map(p => p.trim());
    }
  }

  const fullCalendar = {
    seasons:        dynamicSeasons,
    gradingPeriods: dynamicPeriods,
    seasonPeriods:  dynamicSeasonPeriods
  };

  cache.put('calendar_settings', JSON.stringify(fullCalendar), 21600); 
  
  return fullCalendar;
}

/**
 * Updates manual eligibility overrides (Qualify/Waiver) in the Master Directory.
 * Automatically creates the column if it doesn't exist yet.
 */
function updateEligibilityStatus(schoolName, studentId, colName, isChecked) {
  const config = SCHOOL_INFO[schoolName];
  if (!config) throw new Error('School config missing.');
  
  const ss = SpreadsheetApp.openById(MASTER_DIRECTORY_ID);
  const sheet = ss.getSheetByName(config.abbreviatedName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let colIdx = headers.indexOf(colName);
  
  // If the specific Waiver column doesn't exist yet for this period, create it!
  if (colIdx === -1) {
    colIdx = headers.length;
    sheet.getRange(1, colIdx + 1).setValue(colName);
  }
  
  const idIdx = headers.indexOf('Student Number');
  const rowIndex = data.findIndex(row => String(row[idIdx]).trim() === String(studentId).trim());
  
  if (rowIndex === -1) throw new Error('Student ID ' + studentId + ' not found.');
  
  sheet.getRange(rowIndex + 1, colIdx + 1).setValue(isChecked ? 'TRUE' : 'FALSE');
  return true;
}

