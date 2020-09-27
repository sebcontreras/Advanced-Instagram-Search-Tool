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
    constructor(link, user, month, day, year, objects, text, tagged) {
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
        this.tagged = tagged;
    }
}

function parseAutomatedPost(link, elementText) {
    let index = elementText.indexOf('by') + 3;
    let parsedString = elementText.slice(index);

    //getting month
    let month = '';
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];

    for (let current of months) {
        if (parsedString.indexOf(` on ${current} `) !== -1) {
            month = current;
            break;
        }
    }

    //set user, then  slice user and month
    index = parsedString.indexOf(` on ${month} `);
    const user = parsedString.slice(0, index);
    parsedString = parsedString.slice(user.length + 5 + month.length);

    //set day, then slice day
    index = parsedString.indexOf(`, `);
    const day = parsedString.slice(0, index);
    parsedString = parsedString.slice(index + 2)

    //set year, then slice year
    const year = parsedString.slice(0, 4);
    parsedString = parsedString.slice(5);

    console.log(parsedString);

    //if there is no 'image may contain or taggin', return info
    if (parsedString.length <= 2)
        return new Post(link, user, month, day, year, '', '', '');

    //check for tags
    let tags = [];
    if (parsedString.indexOf('tagging @') !== -1 && parsedString.indexOf('tagging @') < 3) {
        let temp = '';
        if (parsedString.indexOf(' Image may contain:') !== -1)
            temp = parsedString.slice(0, parsedString.indexOf('. Image may contain:'));
        else
            temp = parsedString.slice(0);
        while (temp.length > 0) {
            index = temp.indexOf(`@`);
            temp = temp.slice(index + 1);
            console.log(temp);
            index = temp.indexOf(`, `);
            if (index !== -1) {
                tags.push(temp.slice(0, index));
            } else {

            }
        }
    }

    //slice 'image may contain'
    index = parsedString.indexOf(`: `);
    parsedString = parsedString.slice(index + 2);

    return new Post(link, user, month, day, year, 'instagen', '', '');
}

function CreatePostObjectFromData(element) {
    const elementText = element[1];
    if (elementText == 'video')
        return new Post(element[0], 'user', '', '', '', 'video', '', '');
    else if (elementText == '')
        return new Post(element[0], 'user', '', '', '', '', '');
    else if (elementText.startsWith('Photo by') || elementText.startsWith('Photo by', 1)
        || elementText.startsWith('Photo shared') || elementText.startsWith('Photo shared', 1))
        return parseAutomatedPost(element[0], elementText);
    else
        return new Post(element[0], 'user', '', '', '', '', elementText, '');
}

const parseData = async (data) => {

    return new Promise((resolve, reject) => {
        if (data.length == 0) {
            reject('No data to be parsed');
        } else if (data.length > 0) {
            posts = [];
            for (let element of data) {
                posts.push(CreatePostObjectFromData(element));
            }

            let firstPost = new Post('https://www.instagram.com/accounts/login',
                'sebsucks', 11, 10, 1999, ['2 person', 'outdoor', 'tennis'], 'this is a meme', '');
            resolve(posts);
        }
    });
    let firstPost = new Post('https://www.instagram.com/accounts/login',
        'sebsucks', 11, 10, 1999, ['2 person', 'outdoor', 'tennis'], 'this is a meme');
    return data[0];
    return firstPost;
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
    //console.log(items);
    return items;
}

function extractImgs(identifier) {
    const selector = document.querySelectorAll(`${identifier}`);
    let items = [];
    for (let element of selector) {
        console.log(element.outerHTML);
        items.push(element.alt);
    }
    //console.log(items);
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
function appendData(passedData) {
    let data = [...passedData];
    const EndOfListID = data[data.length - 2][0];
    console.log(EndOfListID);
    //data[0] = 444;

    let nodeLinkList = document.querySelectorAll(`article a`);
    let nodeAltList = document.querySelectorAll(`article img`);
    let dataToAdd = [];

    //console.log(`getting end of list item:  ${nodeLinkList.item(nodeLinkList.length - 1).href}`);
    //checking if the last  item we added to the list is the item in the browser
    if (nodeLinkList.item(nodeLinkList.length - 1).href == EndOfListID) {
        console.log(`all elements have been added up to this point`);
        return dataToAdd;
    } else {
        let nextToCheckIndex = data[data.length - 1];
        let nextToCheck = data[nextToCheckIndex][0];
        console.log(`the final element: ` + nextToCheck + `, at index: ` + nextToCheckIndex);
        for (let i = 0; i < nodeLinkList.length; i++) {
            //console.log('FOR LOOP: in nodelist of appendlinks');
            //console.log(`the element is: ${nodeLinkList.item(i).href}`);
            //console.log(`the endOfListID is: ${EndOfListID}`);
            if (nodeLinkList.item(i).href == nextToCheck) {
                console.log(`THIS IS THE CHECK`);
                let j = i;
                while (nextToCheckIndex < data.length - 1) {
                    console.log(`NodeAltList At J: ${nodeAltList[j].alt} , 
                                data at next to check index: ${data[nextToCheckIndex][1]}`);
                    if (nodeAltList[j].alt != data[nextToCheckIndex][1]) {
                        console.log(`inside if statement`);
                        data[nextToCheckIndex][2] = data[nextToCheckIndex][1];
                        data[nextToCheckIndex][1] = nodeAltList[j].alt;
                        console.log(`just past if statement`);
                    }
                    nextToCheckIndex++;
                    j++;
                }
                data.pop();
            }
            else if (nodeLinkList.item(i).href == EndOfListID) {
                console.log(`MATCH FOUND now adding new elements`);
                console.log(`THE FOUND MATCH(should be last element in array is: ${nodeLinkList.item(i).href})`)
                i++;
                while (i < nodeLinkList.length) {
                    console.log(`ADDING ELEMENT ALT: ${nodeAltList.item(i).alt}`);
                    //dataToAdd.push([nodeLinkList.item(i).href, nodeAltList.item(i).alt]);
                    data.push([nodeLinkList.item(i).href, nodeAltList.item(i).alt]);
                    i++;
                }
                data.push(nextToCheckIndex);
                return data;
                //return dataToAdd;
            }
        }
        console.log(`last item in list was not found, so nothing could be added :(`);
        //return dataToAdd;
        return data;
    }
}

async function getData(page) {

    //let items = await page.evaluate(extractSelectors);
    //getting the selectors of the first posts loaded
    let links = [];
    let imgs = [];
    links = await page.evaluate(extractLinks, 'article a');
    imgs = await page.evaluate(extractImgs, 'article img');

    /**
     * initializing the start of the data list with the first posts that were load,
     * the first element is 1 because thats the index of the first element that we 
     * should check for img alt change
     */
    let data = [];
    for (let i = 0; i < links.length; i++) {
        data[i] = [links[i], imgs[i]];
    }

    let nextToCheck = 2;
    data.push(nextToCheck);

    //console.log(data);

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
                behavior: `smooth`,
            });
        });
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);
        //checks if elementExists is not null

        //let lastPostLink = data[data.length - 1][0];
        //console.log(lastPostLink);
        //let lastPostID = lastPostLink.replace(`https://www.instagram.com`, ``);
        const pastLength = data.length;
        console.log(`data length: ${pastLength}`);
        data = [...await page.evaluate(appendData, data)];
        if (data.length == pastLength) {
            console.log(`no elements were added after this scroll`);
        } else {
            //data = data.concat(newData);
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

function GetSinglePostElement() {

    let videoElement = document.querySelectorAll(`article>div>div>div>div>div>div>video, article>div>div>div>div>div>div>div>ul video`);
    if (videoElement.length >= 1) {
        console.log('video');
        return 'video';
    }

    let imgElement = document.querySelectorAll(`article>div>div>div>div>div>img, article>div>div>div>div>img, article>div>div>div>div>div>div>div>ul img`);
    if (imgElement.length >= 1) {
        let imgAlt = ``;
        for (let element of imgElement) {
            imgAlt += element.alt;
        }
        return imgAlt;
    } else {
        return `no element was found`;
    }
}

async function racePromises(promises) {
    const wrappedPromises = [];
    promises.map((promise, index) => {
        wrappedPromises.push(
            new Promise((resolve) => {
                promise.then(() => {
                    resolve(index);
                })
            })
        )
    })
    return Promise.race(wrappedPromises);
}

async function GetProfileData(page) {

    //let items = await page.evaluate(extractSelectors);
    //getting the selectors of the first posts loaded
    let links = [];
    let imgs = [];
    imgs = await page.evaluate(extractImgs, 'article img');
    links = await page.evaluate(extractLinks, 'article a');

    /**
     * initializing the start of the data list with the first posts that were load,
     * the first element is 1 because thats the index of the first element that we 
     * should check for img alt change
     */
    let data = [];
    for (let i = 0; i < 12; i++) {
        data[i] = [links[i], imgs[i]];
    }

    console.log(data.length);
    console.log(data);

    console.log('in scroll past');
    let scrollDelay = 1000;
    counter = 0;

    console.log(`length of links is: ${links.length}`);

    let lastPostLink = links[11];
    console.log(lastPostLink);
    let lastPostID = lastPostLink.replace(`https://www.instagram.com`, ``)
    //let scrolled = await page.evaluate(scrollDown, lastPostID, page);
    await page.click(`article a[href="${lastPostID}"]`);
    //await page.waitForSelector(`article>div>div>div>div>img`, { visible: true, });

    while (data.length < 16) {

        //await page.evaluate(extractImgs, `body > div._2dDPU.CkGkG > div.zZYga`);
        await page.waitForSelector(`a._65Bje.coreSpriteRightPaginationArrow`, { visible: true });
        //await page.evaluate(extractImgs, `body > div._2dDPU.CkGkG > div.zZYga`);
        await page.click(`a._65Bje.coreSpriteRightPaginationArrow`);
        //await page.evaluate(extractImgs, `body > div._2dDPU.CkGkG > div.zZYga`);
        await page.waitForSelector(`a._65Bje.coreSpriteRightPaginationArrow`, { visible: true });
        //await page.evaluate(extractImgs, `body > div._2dDPU.CkGkG > div.zZYga`);
        //await page.waitForSelector(`article>div>div>div>div>img`, { visible: true, });
        //await page.waitForSelector(`article>div>div>div>div>img`, `article>div>div>div>div>div>div>video`, { visible: true });

        const un = await Promise.race([
            page.waitForSelector(`article>div>div>div>div>img`, { timeout: 10000, visible: true }),
            page.waitForSelector(`article>div>div>div>div>div>img`, { timeout: 10000, visible: true }),
            page.waitForSelector(`article>div>div>div>div>div>div>div>ul img`, { timeout: 10000, visible: true }),
            page.waitForSelector(`article>div>div>div>div>div>div>video`, { timeout: 10000, visible: true }),
            page.waitForSelector(`article>div>div>div>div>div>div>div>ul video`, { timeout: 10000, visible: true })
        ]);

        console.log(`got past wait for`);
        //page.evaluate(() => console.log(`got past wait race`));
        //await page.evaluate(extractImgs, `body > div._2dDPU.CkGkG > div.zZYga`);

        /**
        const imgOrVideo = await racePromises([
            page.waitForSelector(`article>div>div>div>div>img`, { visible: true }),
            page.waitForSelector(`article>div>div>div>div>div>div>video`, { visible: true })
        ]);
        
        await page.waitFor(() =>
            document.querySelectorAll(`article>div>div>div>div>img`, { visible: true }, `article>div>div>div>div>div>div>video`, { visible: true })
        );
        const imgOrVideo = await Promise.race([
            page.waitForSelector(`article>div>div>div>div>img`, { timeout: 1000, visible: true, }),
            page.waitForSelector(`article > div > div > div > div > div > video`, { timeout: 1000, visible: true })
        ]);
        */

        let newLink = await page.url();
        /**
        let newImg = await page.waitFor(() =>
            document.querySelectorAll(`article>div>div>div>div>img`,
                `article>div>div>div>div>div>img`,
                `article>div>div>div>div>div>div>video`)
        );
        */
        let newImg = await page.evaluate(GetSinglePostElement);


        if (newLink && newImg) {
            data.push([newLink, newImg]);
        } else {
            console.log(`no new element added`);
        }
        console.log(counter);
        counter++;
        console.log(data);
        //#react-root > section > main > div > div._2z6nI > article > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(1) > a > div > div.KL4Bh > img
        //body > div._2dDPU.CkGkG > div.zZYga > div > article > div._97aPb > div > div > div.KL4Bh > img
    }

    return data;
    //return posts;
}

const scrapeImages = async () => {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewport({ width: 1000, height: 926 });

    await page.goto('https://www.instagram.com/accounts/login');
    await page.waitFor(1000);
    //await page.screenshot({ path: '1.png' });

    //Login form
    await page.type('[name=username]', 'sebsuckss');
    await page.type('[name=password]', 'Sebastian10');
    //await page.screenshot({ path: '2.png' });
    await page.click('[type=submit]');

    //Social Page
    await page.waitFor(3000);

    //await page.goto(`https://www.instagram.com/babyyoda.official`);
    //await page.goto(`https://www.instagram.com/sadistic.memes`);
    //await page.goto(`https://www.instagram.com/nike`);
    await page.goto(`https://www.instagram.com/complex`);
    //await page.goto(`https://www.instagram.com/daquan`);
    //await page.waitFor(3000);
    //await page.screenshot({ path: '3.png' });

    await page.waitForSelector('article img', {
        visible: true,
    });

    //let data = await getData(page);
    let data = await GetProfileData(page);
    //await browser.close();
    //console.log(data);
    return data;
}
//let posts = [];
scrapeImages()
    .then(rawData => parseData(rawData))
    .then(parsedData => console.log(JSON.stringify(parsedData)))
    .catch((e) =>
        console.log('Error: ' + e)
    );
