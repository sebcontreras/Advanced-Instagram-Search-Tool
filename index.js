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

//this is working perfect, DO NOT CHANGE
function extractLinks(identifier) {
    const selector = document.querySelectorAll(`${identifier}`);
    let items = [];
    for (let element of selector) {
        items.push(element.href);
    }
    console.log(items);
    return items;
}

function extractImgs(identifier) {
    const selector = document.querySelectorAll(`${identifier}`);
    let items = [];
    for (let element of selector) {
        items.push(element.alt);
    }
    console.log(items);
    return items;
}

function extractItem(identifier) {
    const item = document.querySelector(`${identifier}`);
    console.log(`in extract ` + item);
    if (item)
        return true;
    else
        return false;
}

//before we do this lets add data of all posts
function appendLinks(arguments) {
    /**
     * these statements parse the serealizabale argument that was passed into useable data
     */

    const identifierIndex = arguments.indexOf(',');

    //the element that our query is going to search for
    const identifier = arguments.slice(0, identifierIndex);

    //the element at the end of our current links list
    const EndOfListID = arguments.slice(identifierIndex + 1);
    console.log(identifier);
    console.log(EndOfListID);

    const NodeLinkList = document.querySelectorAll(`${identifier}`);
    //const NodeAltList = document.querySelectorAll(`article img`);
    let linksToBeAdded = [];
    //console.log(`getting end of list item:  ${NodeLinkList.item(NodeLinkList.length - 1).href}`);
    //checking if the last  item we added to the list is the item in the browser
    if (NodeLinkList.item(NodeLinkList.length - 1).href == EndOfListID) {
        console.log(`all elements have been added up to this point`);
        return linksToBeAdded;
    } else {
        for (let i = 0; i < NodeLinkList.length; i++) {
            console.log('FOR LOOP: in nodelist of appendlinks');
            console.log(`the element is: ${NodeLinkList.item(i).href}`);
            console.log(`the endOfListID is: ${EndOfListID}`);
            if (NodeLinkList.item(i).href == EndOfListID) {
                console.log(`MATCH FOUND now adding new elements`);
                console.log(`THE FOUND MATCH(should be last element in array is: ${NodeLinkList.item(i).href})`)
                i++;
                while (i < NodeLinkList.length) {
                    console.log(`ADDING ELEMENT: ${NodeLinkList.item(i).href}`);
                    linksToBeAdded.push(NodeLinkList.item(i).href);
                    i++;
                }
                return linksToBeAdded;
            }
        }
        console.log(`last item in list was not found, so nothing could be added :(`);
        return linksToBeAdded;
    }
}

async function getData(page) {

    //let items = await page.evaluate(extractSelectors);
    //getting the selectors of the first posts loaded
    let links = [];
    let imgs = [];
    links = await page.evaluate(extractLinks, 'article a');
    imgs = await page.evaluate(extractImgs, 'article img');

    /**this was used when we were checking if the last post id still existed
        //takes the href of the last post loaded and stores it in lastPostID
        let lastPostLink = links[links.length - 1];
        console.log(lastPostLink);
        let lastPostID = lastPostLink.replace(`https://www.instagram.com`, ``)
        //let scrolled = await page.evaluate(scrollDown, lastPostID, page);
    */
    console.log('in scroll down');
    //let scrollDelay = 1000;
    //console.log(lastPostID);
    //let elementExists = await page.evaluate(extractItem, `article a[href='${lastPostID}']`);
    //console.log(`after extract` + elementExists);
    let previousHeight;
    counter = 0;
    while (counter < 5) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate(() => {
            window.scrollTo({
                left: 0,
                top: document.body.scrollHeight,
                behavior: `auto`,
            });
        });
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        //await page.waitFor(scrollDelay);
        //checks if elementExists is not null

        let lastPostLink = links[links.length - 1];
        console.log(lastPostLink);
        //let lastPostID = lastPostLink.replace(`https://www.instagram.com`, ``);
        const linksToAdd = await page.evaluate(appendLinks, `article a,${lastPostLink}`);
        if (linksToAdd.length == 0) {
            console.log(`no elements were added after this scroll`);
        } else {
            links = links.concat(linksToAdd);
            console.log(`added new elements to links on this scroll`);
            console.log(`new length of links is: ${links.length}`);
        }
        console.log(links);

        //elementExists = await page.evaluate(extractItem, `article a[href='${lastPostID}']`);
        //console.log(`after extract ` + elementExists);
        console.log(counter);
        counter++;
    }
    //console.log(lastPostID);

    //const urls = Array.from(posts).map(v => v.href);
    return links;
    //return posts;
}

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

    let data = await getData(page);

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
