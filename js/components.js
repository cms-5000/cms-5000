App.PostEditorComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (post) { this.sendAction('toggleEdit', post); },
    addPost:    function (post) { this.sendAction('addPost',    post); },
    cancelPost: function (post) { this.sendAction('cancelPost', post); },
    editPost:   function (post) { this.sendAction('editPost',   post); },
    removePost: function (post) { this.sendAction('removePost', post); }
  }
});

App.PostViewerComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (post) { this.sendAction('toggleEdit', post); },
  }
});

App.PageEditorComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (page) { this.sendAction('toggleEdit', page); },
    addPage:    function (page) { this.sendAction('addPage',    page); },
    cancelPage: function (page) { this.sendAction('cancelPage', page); },
    editPage:   function (page) { this.sendAction('editPage',   page); },
    removePage: function (page) { this.sendAction('removePage', page); }
  }
});

App.PageViewerComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (page) { this.sendAction('toggleEdit', page); }
  }
});

// TODO Implement component for search (instead of implementing it in every route).
// See: http://emberjs.com/guides/components/sending-actions-from-components-to-your-application/
//App.SearchComponent = Ember.Component.extend({
//  actions: {
//    startSearch: function (??) { this.sendAction('startSearch', ??); }
//  }
//});