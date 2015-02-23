/*
Wir brauchen ein paar einfache Validatoren für Texteingaben.
Vielleicht bekommen wir das hier eingebunden?
https://github.com/dockyard/ember-validations

... oder vielleicht nehmen wir Regular Expressions?

(Ausnahme-)Fälle:
- kein Text im Pflichtfeld angegeben
- zu langer Text (z.B. bei Post-/Page-Titeln)
- bereits vergeben (z.B. bei Page-Slugs)
- verbotene Slugs (unsere Routen: posts, add-post, add-page etc.)
- valide Slugs (keine Leerzeichen, keine Sonderzeichen, nur Kleinschreibung)

*/