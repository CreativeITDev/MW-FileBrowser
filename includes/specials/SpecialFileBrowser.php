<?php

class SpecialFileBrowser extends \SpecialPage {

	const NAME = 'FileBrowser';

	function __construct() {
		parent::__construct( self::NAME, 'filebrowser-download' );
	}

	function execute( $par ) {
		if ( !$this->getUser()->isAllowed( 'filebrowser-download' ) ) {
			$this->displayRestrictionError();
			return;
		}

		$output = $this->getOutput();
		$request = $this->getRequest();
		$path = explode( '/', $request->getVal( 'file' ) );
		$fileName = array_pop( $path );
		if ( !$fileName ) {
			$this->setHeaders();
			$output->addWikiMsg( 'fb-file-not-specified' );
			return;
		}
		if ( !$path[0] ) {
			array_shift( $path );
		}
		
		$status = FileBrowser::getFileIterator( $path, $fileName );
		if ( !$status->isGood() ) {
			$this->setHeaders();
			$output->addHTML( $status->getHTML() );
			return;
		}

		/* @var $iterator FilesystemIterator */
		$iterator = $status->getValue();
		$file = $iterator->openFile();

		wfResetOutputBuffers();

		if (!$request->getVal( 'inline' )) {
			$request->response()->header( "Content-Type: application/force-download" );
			$request->response()->header( "Content-Disposition: attachment; filename=\"$fileName\"" );
		} else {
			$request->response()->header( "Content-Type: ". mime_content_type($file->getRealPath()) );
			$request->response()->header( "Content-Disposition: inline; filename=\"$fileName\"" );
		}
		while ( !$file->eof() ) {
			echo $file->fread( 1024*8 );
			//ob_flush();
			flush();
		}
//		$output->addHTML( $file->fread( $file->getSize() ) );
		$output->disable();
	}

}
