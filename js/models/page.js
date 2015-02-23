App.Page = DS.Model.extend({
  slug:  DS.attr('string'),
  title: DS.attr('string'),
  body:  DS.attr('string'),
  rev :  DS.attr('string')
});

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