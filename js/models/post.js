App.Post = DS.Model.extend({
  title:   DS.attr('string'),
  slug:    DS.attr('string'),
//  slug: function() { return this.get('name').replace(/\s+/g, '-').toLowerCase(); }.property('name'),
  excerpt: DS.attr('string'),
  body:    DS.attr('string'),
  date:    DS.attr('date', { defaultValue: function () { return new Date(); }}),
  tags:    DS.attr('string'),
  rev:     DS.attr('string')
});
