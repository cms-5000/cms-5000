App.Page = DS.Model.extend({
  title: DS.attr('string'),
  slug:  DS.attr('string'),
  body:  DS.attr('string'),
  rev :  DS.attr('string'),
  
  /* Computed Properties */
  words:   function() {
    return this.get('title').split(' ').length + this.get('body').split(' ').length;
  }.property('title', 'body'),
  complex:  function () {
    return parseFloat((countDifferentPost(this.get('body'),this.get('title'))/ this.get('words'))).toFixed(2);
  }.property('title', 'body', 'words')
});
