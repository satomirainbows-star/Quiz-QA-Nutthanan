const path = require('path');
const fs = require('fs');

// ── สร้างชื่อ folder ตามวันที่และครั้งที่รัน ──────────────────────────────────
function buildReportName() {
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  // วันที่ปัจจุบัน เช่น 2026-05-09
  const date = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD

  // นับจำนวน folder ที่มีวันที่เดียวกันแล้ว +1
  const existing = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith(date) && fs.statSync(path.join(reportsDir, f)).isDirectory());
  const runNumber = String(existing.length + 1).padStart(2, '0');

  return `${date}_run-${runNumber}`;
}

const reportName = buildReportName();
const jsonOutputDir = path.join(__dirname, 'reports', reportName);
fs.mkdirSync(jsonOutputDir, { recursive: true });

// เก็บชื่อไว้ให้ generate-report.js อ่านต่อ
process.env.REPORT_NAME = reportName;

exports.config = {
  runner: 'local',
  specs: ['./features/**/*.feature'],
  exclude: [],
  maxInstances: 1,
  maxInstancesPerCapability: 1,
  workers: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        ...(process.argv.includes('--headed') ? [] : ['--headless']),
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1280,800'
      ]
    }
  }],
  logLevel: 'warn',
  bail: 0,
  baseUrl: 'https://qa-practice.razvanvancea.ro',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['chromedriver'],
  framework: 'cucumber',
  reporters: [
    'spec',
    ['cucumberjs-json', {
      jsonFolder: jsonOutputDir,
      language: 'en'
    }]
  ],
  cucumberOpts: {
    require: ['./step-definitions/**/*.js', './support/hooks.js'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '',
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  }
};
