/*!
 * VisualEditor DataModel MWTransclusionModel class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

( function () {

	ve.dm.MWFBModel = function VeDmMWFBModel() {
		// Parent constructor
		ve.dm.MWFBModel.super.apply( this, arguments );
	};

	/* Inheritance */

	OO.inheritClass( ve.dm.MWFBModel, ve.dm.MWTransclusionModel );

	/* Methods */

	/**
	 * Insert transclusion at the end of a surface fragment.
	 *
	 * If forceType is not specified and this is used in async mode, users of this method
	 * should ensure the surface is not accessible while the type is being evaluated.
	 *
	 * @param {ve.dm.SurfaceFragment} surfaceFragment Surface fragment after which to insert.
	 * @param {boolean|undefined} [forceType] Force the type to 'inline' or 'block'. If not
	 *   specified it will be evaluated asynchronously.
	 * @return {jQuery.Promise} Promise which resolves when the node has been inserted. If
	 *   forceType was specified this will be instant.
	 */
	ve.dm.MWFBModel.prototype.insertTransclusionNode = function ( surfaceFragment, forceType ) {
		var model = this,
			deferred = $.Deferred(),
			baseNodeClass = ve.dm.MWFBNode;

		function insertNode( isInline, generatedContents ) {
			var hash, store, nodeClass,
				type = isInline ? baseNodeClass.static.inlineType : baseNodeClass.static.blockType,
				range = surfaceFragment.getSelection().getCoveringRange(),
				data = [
					{
						type: type,
						attributes: {
							mw: model.getPlainObject()
						}
					},
					{ type: '/' + type }
				];

			// If we just fetched the generated contents, put them in the store
			// so we don't do a duplicate API call later.
			if ( generatedContents ) {
				nodeClass = ve.dm.modelRegistry.lookup( type );
				store = surfaceFragment.getDocument().getStore();
				hash = OO.getHash( [ nodeClass.static.getHashObjectForRendering( data[ 0 ] ), undefined ] );
				store.index( generatedContents, hash );
			}

			if ( range.isCollapsed() ) {
				surfaceFragment.insertContent( data );
			} else {
				// Generate a replacement transaction instead of using surfaceFragment.insertContent
				// (which generates a removal and insertion) as blanking a reference triggers T135127.
				// TODO: Once T135127 is fixed, revert to using surfaceFragment.insert.
				surfaceFragment.getSurface().change(
					ve.dm.TransactionBuilder.static.newFromReplacement( surfaceFragment.getDocument(), range, data )
				);
			}
			deferred.resolve();
		}

		if ( forceType ) {
			insertNode( forceType === 'inline' );
		} else {
			new mw.Api().post( {
				action: 'visualeditor',
				paction: 'parsefragment',
				page: ve.init.target.pageName,
				wikitext: baseNodeClass.static.getWikitext( this.getPlainObject() ),
				pst: 1
			} ).then( function ( response ) {
				var contentNodes;

				if ( ve.getProp( response, 'visualeditor', 'result' ) === 'success' ) {
					contentNodes = $.parseHTML( response.visualeditor.content, surfaceFragment.getDocument().getHtmlDocument() ) || [];
					contentNodes = ve.ce.MWTransclusionNode.static.filterRendering( contentNodes );
					insertNode(
						baseNodeClass.static.isHybridInline( contentNodes, ve.dm.converter ),
						contentNodes
					);
				} else {
					// Request failed - just assume inline
					insertNode( true );
				}
			}, function () {
				insertNode( true );
			} );
		}
		return deferred.promise();
	};

}() );
