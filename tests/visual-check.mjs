import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true,channel:"chrome"});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1});
page.on('pageerror',e=>console.log('PAGEERROR',e.message));
await page.goto('http://localhost:5173');await page.waitForTimeout(1300);await page.screenshot({path:'output/preloader-mobile.png'});await page.waitForTimeout(3200);await page.screenshot({path:'output/hero-mobile.png'});
console.log('mobile',await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,video:document.querySelector('video').readyState,time:document.querySelector('video').currentTime})));
for(const [name,url] of [['room','/sobe/deluxe'],['booking','/booking'],['guest','/client'],['admin','/admin']]){await page.goto('http://localhost:5173'+url);await page.waitForTimeout(700);await page.screenshot({path:'output/'+name+'-mobile.png'});console.log(name,await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth})));}
await browser.close();

