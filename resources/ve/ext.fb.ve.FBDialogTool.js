/**
 *
 */
( function ( ve, OO ) {

	OO.inheritClass( FBDialogTool, ve.ui.FragmentWindowTool );

	function FBDialogTool( toolGroup, config ) {
		FBDialogTool.super.call( this, toolGroup, config );
	};

	FBDialogTool.static.name = 'FBDialogTool';
	FBDialogTool.static.group = 'object';
	FBDialogTool.static.icon = 'folderPlaceholder';
	FBDialogTool.static.title = OO.ui.deferMsg( 'fb-ve-inspector-title' );
	FBDialogTool.static.modelClasses = [ ve.dm.FBNode ];
	FBDialogTool.static.commandName = 'FBDialog';

	/* Registration */

	ve.ui.toolFactory.register( FBDialogTool );

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'FBDialog', 'window', 'open',
			{ args: [ 'FBDialog' ], supportedSelections: [ 'linear' ] }
		)
	);

	ve.ui.commandRegistry.register(
		new ve.ui.Command(
			'FBInspector', 'window', 'open',
			{ args: [ 'FBInspector' ], supportedSelections: [ 'linear' ] }
		)
	);

	ve.ui.sequenceRegistry.register(
		new ve.ui.Sequence( 'wikitextFB', 'FBDialog', '#fb:', 4 )
	);

	ve.ui.commandHelpRegistry.register( 'insert', 'FBDialog', {
		sequences: [ 'wikitextFB' ],
		label: 'Title2' //OO.ui.deferMsg( 'score-visualeditor-mwscoreinspector-title' )
	} );
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

}( ve, OO ) );
