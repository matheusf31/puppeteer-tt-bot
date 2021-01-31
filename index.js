const puppeteer = require('puppeteer');
const fs = require('fs');

const cookiesFilePath = 'cookies.json';

async function loginTT(page) {
  await page.type('[name="session[username_or_email]"]', 'matheusg4g4@gmail.com');
  await page.type('[name="session[password]"]', 'ma33145860');
  await page.click('[data-testid="LoginForm_Login_Button"]');
  
  await page.waitForNavigation();

  const pageUrl = page.url();

  if (pageUrl === 'https://twitter.com/login?email_disabled=true&redirect_after_login=%2F') {
    await page.type('[name="session[username_or_email]"]', 'matheuso_99');
    await page.type('[name="session[password]"]', 'ma33145860');
    await page.click('[data-testid="LoginForm_Login_Button"]');

    await page.waitForNavigation();
  }
}

async function loadSession(page) {
  const cookiesString = fs.readFileSync(cookiesFilePath);
  const parsedCookies = JSON.parse(cookiesString);
  
  if (parsedCookies.length !== 0) {
    for (let cookie of parsedCookies) {
      await page.setCookie(cookie);
    }
    
    console.log('Session has been loaded in the browser');
  }
}

async function saveCookie(page) {
  const cookiesObject = await page.cookies();

  fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
    err => { 
      if (err) {
        console.log('The file could not be written.', err)
      };
      console.log('Session has been successfully saved')
    }
  );
}

async function bot() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://twitter.com/login', { waitUntil: 'networkidle0' });

  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);

  const previousSession = fs.existsSync(cookiesFilePath);

  if (previousSession) {
    await loadSession(page);
  } else {
    await loginTT(page);
    await saveCookie(page);
  }

  await page.goto('https://twitter.com/matheuso_99/media', { waitUntil: 'networkidle2' });

  await page.click('[data-testid="caret"]');

  await page.waitForSelector('[role="menu"]', { timeout: 500 });
  
  const test = await page.evaluate(() => document.querySelector('[role="menu"]'));
  
  console.log(test);
  
  // await page.click('[data-testid="confirmationSheetConfirm"]', { delay: 100 });
}

bot();
