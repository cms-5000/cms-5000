App.PagesRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('page');
  },
  actions: {
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('search');
    }
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
    editPage: function (page) {
      var title = page.get('title');
      var slug  = page.get('slug');
      var body  = page.get('body');
      var slugHasChanged = page.changedAttributes().hasOwnProperty('slug');
      
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
        default: this.set('slugError', 'Oops, something\'s wrong here! Please try again.');
      }
      switch (validateString(body)) {
        case 0: this.set('bodyError', false); break;
        case 1: this.set('bodyError', 'Please write some content.'); break;
        case 2: this.set('bodyError', 'Your content is too long, please make it shorter.'); break;
      }
      
      var inputIsFine = (
        !this.get('titleError') && 
        !this.get('slugError')  && 
        !this.get('bodyError')
      );
      if (inputIsFine) {
        this.set('isEditing', false);
        page.save();

        if (slugHasChanged) {
          // TODO Should forward to the new address ('page/new-slug').
        }
        // TODO Show notification about updated page.
      }
    },
    removePage: function (page) {
      var confirmed = confirm("Are you sure you want to remove the page \"" + page.get('title') + "\"?");
      if (confirmed) {
        page.deleteRecord();
        page.save();
        this.transitionTo('pages');
        this.set('isEditing', false);
        // TODO Show notification about removed page.
      }
    }
  },
  needs: ['register'],
  loggedIn: Ember.computed.alias('controllers.register.loggedIn'),
  isEditing: false,
  titleError: false,
  slugError: false,
  bodyError: false
});

App.AddPageRoute = Ember.Route.extend({
  shortcuts: {
    'escape': 'returnToPosts'
  },
  actions: {
    returnToPosts: function () { this.transitionTo('posts'); },
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('search');
    }
  }
});

App.AddPageController = Ember.ArrayController.extend({
  actions: {
    addPage: function () {
      var title = this.get('title');
      var slug  = this.get('slug');
      var body  = this.get('body');
      
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
      switch (validateString(body)) {
        case 0: this.set('bodyError', false); break;
        case 1: this.set('bodyError', 'Please write some content.'); break;
        case 2: this.set('bodyError', 'Your content is too long, please make it shorter.'); break;
      }
      
      var inputIsFine = (
        !this.get('titleError') && 
        !this.get('slugError')  && 
        !this.get('bodyError')
      );
      if (inputIsFine) {
        var page = this.store.createRecord('page', {
          title:   title,
          slug:    slug,
          body:    body
        });

        this.set('title', '');
        this.set('slug',  '');
        this.set('body',  '');

        page.save();
        this.transitionTo('/page/' + page.get('id'));
        // TODO: Show notification about newly created page.
      }
    },
    cancelPage: function () {
      this.set('title', '');
      this.set('slug',  '');
      this.set('body',  '');
      this.transitionTo('posts');
    }
  },
  needs: ['register'],
  titleError: false,
  slugError:  false,
  bodyError:  false
});