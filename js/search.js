/**
 * 
 */
/*
// %%TODO%% REMOVE DUMMY DATA AFTER TESTING
var posts = [{
    id: '1',
    title: "Rails is Omakase",
    author: {
        name: "d2h"
    },
    date: new Date('12-27-2012'),
    excerpt: "There are lots of à la carte software environments in this world. Places where in order to eat, you must first carefully look over the menu of options to order exactly what you want.",
    body: "I want this for my ORM, I want that for my template language, and let's finish it off with this routing library. Of course, you're going to have to know what you want, and you'll rarely have your horizon expanded if you always order the same thing, but there it is. It's a very popular way of consuming software.\n\nRails is not that. Rails is omakase."
}, {
    id: '2',
    title: "The Parley Letter",
    author: {
        name: "d2h"
    },
    date: new Date('12-24-2012'),
    excerpt: "My [appearance on the Ruby Rogues podcast](http://rubyrogues.com/056-rr-david-heinemeier-hansson/) recently came up for discussion again on the private Parley mailing list.",
    body: "This A long list of topics were raised and I took a time to ramble at large about all of them at once. Apologies for not taking the time to be more succinct, but at least each topic has a header so you can skip stuff you don't care about.\n\n### Maintainability\n\nIt's simply not true to say that I don't care about maintainability. I still work on the oldest Rails app in the world."
}, {
    id: '7',
    title: "Test",
    author: {
        name: "d2h"
    },
    date: new Date('12-21-2012'),
    excerpt: "blab balsb on this the my bob",
    body: "blab balsb on this the my bob"
}];
*/
function checkPhrase(phrase) {
    // check type of variable
    if ((typeof phrase) != "string") {
        return "type";
    }
    // check length of string
    var newPhrase = phrase.trim();
    if (newPhrase.length < 3) {
        return "length";
    }
    return "ok";
}

function generateHitsInPosts(phrase, posts) {
    var checkResult = checkPhrase(phrase);

    if (checkResult != "ok") {
        alert("!!!!!! ERROR !!!!!!!!!!\n\t-->" + checkResult);
        return;
    }
    var newPhrase = phrase.toLocaleLowerCase();
    
    var length = posts.length;
    var hitPosts = new Array(0);
    
    for (var i = 0; i < length; i++) {
        // reset field array
        var hitFields = new Array(0);
        
        //%%TODO%% count the hits in each fiels instead of checking only the appearance
        // check if you can get some hits
        var boolTitle   = posts[i].title.toLocaleLowerCase().indexOf(newPhrase);
        var boolExcerpt = posts[i].excerpt.toLocaleLowerCase().indexOf(newPhrase);
        var boolbody = posts[i].body.toLocaleLowerCase().indexOf(newPhrase);
        
        // check if you got some
        if (boolTitle != -1 || boolExcerpt != -1 || boolbody != -1) {
            hitFields.push(posts[i].id);
            // check in what fields you got hits 
            if (boolTitle   != -1) hitFields.push("title");
            if (boolExcerpt != -1) hitFields.push("excerpt");
            if (boolbody != -1) hitFields.push("body");
            hitPosts.push(hitFields);
        }
    }
    // %%TODO%% REMOVE AFTER TESTING!
    //alert(hitPosts[0] + "\n\t" + hitPosts[0][0] + "\n\t" + hitPosts[0][1] + "\n\t" + hitPosts[0][2] + "\n\t" + hitPosts[0][3] +
    //    "\n\n\n\n\n" + hitPosts[1] + "\n\t" + hitPosts[1][0] + "\n\t" + hitPosts[1][1] + "\n\t" + hitPosts[1][2] + "\n\t" + hitPosts[1][3]);
    
    return (hitPosts);  
}

function generateScoredHits(hitposts) {
    var hitLength = hitposts.length;
    var hitPosts = hitposts;
    var scoredPosts = new Array(0);

    // iterate over hit array -> posts
    for (var i = 0; i < hitLength; i++) {
        var arLength = hitPosts[i].length;
        var tempScore = 0;
        // iterate over hit array for specific post -> fields
        for (var j = 1; j < arLength; j++) {
            var fieldName = hitPosts[i][j];
            if (fieldName == "title")   tempScore = tempScore + 3;
            if (fieldName == "excerpt") tempScore = tempScore + 1;
            if (fieldName == "body") tempScore = tempScore + 1;
        }
        var tempId = hitPosts[i][0];        
        scoredPosts.push([tempId,tempScore,"  XXXX  "]);
    }
    return scoredPosts;
}

function generateSortedPosts(scoredhits) {
    var scoredHits = scoredhits;
    var hitLength  = scoredHits.length;
    var sortedPosts = new Array(0);

    // sort the scored hits (desc)
    var sortedHits = scoredHits.sort(function(a,b) {
        return a[1] < b[1];
    });

    for (var i = 0; i < hitLength; i++) {
        var tempId = sortedHits[i][0];
        sortedPosts.push(getPostById(tempId,App.Post.FIXTURES));
    }
    return sortedPosts;

}

function getPostById(id, posts) {
    var postLength = posts.length;
    for (var i = 0; i < postLength; i++) {
        if (posts[i].id == id) return posts[i];
    }
}

    
/*
//%%TODO%% REMOVE AFTER TESTING
var scoredHits = generateScoredHits(generateHitsInPosts("the", posts));//WITH SECOND COLUMN
var sortedPosts = generateSortedPosts(scoredHits);
alert ("sorted post 0 \n\t" + 
        "id = \t" + sortedPosts[0].id + "\n\t" + 
        "title = \t" + sortedPosts[0].title + "\n\t" +
        "excerpt = \t" + sortedPosts[0].excerpt + "\n\t" +
        "body = \t" + sortedPosts[0].body + "\n\n\n" +
        "sorted post 1 \n\t" + 
        "id = \t" + sortedPosts[1].id + "\n\t" + 
        "title = \t" + sortedPosts[1].title + "\n\t" +
        "excerpt = \t" + sortedPosts[1].excerpt + "\n\t" +
        "body = \t" + sortedPosts[1].body + "\n\n\n" + 
        "sorted post 2 \n\t" + 
        "id = \t" + sortedPosts[2].id + "\n\t" + 
        "title = \t" + sortedPosts[2].title + "\n\t" +
        "excerpt = \t" + sortedPosts[2].excerpt + "\n\t" +
        "body = \t" + sortedPosts[2].body + "\n\n\n");


var result = generateSortedPosts(generateScoredHits(generateHitsInPosts("the", App.Post.FIXTURES)));
*/