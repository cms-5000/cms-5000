App.Page = DS.Model.extend({
  id: DS.attr('number'),
  title: DS.attr('string'),
  body: DS.attr('string')
});


var pages = [{
  id: '1',
  title: 'My Test Page',
  body: 'Hello, this is a test page.'
}, {
  id: '2',
  title: 'My Second Test Page',
  body: 'Hello, this is another test page. Lorem ipsum and stuff.'
}];