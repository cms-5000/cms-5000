App.Post = DS.Model.extend({
  title:   DS.attr('string'),
  slug:    DS.attr('string'),
  excerpt: DS.attr('string'),
  body:    DS.attr('string'),
  date:    DS.attr('date', { defaultValue: function () { return new Date(); }}),
  tags:    DS.attr('string'),
  rev :    DS.attr('string')
});

App.PostsRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('post');
  },
  shortcuts: {
    '⌘+⇧+a, ctrl+shift+a': 'goToAddPost'
  },
  actions: {
    goToAddPost: function () { this.transitionTo('add-post'); }
  }
});

App.PostsIndexRoute = Ember.Route.extend({
  model: function () {
    return this.modelFor('posts');
  }
});

App.PostRoute = Ember.Route.extend({
  model: function (params) {
    return this.modelFor('posts').findBy('slug', params.post_slug); 
    //return this.store.find('post', params.post_id);
  },
  serialize: function (model) {
    return { post_slug: model.get('slug') };
  },
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    returnToPosts: function () { this.transitionTo('posts'); }
  }
});

App.PostController = Ember.ObjectController.extend({
  actions: {
    toggleEdit: function () {
      if (this.get('isEditing')) {
        this.set('isEditing', false);
      } else {
        this.set('isEditing', true);
      }
    },
    editPost: function () {
      this.set('isEditing', false);
      this.get('model').save();
    },
    removePost: function () {
      var post = this.get('model');
      var confirmed = confirm("Are you sure you want to remove the post \"" + this.get('title') + "\"?");
      if(confirmed) {
        post.deleteRecord();
        post.save();
      }
    }
  },
  isEditing: false
});

App.AddPostRoute = Ember.Route.extend({
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    returnToPosts: function () { this.transitionTo('posts'); }
  }
});

App.AddPostController = Ember.ArrayController.extend({
  actions: {
    addPost: function () {
      var title   = this.get('newTitle');
      var slug    = this.get('newSlug');
      var excerpt = this.get('newExcerpt');
      var body    = this.get('newBody');
      var tags    = this.get('newTags');
      
      // TODO Validate entries with validators.js
      
      var post = this.store.createRecord('post', {
        title:   title,
        slug:    slug,
        excerpt: excerpt,
        body:    body,
        tags:    tags
      });
      
      this.set('newTitle',   '');
      this.set('newSlug',    '');
      this.set('newExcerpt', '');
      this.set('newBody',    '');
      this.set('newTags',    '');
      
      post.save();
      
      this.transitionTo('posts');
      // TODO: Show alert message about newly created post --> Use a component.
    }
  }
});

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
