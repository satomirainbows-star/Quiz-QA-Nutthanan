const path = require('path');
const fs = require('fs');
// ── สร้างชื่อ folder ตามวันที่และครั้งที่รัน ──────────────────────────────────
function buildReportName() {
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const date = new Date().toLocaleDateString('sv-SE');
  const existing = fs.readdirSync(reportsDir)
    .filter(f =>
      f.startsWith(date) &&
      fs.statSync(path.join(reportsDir, f)).isDirectory()
    );
  const runNumber = String(existing.length + 1).padStart(2, '0');
  return `${date}_run-${runNumber}`;
}
const reportName = buildReportName();
const jsonOutputDir = path.join(
  __dirname,
  'reports',
  reportName
);
fs.mkdirSync(jsonOutputDir, { recursive: true });
process.env.REPORT_NAME = reportName;
exports.config = {
  runner: 'local',
  specs: ['./features/ui/**/*.feature'],
  exclude: [],
  maxInstances: 1,
  maxInstancesPerCapability: 1,
  capabilities: [{
    browserName: 'chrome',
    maxInstances: 1,
    'goog:chromeOptions': {
      args: [

        ...(process.argv.includes('--headed')
          ? []
          : ['--headless=new']),

        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-infobars',
        '--window-size=1920,1080'
      ]
    }
  }],
  logLevel: 'warn',
  bail: 0,
  baseUrl: 'https://qa-practice.razvanvancea.ro',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [],
  framework: 'cucumber',
  reporters: [
    'spec',
    ['cucumberjs-json', {
      jsonFolder: jsonOutputDir,
      language: 'en'
    }]
  ],
  cucumberOpts: {
    require: [
      './step-definitions/**/*.js',
      './support/hooks.js'
    ],
    backtrace: false,
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    tagExpression: '@ui',
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  }
};