const express = require( 'express' );
const app = express( );


( async ( ) => {
	await require( './route/init.js' )( app );
	await require( './route/route-home.js' )( app );
	await require( './route/route-about.js' )( app );
	await require( './route/route-users.js' )( app );
	await require( './route/route-tasks.js' )( app );


	app.all( '*', async ( req, res ) => {
		res.status( 404 ).end( '404' );
	} );


	const port = app.get( 'port' );
	app.listen( port, ( ) => console.log( `Server started on port ${port}!` ) );
} )( );
