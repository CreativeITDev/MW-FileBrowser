/**
 *
 */
( function ( mw ) {

	mw.fb = mw.fb || {};
	mw.fb.widgets = mw.fb.widgets || {};

	mw.fb.apiFail = function( code, response ) {
		var error;

		if ( response && response.exception ) {
			error = response.exception;
		} else {
			error = 'Error: ' + code;
			if ( response && response.error && response.error.info ) {
				error = error + ', ' + response.error.info;
			}
		}
		OO.ui.alert( error, { size: 'large' } );
	};

}( mediaWiki ) );
