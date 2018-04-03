<?php

class FileBrowser {

	static $FS_FLAGS;

	/**
	 * Used for API queries
	 * @global \Language $wgContLang
	 * @param string $path
	 * @return Status
	 */
	public static function getDirectoryInfo( $path ) {
		global $wgContLang;

		$realPath = [];
		$status = self::getDirectoryIterator( $path, $realPath );

		if ( !$status->isOK() ) {
			return $status;
		}

		/* @var $iterator FilesystemIterator */
		$iterator = $status->getValue();
		$files = [];
		$dirs = [];
		foreach ( $iterator as $value ) {
			if ( !$value->isReadable() ) {
				// @todo warning message???
				continue;
			}
			$type = $value->getType();
			$name = $value->getFilename();
			$nameKey = $wgContLang->lc( $name ) . $name;
			$data = [ 'name' => $name ];
			switch ( $type ) {
				case 'dir':
					$dirs[$nameKey] = $data;
					break;
				case 'file':
					$data['size'] = $value->getSize();
					$files[$nameKey] = $data;
				default:
					// @todo warning message???
					continue;
			}
		}

		ksort( $dirs );
		ksort( $files );
		$return = [
			'dir' => array_values( $dirs ),
			'file' => array_values( $files ),
			'path' => $realPath,
		];
		$status->setResult( true, $return );
		return $status;
	}

	/**
	 * Renders the output of {{#fb:}} parser function
	 * @param \Parser $parser
	 * @param string $param1
	 */
	public static function runParserFunction( &$parser, $param1, $param2=null, $param3=null, $param4=null, $param5=null, $params6=null ) {
		$params = self::getParserParams( func_get_args() );

		$status = self::getFileIterator( $params['path'], $params['file'] );

		if ( !$status->isGood() ) {
			return Html::rawElement( 'span', [ 'class'=>'errorbox', 'title'=>'FileBrowser error message' ], $status->getWikiText() );
		}

		$width  = (array_key_exists('width', $params) ? intval($params['width']).'px' : '100%');
		$height = (array_key_exists('height', $params) ? intval($params['height']).'px' : '500px');
		$page = (array_key_exists('page', $params) ? intval($params['page']) : 1);


		$title = Title::makeTitleSafe( NS_SPECIAL, 'FileBrowser' );
		$attribs = [
			'title' => $params['title'],
			'href' => $title->getInternalURL( [ 'file'=> ($param1[0] === '/' ? $param1 : '/' . $param1) ] ),
		];
		$attribs_iframe = [
            'border' => '0', 
            'src' => $title->getInternalURL( [ 'file'=> ($param1[0] === '/' ? $param1 : '/' . $param1), 'inline'=>'true' ] ).'#page='.$page,
            'width' => $width,
            'height' => $height
        ]; 

		if ($params['preview']) {
                $output = Html::rawElement( 'div', [ 'class' => 'mv-file-preview' ],
                        Html::element( 'a', $attribs, $params['name'] ).Html::rawElement( 'br').Html::element( 'iframe', $attribs_iframe)
                );
        }
        else {
                $output = Html::element( 'a', $attribs, $params['name'] );
        }

		return [ $output, 'noparse' => true, 'isHTML' => true, 'nowiki' => true ];
	}

	/**
	 *
	 * @param array $params
	 * @return array Array with keys: file, path, name, title
	 */
	private static function getParserParams( $params ) {
		array_shift( $params ); // remove $parser
		$return = [];

		$path = explode( '/', array_shift( $params ) ); // params[0] is path
		$return['file'] =  array_pop( $path );

		if ( !($path && $path[0]) ) { // Path starts with '/' or root directory
			array_shift( $path );
		}
		$return['path'] = $path;

//		$return['name'] = $return['title'] = $params && $params[0] ? $params[0] : $return['file'];
		$return['name'] = $return['title'] = $return['file']; // Values by default
		foreach ( $params as $value ) {
			$v = explode( '=', $value, 2 );
			switch ( trim( $v[0] ) ) {
				case 'name':
					if ( isset( $v[1] ) ) {  // skip void
						$return['title'] = $return['name'] = trim( $v[1] ) ?: $return['name']; // Can't be empty string
					}
					break;
                case 'preview':
                    $return['preview'] = isset( $v[1] ) ? trim( $v[1] ) : '';
                    break;
                case 'width':
                    $return['width'] = isset( $v[1] ) ? trim( $v[1] ) : '';
                    break;
                case 'height':
                    $return['height'] = isset( $v[1] ) ? trim( $v[1] ) : '';
                    break;
                case 'page':
                    $return['page'] = isset( $v[1] ) ? trim( $v[1] ) : '';
                    break;
//				case 'title':
//					$return['title'] = isset( $v[1] ) ? trim( $v[1] ) : '';
//					break;
			}
		}
		return $return;
	}

	/**
	 *
	 * @param array $dirPath Array of directories (as a path to the file directory)
	 * @param string $file
	 * @return Status
	 */
	public static function getFileIterator( $dirPath, $file ) {
		$realPath = [];
		$status = self::getDirectoryIterator( $dirPath, $realPath );
		if ( !$status->isGood() ) {
			return $status;
		}

		/* @var $iterator FilesystemIterator */
		$iterator = $status->getValue();
		foreach ( $iterator as $k => $i ) {
			if ( $k === $file ) {
				if ( $i->isFile() ) {
					$status->setResult( true, $i );
					return $status;
				} else {
					$status->fatal( 'fb-path-is-not-file', implode( '/', $realPath ) . '/' . $k );
					return $status;
				}
			}
		}

		$status->fatal( 'fb-file-not-found', implode( '/', $dirPath ) . '/' . $file );
		return $status;
	}

	/**
	 *
	 * @param string|array $path
	 * @param array $realPath Returns opened path
	 * @return Status
	 */
	private static function getDirectoryIterator( $path, &$realPath ) {
		$status = self::getRootIterator();

		if ( is_string( $path ) ) {
			$path = explode( '/', $path );
		}
		
		if ( $status->isOK() && $path && $path[0] ) {
			$iterator = $status->getValue();
			$newStatus = self::openPath( $iterator, $path, $realPath );
			$status->merge( $newStatus, true );
		}

		return $status;
	}

	/**
	 *
	 * @global string $wgFileBrowserDirectory
	 * @return Status
	 */
	private static function getRootIterator() {
		global $wgFileBrowserDirectory;

		if ( !self::$FS_FLAGS ) {
			self::$FS_FLAGS = FilesystemIterator::SKIP_DOTS | FilesystemIterator::UNIX_PATHS | FilesystemIterator::NEW_CURRENT_AND_KEY;
		}

		$status = Status::newGood();
		$iterator = false;

		if ( !$wgFileBrowserDirectory ) {
			$status->fatal( 'fb-not-configured' );
		} else {
			try {
				$iterator = new FilesystemIterator( $wgFileBrowserDirectory, self::$FS_FLAGS );
			} catch ( UnexpectedValueException $ext ) {
				$status->fatal( 'fb-wrong-configured', $ext->getMessage() );
			}
		}

		if ( $status->isOK() && $iterator ) {
			$status->setResult( true, $iterator );
		}

		return $status;
	}

	/**
	 *
	 * @param \FilesystemIterator $baseIterator
	 * @param array $origPath
	 * @param array $realPath
	 * return Status
	 */
	private static function openPath( $baseIterator, &$origPath, &$realPath ) {
		$status = Status::newGood();
		$status->setResult( true, $baseIterator ); // on non fatal error return base iterator

		$dir = array_shift( $origPath );
		if ( !$dir ) {
			$status->error( 'fb-wrong-path', implode( '/', $realPath ) . '//' );
			return $status;
		}

		foreach ( $baseIterator as $k => $i ) {
			if ( $k === $dir ) {
				if ( $i->isDir() ) {
					$realPath[] = $k;
					try {
						$iterator = new FilesystemIterator( $i->getPathname(), self::$FS_FLAGS );
						$status->setResult( true, $iterator );
					} catch ( UnexpectedValueException $ext ) {
						$status->error( 'fb-wrong-directory', $ext->getMessage() );
						return $status;
					}
					if ( $origPath ) {
						$newStatus = self::openPath( $iterator, $origPath, $realPath );
						$status->merge( $newStatus, true );
					}
					return $status;
				} else {
					$status->error( 'fb-path-is-not-dir', implode( '/', $realPath ) . '/' . $k );
					return $status;
				}
			}
		}

		$status->error( 'fb-path-not-found', implode( '/', $realPath ) . '/' . $dir );
		return $status;
	}

	public static function search( $term, $dirPath = null ) {
		global $wgFileBrowserSearchLimit;

		$status = self::getRootIterator();
		if ( !$status->isOK() ) {
			return $status;
		}

		/* @var $iterator FilesystemIterator */
		$iterator = $status->getValue();
		$limit = $wgFileBrowserSearchLimit;
		$pattern = '/' . str_replace( ['\\*', '\\?'], ['.*?', '.'], preg_quote( $term, '/' ) ) . '/i';
		$curPath = [];
		$return = self::getMatchedFiles( $curPath, $iterator, $pattern, $limit );
		$status->setResult( true, [ 'search' => $return ] );
		return $status;
	}

	/**
	 *
	 * @global \Language $wgContLang
	 * @param array $curPath
	 * @param FilesystemIterator $iterator
	 * @param string $pattern
	 * @param int $limit
	 * @return array
	 */
	private static function getMatchedFiles( $curPath, $iterator, $pattern, $limit ) {
		global $wgContLang;

		$directories = [];
		$files = [];
		$return = [];

		/* @var $value FilesystemIterator */
		foreach ( $iterator as $key => $value ) {
			if ( $value->isDir() ) {
				$name = $value->getFilename();
				$nameKey = $wgContLang->lc( $name ) . $name;
				$directories[$nameKey] = $value;
				continue;
			}
			if ( preg_match( $pattern, $key ) ){
				$name = $value->getFilename();
				$nameKey = $wgContLang->lc( $name ) . $name;
				$files[$nameKey] = [ 'name' => $value->getFilename(), 'path' => $curPath ];
			}
		}

		$fileCount = count( $files );
		if ( $fileCount > 0 ) {
			ksort( $files );
			if ( $fileCount > $limit ) {
				array_splice( $files, $limit );
			}
			foreach ( $files as $v ) {
				$return[] = $v;
			}
		}

		if ( $fileCount >= $limit ) {
			return $return;
		}

		$limit -= $fileCount;
		ksort( $directories );
		foreach ( $directories as $dir ) {
			$newPath = $curPath;
			$newPath[] = $dir->getFilename();
			$newIterator = new FilesystemIterator( $dir->getPathname(), self::$FS_FLAGS );
			$r = self::getMatchedFiles( $newPath, $newIterator, $pattern, $limit );
			if ( $r ) {
				$return = array_merge( $return, $r );
				$limit -= count( $r );
				if ( $limit <= 0 ) {
					return $return;
				}
			}
		}

		return $return;
	}

}


