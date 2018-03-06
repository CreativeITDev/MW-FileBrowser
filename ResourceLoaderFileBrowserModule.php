<?php

/**
 * ResourceLoader module for FileBrowser extension
 */
class ResourceLoaderFileBrowserModule extends ResourceLoaderFileModule {
	/**
	 * @inheritDoc
	 */
	public function getScript( ResourceLoaderContext $context ) {
		return ResourceLoader::makeConfigSetScript(
				[ 'extFileBrowserConfig' => $this->getFrontendConfiguraton() ]
			)
			. "\n"
			. parent::getScript( $context );
	}

	/**
	 * @inheritDoc
	 */
	public function supportsURLLoading() {
		// This module does not support loading URLs, because it inserts
		// JS config vars into the module by the getScript function.
		return false;
	}

	/**
	 * @inheritDoc
	 */
	public function enableModuleContentVersion() {
		return true;
	}

	/**
	 * Returns an array of variables for FileBrowser to work (settings)
	 * @global int $wgFileBrowserSearchMinChars
	 * @global int $wgFileBrowserSearchDelay
	 * @return array
	 */
	private function getFrontendConfiguraton() {
		global $wgFileBrowserSearchMinChars, $wgFileBrowserSearchDelay;

		return [
			'searchMinChars' => $wgFileBrowserSearchMinChars,
			'searchDelay' => $wgFileBrowserSearchDelay,
		];
	}

}
