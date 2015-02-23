// General Setup
window.App = Ember.Application.create({});

App.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'cms-5000'
});

Ember.TextSupport.reopen({  
    attributeBindings: ["required"]
}) 

App.Router.map(function() {
  this.resource('posts', { path: '/' });
  this.resource('post',  { path: '/post/:post_slug' });
  this.route('add-post');
  this.resource('page', { path: '/:page_id' });
  this.route('add-page');
  this.route('about');
  //  this.resource('search', { path: '/search' });
});

/*
 * HELPERS
 */
var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function(input) {
  if (input == undefined) {
    return "";
  } else {
    return new Handlebars.SafeString(showdown.makeHtml(input));
  }
});

Ember.Handlebars.helper('format-date', function (date) {
  return moment(date).fromNow();
});