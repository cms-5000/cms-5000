/*
Wir brauchen ein paar einfache Validatoren für Texteingaben.
Vielleicht bekommen wir das hier eingebunden?
https://github.com/dockyard/ember-validations

... oder vielleicht nehmen wir Regular Expressions? 
    -> macht bei den angegebenen Anwendungsfällen keinen Sinn! (Ben)
    -> außer beim letzten (5. siehe Umsetzung)

(Ausnahme-)Fälle:
1- kein Text im Pflichtfeld angegeben
2- zu langer Text (z.B. bei Post-/Page-Titeln)
3- bereits vergeben (z.B. bei Page-Slugs)
4- verbotene Slugs (unsere Routen: posts, add-post, add-page etc.)

5- valide Slugs (keine Leerzeichen, keine Sonderzeichen, nur Kleinschreibung)
    -> wieso nur Kleinschreibung??? Was bringt die Einschränkung? (Ben)    
*/


// 1 test if string is empty or undefined
function isEmpty(string) {
    //can the string be undefined? if not delete following line
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
function isSlugUsed(slugstring) {
    // use global var to save id
    window.curTempId = '';
    App.Post.store.filter('post', function(post) {
      var slug = post.get('slug');
      if (slugstring == slug) {
        window.curTempId = post.get('id');
        return 1;
      }
      return 0;
    });
    if (curTempId != '') {return 1} 
    else {return 0};
}

// 4 test if string for slug is not allowed
function isSlugForbidden(slugstring) {
    //%%TODO%% extend the list for forbidden slugs (especially if you can generate new ones by adding pages!)
    var invalidChars = ['posts','post','add-post','pages','page','add-page','search']
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
function checkStringStuff(string) {
    if (isEmpty(string)) return 1;
    if (isTooLong(string, 1024)) return 2;
    return 0;
}

// wrapper method to test string fields
function checkTitleStuff(string) {
    if (isEmpty(string)) return 1;
    if (isTooLong(string, 30)) return 2;
    return 0;
}

// wrapper method to test string fields
function checkSlugStuff(slugstring) {
    if (isEmpty(slugstring)) return 1;
    if (isSlugUsed(slugstring)) return 2;
    if (isSlugInvalid(slugstring)) return 3;
    if (isSlugForbidden(slugstring)) return 4;
    return 0;
}