App.Tag = DS.Model.extend({
  title: DS.attr('string'),
  posts: DS.hasMany('post'),
  rev:   DS.attr('string')
});