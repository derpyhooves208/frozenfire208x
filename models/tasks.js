const { Task } = require( './task.js' );

class Tasks {
	constructor( app ) {
		this._app = app;
	}

	get app( ) {
		return this._app;
	}

	get db( ) {
		return this.app.get( 'db' );
	}

	async all( filter, options, transform ) { // -> [ Task, Task, ... ]
		let items = await this.db.find( 'tasks', filter, options );
		items = items.map( ( _ ) => new Task( Task.load( _ ) ) );
		const o = options || {};
		if ( o.transform instanceof Function ) items = items.map( o.transform );
		return items;
	}

	async count( filter, options ) {
		return await this.db.count( 'tasks', filter, options );
	}

	async oneByIndex( index ) {
		const filter = {};
		const options = {
			skip: index,
			limit: 1,
			sort: { createdAt: 1, },
		};
		const task = await this.db.findOne( 'tasks', filter, options );
		return task ? new Task( Task.load( task ) ) : undefined;
	}

	async oneById( id ) {
		const filter = {
			_id: this.db.id( id ),
		};
		const options = {};
		const task = await this.db.findOne( 'tasks', filter, options );
		return task ? new Task( Task.load( task ) ) : undefined;
	}

	async upload( path ) {
		/*
		{
		  public_id: 'nn7mtn4hsa3asi37u3if',
		  version: 1547679550,
		  signature: '0958943eb94002aa3de25b065d81df8201ac414a',
		  width: 1366,
		  height: 768,
		  format: 'png',
		  resource_type: 'image',
		  created_at: '2019-01-16T22:59:10Z',
		  tags: [],
		  bytes: 76374,
		  type: 'upload',
		  etag: '67e88062511c9a7ccedbea8064425310',
		  placeholder: false,
		  url: 'http://res.cloudinary.com/dzenuytfg/image/upload/v1547679550/nn7mtn4hsa3asi37u3if.png',
		  secure_url: 'https://res.cloudinary.com/dzenuytfg/image/upload/v1547679550/nn7mtn4hsa3asi37u3if.png',
		  original_filename: '\u001157K<O==K8\u0006'
		}
		*/
		return new Promise( ( resolve, reject ) => {
			const cloudinary = this.app.get( 'cloudinary' );
			cloudinary.v2.uploader.upload( path, ( error, uploaded ) => {
				error ? reject( error ) : resolve( uploaded );
			} );
		} );
	}

	async unupload( src ) {
		return new Promise( ( resolve, reject ) => {
			if ( src ) {
				const RE = /^.*[\/](.*?)[\.].*?$/g;
				const cloudinary = this.app.get( 'cloudinary' );
				const done = ( error, _ ) => error ? reject( error ) : resolve( _ );
				const public_id = String( src ).replace( RE, '$1' );
				cloudinary.v2.api.delete_resources( [ public_id ], done );
			} else {
				resolve( );
			}
		} );
	}

	async insert( _ ) {
		const task = new Task( {
			id: '',
			createdAt: undefined,
			modifiedAt: undefined,
			src: _.src,
			title: _.title,
			description: _.description,
		} );
		const record = Task.save( task );
		delete record._id;
		const result = await this.db.insertOne( 'tasks', record );
		return String( record._id );
	}

	async update( id, _ ) {
		const task = this.oneById( id );
		if ( task && _ ) {
			const filter = {
				_id: this.db.id( id ),
			};
			const record = {};
			if ( 'src' in _ ) record.src = _.src;
			if ( 'title' in _ ) record.title = _.title;
			if ( 'description' in _ ) record.description = _.description;
			const result = await this.db.updateOne( 'tasks', filter, record, true );
			return true;
		} else {
			return false;
		}
	}

	async remove( id ) {
		const task = this.oneById( id );
		const filter = {
			_id: this.db.id( id ),
		};
		const result = await this.db.removeOne( 'tasks', filter );
		return !!task;
	}

}

module.exports.Tasks = Tasks;
module.exports.Task = Task;
