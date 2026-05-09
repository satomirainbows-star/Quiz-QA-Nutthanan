exports.config = {

  runner: 'local',
  specs: ['./features/api/**/*.feature'],
  exclude: [],
  // API tests ไม่ใช้ browser
  capabilities: [],
  logLevel: 'warn',
  bail: 0,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'cucumber',
  reporters: ['spec'],
  cucumberOpts: {
    require: [
      './step-definitions/**/*.js',
      './support/hooks.js'
    ],
    tagExpression: '@api',
    timeout: 60000
  }
};