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