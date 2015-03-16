
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
        // count in tags
        var tagsString = infoArray[i].tags;
        if (!(tagsString === undefined)) {
            var tagsArray = tagsString.split(' ');
            var tagsLength = tagsArray.length;
            wordCounter += tagsLength;
        }
    }
    return wordCounter;
}


