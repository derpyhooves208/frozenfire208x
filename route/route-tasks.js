module.exports = async ( app ) => {
	app.param( 'taskId', async ( req, res, next, id ) => {
		if ( !id ) {
			return;
		}
		const tasks = app.get( 'tasks' );
		const task = await tasks.oneById( id );
		if ( task ) {
			req.task = task;
			next( );
		} else {
			next( new Error( 'failed to load task' ) );
		}
	} );

	app.get( '/tasks', async ( req, res ) => {
		const q = String( req.query.q || '' ).replace( /[^\w]/ig, '.?' );
		const pageIndex = req.query.page || 0;
		const itemsPerPage = 10;
		const pageOffset = 2;
		const filter = {
			$or: [
				{ title: { $regex: new RegExp( q, 'ig' ) } },
				{ description: { $regex: new RegExp( q, 'ig' ) } }
			]
		};
		const skip = pageIndex * itemsPerPage;
		const limit = itemsPerPage;
		const transform = ( task ) => task.toObject( );
		const tasks = app.get( 'tasks' );
		const data = {
			search: {
				action: '/tasks',
				name: 'q',
				placeholder: 'search task',
				value: q,
			},
			skiped: skip,
			tasks: await tasks.all( filter, { skip: skip, limit: limit }, transform ),
			pages: {
				pageIndex: pageIndex,
				itemsCount: await tasks.count( filter, {} ),
				itemsPerPage: itemsPerPage,
				pageOffset: pageOffset,
				pageOffsets: [ ...Array( 2 * pageOffset + 1 ) ].map( ( _, i ) => i - pageOffset ),
			},
		};
		const render = ( E, out ) => res
			.status( E ? 404 : 200 )
			.end( E ? '.' : out );
		res.render( 'tasks', data, render );
	} );

	app.get( '/tasks/new', async ( req, res ) => {
		const data = {
			form: {
				action: '/tasks/new',
				enctype: 'multipart/form-data',
				method: 'POST',
				submit: 'create',
				type: 'add',
			},
		};
		const render = ( E, out ) => res
			.status( E ? 404 : 200 )
			.end( E ? '.' : out );
		res.render( 'task-form', data, render );
	} );

	app.get( '/tasks/:taskId', async ( req, res ) => {
		if ( !req.task ) {
			res.redirect( '/404' );
		}
		const data = {
			task: req.task.toObject( ),
		};
		const render = ( E, out ) => res
			.status( E ? 404 : 200 )
			.end( E ? '.' : out );
		res.render( 'task', data, render );

	} );

	app.get( '/tasks/:taskId/edit', async ( req, res ) => {
		if ( !req.task ) {
			res.redirect( '/404' );
		}
		const data = {
			form: {
				action: `/tasks/${req.task.id}/edit`,
				enctype: 'multipart/form-data',
				method: 'POST',
				submit: 'save',
				type: 'edit',
			},
			task: req.task.toObject( ),
		};
		const render = ( E, out ) => res
			.status( E ? 404 : 200 )
			.end( E ? '.' : out );
		res.render( 'task-form', data, render );
	} );

	app.post( '/tasks/new',
		app.get( 'upload' ).fields( [
			{ name: 'src', maxCount: 1 },
			{ name: 'title', maxCount: 1 },
			{ name: 'description', maxCount: 1 },
		] ),
		async ( req, res ) => {
			const src = ( req.files.src || [ ] ).shift( );
			const title = req.body.title;
			const description = req.body.description;
			const tasks = app.get( 'tasks' );
			const done = async ( src, title, description ) => {
				const taskId = await tasks.insert( {
					src: src,
					title: title,
					description: description,
				} );
				res.redirect( `/tasks/${taskId}` );
			};
			if ( src && src.size > 0 ) {
				const uploaded = await tasks.upload( src.path );
				app.get( 'fs' ).unlink( src.path, ( error ) => error );
				await done( uploaded.secure_url, title, description );
			} else {
				await done( '', title, description );
			}
		} );

	app.post( '/tasks/:taskId/edit',
		app.get( 'upload' ).fields( [
			{ name: 'src', maxCount: 1 },
			{ name: 'unsrc', maxCount: 1 },
			{ name: 'title', maxCount: 1 },
			{ name: 'description', maxCount: 1 },
		] ),
		async ( req, res ) => {
			if ( !req.task ) {
				res.redirect( '/404' );
			}
			const task = req.task;
			const id = task.id;
			const src = ( req.files.src || [ ] ).shift( );
			const unsrc = req.body.unsrc;
			const title = req.body.title;
			const description = req.body.description;
			const tasks = app.get( 'tasks' );
			const done = async ( id, src, title, description ) => {
				const result = await tasks.update( id, {
					src: src,
					title: title,
					description: description,
				} );
				res.redirect( `/tasks/${id}` );
			};
			if ( src && src.size > 0 ) {
				const unupload = await tasks.unupload( req.task.src );
				const uploaded = await tasks.upload( src.path );
				app.get( 'fs' ).unlink( src.path, ( error ) => error );
				await done( id, uploaded.secure_url, title, description );
			} else if ( unsrc ) {
				const unupload = await tasks.unupload( req.task.src );
				await done( id, '', title, description );
			} else {
				await done( id, req.task.src, title, description );
			}
		} );

	app.all( '/tasks/:taskId/remove', async ( req, res ) => {
		if ( !req.task ) {
			res.redirect( '/404' );
		}
		const tasks = app.get( 'tasks' );
		const unupload = await tasks.unupload( req.task.src );
		const result = await tasks.remove( req.task.id );
		res.redirect( '/tasks' );
	} );

	app.get( '/api/tasks', async ( req, res ) => {
		const q = String( req.query.q || '' ).replace( /[^\w]/ig, '.?' );
		const filter = {
			$or: [
				{ title: { $regex: new RegExp( q, 'ig' ) } },
				{ description: { $regex: new RegExp( q, 'ig' ) } }
			]
		};
		const skip = req.query.skip;
		const limit = req.query.limit;
		const transform = ( task ) => task.toObject( );
		const tasks = app.get( 'tasks' );
		const data = await tasks.all( filter, { skip: skip, limit: limit }, transform );
		res.status( 200 ).end( JSON.stringify( data ) );
	} );

	app.get( '/api/tasks/:taskId', async ( req, res ) => {
		if ( !req.task ) {
			res.redirect( '/404' );
		}
		const data = req.task.toObject( );
		res.status( 200 ).end( JSON.stringify( data ) );
	} );

}
