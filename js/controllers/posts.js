App.PostsRoute = Ember.Route.extend({
  model: function () {
    window.infoArray = new Array(0);
    return this.store.filter('post', function(post) {
      // collect all information we need for analysis
      var dataObject = {
        id:      post.get('id'),
        title:   post.get('title'),
        // slug:    post.get('slug'),
        excerpt: post.get('excerpt'),
        body:    post.get('body'),
        tags:    post.get('tags'),
        date:    post.get('date'),
        words:   post.get('words'),
        complex: post.get('complex')
      };
      window.infoArray = addEntry(window.infoArray, dataObject);
      return true;
    });
  },
  shortcuts: {
    '⌘+⇧+a, ctrl+shift+a': 'goToAddPost'
  },
  actions: {
    goToAddPost: function () { this.transitionTo('add-post'); },
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('search');
    }
  },
  needs: ['register']
});

App.PostsController = Ember.ArrayController.extend({
  sortProperties: ['date'],
  sortAscending: false,
  sortedPosts: Ember.computed.sort('content.@each.date', function(a, b) {
   var ap = moment(Ember.get(b, 'date')),
       bp = moment(Ember.get(a, 'date'));
   if (ap !== bp) {
     return ap - bp;
   }
  }),
  actions: {
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('search');
    }
  },
  needs: ['register']
});


App.PostRoute = Ember.Route.extend({
  beforeModel: function (transition) {
    this.controllerFor('post').set('previousTransition', transition);
  },
//  model: function (params) {
//    return this.store.findAsId('post', 'slug', params.post_slug);
//  },
//  serialize: function (model) {
//    return { post_slug: model.get('slug') };
//  },
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    willTransition: function (transition) {
      if (this.controller.get('isEditing') &&
          !confirm("Are you sure you don't want to save your changes?")) {
        transition.abort();
      } else {
        // FIXME, http://emberjs.com/guides/routing/preventing-and-retrying-transitions/#sts=Preventing Transitions via willTransition
        // this.controllerFor('post').send('cancelEdit', this.modelFor(this.routeName));
        return true;
      }
    },
    returnToPosts: function () { 
      this.transitionTo('posts');
    },
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('search');
    }
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
    goToEditor: function (post) {
      this.transitionTo('/post/' + post.get('id')); // FIXME 'id' -> 'slug'
      this.controllerFor('post').set('isEditing', true);
    },
    editPost: function (post) {
      var id      = post.get('id');
      var title   = post.get('title');
      var slug    = post.get('slug');
      var excerpt = post.get('excerpt');
      var body    = post.get('body');
      var tags    = post.get('tags');
      var slugHasChanged = post.changedAttributes().hasOwnProperty('slug');
      
      switch (validateTitle(title)) {
        case 0: this.set('titleError', false); break;
        case 1: this.set('titleError', 'Please choose a title.'); break;
        case 2: this.set('titleError', 'Your title is too long, please make it shorter.'); break;
      }
      switch (validateSlug(slug, id)) {
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
        case 1: this.set('bodyError', 'Please write a main text.'); break;
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
        post.save();

        if (slugHasChanged) {
          // TODO Should rather forward to the new address ('post/new-slug') as soon as slug system is working.
          this.transitionTo('posts');
        }
        this.woof.success('Your post has been updated.');
      }
    },
    cancelEdit: function (post) {
      post.rollback();
      this.set('isEditing', false);
      // this.transitionTo('/post/' + post.get('id'));
      // FIXME Transition to last route instead of always to post.
      var thePreviousTransition = this.get('previousTransition');
      if (thePreviousTransition) {
        thePreviousTransition.retry();
        this.set('previousTransition', null);
      } else {
        this.transitionToRoute('posts');
      }
    },
    removePost: function (post) {
      var confirmed = confirm("Are you sure you want to remove the post \"" + this.get('title') + "\"?");
      if (confirmed) {
        this.set('isEditing', false);
        var title = post.get('title');
        post.deleteRecord();
        post.save();
        this.transitionToRoute('cockpit');
        this.woof.success('Your post \"' + title + '\" has been removed.');
      }
    }
  },
  needs: ['register'],
  loggedIn: Ember.computed.alias('controllers.register.loggedIn'),
  isEditing: false,
  titleError: false,
  slugError: false,
  excerptError: false,
  bodyError: false,
  previousTransition: ''
});


App.AddPostRoute = Ember.Route.extend({
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    returnToPosts: function () { 
      this.transitionTo('posts'); 
    },
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('search');
    }
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
      switch (validateSlug(slug, '-1')) {
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
        this.woof.success('Your post has been created.');
      }
    },
    cancelEdit: function () {
      this.set('title',   '');
      this.set('slug',    '');
      this.set('excerpt', '');
      this.set('body',    '');
      this.set('tags',    '');
      this.transitionTo('posts');
    }
  },
  needs: ['register'],
  previousTransition: '',
  titleError: false,
  slugError: false,
  excerptError: false,
  bodyError: false,
  tagsError: false
});