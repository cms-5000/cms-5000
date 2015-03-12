// General Setup
window.App = Ember.Application.create({});

App.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'cms-5000'
});

App.ApplicationRoute = Ember.Route.extend({
  setupController: function (controller, model) {
    controller.set('pages', this.store.find('page'));
    controller.set('posts', this.store.find('post'));
  },
  actions: {
    doLogin: function () {
      this.controllerFor('register').send('doLogin');
    }
  }
});

App.ApplicationController = Ember.Controller.extend({   
  needs: ['register']
});

App.Router.map(function() {
  this.resource('posts', { path: '/' });
  this.resource('post',  { path: '/post/:post_id' });
  this.route('add-post');
  this.resource('pages', { path: '/pages' });
  this.resource('page',  { path: '/page/:page_id' });
  this.route('add-page');
  this.route('register');
  this.route('search');
  this.route('cockpit');
  // TODO: Handle non-existant routes: http://emberjs.com/guides/routing/defining-your-routes/#toc_wildcard-globbing-routes
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

Ember.TextSupport.reopen({ attributeBindings: ["required"] });