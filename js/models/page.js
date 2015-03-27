App.Page = DS.Model.extend({
  title: DS.attr('string'),
  slug:  DS.attr('string'),
  body:  DS.attr('string'),
  rev :  DS.attr('string'),
  
  /* Computed Properties */
  words:   function() {
    return this.get('title').split(' ').length + this.get('body').split(' ').length;
  }.property('title', 'body')
});
