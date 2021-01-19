const path = require('path');
const wdio = require('webdriverio');
const assert = require('assert');

const appPackage = 'com.example';
const opts = {
  path: '/wd/hub',
  port: 4723,
  logLevel: 'warn',
  capabilities: {
    platformName: 'Android',
    platformVersion: '8',
    deviceName: 'Android Emulator',
    app: path.resolve(
      __dirname,
      '../android/app/build/outputs/apk/release/app-release.apk'
    ),
    fullReset: true,
    appPackage: appPackage,
    appActivity: '.MainActivity',
    automationName: 'UiAutomator2',
  },
};

async function main() {
  const iterations = 10;
  const runs = [];
  for (let i = 0; i < iterations; i++) {
    const client = await wdio.remote(opts);
    const mountElement = await client.$('~appMount');
    await mountElement.waitForExist({ timeout: 10000 });

    const base64encoded = await client.pullFile(
      `/storage/emulated/0/Android/data/${appPackage}/files/performance.json`
    );

    await client.deleteSession();

    const data = Buffer.from(base64encoded, 'base64');
    runs.push(JSON.parse(data));
  }
  const mountDurations = runs.map(
    entries => entries.find(e => e.name === 'appMount').duration
  );
  console.log(mountDurations);
}

main().catch(error => {
  console.error(error.toString());
  process.exit(1);
});
