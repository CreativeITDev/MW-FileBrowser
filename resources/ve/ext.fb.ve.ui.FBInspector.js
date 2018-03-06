/*!
 * VisualEditor UserInterface MWMathInspector class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global ve, OO */

/**
 * MediaWiki math inspector.
 *
 * @class
 * @extends ve.ui.MWLiveExtensionInspector
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.FBInspector = function VeUiFBInspector( config ) {
	// Parent constructor
	ve.ui.FBInspector.super.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.FBInspector, ve.ui.MWLiveExtensionInspector );

/* Static properties */

ve.ui.FBInspector.static.name = 'FBInspector';

ve.ui.FBInspector.static.title = 'Title 3'; //OO.ui.deferMsg( 'fb-ve-fbinspector-title' );

ve.ui.FBInspector.static.modelClasses = [ ve.dm.FBNode ];

ve.ui.FBInspector.static.dir = 'ltr';

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.FBInspector.prototype.initialize = function () {
	var inputField, displayField, idField;

	// Parent method
	ve.ui.FBInspector.super.prototype.initialize.call( this );

	this.displaySelect = new OO.ui.ButtonSelectWidget( {
		items: [
			new OO.ui.ButtonOptionWidget( {
				data: 'default',
				icon: 'math-display-default',
				label: ve.msg( 'math-visualeditor-mwmathinspector-display-default' )
			} ),
			new OO.ui.ButtonOptionWidget( {
				data: 'inline',
				icon: 'math-display-inline',
				label: ve.msg( 'math-visualeditor-mwmathinspector-display-inline' )
			} ),
			new OO.ui.ButtonOptionWidget( {
				data: 'block',
				icon: 'math-display-block',
				label: ve.msg( 'math-visualeditor-mwmathinspector-display-block' )
			} )
		]
	} );

	this.idInput = new OO.ui.TextInputWidget();

	inputField = new OO.ui.FieldLayout( this.input, {
		align: 'top',
		label: ve.msg( 'math-visualeditor-mwmathinspector-title' )
	} );
	displayField = new OO.ui.FieldLayout( this.displaySelect, {
		align: 'top',
		label: ve.msg( 'math-visualeditor-mwmathinspector-display' )
	} );
	idField = new OO.ui.FieldLayout( this.idInput, {
		align: 'top',
		label: ve.msg( 'math-visualeditor-mwmathinspector-id' )
	} );

	// Initialization
	this.$content.addClass( 've-ui-mwMathInspector-content' );
	this.form.$element.append(
		inputField.$element,
		this.generatedContentsError.$element,
		displayField.$element,
		idField.$element
	);
};

/**
 * @inheritdoc
 */
ve.ui.FBInspector.prototype.getSetupProcess = function ( data ) {
	return ve.ui.FBInspector.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			var display = this.selectedNode.getAttribute( 'mw' ).attrs.display || 'default';
			this.displaySelect.selectItemByData( display );
			this.displaySelect.on( 'choose', this.onChangeHandler );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.FBInspector.prototype.getTeardownProcess = function ( data ) {
	return ve.ui.FBInspector.super.prototype.getTeardownProcess.call( this, data )
		.first( function () {
			this.displaySelect.off( 'choose', this.onChangeHandler );
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.FBInspector.prototype.updateMwData = function ( mwData ) {
	var display, id;

	// Parent method
	ve.ui.FBInspector.super.prototype.updateMwData.call( this, mwData );

	display = this.displaySelect.getSelectedItem().getData();
	id = this.idInput.getValue();

	mwData.attrs.display = display !== 'default' ? display : undefined;
	mwData.attrs.id = id || undefined;
};

/**
 * @inheritdoc
 */
ve.ui.FBInspector.prototype.formatGeneratedContentsError = function ( $element ) {
	return $element.text().trim();
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.FBInspector );
