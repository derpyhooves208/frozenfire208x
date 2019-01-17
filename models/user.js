const moment = require( 'moment' );
const util = require( 'util' );

const format4LoadAndSave = 'YYYY-MM-DD HH:mm:ss.SSS';
const format4At = 'DD-MM-YYYY HH:mm:ss.SSS';
const format4Cmp = 'YYYY-MM-DD HH:mm:ss.SSS';

class User {
	static load( jsonAsObject ) {
		const json2user = {
			_id: 'id', // id - унікальний числовий (або uuid) ідентифікатор
			login: 'login', // login - унікальна строка
			password: 'password', // password
			role: 'role', // role - ціле число (0 - простий користувач, 1 - адміністратор).
			fullname: 'fullname', // fullname - строка повного імені користувача
			registeredAt: 'registered', // registeredAt - строка із датою у форматі ISO 8601.
			avaUrl: 'avatarURL', // avaUrl - строка з URL зображення.
			isDisabled: 'enable', // isDisabled - відмітка чи користувача було деактивовано.
		};
		const parse = Object
			.keys( json2user )
			.map( ( jsonKey ) => {
				if ( !( jsonKey in jsonAsObject ) ) return {};
				let value = jsonAsObject[ jsonKey ];
				if ( jsonKey === 'isDisabled' ) {
					value = !value;
				} else if ( jsonKey === 'registeredAt' ) {
					value = moment( value, format4LoadAndSave );
					if ( !value.isValid( ) ) value = moment( );
					value = value.format( 'x' );
				} else if ( jsonKey === 'role' ) {
					value = value ? 1 : 0;
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

	static save( user ) { // -> jsonAsObject
		return {
			_id: user.id,
			login: user.login,
			role: user.role,
			fullname: user.fullname,
			registeredAt: user.registeredAs( format4LoadAndSave ),
			avaUrl: user.avatarURL,
			isDisabled: user.disable,
		}
	}

	constructor( user ) {
		const key2field = ( key ) => util.format( '_%s', key );
		'id login role fullname registered avatarURL enable'.split( ' ' )
			.forEach( ( key ) => this[ key2field( key ) ] = user[ key ] );
	}

	toObject( ) {
		return {
			id: this.id,
			login: this.login,
			password: this.password,
			role: this.role,
			enable: this.enable,
			registered: this.registered,
			fullname: this.fullname,
			avatar: this.avatar,
			roleAs: this.roleAs,
			registeredAt: this.registeredAs( format4At ),
			registeredCmp: this.registeredAs( format4Cmp ),
			disable: this.disable,
		};
	}

	toString( ) {
		return JSON.stringify( this.toObject( ), null, '\t' );
	}

	get id( ) {
		return this._id;
	}

	get login( ) {
		return this._login;
	}

	get password( ) {
		return this._password;
	}

	get role( ) {
		return this._role;
	}

	get fullname( ) {
		return this._fullname;
	}

	get registered( ) {
		return this._registered;
	}

	get avatar( ) {
		return this._avatarURL;
	}

	get enable( ) {
		return this._enable;
	}

	get roleAs( ) {
		return this.role ? 'admin' : 'user';
	}

	get disable( ) {
		return !this.enable;
	}

	registeredAs( format ) {
		return ( this.registered ? moment( this.registered, 'x' ) : moment( ) ).format( format );
	}

	[ util.inspect.custom ]( depth, options ) {
		let obj = this.toObject( );
		if ( options.compact ) {
			delete obj.roleAs;
			delete obj.registeredAt;
			delete obj.registeredCmp;
			delete obj.disable;
		}
		return JSON.stringify( obj, null, '\t' );
	}

	out( ) {
		const obj = this.toObject( );
		delete obj.role;
		delete obj.registered;
		delete obj.registeredCmp;
		if ( obj.enable ) delete obj.disable;
		delete obj.enable;
		return obj;
	}

}

module.exports.User = User;
