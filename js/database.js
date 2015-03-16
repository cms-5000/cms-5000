//var remote = new PouchDB('https://couchdb-b44c24.smileupps.com/cms');
//var db  = new PouchDB('local_couch');
//
//function doSync() {
//  db.sync(remote, {live: true})
//    .on('error', function(err) {
//      // Retry connection every 5 seconds
//      setTimeout(doSync, 5000);
//    });
//}
//
//doSync();

//App.ApplicationAdapter = EmberPouch.Adapter.extend({
//  db: db
//});

App.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'cms-5000'
});
