// General Setup
window.App = Ember.Application.create({});

App.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'cms-5000'
});

Ember.TextSupport.reopen({  
    attributeBindings: ["required"]
}) 

App.Router.map(function() {
  this.resource('posts', { path: '/' });
  this.resource('post',  { path: '/post/:post_id' });
  this.route('add-post');
  this.route('about');
  //    this.resource('page', { path: ':page_id' });
});

/*
 * HELPERS
 */
var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function(input) {
  if (input == undefined) {
    return "";
  } else {
    return new Handlebars.SafeString(showdown.makeHtml(input));
  }
});

Ember.Handlebars.helper('format-date', function (date) {
  return moment(date).fromNow();
});


/*
 * POUCHDB
 */

//var db = new PouchDB('mydb');
//var remote = new PouchDB('http://localhost:5984/cms');
////var remote = new PouchDB('https://cms5000:web5000@cms5000.iriscouch.com/cms');
// 
//function doSync() {
//  db.sync(remote, {live: true}).on('error', function (err) {
//    setTimeout(doSync, 1000); // retry 
//  });
//}
//
//function addPost(text, excerptText, contentText, tagsText) {
//  var post = {
//    _id: new Date().toISOString(),
//    title: text,
//	excerpt: excerptText,
//    content: contentText,
//	date: new Date().toISOString(),
//	tags: tagsText,
//  };
//  db.put(post, function callback(err, result) {
//    if (!err) {
//      console.log('Successfully posted a todo!');
//    }
//  });
//  doSync();
//}
//
////addPost('test3', 'test3', 'test3', 'test3');
//
//function showPosts() {
//  db.allDocs({include_docs: true, descending: true}, function(err, doc) {
//	  postsDoc = doc.rows;
//	  posts=[];
//	  var counter = 0;
//	postsDoc.forEach(function(postDoc) {
//		console.log(counter);
//	var post = {
//		id: postDoc.doc._id,
//		title: postDoc.doc.title,
//		excerpt: postDoc.doc.excerpt,
//		content: postDoc.doc.content,
//		date: postDoc.doc.date,
//		tags: postDoc.doc.tags
//	};
//		posts[counter] = post;
//		counter = counter + 1;
//	});
//  });
//}

//showPosts();