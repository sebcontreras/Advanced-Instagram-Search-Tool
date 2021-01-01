module.exports = { CreatePostObjectFromData };

class Post {
    constructor(type, link, user, month, day, year, objects, text, tagged, original) {
        this.type = type;
        this.date = {
            month,
            day,
            year
        };
        this.imgAlt = {
            objects,
            text,
            original
        };
        this.link = link;
        this.user = user;
        this.tagged = tagged;
    }
}

function CreatePostObjectFromData(element) {
    const elementText = element[1];
    if (elementText == 'video')
        return new Post('video', element[0], '', '', '', '', '', '', '', elementText);
    else if (elementText == '')
        return new Post('empty', element[0], '', '', '', '', '', '', '', elementText);
    else if (elementText.startsWith('Photo by') || elementText.startsWith('Photo by', 1)
        || elementText.startsWith('Photo shared') || elementText.startsWith('Photo shared', 1))
        return parseAutomatedPost(element[0], elementText);
    else
        return new Post('userPhoto', element[0], '', '', '', '', '', '', elementText);
}

function parseAutomatedPost(link, elementText) {
    let index = elementText.indexOf('by') + 3;
    let parsedString = elementText.slice(index);

    //getting month
    let month = getMonth(parsedString);
    let day = '';
    let year = '';
    let user = '';
    let tags;
    let objects;
    let text;


    //check if a date was found, if not, format is different and user should be next
    if (month !== '') {
        //set user, then  slice user and month
        index = parsedString.indexOf(` on ${month} `);
        user = parsedString.slice(0, index);
        parsedString = parsedString.slice(user.length + 5 + month.length);

        //set day, then slice day
        index = parsedString.indexOf(`, `);
        day = parsedString.slice(0, index);
        parsedString = parsedString.slice(index + 2)

        //set year, then slice year
        year = parsedString.slice(0, 4);
        parsedString = parsedString.slice(5);
    }

    //if there is no 'image may contain or taggin', return info
    if (parsedString.length <= 2)
        return new Post('automatedPhoto', link, user, month, day, year, '', '', '', elementText);

    //check for tags
    tags = getPostTags(parsedString);

    //check for objects
    objects = getPostObjects(parsedString);

    text = getPostText(parsedString);

    return new Post('automatedPhoto', link, user, month, day, year, objects, text, tags, elementText);
}

function getPostText(parsedString) {
    //console.log(parsedString);
    let text = '';
    let index = parsedString.indexOf(`text that says '`);

    if (index !== -1) {
        parsedString = parsedString.slice(index + 16, -2);
        text = parsedString;
        //console.log(parsedString);
    }
    return text;
}

function getPostObjects(parsedString) {
    parsedString = parsedString.toLowerCase();
    let objects = [];

    //if may contain only has text and no objects, return empty list
    if (parsedString.indexOf(`image may contain: text`) !== -1)
        return objects;

    let index = parsedString.indexOf(`image may contain:`);

    //checking if their exists an image may contain list, if so, splice
    //'image may contain
    if (index !== -1) {
        parsedString = parsedString.slice(index);
        index = parsedString.indexOf(`: `);
        parsedString = parsedString.slice(index + 2);
        //find the end of the list by looking for a period or 'text that says, if end of list exists
        //slice up to period
        index = parsedString.indexOf(', text');
        if (index !== -1) {
            parsedString = parsedString.slice(0, index);
        } else if (parsedString.indexOf('text') !== -1) {
            parsedString = parsedString.slice(0, index);
        } else if (parsedString.indexOf('.') !== -1) {
            index = parsedString.indexOf('.');
            parsedString = parsedString.slice(0, index);
        }
        //replace all ', ' and ' and ' with ',' in order to assist the split function
        //in creating an array
        parsedString = parsedString.replace(/(\sand\s)|(,\s)/g, ',');
        const listIdentifiers = /,/g;
        objects = parsedString.split(listIdentifiers);
    }

    return objects;
}

function getPostTags(parsedString) {
    let tags = [];
    if (parsedString.indexOf('tagging @') !== -1 || parsedString.indexOf('@') !== -1) {
        if (parsedString.indexOf('. Image may contain:') !== -1)
            parsedString = parsedString.slice(0, parsedString.indexOf('. Image may contain:'));
        else
            parsedString = parsedString.slice(0);
        while (parsedString.length > 0) {
            //checking to see if more tags exist, if not -> exit loop
            index = parsedString.indexOf(`@`);
            if (index == -1) {
                //console.log(`no @ found`);
                break;
            }
            //slice just past @
            parsedString = parsedString.slice(index + 1);
            //console.log(temp);

            //comma indicates end of tag if more tags still appear
            //if comma doesn't exist, push remainder of temp and break;
            index = parsedString.indexOf(`,`);
            if (index == -1) {
                //console.log(`no comma found`);
                tags.push(parsedString.slice(0));
                break;
            }
            //if comma exists, push up to comme, slice after comma.
            else if (index !== -1) {
                //console.log(`comma found`);
                tags.push(parsedString.slice(0, index));
                parsedString = parsedString.slice(index + 1)
                //console.log(`after found comma slicing, string is: ${temp}`);
            }
        }
    }
    return tags;
}

function getMonth(parsedString) {
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];
    let month = '';
    for (let current of months) {
        if (parsedString.indexOf(` on ${current} `) !== -1) {
            month = current;
            break;
        }
    }
    return month;
}