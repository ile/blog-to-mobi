/*
 * blog to kindle
 * 
 * Saves data to mongodb, db blog-scraper, collection posts
 *
 * (C) Ilkka Huotari
 */

var mongo = require('mongoskin'),
	scraper = require('blog-scraper'),
	fs = require('fs'),
	moment = require('moment'),
	db, dir, files = [];

moment.locale('fi');

function usage() {
	console.log('usage');
}

function createToc() {
	var fileName = dir + '/toc.html',
		data = "<html>"+
			"<body>"+
			"<h1>Table of Contents</h1>\n"+
			'<p style="text-indent:0pt">\n';

     files.forEach(function(el) {
		data += '<a href="' + el.file + '">' + el.title + '</a><br/>\n';
     });

     data += '</p>'+
		'</body>'+
		'</html>';

	fs.writeFileSync(fileName, data);
	process.exit(1);
}

function get() {
	var num = 1;
	db.posts.find().toArray(function(err, items) {
		items.forEach(function(el, i, arr) {
			var data = '<h1>' + el.title + '</h1>' +
				'<time>' + moment(el.date).format('LLL') + '</time>' +
				'<article>' + el.body + '<article>' +
				'<section>' + el.comments + '<article>';

			var fileName = dir + '/' + num + '.html';
			files.push({ title: el.title, file: num + '.html' });
			console.log('Writing ' + fileName);
			fs.writeFileSync(fileName, data);
			num++;
		});

		createToc();
	});
}

(function main() {
	var url;

	if (process.argv.length !== 4) {
		usage();
		process.exit(1);
	}
	
	dbname = process.argv[2];
	dir = process.argv[3];
	db = mongo.db("mongodb://localhost:27017/" + dbname, {native_parser:true});
	db.bind('posts');

	var stats = fs.stat(dir, function(err, stats) {
	
		if (err || !stats.isDirectory()) {
			fs.mkdirSync(dir);
		}

		get();
	});
}());

