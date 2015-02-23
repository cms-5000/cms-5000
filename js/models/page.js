App.Page = DS.Model.extend({
  title: DS.attr('string'),
  slug:  DS.attr('string'),
  body:  DS.attr('string'),
  rev :  DS.attr('string')
});

App.AddPageRoute = Ember.Route.extend({
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    returnToPosts: function() { this.transitionTo('posts'); }
  }
});

App.AddPageController = Ember.ArrayController.extend({
  actions: {
    addPage: function() {
      var title   = this.get('newPageTitle');
      var slug    = this.get('newPageSlug');
      var body    = this.get('newPageBody');
      
      // TODO Validate entries with validators.js
      
      var page = this.store.createRecord('page', {
        title:   title,
        slug:    slug,
        body:    body
      });
      
      this.set('newPageTitle', '');
      this.set('newPageSlug', '');
      this.set('newPageBody', '');
      
      page.save();
      
      this.transitionTo('posts');
      // TODO: Show alert message about newly created page.
    }
  }
});

//App.PageRoute = Ember.Route.extend({
//  model: function (params) {
//    return pages.findBy('id', params.page_id);
//  }
//});
//
//App.PageController = Ember.ObjectController.extend({
//  isEditing: false,
//
//  actions: {
//    edit: function () {
//      this.set('isEditing', true);
//    },
//
//    doneEditing: function () {
//      this.set('isEditing', false);
//    }
//  }
//});