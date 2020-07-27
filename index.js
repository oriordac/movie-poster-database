const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.google.com';
const SEARCH_TERM = 'Lord of the Rings The Two Towers Movie';

(async () => {
  const browser = await puppeteer.launch({headless: false}); //{headless: false} for visual
  const page = await browser.newPage();

  //Google Home Page
  await page.goto(BASE_URL, {waitUntil: 'networkidle2'});
  await page.type('[name=q]', SEARCH_TERM);
  await page.keyboard.press('Enter')
  await page.waitFor(5000);

  //Google Search Page
  const google = await page.evaluate(() => {
    try {
      const title = document.querySelector('h2.qrShPb').innerText;
      const streamers = Array.from(document.querySelectorAll("div.ellip.phXTff"))
        .filter(provider => provider.querySelector("div.ellip.rsj3fb").innerText == "Subscription")
        .map(stream => stream.querySelector("div.ellip.bclEt").innerText);
      console.log(streamers);
      const ROTTEN_TOMATO_URL = document.querySelector('span[title="Rotten Tomatoes"]').parentNode.href;
      return {
        Title: title,
        StreamService: streamers, 
        ROTTEN_TOMATO_URL: ROTTEN_TOMATO_URL
      }; 
    } catch (error) {
      console.log(error);
    }
  });

  //Visit Rotten Tomatoes
  await page.goto(google.ROTTEN_TOMATO_URL, {waitUntil: 'networkidle2'});

  //Scrap Rotten Tomatoes
  const poster = await page.evaluate(() => {
    try {
      return document.querySelector('img.posterImage').src;
    } catch (error) {
      console.log(error);
      return 'poster URL not found'
    }
  });
  
  //Append Poster to object as a property
  google['Poster'] = poster;

  console.log(google);

  await browser.close();
})();