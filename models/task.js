const moment = require( 'moment' );
const util = require( 'util' );

const format4LoadAndSave = 'YYYY-MM-DD HH:mm:ss.SSS';
const format4At = 'DD-MM-YYYY HH:mm:ss.SSS';
const format4Cmp = 'YYYY-MM-DD HH:mm:ss.SSS';

class Task {
	static load( jsonAsObject ) {
		const json2user = {
			_id: 'id',
			createdAt: 'created',
			modifiedAt: 'modified',
			src: 'src',
			title: 'title',
			description: 'description',
		};
		const parse = Object
			.keys( json2user )
			.map( ( jsonKey ) => {
				if ( !( jsonKey in jsonAsObject ) ) return {};
				let value = jsonAsObject[ jsonKey ];
				if ( jsonKey === 'createdAt' || jsonKey === 'modifiedAt' ) {
					value = moment( value, format4LoadAndSave );
					if ( !value.isValid( ) ) value = moment( );
					value = value.format( 'x' );
				} else if ( jsonKey === 'id' ) {
					value = String( value );
				} else {
					value = String( value );
				}
				return {
					[ json2user[ jsonKey ] ]: value,
				};
			} );
		return Object.assign.apply( {}, parse );
	}

	static save( task ) { // -> jsonAsObject
		return {
			_id: String( task.id ),
			createdAt: task.createdAs( format4LoadAndSave ),
			modifiedAt: task.modifiedAs( format4LoadAndSave ),
			src: task.src,
			title: task.title,
			description: task.description,
		}
	}

	constructor( task ) {
		const key2field = ( key ) =>
			util.format( '_%s', key );
		'id created modified src title description'.split( ' ' )
			.forEach( ( key ) => this[ key2field( key ) ] = task[ key ] );
	}

	toObject( ) {
		return {
			id: String( this.id ),
			created: this.created,
			modified: this.modified,
			src: String( this.src ),
			title: String( this.title ),
			description: String( this.description ),
			createdAt: this.createdAs( format4At ),
			createdCmp: this.createdAs( format4Cmp ),
			modifiedAt: this.modifiedAs( format4At ),
			modifiedCmp: this.modifiedAs( format4Cmp ),
		};
	}

	toString( ) {
		return JSON.stringify( this.toObject( ), null, '\t' );
	}

	get id( ) {
		return this._id;
	}

	get created( ) {
		return this._created;
	}

	get modified( ) {
		return this._modified;
	}

	get src( ) {
		return this._src;
	}

	get title( ) {
		return this._title;
	}

	get description( ) {
		return this._description;
	}

	set src( _ ) {
		this._modified = moment( ).format( 'x' );
		this._src = String( _ );
	}

	set title( _ ) {
		this._modified = moment( ).format( 'x' );
		this._title = String( _ );
	}

	set description( _ ) {
		this._modified = moment( ).format( 'x' );
		this._description = String( _ );
	}

	createdAs( format ) {
		return ( this.created ? moment( this.created, 'x' ) : moment( ) ).format( format );
	}

	modifiedAs( format ) {
		return ( this.modified ? moment( this.modified, 'x' ) : moment( ) ).format( format );
	}

	[ util.inspect.custom ]( depth, options ) {
		let obj = this.toObject( );
		if ( options.compact ) {
			delete obj.createdAt;
			delete obj.createdCmp;
			delete obj.modifiedAt;
			delete obj.modifiedCmp;
		}
		return JSON.stringify( obj, null, '\t' );
	}

	out( ) {
		const obj = this.toObject( );
		delete obj.created;
		delete obj.modified;
		delete obj.createdCmp;
		delete obj.modifiedCmp;
		return obj;
	}

}

module.exports.Task = Task;
