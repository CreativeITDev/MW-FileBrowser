/*!
 * VisualEditor MWMathContextItem class.
 *
 * @copyright 2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a math node.
 *
 * @class
 * @extends ve.ui.LinearContextItem
 *
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.FBContextItem = function VeUiFBContextItem() {
	// Parent constructor
	ve.ui.FBContextItem.super.apply( this, arguments );

	this.quickEditButton = new OO.ui.ButtonWidget( {
		label: ve.msg( 'math-visualeditor-mwmathcontextitem-quickedit' ),
		flags: [ 'progressive' ]
	} );

	this.actionButtons.addItems( [ this.quickEditButton ], 0 );

	this.quickEditButton.connect( this, { click: 'onInlineEditButtonClick' } );

	// Initialization
	this.$element.addClass( 've-ui-mwMathContextItem' );
};

/* Inheritance */

OO.inheritClass( ve.ui.FBContextItem, ve.ui.LinearContextItem );

/* Static Properties */

ve.ui.FBContextItem.static.name = 'math';

ve.ui.FBContextItem.static.icon = 'math';

ve.ui.FBContextItem.static.label = OO.ui.deferMsg( 'math-visualeditor-mwmathinspector-title' );

ve.ui.FBContextItem.static.modelClasses = [ ve.dm.FileBrowser ];

ve.ui.FBContextItem.static.embeddable = false;

ve.ui.FBContextItem.static.commandName = 'mathDialog';

/* Methods */

/**
 * Handle inline edit button click events.
 */
ve.ui.FBContextItem.prototype.onInlineEditButtonClick = function () {
	this.context.getSurface().executeCommand( 'mathInspector' );
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.FBContextItem );

mw.log( 'FBContextItem ' + Date() );
