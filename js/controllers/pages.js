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

App.PagesController = Ember.ArrayController.extend({
  model: function () {
    return this.store.find('page');
  },
  needs: ['register']
});

App.PageRoute = Ember.Route.extend({
  serialize: function (model) {
    return { page_slug: model.get('slug') };
  }
});

App.PageController = Ember.ObjectController.extend({
  model: function (params) {
    return this.modelFor('pages').findBy('slug', params.page_slug);
    // return this.store.findAsId('page', 'slug', params.page_slug); // works, too
  },
  actions: {
    toggleEdit: function () {
      if (this.get('isEditing')) {
        this.set('isEditing', false);
      } else {
        this.set('isEditing', true);
      }
    },
    goToEditor: function (page) {
      this.transitionTo('/page/' + page.get('slug'));
      this.controllerFor('page').set('isEditing', true);
    },
    editPage: function (page) {
      var title = page.get('title');
      var slug  = page.get('slug');
      var menu  = page.get('menu');
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
          // FIXME Doesn't work properly -> is validateSlug returning 2 by accident?
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
      switch (validateString(menu)) {
        case 0: this.set('menuError', false); break;
        case 1: this.set('menuError', 'Please choose a menu title.'); break;
        case 2: this.set('menuError', 'Your menu title is too long, please choose a shorter one.'); break;
      }
      switch (validateString(body)) {
        case 0: this.set('bodyError', false); break;
        case 1: this.set('bodyError', 'Please write some content.'); break;
        case 2: this.set('bodyError', 'Your content is too long, please make it shorter.'); break;
      }
      
      var inputIsFine = (
        !this.get('titleError') && 
        !this.get('slugError')  && 
        !this.get('menuError')  &&
        !this.get('bodyError')
      );
      if (inputIsFine) {
        this.set('isEditing', false);
        page.save();

        if (slugHasChanged) {
          // TODO Should forward to the new address ('page/new-slug').
        }
        this.woof.success('Your page has been updated.');
      }
    },
    cancelEdit: function (page) {
      page.rollback();
      this.set('isEditing', false);
      // FIXME Transition to last route instead of always to page.
      this.transitionTo('/page/' + page.get('slug'));
    },
    removePage: function (page) {
      var confirmed = confirm("Are you sure you want to remove the page \"" + page.get('title') + "\"?");
      if (confirmed) {
        this.set('isEditing', false);
        page.deleteRecord();
        page.save();
        this.transitionTo('pages');
        this.woof.success('Your page has been removed.');
      }
    }
  },
  needs: ['register'],
  loggedIn: Ember.computed.alias('controllers.register.loggedIn'),
  isEditing: false,
  titleError: false,
  slugError: false,
  menuError: false,
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
      var menu  = this.get('menu');
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
      switch (validateString(menu)) {
        case 0: this.set('menuError', false); break;
        case 1: this.set('menuError', 'Please choose a menu title.'); break;
        case 2: this.set('menuError', 'Your menu title is too long, please choose a shorter one.'); break;
      }
      switch (validateString(body)) {
        case 0: this.set('bodyError', false); break;
        case 1: this.set('bodyError', 'Please write some content.'); break;
        case 2: this.set('bodyError', 'Your content is too long, please make it shorter.'); break;
      }
      
      var inputIsFine = (
        !this.get('titleError') && 
        !this.get('slugError')  && 
        !this.get('bodyError')  &&
        !this.get('menuError')
      );
      if (inputIsFine) {
        var page = this.store.createRecord('page', {
          title: title,
          slug:  slug,
          menu:  menu,
          body:  body
        });
        page.save();

        this.set('title', '');
        this.set('slug',  '');
        this.set('menu',  '');
        this.set('body',  '');

        this.transitionTo('/page/' + page.get('slug'));
        this.woof.success('Your page has been created.');
      }
    },
    cancelEdit: function () {
      this.set('title', '');
      this.set('slug',  '');
      this.set('menu',  '');
      this.set('body',  '');
      this.transitionTo('posts');
    }
  },
  needs: ['register'],
  titleError: false,
  slugError:  false,
  menuError:  false,
  bodyError:  false
});