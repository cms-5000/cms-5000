App.PostEditorComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (post) { this.sendAction('toggleEdit', post); },
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
    editPage:   function (page) { this.sendAction('editPage',   page); },
    removePage: function (page) { this.sendAction('removePage', page); }
  }
});

App.PageViewerComponent = Ember.Component.extend({
  actions: {
    toggleEdit: function (page) { this.sendAction('toggleEdit', page); },
  }
});
