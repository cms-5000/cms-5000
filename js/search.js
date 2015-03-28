
// helper to generate the needed infoArray

// function to push dataObject into array, testing if entry is already in there and just needs to be updated
function addEntry(array, entry) {
    var arrayLength = array.length;
    var addEntry = 1;
    for (var i = 0; i < arrayLength; i++) {
        if (entry.id == array[i].id) {
            addEntry = 0;
            array[i].title = entry.title; 
            array[i].excerpt = entry.excerpt; 
            array[i].body = entry.body; 
            array[i].tags = entry.tags; 
        }
    }
    if (addEntry) array.push(entry);
    return array;
}


// ANALYSIS

function countWordsInAllPosts(infoArray) {
    var arrayLength = infoArray.length;
    var wordCounter = 0;
    for (var i = 0; i < arrayLength; i++) {
        // count in title
        var titleString = infoArray[i].title;
        if (!(titleString === undefined)) {
            var titleArray = titleString.split(' ');
            var titleLength = titleArray.length;
            wordCounter += titleLength;
        }
        // count in excerpt
        var excerptString = infoArray[i].excerpt;
        if (!(excerptString === undefined)) {
            var excerptArray = excerptString.split(' ');
            var excerptLength = excerptArray.length;
            wordCounter += excerptLength;
        }
        // count in body
        var bodyString = infoArray[i].body;
        if (!(bodyString === undefined)) {
            var bodyArray = bodyString.split(' ');
            var bodyLength = bodyArray.length;
            wordCounter += bodyLength;
        }
    }
    return wordCounter;
}


function countDifferentWordsInPosts(infoArray) {
    var arrayLength = infoArray.length;
    var wordMap = new Map();
    var differentWordsCounter = 0;

    for (var i = 0; i < arrayLength; i++) {
        // count in title
        var titleString = infoArray[i].title;
        if (!(titleString === undefined)) {
            //replace all punctuation marks to get a correct result
            tempTitle = replacePunctuationMarks(titleString);
            //split the text to get an array
            var titleArray = tempTitle.split(' ');
            var titleLength = titleArray.length;
            // for each word within this field of a post
            for (var j = 0; j < titleLength; j++) {
                var tempWord = titleArray[j];
                //test if entry is already in map 
                if (wordMap.get(tempWord) === undefined) {
                    wordMap.set(tempWord,1);
                    differentWordsCounter++;
                } else {
                    wordMap.set(tempWord,(wordMap.get(tempWord)+1));
                }
            }
        }
        // count in excerpt
        var excerptString = infoArray[i].excerpt;
        if (!(excerptString === undefined)) {
            // replace
            tempExcerpt = replacePunctuationMarks(excerptString);
            //split
            var excerptArray = tempExcerpt.split(' ');
            var excerptLength = excerptArray.length;
            // for each word within this field of a post
            for (var j = 0; j < excerptLength; j++) {
                var tempWord = excerptArray[j];
                //test if entry is already in map 
                if (wordMap.get(tempWord) === undefined) {
                    wordMap.set(tempWord,1);
                    differentWordsCounter++;
                } else {
                    wordMap.set(tempWord,(wordMap.get(tempWord)+1));
                }    
            }
        }
        // count in body
        var bodyString = infoArray[i].body;
        if (!(bodyString === undefined)) {
             // replace
            tempBody = replacePunctuationMarks(bodyString);
            //split
            var bodyArray = tempBody.split(' ');
            var bodyLength = bodyArray.length;
            // for each word within this field of a post
            for (var j = 0; j < bodyLength; j++) {
                var tempWord = bodyArray[j];
                //test if entry is already in map 
                if (wordMap.get(tempWord) === undefined) {
                    wordMap.set(tempWord,1);
                    differentWordsCounter++;
                } else {
                    wordMap.set(tempWord,(wordMap.get(tempWord)+1));
                }    
            }
        }
    }
    window.wMap = wordMap;
    return differentWordsCounter;
}

function countDifferentPost(title, excerpt, body) {
    var wordMap = new Map();
    var differentWordsCounter = 0;

    // count in title
    var titleString = title;
    if (!(titleString === undefined)) {
        //replace all punctuation marks to get a correct result
        tempTitle = replacePunctuationMarks(titleString);
        //split the text to get an array
        var titleArray = tempTitle.split(' ');
        var titleLength = titleArray.length;
        // for each word within this field of a post
        for (var j = 0; j < titleLength; j++) {
            var tempWord = titleArray[j];
            //test if entry is already in map 
            if (wordMap.get(tempWord) === undefined) {
                wordMap.set(tempWord,1);
                differentWordsCounter++;
            } else {
                wordMap.set(tempWord,(wordMap.get(tempWord)+1));
            }
        }
    }
    // count in excerpt
    var excerptString = excerpt;
    if (!(excerptString === undefined)) {
        // replace
        tempExcerpt = replacePunctuationMarks(excerptString);
        //split
        var excerptArray = tempExcerpt.split(' ');
        var excerptLength = excerptArray.length;
        // for each word within this field of a post
        for (var j = 0; j < excerptLength; j++) {
            var tempWord = excerptArray[j];
            //test if entry is already in map 
            if (wordMap.get(tempWord) === undefined) {
                wordMap.set(tempWord,1);
                differentWordsCounter++;
            } else {
                wordMap.set(tempWord,(wordMap.get(tempWord)+1));
            }    
        }
    }
    // count in body
    var bodyString = body;
    if (!(bodyString === undefined)) {
         // replace
        tempBody = replacePunctuationMarks(bodyString);
        //split
        var bodyArray = tempBody.split(' ');
        var bodyLength = bodyArray.length;
        // for each word within this field of a post
        for (var j = 0; j < bodyLength; j++) {
            var tempWord = bodyArray[j];
            //test if entry is already in map 
            if (wordMap.get(tempWord) === undefined) {
                wordMap.set(tempWord,1);
                differentWordsCounter++;
            } else {
                wordMap.set(tempWord,(wordMap.get(tempWord)+1));
            }    
        }
    }
    window.wMap = wordMap;
    return differentWordsCounter;
}

function countInFields(title, body) {
    var wordMap = new Map();
    var differentWordsCounter = 0;

    // count in title
    var titleString = title;
    if (!(titleString === undefined)) {
        //replace all punctuation marks to get a correct result
        tempTitle = replacePunctuationMarks(titleString);
        //split the text to get an array
        var titleArray = tempTitle.split(' ');
        var titleLength = titleArray.length;
        // for each word within this field of a post
        for (var j = 0; j < titleLength; j++) {
            var tempWord = titleArray[j];
            //test if entry is already in map 
            if (wordMap.get(tempWord) === undefined) {
                wordMap.set(tempWord,1);
                differentWordsCounter++;
            } else {
                wordMap.set(tempWord,(wordMap.get(tempWord)+1));
            }
        }
    }
    // count in body
    var bodyString = body;
    if (!(bodyString === undefined)) {
         // replace
        tempBody = replacePunctuationMarks(bodyString);
        //split
        var bodyArray = tempBody.split(' ');
        var bodyLength = bodyArray.length;
        // for each word within this field of a post
        for (var j = 0; j < bodyLength; j++) {
            var tempWord = bodyArray[j];
            //test if entry is already in map 
            if (wordMap.get(tempWord) === undefined) {
                wordMap.set(tempWord,1);
                differentWordsCounter++;
            } else {
                wordMap.set(tempWord,(wordMap.get(tempWord)+1));
            }    
        }
    }
    window.wMap = wordMap;
    return differentWordsCounter;
}

function replacePunctuationMarks(string) {
    var result = string;
    var chars = ["!","\"","\'",".",",",":",";","?",")","(","/","\\","§","$","%","&","´","`","^"];
    if ((result != undefined) && (result.length > 0) && (result != null)) {
        for (var i = 0; i < chars.length; i++) {
            if (result.indexOf(chars[i]) > -1) result = result.split(chars[i]).join("");
        }
    } else {
        result = "";
    }
    return result;
}