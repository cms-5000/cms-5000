App.Post = DS.Model.extend({
  title: DS.attr('string'),
  excerpt: DS.attr('string'),
  content: DS.attr('string'),
  date: DS.attr('string'),
  tags: DS.attr('string')
});

App.PostsRoute = Ember.Route.extend({
  model: function(){
    return this.store.find('post');
  }
});

App.PostsController = Ember.ArrayController.extend({
  actions: {
    addPost: function() {
      var title = this.get('newTitle');
      var excerpt = this.get('newExcerpt');
      var content = this.get('newContent');
      var date = this.get('newDate');
      var tags = this.get('newTags');

      var post = this.store.createRecord('post', {
        id: 50,
        title: title,
        excerpt: excerpt,
        content: content,
        date: date,
        tags: tags
      });

      this.set('newTitle', '');
      this.set('newExcerpt', '');
      this.set('newContent', '');
      this.set('newDate', '');
      this.set('newTags', '');
      
      post.save();
    }
  }
});

App.PostController = Ember.ObjectController.extend({
  actions: {
    toggleEdit: function() {
      this.set('isEditing', true);
    }
  },
  isEditing: false
});

App.Post.FIXTURES = [{
  id: '1',
  title: "Lorem Ipsum Header",
  excerpt: "There are lots of à la carte software environments in this world. Places where in order to eat, you must first carefully look over the menu of options to order exactly what you want.",
  content: "I want this for my ORM, I want that for my template language, and let's finish it off with this routing library. Of course, you're going to have to know what you want, and you'll rarely have your horizon expanded if you always order the same thing, but there it is. It's a very popular way of consuming software.\n\nRails is not that. Rails is omakase.",
  date: new Date('01-02-2015'),
  tags: "bit, chip"
}, {
  id: '2',
  title: "Here's another Header!",
  excerpt: "Here is some excerpt text, wow.",
  content: "... and here's the legit content of this post!\n\n_Incredible_, right?",
  date: new Date('12-27-2014'),
  tags: "none, sense"
}];