<?php

class ApiFileBrowser extends ApiBase {

	static $FS_FLAGS;

	public function execute() {
		$user = $this->getUser();
		if ( !$user->isAllowed( 'filebrowser-browse' ) ) {
			$this->dieUsageMsg( 'badaccess-group0' );
		}

		$params = $this->extractRequestParams();
		$path = $params['path'];
		$status = \Status::newFatal( 'fb-api-error-unknown-task' );

		switch ( $params['task'] ) {
			case 'browse':
				$status = FileBrowser::getDirectoryInfo( $path );
				break;
			case 'search':
				global $wgFileBrowserSearchMinChars;
				if ( mb_strlen( $params['term'] ) < $wgFileBrowserSearchMinChars ) {
					$this->dieWithError( [ 'message' => 'fb-api-error-short-term', 'params' => [$wgFileBrowserSearchMinChars] ] );
				}
				$status = FileBrowser::search( $params['term'], $path );
				break;
		}

		if ( !$status->isOK() ) {
			$this->dieStatus( $status );
		}
		$result = $status->getValue();
		$result['error'] = $status->isGood() ? null : $status->getMessage()->text();

		$this->getResult()->addValue( null, 'result', $result );
		return true;
	}

	public function getAllowedParams() {
		return array_merge( parent::getAllowedParams(), [
			'task' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'path' => [
				ApiBase::PARAM_TYPE => 'string',
			],
			'term' => [
				ApiBase::PARAM_TYPE => 'string',
			],
		] );
	}

}
