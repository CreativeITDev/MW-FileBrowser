/**
 *
 */
( function ( ve, OO, mw, $ ) {

	OO.inheritClass( FBSearchInputWidget, OO.ui.SearchInputWidget );
	OO.mixinClass( FBSearchInputWidget, OO.ui.mixin.RequestManager );

	function FBSearchInputWidget ( config ) {
		// Configuration initialization
		config = config || {};

		// Parent constructor
		FBSearchInputWidget.super.call( this, config );

		// Mixin constructors
		OO.ui.mixin.RequestManager.call( this, config );

		// Initialize
		var cfg = mw.config.get( 'extFileBrowserConfig' );
		this.searchMinChars = cfg.searchMinChars || 3;
		this.mwApi = config.mwApi || new mw.Api();
		this.dialog = config.dialog;
		this.debouncedSendRequestData = OO.ui.debounce( this.sendRequestData, cfg.searchDelay || 1000 );

		// Events
		this.connect( this, { change: 'onValueChange' } );
	}

	FBSearchInputWidget.prototype.getRequestQuery = function () {
		return this.getValue();
	};

	FBSearchInputWidget.prototype.getRequest = function () {
		return  this.mwApi.get( {
			action: 'filebrowser',
			task: 'search',
			term: this.getRequestQuery()
		} );
	};

	FBSearchInputWidget.prototype.getRequestCacheDataFromResponse = function ( response ) {
		return response.result && response.result.search || {};
	};

	FBSearchInputWidget.prototype.onValueChange = function () {
		var value = this.getValue();

		if ( this.skipChanges ) {
			return;
		}

		if ( value.length >= this.searchMinChars ) {
			this.debouncedSendRequestData();
		} else if ( !value.length ) {
			this.dialog.getFileList();
		}
	};

	FBSearchInputWidget.prototype.sendRequestData = function () {
		var widget = this,
			value = this.getValue();

		if ( value.length >= this.searchMinChars ) {
			this.getRequestData().done( function ( data ) {
				var items = widget.getOptionsFromData( data );
				widget.dialog.drawFileList( items );
			} );
		}
	};

	FBSearchInputWidget.prototype.reset = function () {
		if ( this.getValue() ) {
			this.skipChanges = true;
			this.setValue( '' );
			this.skipChanges = false;
		}
	};

	FBSearchInputWidget.prototype.getOptionsFromData = function ( data ) {
		return $.map( data, this.dialog.newFileItem.bind( this.dialog ) );
	};



	/* FBDialog */

	OO.inheritClass( FBDialog, ve.ui.NodeDialog );

	function FBDialog ( config ) {
		// Configuration initialization
		config = config || {};

		// Parent constructor
		FBDialog.super.call( this, config );

		// Initialize
		this.mwApi = config.mwApi || new mw.Api();
	};

	/* Static properties */
	FBDialog.static.modelClasses = [ ve.dm.MWFBNode ];
	FBDialog.static.name = 'FBDialog';
	FBDialog.static.title = OO.ui.deferMsg( 'fb-ve-dialog-title' );
	FBDialog.static.size = 'large';
	FBDialog.static.modelClasses = [ ve.dm.MWFBNode ];
	FBDialog.static.dir = 'ltr';
	FBDialog.static.actions = [
		{
			label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
			flags: [ 'safe', 'back' ],
			modes: [ 'insert', 'edit' ]
		},
		{
			action: 'backChoose',
			icon: 'previous',
			label: OO.ui.deferMsg( 'fb-ve-dialog-action-choose-file' ),
			flags: [ 'safe', 'back' ],
			modes: [ 'editSecondStep', 'insertSecondStep' ]
		},
		{
			action: 'apply',
			label: OO.ui.deferMsg( 'visualeditor-dialog-action-apply' ),
			flags: [ 'progressive', 'primary' ],
			modes: [ 'edit', 'editSecondStep' ],
			disabled: true
		},
		{
			action: 'insert',
			label: OO.ui.deferMsg( 'visualeditor-dialog-action-insert' ),
			flags: [ 'primary', 'constructive' ],
			modes: [ 'insert', 'insertSecondStep' ],
			disabled: true
		}
	];


	/* Methods */

	FBDialog.prototype.getSetupProcess = function ( data ) {
		data = data || {};
		return ve.ui.MWTemplateDialog.super.prototype.getSetupProcess.call( this, data )
			.next( function () {
				var parts, template, target, params, tmp, path, file;

				this.transclusionModel = new ve.dm.MWFBModel();
				this.searchInput.reset();

				// Initialization
				if ( !this.selectedNode ) {
					this.actionMode = 'insert';
					this.actions.setMode( 'insert' );
					this.swithToStep( true );
				} else {
					this.actionMode = 'edit';
					parts = this.selectedNode.getAttribute( 'mw' ).parts;
//					parts = this.selectedNode.getPartsList();
					template = parts && parts[0] && parts[0].template;
					target = template && template.target || {};
					params = template && template.params || {};
					tmp = target.wt && target.wt.split( ':' ); // #fb:/filename
					tmp.shift();
					path = tmp.join( ':' );
					this.filePath = path.split( '/' );
					if ( this.filePath[0] === '' ) { // path begin from '/'
						this.filePath.shift();
					}
					file = this.filePath.pop();
					this.onFileClick( file, null, params.name && params.name.wt );

//					this.actionMode = 'edit';
//					this.actions.setMode( 'editSecondStep' );
//					this.swithToStep( false );
					// Load existing template
//					promise = this.transclusionModel
//						.load( ve.copy( this.selectedNode.getAttribute( 'mw' ) ) )
//						.done( this.initializeTemplateParameters.bind( this ) );
//					}
				}

			}, this );
	};

	FBDialog.prototype.swithToStep = function ( isFirst ) {
		this.searchInput.toggle( isFirst );
		this.pathLayout.toggle( isFirst );
		this.secondStepLayout.toggle( !isFirst );
		this.actions.setAbilities( { apply: !isFirst, insert: !isFirst } );
		this.initPromise.done( function() {
			this.files.toggle( isFirst );
		}.bind( this ) );
	};

	FBDialog.prototype.getActionProcess = function ( action ) {
		var dialog = this;

		if ( action === 'apply' || action === 'insert' ) {
			return new OO.ui.Process( function () {
				var deffered = $.Deferred(),
					filepath = dialog.ssFilePath.getLabel(),
					name = dialog.ssLinkText.getValue(),
					part = new ve.dm.MWTemplateModel( dialog.transclusionModel, { wt: '#fb:' + filepath, function: 'fb' } ),
					linkNameParam = new ve.dm.MWParameterModel( part, 'name', name );
//					linkTitleParam = new ve.dm.MWParameterModel( part, 'title', name );

				dialog.pushPending();

				part.addParameter( linkNameParam );
//				part.addParameter( linkTitleParam );

				dialog.transclusionModel.addPart( part, 0 ).done( function() {
					var surfaceModel = dialog.getFragment().getSurface(),
						obj = dialog.transclusionModel.getPlainObject();

					if ( dialog.selectedNode instanceof ve.dm.MWFBNode ) {
						dialog.transclusionModel.updateTransclusionNode( surfaceModel, dialog.selectedNode );
						// TODO: updating the node could result in the inline/block state change
						deffered.resolve();
					} else if ( obj !== null ) {
						// Collapse returns a new fragment, so update dialog.fragment
						dialog.fragment = dialog.getFragment().collapseToEnd();
						dialog.transclusionModel.insertTransclusionNode( dialog.getFragment() ).done( function () {
							deffered.resolve();
						} );
					}
				} );

				return deffered.promise().then( function () {
					dialog.close( { action: action } ).closed.always( dialog.popPending.bind( dialog ) );
				} );
			} );
		} else if ( action === 'secondStep' ) {
			return new OO.ui.Process( function () {
				if ( this.actionMode === 'edit' ) {
					dialog.actions.setMode( 'editSecondStep' );
				} else {
					dialog.actions.setMode( 'insertSecondStep' );
				}
				dialog.swithToStep( false );
			} );
		} else if ( action === 'backChoose' ) {
			return new OO.ui.Process( function () {
				dialog.swithToStep( true );
				dialog.actions.setMode( dialog.actionMode );
			} );
		}

		return FBDialog.super.prototype.getActionProcess.apply( this, arguments );
	};

	FBDialog.prototype.initialize = function () {
		// Parent method
		FBDialog.super.prototype.initialize.apply( this, arguments );

		this.filePath = [];
		this.searchInput = new FBSearchInputWidget( { dialog: this } );
//		this.searchLayout = new OO.ui.PanelLayout( { padded: false, expanded: false, framed: false, content: [this.searchInput] } );

		this.pathRootButton = new OO.ui.ButtonWidget( { label: 'root', icon: 'next', framed: false } );
		this.pathRootButton.on( 'click', this.onPathClick, [ false ], this );
		this.pathLayout = new OO.ui.PanelLayout( { padded: false, expanded: false } );
		this.errorLabel = new OO.ui.LabelWidget( { classes: [ 'fb-error' ] } );
		this.content = new OO.ui.PanelLayout( { padded: true, expanded: true } );
		this.content.$element.append( this.searchInput.$element, this.pathLayout.$element );
		this.$body.append( this.content.$element );

		this.ssFilePath = new OO.ui.ButtonWidget( { framed: false } );
		this.ssLinkText = new OO.ui.InputWidget();
//		this.ssLinkTitle = new OO.ui.InputWidget();
		this.secondStepLayout = new OO.ui.FieldsetLayout();
		this.secondStepLayout.toggle( false );
		this.secondStepLayout.$element.appendTo( this.content.$element );
		this.secondStepLayout.addItems( [
			new OO.ui.FieldLayout( this.ssFilePath, {
				label: 'File path'
			} ),
			new OO.ui.FieldLayout( this.ssLinkText, {
				label: 'Name'
			} )
//				label: 'Link text'
//			} ),
//			new OO.ui.FieldLayout( this.ssLinkTitle, {
//				label: 'Link title'
//			} )
		] );

		this.pushPending();
		this.initPromise = mw.loader.using( 'ext.fb.widgets.ItemsLayout' ).done( function () {
			this.files = new mw.fb.widgets.ItemsLayout( { framed: false, padded: false } );
			this.files.$topElement.append( this.errorLabel.$element );
//			this.files.aggregate( { click: 'itemClick' } );
//			this.files.connect( this, { itemClick: 'onItemClick' } );
			this.content.$element.append( this.files.$element );
			this.popPending();
		}.bind( this ) );
	};

	FBDialog.prototype.getReadyProcess = function ( data ) {
		return FBDialog.super.prototype.getReadyProcess.call( this, data ).next( this.getFileList, this );
	};

	FBDialog.prototype.getBodyHeight = function () {
		return 600;
	};

	FBDialog.prototype.getFileList = function () {
		var widget = this;

		function doit() {
			widget.files.pushPending();
		}

		if ( widget.files ) {
			doit();
		} else {
			this.initPromise.done( doit );
		}

		this.mwApi.get( {
			action: 'filebrowser',
			task: 'browse',
			path: this.filePath.join( '/' )
		} ).done( this.onRequestDone.bind( this ) ).fail( this.onApiFail.bind( this ) );
	};

	FBDialog.prototype.onApiFail = function ( code, response ) {
		mw.loader.using( 'ext.fb.widgets' ).done( function() {
			var error;

			if ( response && response.exception ) {
				error = response.exception;
			} else {
				error = 'Error: ' + code;
				if ( response && response.error && response.error.info ) {
					error = error + ', ' + response.error.info;
				}
			}

			this.errorLabel.setLabel( error );
		}.bind( this ) );

		this.initPromise.done( function() {
			this.files.popPending();
		}.bind( this ) );

		this.filePath.pop(); // Remove last path since error happened
	};

	FBDialog.prototype.onRequestDone = function ( response ) {
		var dialog = this,
			result = response && response.result,
			dir = result && result.dir || {},
			file = result && result.file || {},
			items;

		this.errorLabel.setLabel( result.error );
		this.filePath = result.path || [];
		this.pathRootButton.$element.detach();
		this.pathLayout.$element.empty().append( this.pathRootButton.$element );
		$.each( this.filePath, function ( index, dir ) {
			var button = new OO.ui.ButtonWidget( { label: dir, icon: 'next', framed: false } );
			button.on( 'click', this.onPathClick, [ this.filePath.slice( 0, index + 1 ) ], this );
			this.pathLayout.$element.append( button.$element );
		}.bind( this ) );

		items = $.map( dir, function ( data ) {
			var dirName = new OO.ui.ButtonWidget( { label: data.name, icon: 'fb-folder', framed: false } );

			dirName.on( 'click', dialog.onDirectoryClick, [ data.name ], dialog );
			return new OO.ui.PanelLayout( { content: [ dirName ], expanded: false, padded: false } );
		} );
		items = items.concat( $.map( file, this.newFileItem.bind( this ) ) );
		this.drawFileList( items );
	};

	FBDialog.prototype.newFileItem = function ( data ) {
		var fileSize = new OO.ui.LabelWidget( { label: data.size } ),
			name = (data.path ? '/' + (data.path.length ? data.path.join( '/' ) + '/' : '') : '') + data.name,
			fileName = new OO.ui.ButtonWidget( { label: name, icon: 'fb-file', framed: false } );

		fileName.$element.append( fileSize.$element );
		fileName.on( 'click', this.onFileClick, [ data.name, data.path ], this );
		return new OO.ui.PanelLayout( { content: [ fileName, fileSize ], expanded: false, padded: false } );
	};

	FBDialog.prototype.drawFileList = function ( items ) {
		var widget = this;

		function doit() {
			widget.files.clearItems();
			widget.files.addItems( items );
			if ( widget.files.isPending() ) {
				widget.files.popPending();
			}
		}

		if ( widget.files ) {
			doit();
		} else {
			this.initPromise.done( doit );
		}
	};

	FBDialog.prototype.onDirectoryClick = function ( name ) {
		this.filePath.push( name );
		this.getFileList();
	};

	FBDialog.prototype.onFileClick = function ( file, filePath, linkText ) {
		var path = filePath || this.filePath,
			pathString = path.length ? '/' + path.join( '/' ) + '/' : '/',
			filepath = pathString + file;

//		mw.log( 'onFileClick: ' + filepath );

		this.ssFilePath.setLabel( filepath );
		this.ssLinkText.setValue( linkText || file );

		this.executeAction( 'secondStep' );
	};

	FBDialog.prototype.onPathClick = function ( path ) {
		this.searchInput.reset();
		this.filePath = path || [];
		this.getFileList();
	};

	/* Registration */

	ve.ui.windowFactory.register( FBDialog );

}( ve, OO, mediaWiki, jQuery ) );
