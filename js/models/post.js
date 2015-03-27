App.Post = DS.Model.extend({
  title:   DS.attr('string'),
  slug:    DS.attr('string'),
  excerpt: DS.attr('string'),
  body:    DS.attr('string'),
  date:    DS.attr('date', { defaultValue: function () { return new Date(); }}),
  tags:    DS.attr('string'),
  rev:     DS.attr('string'),
  
  /* Computed Properties */
  words:   function() {
    return this.get('title').split(' ').length + this.get('excerpt').split(' ').length + this.get('body').split(' ').length;
  }.property('title', 'excerpt', 'body'),
  complex:  function () {
    return parseFloat((countDifferentPost(this.get('title'), this.get('excerpt'), this.get('body'))/ this.get('words'))).toFixed(2);
  }.property('title', 'excerpt', 'body', 'words')
});
