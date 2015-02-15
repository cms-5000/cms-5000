App.Page = DS.Model.extend({
  title: DS.attr('string'),
  body: DS.attr('string')
});


App.Page.FIXTURES = [{
  id: '1',
  title: 'My Test Page',
  body: 'Hello, this is a test page.'
}, {
  id: '2',
  title: 'My Second Test Page',
  body: 'Hello, this is another test page. Lorem ipsum and stuff.'
}];


///* 
// * PAGES
// */
//App.PageRoute = Ember.Route.extend({
//  model: function (params) {
//    return pages.findBy('id', params.page_id);
//  }
//});
//
//App.PageController = Ember.ObjectController.extend({
//  isEditing: false,
//
//  actions: {
//    edit: function () {
//      this.set('isEditing', true);
//    },
//
//    doneEditing: function () {
//      this.set('isEditing', false);
//    }
//  }
//});