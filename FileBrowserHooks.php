<?php

class FileBrowserHooks {

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ParserFirstCallInit
	 * @param \Parser $parser
	 */
	public static function onParserFirstCallInit( $parser ) {
		$parser->setFunctionHook( 'fb', 'FileBrowser::runParserFunction' );
	}

}
