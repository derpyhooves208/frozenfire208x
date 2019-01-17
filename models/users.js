const { User } = require( './user.js' );

class Users {
	constructor( app ) {
		this._app = app;
	}

	get app( ) {
		return this._app;
	}

	get db( ) {
		return this.app.get( 'db' );
	}

	async all( filter, options, transform ) { // -> [ User, User, ... ]
		let items = await this.db.find( 'users', filter, options );
		items = items.map( ( _ ) => new User( User.load( _ ) ) );
		const o = options || {};
		if ( o.transform instanceof Function ) items = items.map( o.transform );
		return items;
	}

	async count( filter, options ) {
		return await this.db.count( 'users', filter, options );
	}

	async oneByIndex( index ) {
		const filter = {};
		const options = {
			skip: index,
			limit: 1,
			sort: { registeredAt: 1, },
		};
		const user = await this.db.findOne( 'users', filter, options );
		return user ? new User( User.load( user ) ) : undefined;
	}

	async oneById( id ) {
		const filter = {
			_id: this.db.id( id ),
		};
		const options = {};
		const user = await this.db.findOne( 'users', filter, options );
		return user ? new User( User.load( user ) ) : undefined;
	}

	async oneByLoginPassword( login, password ) {
		const filter = {
			login: login,
			password: password,
		};
		const options = {};
		const user = await this.db.findOne( 'users', filter, options );
		return user ? new User( User.load( user ) ) : undefined;
	}

}

module.exports.Users = Users;
module.exports.User = User;
