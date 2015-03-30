// General Setup
window.App = Ember.Application.create({});

App.ApplicationStore = DS.Store.extend({
  findAsId: function (type, field, value) {
    Ember.assert("You need to pass a type, field and value.", arguments.length === 3);

    var entity = this.all(type).findBy(field, value);
    if (Ember.isEmpty(entity)) {
      var query = {};
      query[field] = value;
      return this.find(type, query).then(function (array) {
        Ember.assert('Must find only one object. Found:' + array.get('length'), array.get('length') === 1);
        return array.get('firstObject');
      });
    } else {
      return new Ember.RSVP.Promise(function (resolve) {
        resolve(entity);
      });
    }
  }
});

App.ApplicationRoute = Ember.Route.extend({
  setupController: function (controller, model) {
    controller.set('posts', this.store.find('post'));
    controller.set('pages', this.store.find('page'));
  },
  actions: {
    error: function() {
      this.transitionTo('notfound', 'application-error');
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
  this.resource('page',  { path: '/page/:page_slug' });  
  this.route('add-page');
  this.route('register');
  this.route('search');
  this.route('cockpit');
  this.route('notfound', { path: '/*wildcard' });
});

//Transition
LiquidFire.map(function(){
  this.transition(
    this.toRoute('index','post', 'posts','add-post','page', 'pages', 'add-page', 'register',  'search', 'cockpit', 'notfound'),
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

Ember.Handlebars.helper('format-date-simple', function (date) {
  return moment(date).format('L');
});

Ember.TextSupport.reopen({ attributeBindings: ["required"] });
