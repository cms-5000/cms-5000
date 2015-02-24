App.Page = DS.Model.extend({
  title: DS.attr('string'),
  slug:  DS.attr('string'),
  body:  DS.attr('string'),
  rev :  DS.attr('string')
});

App.PagesRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('page');
  }
});

App.PageController = Ember.ObjectController.extend({
  model: function (params) {
    return this.store.find('page', params.page_id);
  },
  actions: {
    toggleEdit: function () {
      if (this.get('isEditing')) {
        this.set('isEditing', false);
      } else {
        this.set('isEditing', true);
      }
    },
    editPage: function () {
      this.set('isEditing', false);
      
      if(this.get('model').changedAttributes().hasOwnProperty('slug')) {
        var slugHasChanged = true;
      }
      this.get('model').save();
      
      if (slugHasChanged) {
        this.transitionTo('pages'); // TODO Should rather forward to the new address ('page/new-slug').
      }
    },
    removePage: function () {
      var page = this.get('model');
      var confirmed = confirm("Are you sure you want to remove the page \"" + this.get('title') + "\"?");
      if (confirmed) {
        page.deleteRecord();
        page.save();
        this.transitionTo('pages');
        this.set('isEditing', false);
        // TODO Show success message.
      }
    }
  },
  isEditing: false
});

App.AddPageRoute = Ember.Route.extend({
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    returnToPosts: function () { this.transitionTo('posts'); }
  }
});

App.AddPageController = Ember.ArrayController.extend({
  actions: {
    addPage: function () {
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
      
      this.transitionTo('/page/' + page.get('id'));
      // TODO: Show alert message about newly created page.
    }
  }
});

App.PageEditorComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (page) { this.sendAction('toggleEdit', page); },
    addPage:    function (page) { this.sendAction('addPage',    page); },
    editPage:   function (page) { this.sendAction('editPage',   page); },
    removePage: function (page) { this.sendAction('removePage', page); }
  }
});

App.PageViewerComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (page) { this.sendAction('toggleEdit', page); },
  }
});
