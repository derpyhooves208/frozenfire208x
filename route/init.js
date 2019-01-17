const cloudinary = require( 'cloudinary' );
const consolidate = require( 'consolidate' );
const bodyParser = require( 'body-parser' );
const express = require( 'express' );
const fs = require( 'fs' );
const moment = require( 'moment' );
const multer = require( 'multer' );
const mustache = require( 'mustache' );
const path = require( 'path' );
const process = require( 'process' );
const util = require( 'util' );
const DB = require( '../models/lib/mongodb.js' );
const { Tasks } = require( '../models/tasks.js' );
const { Users } = require( '../models/users.js' );


module.exports = async ( app ) => {
	app.set( 'cloudinary', cloudinary );
	app.set( 'consolidate', consolidate );
	app.set( 'bodyParser', bodyParser );
	app.set( 'fs', fs );
	app.set( 'moment', moment );
	app.set( 'multer', multer );
	app.set( 'mustache', mustache );
	app.set( 'path', path );
	app.set( 'process', process );
	app.set( 'util', util );
	app.set( 'db', DB );
	app.set( 'Tasks', Tasks );
	app.set( 'Users', Users );

	// https://cloudinary.com/documentation/admin_api
	const cloudinaryName = process.env.CLOUDINARY_NAME;
	const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
	const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
	cloudinary.config( {
		cloud_name: cloudinaryName,
		api_key: cloudinaryApiKey,
		api_secret: cloudinaryApiSecret,
	} );

	app.use( express.static( 'public', {
		dotfiles: 'ignore',
		etag: false,
		extensions: [ 'htm', 'html' ],
		index: false,
		maxAge: '1d',
		redirect: false,
		setHeaders: ( res, path, stat ) => {
			res.set( 'x-timestamp', Date.now( ) );
		},
	} ) );

	app.use( bodyParser.json( ) ); // for parsing application/json
	app.use( bodyParser.urlencoded( { extended: true } ) ); // for parsing application/x-www-form-urlencoded

	app.engine( 'html', consolidate.swig ); // http://node-swig.github.io/swig-templates/
	// app.engine( 'mst', consolidate.mustache ); // http://mustache.github.io/mustache.5.html
	app.set( 'view engine', 'html' );
	app.set( 'views', path.resolve( __dirname, '..', 'views' ) );

	app.set( 'upload', multer( { dest: path.resolve( __dirname, '..', 'data', 'fs' ) } ) );

	app.set( 'port', process.env.PORT || 3000 );
	app.set( 'tasks', new Tasks( app ) );
	app.set( 'users', new Users( app ) );
};
