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

/**
 * Master list of all known sports grouped by season.
 * Used as the dropdown source when adding a sport from the dashboard.
 * The actual active sports per school are stored in the Sports tab.
 */
const SEASON_DATA = {
  "FALL":   { icon: "fa-leaf",      sports: ["Cheer", "Cross Country", "Flag Football", "Football", "Golf - Girls", "Tennis - Girls", "Volleyball - Girls", "Water Polo - Boys"] },
  "WINTER": { icon: "fa-snowflake", sports: ["Basketball - Boys", "Basketball - Girls", "Competition Cheer", "Soccer - Boys", "Soccer - Girls", "Water Polo - Girls", "Wrestling - Boys", "Wrestling - Girls"] },
  "SPRING": { icon: "fa-droplet",   sports: ["Baseball", "Golf - Boys", "Lacrosse - Boys", "Lacrosse - Girls", "Softball", "Swim & Dive", "Tennis - Boys", "Track & Field", "Volleyball - Boys"] }
};

const CALENDAR_DATA = {
  seasons: {
    FALL:   { start: '2025-07-23', end: '2025-11-13' },
    WINTER: { start: '2025-10-27', end: '2026-02-11' },
    SPRING: { start: '2026-01-15', end: '2026-05-12' }
  },
  gradingPeriods: [
    { key: 'S1_6WK',    label: 'S1 - 6 Week',  start: '2025-09-27', end: '2025-11-07' },
    { key: 'S1_12WK',   label: 'S1 - 12 Week', start: '2025-11-08', end: '2026-01-09' },
    { key: 'S1_FINALS', label: 'S1 - Finals',  start: '2026-01-10', end: '2026-02-20' },
    { key: 'S2_6WK',    label: 'S2 - 6 Week',  start: '2026-02-21', end: '2026-04-24' },
    { key: 'S2_12WK',   label: 'S2 - 12 Week', start: '2026-04-25', end: '2026-06-18' },
    { key: 'S2_FINALS', label: 'S2 - Finals',  start: '2026-06-20', end: '2026-09-26' }
  ],
  seasonPeriods: {
    FALL:   ['S2_FINALS', 'S1_6WK',    'S1_12WK'  ],
    WINTER: ['S1_12WK',   'S1_FINALS', 'S2_6WK'   ],
    SPRING: ['S1_FINALS', 'S2_6WK',    'S2_12WK'  ]
  }
};

const MASTER_DIRECTORY_ID = '1taQtmJlyyj8IVlKxL8gNngw8lKrRNvnHsXVvox3DBjQ';

const SECRETARY_EMAILS = [
  'secretary1@guhsd.net',
  'secretary2@guhsd.net'
];

// ─── Sport Sheet Header Row ───────────────────────────────────────────────────
const SPORT_SHEET_HEADERS = [
  ['School Year', 'Student ID', 'Level', 'Last Name', 'First Name', 'Grade',
   'S1F GPA', 'S1F Conduct', 'S1F Passing', 'S1F Classes', 'S1F Qualify', 'S1F Waiver', 'S1F Status',
   'S26W GPA', 'S26W Conduct', 'S26W Passing', 'S26W Classes', 'S26W Qualify', 'S26W Waiver', 'S26W Status',
   'S212W GPA', 'S212W Conduct', 'S212W Passing', 'S212W Classes', 'S212W Qualify', 'S212W Waiver', 'S212W Status',
   'Overall Waiver Used',
   'Date Added', 'Date Last Moved', 'Date Dropped']  // cols 28, 29, 30 (index 27, 28, 29)
];

// Column indices (0-based) for the date tracking columns
const COL_DATE_ADDED    = 27;
const COL_DATE_MOVED    = 28;
const COL_DATE_DROPPED  = 29;

// History tab headers
const HISTORY_HEADERS = [
  ['Timestamp', 'Student ID', 'Student Name', 'Sport', 'Action', 'From Level', 'To Level', 'Action Date', 'Logged By']
];

// ─── Entry Point ──────────────────────────────────────────────────────────────

function doGet(e) {
  const selectedSchool = (e && e.parameter && e.parameter.school) || "Valhalla";
  const schoolConfig   = SCHOOL_INFO[selectedSchool] || SCHOOL_INFO['Valhalla'];
  const template       = HtmlService.createTemplateFromFile('Index');

  const userEmail       = (Session.getEffectiveUser().getEmail() || Session.getActiveUser().getEmail()).toLowerCase();

  // Role is always 'Pending' — determined client-side via PIN auth.
  // This ensures non-Google users can still authenticate.
  const userRole = 'Pending';

  // Load active sports from spreadsheet for sidebar
  const activeSports = getSportsForSchool(selectedSchool);

  template.currentSchool  = selectedSchool;
  template.activeSports   = activeSports;
  template.seasonData     = SEASON_DATA;
  template.calendarData   = CALENDAR_DATA;
  template.userRole       = userRole;
  template.userEmail      = userEmail;
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

// ─── Sports Tab Helpers ───────────────────────────────────────────────────────

/**
 * Reads the Sports tab and returns active sports grouped by season.
 * Format: { FALL: ['Football', 'Cheer', ...], WINTER: [...], SPRING: [...] }
 * Falls back to SEASON_DATA if Sports tab doesn't exist yet.
 */
function getSportsForSchool(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return buildFallbackSports();

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Sports');
  if (!sheet) return buildFallbackSports();

  const data   = sheet.getDataRange().getValues().slice(1); // skip header
  const result = { FALL: [], WINTER: [], SPRING: [] };

  data.forEach(row => {
    const season = String(row[0]).trim().toUpperCase();
    const sport  = String(row[1]).trim();
    const active = String(row[2]).trim().toUpperCase();
    if (sport && active === 'Y' && result[season] !== undefined) {
      result[season].push(sport);
    }
  });

  // Sort each season's sports alphabetically
  Object.keys(result).forEach(season => result[season].sort());

  return result;
}

/** Falls back to SEASON_DATA if the Sports tab doesn't exist yet. */
function buildFallbackSports() {
  const result = {};
  Object.keys(SEASON_DATA).forEach(season => {
    result[season] = SEASON_DATA[season].sports.slice();
  });
  return result;
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────

/**
 * Returns all data needed to render the dashboard:
 * sports (all rows from Sports tab) and coaches (all rows from Coaches tab).
 */
function getDashboardData(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss = SpreadsheetApp.openById(config.sheetID);

  // Sports tab: Season | Sport Name | Active
  const sportsSheet = ss.getSheetByName('Sports');
  const sports = sportsSheet
    ? sportsSheet.getDataRange().getValues().slice(1)
        .filter(r => String(r[1]).trim())
        .map(r => ({ season: String(r[0]).trim(), name: String(r[1]).trim(), active: String(r[2]).trim().toUpperCase() === 'Y' }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  // Coaches tab: Name | PIN | Sports
  const coachesSheet = ss.getSheetByName('Coaches');
  const coaches = coachesSheet
    ? coachesSheet.getDataRange().getValues().slice(1)
        .filter(r => String(r[0]).trim())
        .map(r => ({ name: String(r[0]).trim(), pin: String(r[1]).trim(), sports: String(r[2]).trim() }))
    : [];

  return { sports, coaches };
}

// ─── Sport Management ─────────────────────────────────────────────────────────

/**
 * Adds a sport to the Sports tab and creates its sheet with standard headers.
 * @returns {{ success: boolean, message: string }}
 */
function addSport(schoolName, season, sportName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss = SpreadsheetApp.openById(config.sheetID);

  // Ensure Sports tab exists
  let sportsTab = ss.getSheetByName('Sports');
  if (!sportsTab) {
    sportsTab = ss.insertSheet('Sports');
    sportsTab.appendRow(['Season', 'Sport Name', 'Active']);
  }

  // Check for duplicate
  const existing = sportsTab.getDataRange().getValues();
  for (let i = 1; i < existing.length; i++) {
    if (String(existing[i][1]).trim().toLowerCase() === sportName.trim().toLowerCase()) {
      // If archived, re-activate it
      if (String(existing[i][2]).trim().toUpperCase() === 'N') {
        sportsTab.getRange(i + 1, 3).setValue('Y');
        // Rename archived sheet back if it exists
        const archivedSheet = ss.getSheetByName('ARCHIVED - ' + sportName);
        if (archivedSheet) archivedSheet.setName(sportName);
        return { success: true, message: sportName + ' has been re-activated.' };
      }
      return { success: false, message: sportName + ' is already active.' };
    }
  }

  // Add to Sports tab
  sportsTab.appendRow([season.toUpperCase(), sportName, 'Y']);

  // Create sport sheet if it doesn't exist
  if (!ss.getSheetByName(sportName)) {
    const newSheet = ss.insertSheet(sportName);
    newSheet.getRange(1, 1, 1, SPORT_SHEET_HEADERS[0].length).setValues(SPORT_SHEET_HEADERS);
    newSheet.appendRow(new Array(SPORT_SHEET_HEADERS[0].length).fill(''));

    // Move to position 6 (index 5), or last if fewer than 6 sheets exist
    const targetIndex = Math.min(5, ss.getNumSheets() - 1);
    ss.moveActiveSheet(targetIndex + 1); // moveActiveSheet is 1-based
  }

  return { success: true, message: sportName + ' has been added successfully.' };
}

/**
 * Archives a sport: sets Active to N in Sports tab and renames the sheet.
 * @returns {{ success: boolean, message: string }}
 */
function archiveSport(schoolName, sportName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss         = SpreadsheetApp.openById(config.sheetID);
  const sportsTab  = ss.getSheetByName('Sports');
  if (!sportsTab) throw new Error('Sports tab not found.');

  // Set Active to N
  const data = sportsTab.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toLowerCase() === sportName.trim().toLowerCase()) {
      sportsTab.getRange(i + 1, 3).setValue('N');
      break;
    }
  }

  // Rename sport sheet to ARCHIVED - Sport Name
  const sportSheet = ss.getSheetByName(sportName);
  if (sportSheet) sportSheet.setName('ARCHIVED - ' + sportName);

  return { success: true, message: sportName + ' has been archived.' };
}

// ─── Coach Management ─────────────────────────────────────────────────────────

/**
 * Adds a new coach row to the Coaches tab.
 * Enforces PIN uniqueness across all coaches.
 */
function addCoach(schoolName, name, pin, sports) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss = SpreadsheetApp.openById(config.sheetID);
  let coachesTab = ss.getSheetByName('Coaches');
  if (!coachesTab) {
    coachesTab = ss.insertSheet('Coaches');
    coachesTab.appendRow(['Name', 'PIN', 'Sports']);
  }

  // Check PIN uniqueness
  const data = coachesTab.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(pin).trim()) {
      return { success: false, message: 'PIN ' + pin + ' is already in use by ' + data[i][0] + '.' };
    }
  }

  coachesTab.appendRow([name, pin, sports]);
  return { success: true, message: name + ' has been added.' };
}

/**
 * Removes a coach by their PIN.
 */
function removeCoach(schoolName, pin) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss         = SpreadsheetApp.openById(config.sheetID);
  const coachesTab = ss.getSheetByName('Coaches');
  if (!coachesTab) throw new Error('Coaches tab not found.');

  const data = coachesTab.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(pin).trim()) {
      coachesTab.deleteRow(i + 1);
      return { success: true, message: data[i][0] + ' has been removed.' };
    }
  }
  return { success: false, message: 'Coach with PIN ' + pin + ' not found.' };
}

/**
 * Updates an existing coach row. Identified by their current PIN.
 * If newPin differs from currentPin, checks uniqueness first.
 */
function updateCoach(schoolName, currentPin, name, newPin, sports) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss         = SpreadsheetApp.openById(config.sheetID);
  const coachesTab = ss.getSheetByName('Coaches');
  if (!coachesTab) throw new Error('Coaches tab not found.');

  const data = coachesTab.getDataRange().getValues();

  // If PIN is changing, check it's not already taken
  if (String(newPin).trim() !== String(currentPin).trim()) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim() === String(newPin).trim()) {
        return { success: false, message: 'PIN ' + newPin + ' is already in use by ' + data[i][0] + '.' };
      }
    }
  }

  // Find and update
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() === String(currentPin).trim()) {
      coachesTab.getRange(i + 1, 1, 1, 3).setValues([[name, newPin, sports]]);
      return { success: true, message: name + ' has been updated.' };
    }
  }

  return { success: false, message: 'Coach with PIN ' + currentPin + ' not found.' };
}

/**
 * Returns all rows from the History tab, newest first.
 * Each row: [Timestamp, Student ID, Student Name, Sport, Action, From Level, To Level, Action Date, Logged By]
 */
function getHistoryLog(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School not found.');

  const ss   = SpreadsheetApp.openById(config.sheetID);
  const tab  = ss.getSheetByName('History');
  if (!tab) return [];

  const rows = tab.getDataRange().getValues().slice(1) // skip header
    .filter(r => r[0]) // skip blank rows
    .map(r => r.map(cell => cell instanceof Date ? cell.toISOString() : cell));

  // Return newest first
  return rows.reverse();
}

// ─── PIN Validation ───────────────────────────────────────────────────────────

function validateCoachPIN(schoolName, pin) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return null;

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Coaches');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowPin    = String(data[i][1]).trim();
    const rowSports = String(data[i][2]).trim();
    if (rowPin === String(pin).trim()) {
      return {
        name:   String(data[i][0]).trim(),
        sports: rowSports.split(',').map(s => s.trim()).filter(s => s.length > 0)
      };
    }
  }
  return null;
}

/**
 * Validates an admin PIN against the Admins tab.
 * Admins tab layout: Name | Email | Role | PIN
 * Returns { name, role } on success, null on failure.
 */
function validateAdminPIN(schoolName, pin) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return null;

  const ss = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  // Ensure the input PIN is treated as a trimmed string
  const inputPin = String(pin).trim();

  for (let i = 1; i < data.length; i++) {
    // Force the cell value to a string and remove decimals if it's a number
    let rowPin = data[i][3];
    if (rowPin === null || rowPin === undefined) continue;
    
    // This handles scientific notation or .0 decimals from Google Sheets
    rowPin = String(rowPin).split('.')[0].trim(); 

    if (rowPin === inputPin) {
      return {
        name: String(data[i][0]).trim(), // col A
        role: String(data[i][2]).trim()  // col C
      };
    }
  }
  return null;
}

// ─── Data Functions ───────────────────────────────────────────────────────────

function getDirectoryData(schoolName) {
  const config = SCHOOL_INFO[schoolName] || SCHOOL_INFO['Valhalla'];
  const ss     = SpreadsheetApp.openById(MASTER_DIRECTORY_ID);
  const sheet  = ss.getSheetByName(config.abbreviatedName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  data.shift();
  return data.map(row => row.map(cell =>
    cell instanceof Date ? cell.toLocaleDateString() : cell
  ));
}

function getMergedSportData(schoolName, sport) {
  const config = SCHOOL_INFO[schoolName];
  const ss     = SpreadsheetApp.openById(config.sheetID);
  const sheet  = ss.getSheetByName(sport);
  if (!sheet) return [];

  return sheet.getDataRange().getValues()
    .slice(2)
    .filter(row => row[0] && String(row[0]).trim() !== '')
    .map(row => row.map(cell =>
      cell instanceof Date ? cell.toLocaleDateString() : cell
    ));
}

function updateStudentData(p) {
  if (!p || !p.school) throw new Error('Parameters missing.');
  const config = SCHOOL_INFO[p.school];
  if (!config)          throw new Error('School not found.');

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName(p.sport);
  if (!sheet)           throw new Error('Sport sheet not found.');

  const data     = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(row => String(row[0]).trim() === String(p.id).trim());
  if (rowIndex === -1)  throw new Error('Student ID ' + p.id + ' not found.');

  const sheetRow = rowIndex + 1;

  // Write the primary value (level change)
  sheet.getRange(sheetRow, p.colIndex + 1).setValue(p.value);

  // Write the appropriate date column based on action type
  const actionDate = p.actionDate || new Date().toLocaleDateString('en-US');
  if (p.action === 'DROP') {
    sheet.getRange(sheetRow, COL_DATE_DROPPED + 1).setValue(actionDate);
  } else if (p.action === 'MOVE') {
    sheet.getRange(sheetRow, COL_DATE_MOVED + 1).setValue(actionDate);
  } else if (p.action === 'RESTORE') {
    // Clear drop date, set move date
    sheet.getRange(sheetRow, COL_DATE_DROPPED + 1).setValue('');
    sheet.getRange(sheetRow, COL_DATE_MOVED + 1).setValue(actionDate);
  }

  // Log to History tab
  const studentName = String(data[rowIndex][3] || '') + ' ' + String(data[rowIndex][2] || '');
  logHistoryEntry(p.school, {
    studentId:   p.id,
    studentName: studentName.trim(),
    sport:       p.sport,
    action:      p.action || 'UPDATE',
    fromLevel:   String(data[rowIndex][1] || ''),
    toLevel:     p.value,
    actionDate:  actionDate,
    loggedBy:    p.loggedBy || ''
  });

  return getMergedSportData(p.school, p.sport);
}

/**
 * Appends a row to the History tab. Auto-creates the tab if it doesn't exist.
 * Also schedules a debounced notification email for admins who opt in.
 */
function logHistoryEntry(schoolName, entry) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return;

  const ss = SpreadsheetApp.openById(config.sheetID);
  let historyTab = ss.getSheetByName('History');

  if (!historyTab) {
    historyTab = ss.insertSheet('History');
    historyTab.getRange(1, 1, 1, HISTORY_HEADERS[0].length).setValues(HISTORY_HEADERS);
    // Freeze header row and bold it
    historyTab.setFrozenRows(1);
    historyTab.getRange(1, 1, 1, HISTORY_HEADERS[0].length).setFontWeight('bold');
  }

  historyTab.appendRow([
    new Date(),          // Timestamp (server time)
    entry.studentId,
    entry.studentName,
    entry.sport,
    entry.action,
    entry.fromLevel,
    entry.toLevel,
    entry.actionDate,    // Coach-provided date
    entry.loggedBy
  ]);

  // Queue a debounced notification email
  scheduleNotificationEmail(schoolName, entry);
}

// ─── Notification System ──────────────────────────────────────────────────────

/**
 * Reads the Admins tab and returns email addresses for admins who have
 * "Receives Updates" set to Y in column E.
 * Admins tab layout: Name (A) | Email (B) | Role (C) | PIN (D) | Receives Updates (E)
 *
 * @param {string} schoolName
 * @returns {string[]} array of email addresses
 */
function getNotificationRecipients(schoolName) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return [];

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName('Admins');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues().slice(1); // skip header
  return data
    .filter(row => {
      const email      = String(row[1] || '').trim();
      const receivesUp = String(row[4] || '').trim().toUpperCase();
      return email && receivesUp === 'Y';
    })
    .map(row => String(row[1]).trim());
}

/**
 * Pending-notifications tab headers.
 * Columns: School | Sport | Action | Student Name | Student ID |
 *          From Level | To Level | Action Date | Logged By | Queued At | Sent
 */
const NOTIFICATIONS_HEADERS = [[
  'School', 'Sport', 'Action', 'Student Name', 'Student ID',
  'From Level', 'To Level', 'Action Date', 'Logged By', 'Queued At', 'Sent'
]];

/**
 * Writes one pending-notification row to the school's Notifications tab,
 * then ensures a time-based trigger will fire ~1 hour from now to flush them.
 *
 * The trigger is stored in Script Properties as
 *   "notif_trigger_<sheetID>" → triggerId
 * so we only ever have one pending trigger per school at a time.
 *
 * @param {string} schoolName
 * @param {object} entry  - same shape as logHistoryEntry's entry param
 */
function scheduleNotificationEmail(schoolName, entry) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) return;

  const ss = SpreadsheetApp.openById(config.sheetID);

  // Auto-create Notifications tab if needed
  let notifTab = ss.getSheetByName('Notifications');
  if (!notifTab) {
    notifTab = ss.insertSheet('Notifications');
    notifTab.getRange(1, 1, 1, NOTIFICATIONS_HEADERS[0].length).setValues(NOTIFICATIONS_HEADERS);
    notifTab.setFrozenRows(1);
    notifTab.getRange(1, 1, 1, NOTIFICATIONS_HEADERS[0].length).setFontWeight('bold');
  }

  // Append the pending row (Sent = N)
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
    new Date(),   // Queued At
    'N'           // Sent flag
  ]);

  // Check if a trigger is already scheduled for this school
  const props    = PropertiesService.getScriptProperties();
  const propKey  = 'notif_trigger_' + config.sheetID;
  const existing = props.getProperty(propKey);

  if (existing) {
    // A trigger is already pending — nothing more to do.
    // The existing trigger will pick up this new row when it fires.
    return;
  }

  // No pending trigger — create one to fire in ~65 minutes
  // (65 min gives Apps Script's trigger a comfortable margin around the 1-hour mark)
  const trigger = ScriptApp.newTrigger('sendPendingNotifications')
    .timeBased()
    .after(65 * 60 * 1000)
    .create();

  props.setProperty(propKey, trigger.getUniqueId());
}

/**
 * Time-based trigger target.
 * Reads every school's Notifications tab, groups unsent rows by school,
 * sends one summary email per school to opted-in admins, then marks rows sent.
 *
 * This function is registered as a trigger by scheduleNotificationEmail.
 * It self-cleans its own trigger from Script Properties when done.
 */
function sendPendingNotifications() {
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();

  // Find all pending-trigger property keys
  const triggerKeys = Object.keys(allProps).filter(k => k.startsWith('notif_trigger_'));

  triggerKeys.forEach(propKey => {
    // Derive sheetID from the property key
    const sheetID = propKey.replace('notif_trigger_', '');

    // Find which school this sheetID belongs to
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

    // Collect unsent rows (col index 10 = Sent flag)
    const unsentRows    = [];
    const unsentIndices = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][10]).trim().toUpperCase() === 'N') {
        unsentRows.push(data[i]);
        unsentIndices.push(i + 1); // 1-based sheet row
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

    // Mark all flushed rows as sent
    unsentIndices.forEach(rowNum => {
      notifTab.getRange(rowNum, 11).setValue('Y');
    });

    // Remove the trigger property so a new trigger can be created next time
    props.deleteProperty(propKey);

    // Also delete the actual Apps Script trigger object
    const triggerId = allProps[propKey];
    ScriptApp.getProjectTriggers().forEach(t => {
      if (t.getUniqueId() === triggerId) ScriptApp.deleteTrigger(t);
    });
  });
}

/**
 * Builds an HTML email body summarising all roster changes.
 *
 * @param {string}   schoolName
 * @param {Array[]}  rows  - unsent notification rows from the Notifications tab
 * @returns {string} HTML string
 */
function buildNotificationEmailBody(schoolName, rows) {
  const config     = SCHOOL_INFO[schoolName];
  const color      = config ? config.primaryColor : '#2c66b8';
  const logoUrl    = config ? config.logoUrl       : '';
  const now        = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  // Group rows by sport for a cleaner layout
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
          // If it's already a date object or a valid date string, format it
          date = Utilities.formatDate(new Date(date), "America/Los_Angeles", "MM/dd/yyyy");
        } catch (e) {
          // If it's not a valid date, keep the original string as a fallback
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
    <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
                 background:#f1f5f9; margin:0; padding:24px;">
      <div style="max-width:1000px; margin:0 auto;">

        <!-- Header -->
        <div style="background:${color}; border-radius:12px 12px 0 0;
                    padding:20px 24px; display:flex; align-items:center; gap:16px;">
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

        <!-- Body -->
        <div style="background:#f8fafc; padding:24px; border:1px solid #e2e8f0; border-top:none;
                    border-radius:0 0 12px 12px;">

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

function addBulkStudentsToSport(schoolName, sportName, studentArray, level, actionDate, loggedBy) {
  const config = SCHOOL_INFO[schoolName];
  if (!config || !config.sheetID) throw new Error('School config missing.');

  const ss    = SpreadsheetApp.openById(config.sheetID);
  const sheet = ss.getSheetByName(sportName);
  if (!sheet) throw new Error('Sport sheet not found.');

  const date = actionDate || new Date().toLocaleDateString('en-US');

  studentArray.forEach(student => {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1).setValue(student[0]); // Student ID
    sheet.getRange(lastRow + 1, 2).setValue(level);       // Level
    sheet.getRange(lastRow + 1, COL_DATE_ADDED + 1).setValue(date);

    const studentName = String(student[2] || '') + ' ' + String(student[1] || '');
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




