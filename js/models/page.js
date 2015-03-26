App.Page = DS.Model.extend({
  title: DS.attr('string'),
  slug:  DS.attr('string'),
  body:  DS.attr('string'),
  rev :  DS.attr('string'),
  
  /* Computed Properties */
  words:   function() {
    return this.get('body').split(' ').length;
  }.property('excerpt', 'body')
});
