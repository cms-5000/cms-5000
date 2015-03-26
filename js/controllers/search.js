$(function(){
  $("#searchbox-action").keyup(function() {
    var controller = App.__container__.lookup("controller:search");
    controller.send('startSearch',this.value);
  });
});

App.SearchRoute = Ember.Route.extend({
  model: function () {
    //window.searchString = prompt("Please enter the string", "test");
    window.searchString = window.mySearchString;

    return App.Post.store.filter('post', function(post) {
      if (!(post.get('title') === undefined)) {
        var tempTitle = post.get('title');
        var tempIndex = tempTitle.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      if (!(post.get('excerpt') === undefined)) {
        var tempExcerpt = post.get('excerpt');
        var tempIndex = tempExcerpt.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      if (!(post.get('body') === undefined)) {
        var tempBody = post.get('body');
        var tempIndex = tempBody.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      if (!(post.get('tags') === undefined)) {
        var tempTags = post.get('tags');
        var tempIndex = tempTags.indexOf(searchString);
        if (tempIndex > -1) return true;
      }
      return (false);
    });
  },
});

App.SearchController = Ember.ArrayController.extend({
    actions: {
    startSearch: function (params) { 
      window.mySearchString = params;
      this.transitionTo('posts');
      this.transitionTo('search');
    }
  }
});
