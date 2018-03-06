/**
 *
 */
( function ( ve, OO, $ ) {

	/* ve.ce.FBNode */

	ve.ce.MWFBNode = function VeCeMWFBNode() {
		// Parent constructor
		ve.ce.MWFBNode.super.apply( this, arguments );

//		this.$link = $( '<a>' ).appendTo( this.$element );

		// Events
//		this.model.connect( this, { update: 'onUpdate' } );

		// Initialization
//		this.onUpdate();
	};

	/* Inheritance */

	OO.inheritClass( ve.ce.MWFBNode, ve.ce.MWTransclusionNode );

	/* Static Properties */

	ve.ce.MWFBNode.static.name = 'mwFileBrowser';

	ve.ce.MWFBNode.static.primaryCommandName = 'FBDialog';

	/* Methods */

//	ve.ce.MWFBNode.prototype.onUpdate = function () {
//		var childNodes = this.$element && this.$element[0] && this.$element[0].childNodes,
//			data = childNodes && childNodes[0] && childNodes[0].data;
//
//		if ( data ) {
//			this.$element.empty().append( data );
//		}
//	};

	ve.ce.MWFBNode.prototype.getRenderedDomElements = function () {
		var childNodes = arguments[0],
			element;

		if ( childNodes[0].nodeType === Node.TEXT_NODE ) {
			if ( childNodes[0].data.substr( 0, 2 ) === '<a' ) { // it is not error message
				arguments[0][0] = $( childNodes[0].data )[0];
			}
		} else {
			element = childNodes[0];
			childNodes = element.childNodes;
			if ( childNodes && childNodes[0] && childNodes[0].nodeType === Node.TEXT_NODE ) {
				if ( childNodes[0].data.substr( 0, 2 ) === '<a' ) { // it is not error message
					element.replaceChild( $( childNodes[0].data )[0], childNodes[0] );
				}
			}
		}

		// Parent method
		return ve.ce.MWFBNode.super.prototype.getRenderedDomElements.apply( this, arguments );
	};

	/* Registration */

	ve.ce.nodeFactory.register( ve.ce.MWFBNode );





//	/* ve.dm.MWFBNode */
//
//	ve.dm.MWFBNode = function VeDmMWFBNode() {
//		// Parent constructor
//		ve.dm.MWFBNode.super.apply( this, arguments );
//	};
//
//	/* Inheritance */
//
//	OO.inheritClass( ve.dm.MWFBNode, ve.dm.MWTransclusionNode );
//
//	/* Static Properties */
//
//	ve.dm.MWFBNode.static.name = 'mwFileBrowser';
//	ve.dm.MWFBNode.static.blockType = 'mwFileBrowser';
//	ve.dm.MWFBNode.static.inlineType = 'mwFileBrowser';
//	ve.dm.MWFBNode.static.isContent = true;
//
//	/* Static Methods */
//
//	ve.dm.MWFBNode.static.matchFunction = function ( domElement ) {
//		var mwDataJSON = domElement.getAttribute( 'data-mw' ),
//			mwData = mwDataJSON && JSON.parse( mwDataJSON ),
//			template = mwData && mwData.parts && mwData.parts[0] && mwData.parts[0].template,
//			funct = template && template.target && template.target.function;
//
//		return funct === 'fb';
//	};
//
//	/* Registration */
//
//	ve.dm.modelRegistry.register( ve.dm.MWFBNode );



	/* MWFBContextItem */

	ve.ui.MWFBContextItem = function VeUiMWFBContextItem() {
		// Parent constructor
		ve.ui.MWFBContextItem.super.apply( this, arguments );
	};

	/* Inheritance */

	OO.inheritClass( ve.ui.MWFBContextItem, ve.ui.LinearContextItem );

	/* Static Properties */

	ve.ui.MWFBContextItem.static.embeddable = false;

	ve.ui.MWFBContextItem.static.name = 'FB';

	ve.ui.MWFBContextItem.static.icon = 'fb-folder-open';

	ve.ui.MWFBContextItem.static.label = OO.ui.deferMsg( 'fb-ve-dialog-title' );

	ve.ui.MWFBContextItem.static.modelClasses = [ ve.dm.MWFBNode ];

	ve.ui.MWFBContextItem.static.commandName = 'FBDialog';

	/* Registration */

	ve.ui.contextItemFactory.register( ve.ui.MWFBContextItem );





	/* FBDialogTool */

	ve.ui.MWFBDialogTool = function VeUiMWFBDialogTool( toolGroup, config ) {
		ve.ui.MWFBDialogTool.super.call( this, toolGroup, config );
	};

	/* Inheritance */

	OO.inheritClass( ve.ui.MWFBDialogTool, ve.ui.FragmentWindowTool );

	/* Static Properties */

	ve.ui.MWFBDialogTool.static.name = 'FBDialogTool';
	ve.ui.MWFBDialogTool.static.group = 'object';
	ve.ui.MWFBDialogTool.static.icon = 'fb-folder-open';
	ve.ui.MWFBDialogTool.static.title = OO.ui.deferMsg( 'fb-ve-inspector-title' );
	ve.ui.MWFBDialogTool.static.modelClasses = [ ve.dm.MWFBNode ];
	ve.ui.MWFBDialogTool.static.commandName = 'FBDialog';

	/* Registration */

	ve.ui.toolFactory.register( ve.ui.MWFBDialogTool );

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'FBDialog', 'window', 'open',
			{ args: [ 'FBDialog' ], supportedSelections: [ 'linear' ] }
		)
	);

//	ve.ui.commandRegistry.register(
//		new ve.ui.Command(
//			'FBInspector', 'window', 'open',
//			{ args: [ 'FBInspector' ], supportedSelections: [ 'linear' ] }
//		)
//	);

//	ve.ui.sequenceRegistry.register(
//		new ve.ui.Sequence( 'wikitextFB', 'FBDialog', '{{#fb', 4 )
//	);
//
//	ve.ui.commandHelpRegistry.register( 'insert', 'FBDialog', {
//		sequences: [ 'wikitextFB' ],
//		label: 'Title2' //OO.ui.deferMsg( 'score-visualeditor-mwscoreinspector-title' )
//	} );
	/*
	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'mathDialog', 'window', 'open',
			{ args: [ 'mathDialog' ], supportedSelections: [ 'linear' ] }
		)
	);

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'mathInspector', 'window', 'open',
			{ args: [ 'mathInspector' ], supportedSelections: [ 'linear' ] }
		)
	);

	ve.ui.sequenceRegistry.register(
		new ve.ui.Sequence( 'wikitextMath', 'mathDialog', '<math', 5 )
	);

	ve.ui.commandHelpRegistry.register( 'insert', 'mathDialog', {
		sequences: [ 'wikitextMath' ],
		label: OO.ui.deferMsg( 'fb-ve-inspector-title' )
	} );
	*/

}( ve, OO, jQuery ) );
