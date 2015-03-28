
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
    window.wSingleMap = wordMap;
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
    window.wPageMap = wordMap;
    return differentWordsCounter;
}

function replacePunctuationMarks(string) {
    var result = string;
    var chars = ["!","\"","\'",".",",",":",";","?",")","(","/","\\","§","$","%","&","´","`","^"];
    if ((result != undefined) && (result.length > 0) && (result != null)) {
        result = result.replace(/(\r\n|\n|\r)/gm,"");
        for (var i = 0; i < chars.length; i++) {
            if (result.indexOf(chars[i]) > -1) result = result.split(chars[i]).join("");
        }
    } else {
        result = "";
    }
    return result;
}

function generateTagDataArray(infoArray) {
    var arrayLength = infoArray.length;
    var tagMap = new Map();
    var differentTagsCounter = 0;
    var result = new Array(0);

    for (var i = 0; i < arrayLength; i++) {
        // count in title
        var tagString = infoArray[i].tags;
        if (!(tagString === undefined)) {
            if ((tagString != null) && (tagString.length > 0)) {
                //split the text to get an array
                var tagArray = tagString.split(',');
                var tagLength = tagArray.length;
                // for each word within this field of a post
                for (var j = 0; j < tagLength; j++) {
                    var tempTag = tagArray[j].trim();
                    //test if entry is already in map 
                    if (tagMap.get(tempTag) === undefined) {
                        tagMap.set(tempTag,1);
                        differentTagsCounter++;
                    } else {
                        tagMap.set(tempTag,(tagMap.get(tempTag)+1));
                    }
                }
            }
        }
    }
    window.tagMap = tagMap;
    var mapKeys = tagMap.keys();
    var amount = tagMap.size;
    var breakFlag = 1;
    var dataArray = new Array(0);

    do {
        try {
            var entryArray = new Array(0);
            var tempKeyI = mapKeys.next();
            var tempKey = tempKeyI.value;
            if (tempKey != undefined) {
                var tempAmount = tagMap.get(tempKey);
                var tempPercentage = (tempAmount/amount * 100);
                entryArray.push(tempKey);
                entryArray.push(tempPercentage);
                dataArray.push(entryArray);
            } else {
                breakFlag = 0;
            }
        } catch (ex) {
            breakFlag = 0;
        }
    } while (breakFlag);
    window.TagData = dataArray;
    return dataArray;
}

function generateVsChart(infoArray) {
    var arrayLength = infoArray.length;
    var result = new Array(0);

    for (var i = 0; i < arrayLength; i++) {
        var dataSet = new Array(0);
        var tempWords = infoArray[i].words;
        var tempComplex = infoArray[i].complex;
        dataSet.push(tempWords);
        dataSet.push(parseFloat(tempComplex));
        result.push(dataSet);
    }
    window.testResult = result;
    return result;
}