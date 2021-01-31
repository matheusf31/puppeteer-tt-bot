require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

const cookiesFilePath = 'cookies.json';

async function loginTT(page) {
  await page.type('[name="session[username_or_email]"]', process.env.EMAIL);
  await page.type('[name="session[password]"]', process.env.PASS);
  await page.click('[data-testid="LoginForm_Login_Button"]');
  
  await page.waitForNavigation();

  const pageUrl = page.url();

  if (pageUrl === 'https://twitter.com/login?email_disabled=true&redirect_after_login=%2F') {
    await page.type('[name="session[username_or_email]"]', process.env.USER);
    await page.type('[name="session[password]"]', process.env.PASS);
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

async function deleteMedia(page, quantityOfMedias) {
  for (let i = 0; i < quantityOfMedias; i++) {
    await page.click('[data-testid="caret"]');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
}

async function bot() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://twitter.com/login', { waitUntil: 'networkidle2' });

  const previousSession = fs.existsSync(cookiesFilePath);

  if (previousSession) {
    await loadSession(page);
  } else {
    await loginTT(page);
    await saveCookie(page);
  }

  await page.goto('https://twitter.com/matheuso_99/media', { waitUntil: 'networkidle2' });

  await deleteMedia(page, 100);
}

bot();
