App.SearchRoute = Ember.Route.extend({
  model: function () {
    window.searchString = prompt("Please enter the string", "test");
    return this.store.filter('post', function(post) {
      var tempContent = post.get('body');
      var tempLength = tempContent.indexOf(searchString);
      return (tempLength > 0);
    });
  }
});
