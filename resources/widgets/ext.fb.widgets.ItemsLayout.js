/**
 *
 */
( function ( $, mw, OO ) {

	mw.fb.widgets.ItemsLayout = ItemsLayout;

	OO.inheritClass( ItemsLayout, OO.ui.PanelLayout );
	OO.mixinClass( ItemsLayout, OO.ui.mixin.PendingElement );
	OO.mixinClass( ItemsLayout, OO.ui.mixin.GroupElement );

	function ItemsLayout( config ) {
		// Configuration initialization
		config = $.extend( {
			expanded: false,
			framed: true,
			padded: true,
			emptyLabel: true
		}, config );

		// Parent constructor
		ItemsLayout.super.call( this, config );

		// Mixin constructors
		this.$itemsElement = config.$itemsElement || $( '<div class="fb-items-layout">' );
		OO.ui.mixin.PendingElement.call( this, $.extend( { $pending: this.$element }, config ) );
		OO.ui.mixin.GroupElement.call( this, $.extend( {}, config, { $group: this.$itemsElement } ) );

		// Initialization
		this.$topElement = config.$topElement || $( '<div class="fb-top-element">');
		this.$bottomElement = config.$bottomElement || $( '<div class="fb-bottom-element">');
		this.$element.append( this.$topElement, this.$itemsElement, this.$bottomElement );

		if ( config.emptyLabel ) {
			this.$itemsElement.append( $( '<div class="fb-list-empty">' ).append( new OO.ui.ButtonWidget( {
				label: mw.msg( 'fb-list-empty' ),
				framed: false,
				icon: 'info',
				disabled: true
			} ).$element ) );
		}

		if ( config.items ) {
			this.addItems( config.items );
		}
	}

	ItemsLayout.prototype.addItems = function( items ) {
		$.each( items, function( index, obj ) {
			obj.$element.toggleClass( 'fb-item', true );
		} );

		return OO.ui.mixin.GroupElement.prototype.addItems.apply( this, arguments );
	};

	ItemsLayout.prototype.destroyItems = function () {
		var oldItems = this.getItems();

		if ( oldItems.length > 0 ) {
			this.clearItems();
			$.each( oldItems, function( key, item ) {
				item.$element.remove();
			} );
		}
	};

}( jQuery, mediaWiki, OO ) );
