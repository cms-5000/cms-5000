//App.RegisterRoute = Ember.Route.extend({ 
//  actions: {
//    startSearch: function (params) { 
//      window.mySearchString = params;
//      this.transitionTo('search');
//    }
//  }
//});

App.RegisterController = Ember.ArrayController.extend({
  actions: {
    addUser: function () {
      var username = this.get('registerUsername');
      var password = this.get('registerPassword');
      
      // TODO There should be a validator for usernames!
      switch (validateString (username)) {
        case 0: this.set('usernameError', false); break;
        case 1: this.set('usernameError', 'Please enter a username.'); break;
        // case 2: this.set('usernameError', 'This username is already being used. Please choose another one.'); break;
        // case 3: this.set('usernameError', 'Only a-z, A-Z, 0-9 and \"_\" are allowed for your username.'); break;
      }
      switch (validatePassword (password)) {
        case 0: this.set('passwordError', false); break;
        case 1: this.set('passwordError', 'Please choose a password.'); break;
        case 2: this.set('passwordError', 'Your password is too long. Please choose a shorter one.'); break;
      }
      
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
        this.transitionTo('register');
        this.woof.success('Welcome! You are now registered and can login with your username and password.');
      }
    },
    doLogin: function () {
      var username = this.get('loginUsername');
      var password = this.get('loginPassword');
      
      if (username === 'admin') {
        this.set('loginUsernameError', false);
      } else {
        this.set('loginUsernameError', 'This username does not exist.');
      }
      if (!this.get('loginUsernameError')) {
        if (password === 'password') {
          this.set('loginPasswordError', false);
        } else {
          this.set('loginPasswordError', 'This password does not match the username. Please try again.');
        }
      }
      
      var inputIsFine = (!this.get('loginUsernameError') && !this.get('loginPasswordError'));
      if (inputIsFine) {
        this.set('loggedIn', true);
        this.transitionTo('posts');
        this.woof.success('You are now logged in.');
      }
    },
    doLogout: function () {
      this.set('loginUsername', '');
      this.set('loginPassword', '');
      this.set('loggedIn', false);
      this.woof.success('You are now logged out. Bye bye.');
    }
  },
  usernameError: false,
  passwordError: false,
  loginUsernameError: false,
  loginPasswordError: false,
  loggedIn: false
});
