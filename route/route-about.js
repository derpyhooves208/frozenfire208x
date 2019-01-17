module.exports = async ( app ) => {
	app.get( '/about', async ( req, res ) => {
		const data = {};
		const render = ( E, out ) => res.status( E ? 404 : 200 ).end( E ? '.' : out );
		res.render( 'about', data, render );
	} );
}
