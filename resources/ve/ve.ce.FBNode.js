/*!
 * VisualEditor ContentEditable MWMathNode class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global ve, OO */

/**
 * ContentEditable MediaWiki math node.
 *
 * @class
 * @extends ve.ce.MWTransclusionInlineNode
 *
 * @constructor
 * @param {ve.dm.MWMathNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.FBNode = function VeCeMWMathNode() {
	// Parent constructor
	ve.ce.FBNode.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.FBNode, ve.ce.MWTransclusionInlineNode );

/* Static Properties */

ve.ce.FBNode.static.name = 'mwMath';

ve.ce.FBNode.static.primaryCommandName = 'math';

/* Methods */

/**
 * @inheritdoc
 */
ve.ce.FBNode.prototype.onSetup = function () {
	// Parent method
	ve.ce.FBNode.super.prototype.onSetup.call( this );

	// DOM changes
	this.$element.addClass( 've-ce-mwMathNode' );
};

/**
 * @inheritdoc ve.ce.GeneratedContentNode
 */
ve.ce.FBNode.prototype.validateGeneratedContents = function ( $element ) {
	return !( $element.find( '.error' ).addBack( '.error' ).length );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.FBNode );
