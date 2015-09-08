// Change this to the address of your CouchDB.
var remote = new PouchDB('https://cms5000:web5000@couchdb-b44c24.smileupps.com/cms');

var db     = new PouchDB('local_couch');

function doSync() {
  db.sync(remote, {
    live:  true,
    retry: true
  }).on('error', function(err) {
      // Retry connection every 5 seconds
      // FIXME Maybe there should be an error message here?
      setTimeout(doSync, 5000);
  });
}
doSync();

App.ApplicationAdapter = EmberPouch.Adapter.extend({
  db: db
});

//App.ApplicationAdapter = DS.LSAdapter.extend({
//  namespace: 'cms-5000'
//});

App.ApplicationStore = DS.Store.extend({
  findAsId: function (type, field, value) {
    Ember.assert("You need to pass a type, field and value.", arguments.length === 3);

    var entity = this.all(type).findBy(field, value);
    if (Ember.isEmpty(entity)) {
      var query = {};
      query[field] = value;
      return this.find(type, query).then(function (array) {
        Ember.assert('Must find only one object. Found:' + array.get('length'), array.get('length') === 1);
        return array.get('firstObject');
      });
    } else {
      return new Ember.RSVP.Promise(function (resolve) {
        resolve(entity);
      });
    }
  }
});
