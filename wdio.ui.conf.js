const path = require('path');
const fs = require('fs');
// ── Build report folder name by date and run number ──────────────────────────
function buildReportName() {
  const reportsDir = path.join(__dirname, 'reports');
  // Create reports directory automatically
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, {
      recursive: true
    });
  }
  // Format date: YYYY-MM-DD
  const date = new Date().toLocaleDateString('sv-SE');
  // Count existing report folders for today
  const existing = fs.readdirSync(reportsDir)
    .filter(folder =>
      folder.startsWith(date) &&
      fs.statSync(
        path.join(reportsDir, folder)
      ).isDirectory()
    );
  // Generate run number
  const runNumber = String(
    existing.length + 1
  ).padStart(2, '0');
  return `${date}_run-${runNumber}`;
}
// Build dynamic report folder name
const reportName = buildReportName();
// JSON output directory
const jsonOutputDir = path.join(
  __dirname,
  'reports',
  reportName
);
// Create JSON report directory
fs.mkdirSync(jsonOutputDir, {
  recursive: true
});
// Expose report name to generate-report.js
process.env.REPORT_NAME = reportName;
exports.config = {
  // Use WebDriver protocol
  automationProtocol: 'webdriver',
  // Run locally
  runner: 'local',
  // Prevent parallel execution
  workers: 1,
  // Feature files
  specs: [
    './features/ui/**/*.feature'
  ],
  exclude: [],
  // Stability settings
  maxInstances: 1,
  maxInstancesPerCapability: 1,
  capabilities: [{
    browserName: 'chrome',
    maxInstances: 1,
    'goog:chromeOptions': {
      args: [
        // Run headed mode manually with --headed
        ...(process.argv.includes('--headed')
          ? []
          : ['--headless=new']),
        // CI stability flags
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-infobars',
        '--disable-notifications',
        '--disable-popup-blocking',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-features=VizDisplayCompositor',
        '--remote-allow-origins=*',
        // Browser resolution
        '--window-size=1920,1080'
      ]
    }
  }],
  // Logging
  logLevel: 'warn',
  // Stop immediately on failure? 0 = no
  bail: 0,
  // Base URL
  baseUrl: 'https://qa-practice.razvanvancea.ro',
  // Element wait timeout
  waitforTimeout: 20000,
  // WebDriver retry settings
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  // Retry flaky spec files automatically
  specFileRetries: 1,
  // Screenshot output folder
  screenshotPath: './reports/screenshots/',
  // No external services required
  services: [],
  // Test framework
  framework: 'cucumber',
  // Reporters
  reporters: [
    'spec',
    ['cucumberjs-json', {
      jsonFolder: jsonOutputDir,
      language: 'en'
    }]
  ],
  // Cucumber configuration
  cucumberOpts: {
    // Step definitions and hooks
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
    // Run only UI scenarios
    tags: '@ui',
    // Step timeout
    timeout: 60000,
    ignoreUndefinedDefinitions: false
  }
};