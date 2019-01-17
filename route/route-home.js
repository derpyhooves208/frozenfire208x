module.exports = async ( app ) => {
	app.get( '/', async ( req, res ) => {
		const data = {};
		const render = ( E, out ) => res.status( E ? 404 : 200 ).end( E ? '.' : out );
		res.render( 'index', data, render );
	} );
}
