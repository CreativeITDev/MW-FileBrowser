/*!
 * VisualEditor DataModel MWTransclusionNode class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki transclusion node.
 *
 * @class
 * @abstract
 * @extends ve.dm.LeafNode
 * @mixins ve.dm.GeneratedContentNode
 * @mixins ve.dm.FocusableNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWFBNode = function VeDmMWFBNode() {
	// Parent constructor
	ve.dm.MWFBNode.super.apply( this, arguments );

	// Mixin constructors
	ve.dm.GeneratedContentNode.call( this );
	ve.dm.FocusableNode.call( this );

	// Properties
	this.partsList = null;

	// Events
	this.connect( this, { attributeChange: 'onAttributeChange' } );
};

/* Inheritance */

OO.inheritClass( ve.dm.MWFBNode, ve.dm.LeafNode );

OO.mixinClass( ve.dm.MWFBNode, ve.dm.GeneratedContentNode );

OO.mixinClass( ve.dm.MWFBNode, ve.dm.FocusableNode );

/* Static members */

ve.dm.MWFBNode.static.name = 'mwFileBrowser';

ve.dm.MWFBNode.static.matchTagNames = null;

ve.dm.MWFBNode.static.matchRdfaTypes = [ 'mw:Transclusion' ];

// Transclusion nodes can contain other types, e.g. mw:PageProp/Category.
// Allow all other types (null) so they match to this node.
ve.dm.MWFBNode.static.allowedRdfaTypes = null;

ve.dm.MWFBNode.static.isContent = true;

// HACK: This prevents any rules with higher specificity from matching,
// e.g. LanguageAnnotation which uses a match function
ve.dm.MWFBNode.static.matchFunction = function ( domElement ) {
		var mwDataJSON = domElement.getAttribute( 'data-mw' ),
			mwData = mwDataJSON && JSON.parse( mwDataJSON ),
			template = mwData && mwData.parts && mwData.parts[0] && mwData.parts[0].template,
			funct = template && template.target && template.target.function;

		return funct === 'fb';
};

//ve.dm.MWFBNode.static.enableAboutGrouping = true;
//
ve.dm.MWFBNode.static.getHashObject = function ( dataElement ) {
	return {
		type: dataElement.type,
		mw: dataElement.attributes.mw
	};
};

ve.dm.MWFBNode.static.isDiffComparable = function ( element, other ) {
	function getTemplateNames( parts ) {
		return parts.map( function ( part ) {
			return part.template ? part.template.target.wt : '';
		} ).join( '|' );
	}

	return ve.dm.MWFBNode.super.static.isDiffComparable.call( this, element, other ) &&
		getTemplateNames( element.attributes.mw.parts ) === getTemplateNames( other.attributes.mw.parts );
};

/**
 * Node type to use when the transclusion is inline
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.MWFBNode.static.inlineType = 'mwFileBrowser';

/**
 * Node type to use when the transclusion is a block
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.MWFBNode.static.blockType = 'mwFileBrowser';

///**
// * Node type to use when the transclusion is cellable
// *
// * @static
// * @property {string}
// * @inheritable
// */
//ve.dm.MWFBNode.static.cellType = 'mwFileBrowser';

ve.dm.MWFBNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement,
		mwDataJSON = domElements[ 0 ].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {},
		isInline = this.isHybridInline( domElements, converter ),
		type = isInline ? this.inlineType : this.blockType;

	dataElement = {
		type: type,
		attributes: {
			mw: mwData,
			originalMw: mwDataJSON
		}
	};

	if ( domElements.length === 1 && [ 'td', 'th' ].indexOf( domElements[ 0 ].nodeName.toLowerCase() ) !== -1 ) {
		dataElement.type = this.cellType;
		ve.dm.TableCellableNode.static.setAttributes( dataElement.attributes, domElements );
	}

	if ( !domElements[ 0 ].getAttribute( 'data-ve-no-generated-contents' ) ) {
		this.storeGeneratedContents( dataElement, domElements, converter.getStore() );
	}

	return dataElement;
};

ve.dm.MWFBNode.static.toDomElements = function ( dataElement, doc, converter ) {
	var els, i, len, span, value,
		store = converter.getStore(),
		originalMw = dataElement.attributes.originalMw,
		originalDomElements = store.value( dataElement.originalDomElementsIndex );

	function wrapTextNode( node ) {
		var wrapper;
		if ( node.nodeType === Node.TEXT_NODE ) {
			wrapper = doc.createElement( 'span' );
			wrapper.appendChild( node );
			return wrapper;
		}
		return node;
	}

	// If the transclusion is unchanged just send back the
	// original DOM elements so selser can skip over it
	if (
		originalDomElements &&
		originalMw && ve.compare( dataElement.attributes.mw, JSON.parse( originalMw ) )
	) {
		// originalDomElements is also used for CE rendering so return a copy
		els = ve.copyDomElements( originalDomElements, doc );
	} else {
		if (
			converter.isForClipboard() &&
			// Use getHashObjectForRendering to get the rendering from the store
			( value = store.value( store.indexOfValue( null, OO.getHash( [ this.getHashObjectForRendering( dataElement ), undefined ] ) ) ) )
		) {
			// For the clipboard use the current DOM contents so the user has something
			// meaningful to paste into external applications
			els = ve.copyDomElements( value, doc );
			els[ 0 ] = wrapTextNode( els[ 0 ] );
		} else if ( originalDomElements ) {
			els = [ doc.createElement( originalDomElements[ 0 ].nodeName ) ];
		} else if ( dataElement.type === this.cellType ) {
			els = [ doc.createElement( dataElement.attributes.style === 'header' ? 'th' : 'td' ) ];
		} else {
			els = [ doc.createElement( 'span' ) ];
		}
		// All we need to send back to Parsoid is the original transclusion marker, with a
		// reconstructed data-mw property.
		els[ 0 ].setAttribute( 'typeof', 'mw:Transclusion' );
		els[ 0 ].setAttribute( 'data-mw', JSON.stringify( dataElement.attributes.mw ) );
	}
	if ( converter.isForClipboard() ) {
		// If the first element is a <link> or <meta> tag, e.g. a category, ensure it
		// is not destroyed by copy-paste by replacing it with a span
		if ( els[ 0 ].tagName === 'LINK' || els[ 0 ].tagName === 'META' ) {
			span = doc.createElement( 'span' );
			span.setAttribute( 'typeof', 'mw:Transclusion' );
			span.setAttribute( 'data-mw', els[ 0 ].getAttribute( 'data-mw' ) );
			els[ 0 ] = span;
		}

		// Empty spans can get thrown around by Chrome when pasting, so give them a space
		if ( els[ 0 ].innerHTML === '' ) {
			els[ 0 ].appendChild( doc.createTextNode( '\u00a0' ) );
		}

		// Mark the data-mw element as not having valid generated contents with it in case it is
		// inserted into another editor (e.g. via paste).
		els[ 0 ].setAttribute( 'data-ve-no-generated-contents', true );

		// ... and mark all but the first child as ignorable
		for ( i = 1, len = els.length; i < len; i++ ) {
			// Wrap plain text nodes so we can give them an attribute
			els[ i ] = wrapTextNode( els[ i ] );
			els[ i ].setAttribute( 'data-ve-ignore', 'true' );
		}
	}
	return els;
};

ve.dm.MWFBNode.static.describeChanges = function () {
	// TODO: Provide a more detailed description of template changes
	return [ ve.msg( 'visualeditor-changedesc-mwtransclusion' ) ];
};

/** */
ve.dm.MWFBNode.static.cloneElement = function () {
	// Parent method
	var clone = ve.dm.MWFBNode.super.static.cloneElement.apply( this, arguments );
	delete clone.attributes.originalMw;
	return clone;
};

/**
 * Escape a template parameter. Helper function for #getWikitext.
 *
 * @static
 * @param {string} param Parameter value
 * @return {string} Escaped parameter value
 */
ve.dm.MWFBNode.static.escapeParameter = function ( param ) {
	var match, needsNowiki,
		input = param,
		output = '',
		inNowiki = false,
		bracketStack = 0,
		linkStack = 0;

	while ( input.length > 0 ) {
		match = input.match( /(?:\[\[)|(?:\]\])|(?:\{\{)|(?:\}\})|\|+|<\/?nowiki>|<nowiki\s*\/>/ );
		if ( !match ) {
			output += input;
			break;
		}
		output += input.slice( 0, match.index );
		input = input.slice( match.index + match[ 0 ].length );
		if ( inNowiki ) {
			if ( match[ 0 ] === '</nowiki>' ) {
				inNowiki = false;
				output += match[ 0 ];
			} else {
				output += match[ 0 ];
			}
		} else {
			needsNowiki = true;
			if ( match[ 0 ] === '<nowiki>' ) {
				inNowiki = true;
				needsNowiki = false;
			} else if ( match[ 0 ] === '</nowiki>' || match[ 0 ].match( /<nowiki\s*\/>/ ) ) {
				needsNowiki = false;
			} else if ( match[ 0 ].match( /(?:\[\[)/ ) ) {
				linkStack++;
				needsNowiki = false;
			} else if ( match[ 0 ].match( /(?:\]\])/ ) ) {
				if ( linkStack > 0 ) {
					linkStack--;
					needsNowiki = false;
				}
			} else if ( match[ 0 ].match( /(?:\{\{)/ ) ) {
				bracketStack++;
				needsNowiki = false;
			} else if ( match[ 0 ].match( /(?:\}\})/ ) ) {
				if ( bracketStack > 0 ) {
					bracketStack--;
					needsNowiki = false;
				}
			} else if ( match[ 0 ].match( /\|+/ ) ) {
				if ( bracketStack > 0 || linkStack > 0 ) {
					needsNowiki = false;
				}
			}

			if ( needsNowiki ) {
				output += '<nowiki>' + match[ 0 ] + '</nowiki>';
			} else {
				output += match[ 0 ];
			}
		}
	}
	return output;
};

/**
 * Get the wikitext for this transclusion.
 *
 * @static
 * @param {Object} content MW data content
 * @return {string} Wikitext like `{{foo|1=bar|baz=quux}}`
 */
ve.dm.MWFBNode.static.getWikitext = function ( content ) {
	var i, len, part, template, param,
		wikitext = '';

	// Normalize to multi template format
	if ( content.params ) {
		content = { parts: [ { template: content } ] };
	}
	// Build wikitext from content
	for ( i = 0, len = content.parts.length; i < len; i++ ) {
		part = content.parts[ i ];
		if ( part.template ) {
			// Template
			template = part.template;
			wikitext += '{{' + template.target.wt;
			for ( param in template.params ) {
				wikitext += '|' + param + '=' +
					this.escapeParameter( template.params[ param ].wt );
			}
			wikitext += '}}';
		} else {
			// Plain wikitext
			wikitext += part;
		}
	}
	return wikitext;
};

/* Methods */

/**
 * Handle attribute change events.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.dm.MWFBNode.prototype.onAttributeChange = function ( key ) {
	if ( key === 'mw' ) {
		this.partsList = null;
	}
};

/**
 * Check if transclusion contains only a single template.
 *
 * @param {string|string[]} [templates] Names of templates to allow, omit to allow any template name
 * @return {boolean} Transclusion only contains a single template, which is one of the ones in templates
 */
ve.dm.MWFBNode.prototype.isSingleTemplate = function ( templates ) {
	var i, len,
		templateNS = mw.config.get( 'wgNamespaceIds' ).template,
		partsList = this.getPartsList();

	function normalizeTemplateTitle( name ) {
		var title = mw.Title.newFromText( name, templateNS );
		return title ? title.getPrefixedText() : name;
	}

	if ( partsList.length !== 1 ) {
		return false;
	}
	if ( templates === undefined ) {
		return true;
	}
	if ( typeof templates === 'string' ) {
		templates = [ templates ];
	}
	for ( i = 0, len = templates.length; i < len; i++ ) {
		if (
			partsList[ 0 ].templatePage &&
			partsList[ 0 ].templatePage === normalizeTemplateTitle( templates[ i ] )
		) {
			return true;
		}
	}
	return false;
};

/**
 * Get a simplified description of the transclusion's parts.
 *
 * @return {Object[]} List of objects with either template or content properties
 */
ve.dm.MWFBNode.prototype.getPartsList = function () {
	var i, len, href, page, part, content;

	if ( !this.partsList ) {
		this.partsList = [];
		content = this.getAttribute( 'mw' );
		for ( i = 0, len = content.parts.length; i < len; i++ ) {
			part = content.parts[ i ];
			if ( part.template ) {
				href = part.template.target.href;
				page = href ? ve.decodeURIComponentIntoArticleTitle( href.replace( /^(\.\.?\/)*/, '' ) ) : null;
				this.partsList.push( {
					template: part.template.target.wt,
					templatePage: page
				} );
			} else {
				this.partsList.push( { content: part } );
			}
		}
	}

	return this.partsList;
};

/**
 * Wrapper for static method
 *
 * @method
 * @return {string} Wikitext like `{{foo|1=bar|baz=quux}}`
 */
ve.dm.MWFBNode.prototype.getWikitext = function () {
	return this.constructor.static.getWikitext( this.getAttribute( 'mw' ) );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWFBNode );
