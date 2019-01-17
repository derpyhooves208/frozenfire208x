// https://mongodb.github.io/node-mongodb-native/
// http://mongodb.github.io/node-mongodb-native/3.1/
// http://mongodb.github.io/node-mongodb-native/3.1/api/
const process = require( 'process' );
const { MongoClient, ObjectID } = require( 'mongodb' );

const mongoAuthString = process.env.MONGO_AUTH;
const mongoDBname = process.env.MONGO_DB;
const client = new MongoClient(
	mongoAuthString, {
		authSource: mongoDBname,
		poolSize: 2,
		autoReconnect: true,
		noDelay: true,
		keepAlive: 30000,
		useNewUrlParser: true,
	} );


const open = ( db, collection ) => {
	return new Promise( ( resolve, reject ) => {
		const done = ( error, table ) => error ? reject( error ) : resolve( table );
		const connected = ( ) => client.db( db ).collection( collection, {}, done );
		const connecting = ( error ) => error ? reject( error ) : connected( );
		client.isConnected( ) ? connected( ) : client.connect( connecting );
	} );
};
const close = ( ) => {}; //setTimeout( ( ) => client.close( ), 100 );
const optioned = ( options ) => {
	const result = {};
	const o = options || {};
	if ( o.hint instanceof Object ) result.hint = o.hint;
	if ( o.projection instanceof Object ) result.projection = o.projection;
	if ( o.skip && Number( o.skip ) > 0 ) result.skip = Number( o.skip );
	if ( o.limit && Number( o.limit ) > 0 ) result.limit = Number( o.limit );
	if ( o.sort instanceof Object ) result.sort = o.sort;
	if ( o.timeout === !!o.timeout ) result.timeout = o.timeout;
	return result;
}


const ObjectId = module.exports.id = ObjectID;

const count = module.exports.count = async (
	collection,
	filter,
	options,
) => {
	const table = await open( mongoDBname, collection );
	const data = await table.find( filter, optioned( options ) ).count( );
	close( );
	return data || 0;
};

const find = module.exports.find = async (
	collection,
	filter,
	options,
) => {
	const table = await open( mongoDBname, collection );
	const data = await table.find( filter, optioned( options ) ).toArray( );
	close( );
	return data || [ ];
};

const findOne = module.exports.findOne = async (
	collection,
	filter,
	options,
) => {
	const table = await open( mongoDBname, collection );
	const data = await table.findOne( filter, optioned( options ) );
	close( );
	return data;
};

const insertOne = module.exports.insertOne = async (
	collection,
	record,
) => {
	const options = {};
	const table = await open( mongoDBname, collection );
	const data = await table.insertOne( record, options );
	close( );
	return data || {};
};

const updateOne = module.exports.updateOne = async (
	collection,
	filter,
	record,
	set = true,
) => {
	const options = { upsert: true };
	const table = await open( mongoDBname, collection );
	const update = set ? { $set: record } : record;
	const data = await table.updateOne( filter, update, options );
	close( );
	return data || {};
}

const removeOne = module.exports.removeOne = async (
	collection,
	filter,
) => {
	const options = {};
	const table = await open( mongoDBname, collection );
	const data = await table.deleteOne( filter, options );
	close( );
	return data || {};
}
