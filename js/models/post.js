App.Post = DS.Model.extend({
  title:   DS.attr('string'),
  slug:    DS.attr('string'),
  excerpt: DS.attr('string'),
  body:    DS.attr('string'),
  date:    DS.attr('date', { defaultValue: function () { return new Date(); }}),
  tags:    DS.hasMany('tag'),
  tagsString: function() { 
    console.log(this.get('tags').toArray().join());
    return this.get('tags').toArray().join();
  }.property('tags.[]'),
  rev:     DS.attr('string')
});
