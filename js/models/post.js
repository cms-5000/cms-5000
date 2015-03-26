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
    return this.get('excerpt').split(' ').length + this.get('body').split(' ').length;
  }.property('excerpt', 'body')
});
