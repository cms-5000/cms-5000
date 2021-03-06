/*
(Ausnahme-)Fälle:
1- kein Text im Pflichtfeld angegeben
2- zu langer Text (z.B. bei Post-/Page-Titeln)
3- bereits vergeben (z.B. bei Page-Slugs)
4- verbotene Slugs (unsere Routen: posts, add-post, add-page etc.)
5- valide Slugs (keine Leerzeichen, keine Sonderzeichen, nur Kleinschreibung)
    -> wieso nur Kleinschreibung??? Was bringt die Einschränkung? (Ben)
    Antwort: Stimmt, wandeln wir dann einfach beim Speichern um. (Sebastian)
*/

// 1 test if string is empty or undefined
function isEmpty(string) {
    if (string === undefined) return 1;
    if (string.length == 0) return 1;
    return 0;
}

// 2 test if string is to long
function isTooLong(string, maxlength) {
    if (string.length > maxlength) return 1;
    return 0;
}

// 3 test if string is to long
function isSlugUsed(slugstring, id) {
    // use global var to save id
    window.curTempId = new Array(0);
    App.Post.store.filter('post', function(post) {
      var slug = post.get('slug');
      if (slugstring == slug) {
        tempId = post.get('id');
        window.curTempId.push(tempId)
        return 1;
      }
      return 0;
    });

    if (curTempId.length > 0) { 
        for (var i = 0; i < curTempId.length; i++) {
            if (!(curTempId[i] == id)) {return 1};    
        }
    }
    window.curTempId = new Array(0);
    App.Page.store.filter('page', function(page) {
      var slug = page.get('slug');
      if (slugstring == slug) {
        var tempId = page.get('id');
        window.curTempId.push(tempId);
        return 1;
      }
      return 0;
    });
    if (curTempId.length > 0) { 
        for (var i = 0; i < curTempId.length; i++) {
            if (!(curTempId[i] == id)) {return 1};    
        }
    }
    else {return 0};
}

// 4 test if string for slug is not allowed
function isSlugForbidden(slugstring) {
    //%%TODO%% extend the list for forbidden slugs (especially if you can generate new ones by adding pages!)
    var forbiddenSlugs = ['posts','post','add-post','pages','page','add-page','search', 'cokpit']
    var forbiddenLength = forbiddenSlugs.length;
    for (var i = 0; i < forbiddenLength; i++) {
        if (forbiddenSlugs[i] == slugstring) return 1;
    }
    return 0;
}

// 5 test if string for slug is invalid
function isSlugInvalid(slugstring) {
    //(only a-z, A-Z, 0-9 and "_" are allowed as characters!)
    var forbiddenCharRegex = /^\w+$/;
    if (!forbiddenCharRegex.test(slugstring)) {return 1;}
    else {return 0;}
}

// wrapper method to test string fields
function validateString (string) {
    if (isEmpty(string)) return 1;
    if (isTooLong(string, 4048000)) return 2;
    return 0;
}

// wrapper method to test string fields
function validateTitle (string) {
    if (isEmpty(string)) return 1;
    if (isTooLong(string, 100)) return 2;
    return 0;
}

// wrapper method to test string fields
function validatePassword (string) {
    if (isEmpty(string)) return 1;
    if (isTooLong(string, 30)) return 2;
    return 0;
}

// wrapper method to test string fields
function validateSlug (slugstring, id) {
    if (isEmpty(slugstring)) return 1;
    if (isSlugUsed(slugstring, id)) return 2;
    if (isSlugInvalid(slugstring)) return 3;
    if (isSlugForbidden(slugstring)) return 4;
    return 0;
}