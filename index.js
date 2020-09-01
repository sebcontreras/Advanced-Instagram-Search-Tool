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
function appendData(arguments) {
    /**
     * these statements parse the serealizabale argument that was passed into useable data
     */
    const queryIdentifierIndex = arguments.indexOf(',');
    const endOfListIDIndex = arguments.indexOf(';');

    //the link element that our query is going to search for
    const linkIdentifier = arguments.slice(0, queryIdentifierIndex);

    //the img element that our query is going to search for
    const imgIdentifier = arguments.slice(queryIdentifierIndex + 1, endOfListIDIndex);

    //the element at the end of our current links list
    const EndOfListID = arguments.slice(endOfListIDIndex + 1);
    console.log(EndOfListID);

    const nodeLinkList = document.querySelectorAll(`${linkIdentifier}`);
    const nodeAltList = document.querySelectorAll(`${imgIdentifier}`);
    let dataToAdd = [];
    //console.log(`getting end of list item:  ${nodeLinkList.item(nodeLinkList.length - 1).href}`);
    //checking if the last  item we added to the list is the item in the browser
    if (nodeLinkList.item(nodeLinkList.length - 1).href == EndOfListID) {
        console.log(`all elements have been added up to this point`);
        return dataToAdd;
    } else {
        for (let i = 0; i < nodeLinkList.length; i++) {
            console.log('FOR LOOP: in nodelist of appendlinks');
            console.log(`the element is: ${nodeLinkList.item(i).href}`);
            console.log(`the endOfListID is: ${EndOfListID}`);
            if (nodeLinkList.item(i).href == EndOfListID) {
                console.log(`MATCH FOUND now adding new elements`);
                console.log(`THE FOUND MATCH(should be last element in array is: ${nodeLinkList.item(i).href})`)
                i++;
                while (i < nodeLinkList.length) {
                    console.log(`ADDING ELEMENT: ${nodeLinkList.item(i).href}`);
                    dataToAdd.push([nodeLinkList.item(i).href, nodeAltList.item(i).alt]);
                    i++;
                }
                return dataToAdd;
            }
        }
        console.log(`last item in list was not found, so nothing could be added :(`);
        return dataToAdd;
    }
}

async function getData(page) {

    //let items = await page.evaluate(extractSelectors);
    //getting the selectors of the first posts loaded
    let links = [];
    let imgs = [];
    links = await page.evaluate(extractLinks, 'article a');
    imgs = await page.evaluate(extractImgs, 'article img');

    //initializing the start of the data list with the first posts that were loaded
    let data = [];
    for (let i = 0; i < links.length; i++) {
        data[i] = [links[i], imgs[i]];
    }

    console.log(data);

    /**this was used when we were checking if the last post id still existed
        //takes the href of the last post loaded and stores it in lastPostID
        let lastPostLink = links[links.length - 1];
        console.log(lastPostLink);
        let lastPostID = lastPostLink.replace(`https://www.instagram.com`, ``)
        //let scrolled = await page.evaluate(scrollDown, lastPostID, page);
    */
    console.log('in scroll down');
    let scrollDelay = 1000;
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
        await page.waitFor(scrollDelay);
        //checks if elementExists is not null

        let lastPostLink = data[data.length - 1][0];
        console.log(lastPostLink);
        //let lastPostID = lastPostLink.replace(`https://www.instagram.com`, ``);
        const newData = await page.evaluate(appendData, `article a,article img;${lastPostLink}`);
        if (newData.length == 0) {
            console.log(`no elements were added after this scroll`);
        } else {
            data = data.concat(newData);
            console.log(`added new elements to links on this scroll`);
            console.log(`new length of data is: ${data.length}`);
        }
        console.log(data);

        //elementExists = await page.evaluate(extractItem, `article a[href='${lastPostID}']`);
        //console.log(`after extract ` + elementExists);
        console.log(counter);
        counter++;
    }

    return data;
    //return posts;
}

const scrapeImages = async () => {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    await page.goto('https://www.instagram.com/accounts/login');
    await page.waitFor(3000);
    //await page.screenshot({ path: '1.png' });

    //Login form
    await page.type('[name=username]', 'sebsuckss');
    await page.type('[name=password]', 'Sebastian10');
    //await page.screenshot({ path: '2.png' });
    await page.click('[type=submit]');

    //Social Page
    await page.waitFor(3000);

    await page.goto(`https://www.instagram.com/daquan/`);
    //await page.screenshot({ path: '3.png' });

    await page.waitForSelector('img', {
        visible: true,
    });

    let data = await getData(page);

    //await browser.close();
    //console.log(data);
    return data;
}

scrapeImages().then((urls) => {
    //console.log(urls);
    console.log('done');
}).catch((e) =>
    console.log('Error: ' + e)
);
