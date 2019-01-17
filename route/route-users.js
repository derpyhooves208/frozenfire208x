module.exports = async ( app ) => {
	app.param( 'userId', async ( req, res, next, id ) => {
		const users = app.get( 'users' );
		const user = await users.oneById( id );
		if ( user ) {
			req.user = user;
			next( );
		} else {
			next( new Error( 'failed to load user' ) );
		}
	} );

	app.get( '/users', async ( req, res ) => {
		const q = String( req.query.q || '' ).replace( /[^\w]/ig, '.?' );
		const pageIndex = req.query.page || 0;
		const itemsPerPage = 10;
		const pageOffset = 2;
		const filter = {
			$or: [
				{ login: { $regex: new RegExp( q, 'ig' ) } },
				{ fullname: { $regex: new RegExp( q, 'ig' ) } }
			]
		};
		const skip = pageIndex * itemsPerPage;
		const limit = itemsPerPage;
		const transform = ( user ) => user.toObject( );
		const users = app.get( 'users' );
		const data = {
			search: {
				action: '/users',
				name: 'q',
				placeholder: 'search user',
				value: q,
			},
			skiped: skip,
			users: await users.all( filter, { skip: skip, limit: limit }, transform ),
			pages: {
				pageIndex: pageIndex,
				itemsCount: await users.count( filter, {} ),
				itemsPerPage: itemsPerPage,
				pageOffset: pageOffset,
				pageOffsets: [ ...Array( 2 * pageOffset + 1 ) ].map( ( _, i ) => i - pageOffset ),
			},
		};
		const render = ( E, out ) => res
			.status( E ? 404 : 200 )
			.end( E ? '.' : out );
		res.render( 'users', data, render );
	} );

	app.get( '/users/:userId', async ( req, res ) => {
		const data = {
			user: req.user.toObject( ),
		};
		const render = ( E, out ) => res
			.status( E ? 404 : 200 )
			.end( E ? '.' : out );
		res.render( 'user', data, render );
	} );

	app.get( '/api/users', async ( req, res ) => {
		const q = String( req.query.q || '' ).replace( /[^\w]/ig, '.?' );
		const filter = {
			$or: [
				{ login: { $regex: new RegExp( q, 'ig' ) } },
				{ fullname: { $regex: new RegExp( q, 'ig' ) } }
			]
		};
		const skip = req.query.skip;
		const limit = req.query.limit;
		const transform = ( user ) => user.toObject( );
		const users = app.get( 'users' );
		const data = await users.all( filter, { skip: skip, limit: limit }, transform );
		res.status( 200 ).end( JSON.stringify( data ) );
	} );

	app.get( '/api/users/:userId', async ( req, res ) => {
		const data = req.user.toObject( );
		res.status( 200 ).end( JSON.stringify( data ) );
	} );

}
