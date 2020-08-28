const request = require('request');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

/**
 * request('https://www.instagram.com/sebsucks/', (error,
    response, html) => {
    if (!error && response.statusCode == 200) {
        console.log(html);
    }
});
*/

class Post {
    constructor(link, user, month, day, year, objects, text) {
        this.date = {
            month,
            day,
            year
        };
        this.imgAlt = {
            objects,
            text
        };
        this.link = link;
        this.user = user;
    }
}

/**
 * let firstPost = new Post('https://www.instagram.com/accounts/login',
    'sebsucks', 11, 10, 1999, ['2 person', 'outdoor', 'tennis'], 'this is a meme');

console.log(firstPost);
console.log(firstPost.imgAlt);
console.log(firstPost.imgAlt.objects[1]);

*/


const scrapeImages = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    await page.goto('https://www.instagram.com/accounts/login');
    await page.waitFor(3000);
    await page.screenshot({ path: '1.png' });

    //Login form
    await page.type('[name=username]', 'sebsuckss');
    await page.type('[name=password]', 'Sebastian10');
    await page.screenshot({ path: '2.png' });
    await page.click('[type=submit]');

    //Social Page
    await page.waitFor(3000);

    await page.goto(`https://www.instagram.com/isetups/`);
    await page.screenshot({ path: '3.png' });

    await page.waitForSelector('img', {
        visible: true,
    });

    async function scrollDown(postID) {
        console.log('in scroll down');
        let scrollDelay = 1000;
        console.log(postID);
        let elementExists = document.querySelector(`a[href='${postID}']`);
        let previousHeight;
        counter = 0;
        while (counter < 10) {
            console.log('right before page');
            previousHeight = await page.evaluate('document.body.scrollHeight');
            console.log('after');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            console.log('after');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitFor(scrollDelay);
            //checks if elementExists is not null
            elementExists = document.querySelector(`a[href='${postID}']`);
            counter++;
        }
        return elementExists;
    }

    /**
    const $ = cheerio.load(`https://www.instagram.com/isetups/`);
    const body = $('body');
    console.log(body.html);
    */

    const data = await page.evaluate(() => {

        /**
        //console.log('getting tags');
        const posts = document.querySelectorAll('article a');
        const imgs = document.querySelectorAll('article img');

        //for(let img of Array.from(imgs))
        console.log(posts.length + ' ' + imgs.length);
        let length = posts.length;
        //for (let i = 0; i < length; i++) {
        //    let imgs
        //}
        //const urls = Array.from(posts).map(v => v.href);
        const urls = Array.from(posts).map(v => v.img);
        //const urls = Array.from(imgs).map(v => v.alt);
        console.log('sup' + urls);
        return posts[0];
        //return urls;
        */
        page.waitFor(3000);
        //getting the selectors of the first posts loaded
        let posts = document.querySelectorAll('article a');
        let imgs = document.querySelectorAll('article img');

        //takes the href of the last post loaded and stores it in lastPostID
        let lastPostID = posts[posts.length - 1].href;
        let scrolled = scrapeImages.scrollDown(lastPostID);
        //console.log(lastPostID);

        const urls = Array.from(posts).map(v => v.href);
        return urls;

    });

    //await browser.close();
    //console.log(data);
    return data;
}

scrapeImages().then((urls) => {
    console.log(urls);
    console.log('done');
}).catch((e) =>
    console.log('Error: ' + e)
);
