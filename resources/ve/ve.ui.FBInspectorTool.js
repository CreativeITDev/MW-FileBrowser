/*!
 * VisualEditor UserInterface MWScoreInspectorTool class.
 *
 * @copyright 2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki UserInterface score tool.
 *
 * @class
 * @extends ve.ui.FragmentInspectorTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */

ve.ui.FBInspectorTool = function VeFBInspectorTool( toolGroup, config ) {
	ve.ui.FBInspectorTool.super.call( this, toolGroup, config );
};
OO.inheritClass( ve.ui.FBInspectorTool, ve.ui.FragmentInspectorTool );
ve.ui.FBInspectorTool.static.name = 'filebrowser';
ve.ui.FBInspectorTool.static.group = 'object';
ve.ui.FBInspectorTool.static.icon = 'filebrowser';
ve.ui.FBInspectorTool.static.title = 'Title1';
//OO.ui.deferMsg(
//	'score-visualeditor-mwscoreinspector-title'
//);
ve.ui.FBInspectorTool.static.modelClasses = [ ve.dm.FBNode ];
ve.ui.FBInspectorTool.static.commandName = 'filebrowser';
ve.ui.toolFactory.register( ve.ui.FBInspectorTool );

ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextFB', 'FBDialog', '{{#fb', 4 )
);

ve.ui.commandHelpRegistry.register( 'insert', 'FBDialog', {
	sequences: [ 'wikitextFB' ],
	label: 'Title2' //OO.ui.deferMsg( 'score-visualeditor-mwscoreinspector-title' )
} );
