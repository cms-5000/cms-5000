// General Setup
window.App = Ember.Application.create({});

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

//Transition
LiquidFire.map(function(){
  this.transition(
    this.fromRoute('index','post', 'posts','add-post','page', 'pages', 'add-page', 'register',  'search', 'cockpit'),
    this.toRoute('index','post', 'posts','add-post','page', 'pages', 'add-page', 'register',  'search', 'cockpit'),
    this.use('crossFade')
  );
});

/*
 * HELPERS
 */
var showdown = new Showdown.converter( { extensions: ['github'] } );
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
