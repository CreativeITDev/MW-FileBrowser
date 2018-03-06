/*!
 * VisualEditor DataModel MWMathNode class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global ve, OO */

/**
 * DataModel MediaWiki math node.
 *
 * @class
 * @extends ve.dm.MWTransclusionInlineNode
 *
 * @constructor
 * @param {Object} [element]
 */
ve.dm.FBNode = function VeDmMWMathNode() {
	// Parent constructor
	ve.dm.FBNode.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.dm.FBNode, ve.dm.MWTransclusionInlineNode );

/* Static members */

ve.dm.FBNode.static.name = 'filebrowser';

/* Static Methods */

/**
 * @inheritdoc ve.dm.GeneratedContentNode
 */
ve.dm.FBNode.static.getHashObjectForRendering = function ( dataElement ) {
	// Parent method
	var hashObject = ve.dm.FBNode.super.static.getHashObjectForRendering.call( this, dataElement );

	// The id does not affect the rendering.
	if ( hashObject.mw.attrs ) {
		delete hashObject.mw.attrs.id;
	}
	return hashObject;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.FBNode );
