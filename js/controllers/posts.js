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

App.PostRoute = Ember.Route.extend({
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    returnToPosts: function () { 
      this.transitionTo('posts');
      // FIXME: Notification stuff: https://github.com/aexmachina/ember-notify/tree/v2.0.0#module-formats
      // window.EmberNotify.default.success("It worked.");
    }
  }
});

App.PostController = Ember.ObjectController.extend({
  model: function (params) {
    return this.store.find('post', params.post_id);
    //return this.modelFor('posts').find('id', params.post_id);
  },
  actions: {
    toggleEdit: function () {
      if (this.get('isEditing')) {
        this.set('isEditing', false);
      } else {
        this.set('isEditing', true);
      }
    },
    editPost: function () {
      var title   = this.get('model').get('title');
      var slug    = this.get('model').get('slug');
      var excerpt = this.get('model').get('excerpt');
      var body    = this.get('model').get('body');
      var tags    = this.get('model').get('tags');
      var slugHasChanged = this.get('model').changedAttributes().hasOwnProperty('slug');
      
      switch (validateTitle(title)) {
        case 0: this.set('titleError', false); break;
        case 1: this.set('titleError', 'Please choose a title.'); break;
        case 2: this.set('titleError', 'Your title is too long, please make it shorter.'); break;
      }
      switch (validateSlug(slug)) {
        case 0: this.set('slugError', false); break;
        case 1: this.set('slugError', 'Please define a slug (short url).'); break;
        case 2:
          if (slugHasChanged) {
            this.set('slugError', 'This slug is already being used. Please choose a different one.'); 
          } else {
            this.set('slugError', false);
          }
          break;
        case 3: this.set('slugError', 'Only a-z, A-Z, 0-9 and \"_\" are allowed for your slug.'); break;
        case 4: this.set('slugError', 'Please don\'t use any of the following keywords: post(s), page(s), add-post, add-page or search.'); break;
      }
      switch (validateString(excerpt)) {
        case 0: this.set('excerptError', false); break;
        case 1: this.set('excerptError', 'Please write a short excerpt.'); break;
        case 2: this.set('excerptError', 'Your excerpt is too long, please make it shorter.'); break;
      }
      switch (validateString(body)) {
        case 0: this.set('bodyError', false); break;
        case 1: this.set('bodyError', false); break; // non-mandatory field
        case 2: this.set('bodyError', 'Your content is too long, please make it shorter.'); break;
      }
      // TODO Validate tags.
      
      var inputIsFine = (
        !this.get('titleError')   && 
        !this.get('slugError')    && 
        !this.get('excerptError') && 
        !this.get('bodyError')
      );
      if(inputIsFine){
        this.set('isEditing', false);
        this.get('model').save();

        if (slugHasChanged) {
          this.transitionTo('posts'); // TODO Should rather forward to the new address ('post/new-slug').
        }
        // TODO Show notification about updated post.
      }
    },
    removePost: function () {
      var confirmed = confirm("Are you sure you want to remove the post \"" + this.get('title') + "\"?");
      if (confirmed) {
        this.set('isEditing', false);
        var post = this.get('model');
        post.deleteRecord();
        post.save();
        this.transitionTo('posts');
        // TODO Show notification about removed post.
      }
    }
  },
  isEditing: false,
  titleError: false,
  slugError: false,
  excerptError: false,
  bodyError: false
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
      var title   = this.get('title');
      var slug    = this.get('slug');
      var excerpt = this.get('excerpt');
      var body    = this.get('body');
      var tags    = this.get('tags');
      
      switch (validateTitle(title)) {
        case 0: this.set('titleError', false); break;
        case 1: this.set('titleError', 'Please choose a title.'); break;
        case 2: this.set('titleError', 'Your title is too long, please make it shorter.'); break;
      }
      switch (validateSlug(slug)) {
        case 0: this.set('slugError', false); break;
        case 1: this.set('slugError', 'Please define a slug (short url).'); break;
        case 2: this.set('slugError', 'This slug is already being used. Please choose a different one.'); break;
        case 3: this.set('slugError', 'Only a-z, A-Z, 0-9 and \"_\" are allowed for your slug.'); break;
        case 4: this.set('slugError', 'Please don\'t use any of the following keywords: post(s), page(s), add-post, add-page or search.'); break;
      }
      switch (validateString(excerpt)) {
        case 0: this.set('excerptError', false); break;
        case 1: this.set('excerptError', 'Please write a short excerpt.'); break;
        case 2: this.set('excerptError', 'Your excerpt is too long, please make it shorter.'); break;
      }
      switch (validateString(body)) {
        case 0: this.set('bodyError', false); break;
        case 1: this.set('bodyError', false); break; // non-mandatory field
        case 2: this.set('bodyError', 'Your content is too long, please make it shorter.'); break;
      }
      
      var inputIsFine = (
        !this.get('titleError')   && 
        !this.get('slugError')    && 
        !this.get('excerptError') && 
        !this.get('bodyError')    && 
        !this.get('tagsError')
      );
      if (inputIsFine) {
        var post = this.store.createRecord('post', {
          title:   title,
          slug:    slug,
          excerpt: excerpt,
          body:    body,
          tags:    tags
        });

        this.set('title',   '');
        this.set('slug',    '');
        this.set('excerpt', '');
        this.set('body',    '');
        this.set('tags',    '');

        post.save();
        this.transitionTo('posts');
        // TODO: Show notification about newly created post.
      }
    },
    cancelPost: function () {
      this.set('title',   '');
      this.set('slug',    '');
      this.set('excerpt', '');
      this.set('body',    '');
      this.set('tags',    '');
      this.transitionTo('posts');
    }
  },
  titleError: false,
  slugError: false,
  excerptError: false,
  bodyError: false,
  tagsError: false
});