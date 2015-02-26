App.LoginRoute = Ember.Route.extend({ 
  actions: {
    doLogin: function () { 
      var username = this.get('loginUsername');
      var password = this.get('loginPassword');
      
      console.log('username: ' + username);
      console.log('password: ' + password);
      
      
      // TODO Do the login handling here (or in ApplicationRoute?).
    }
  }
});

App.RegisterController = Ember.ArrayController.extend({
  actions: {
    addUser: function () {
      var username = this.get('registerUsername');
      var password = this.get('registerPassword');
      
      // TODO Waiting for Ben's validator functions.
//      switch (checkUsernameStuff(username)) {
//        case 0: this.set('usernameError', false);
//        case 1: this.set('usernameError', 'Please enter a username.');
//        case 2: this.set('usernameError', 'This username is already being used. Please choose another one.');
//        case 3: this.set('usernameError', 'Only a-z, A-Z, 0-9 and \"_\" are allowed for your username.');
//      }
//      switch (checkStringStuff(password)) {
//        case 0: this.set('passwordError', false);
//        case 1: this.set('passwordError', 'Please choose a password.');
//        case 2: this.set('passwordError', 'Your password is too long. Please choose a shorter one.');
//      }
      
      var inputIsFine = (!this.get('usernameError') && !this.get('passwordError'));
      if (inputIsFine) {
        // FIXME This should be rather sent to the server instead of being stored locally!
        var user = this.store.createRecord('user', {
          username: username,
          password: password
        });
        
        this.set('registerUsername', '');
        this.set('registerPassword', '');

        user.save();
        this.transitionTo('posts');
        // TODO: Show notification about newly created user.
      }
    }
  },
  usernameError: false,
  passwordError: false
});
