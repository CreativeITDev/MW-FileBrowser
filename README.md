# MW-FileBrowser
Add these lines to `ExtraLocalSetting.php`:
```PHP
wfLoadExtension( 'FileBrowser' );
$wgFileBrowserDirectory = '/path/to/shared/folder/';
$wgFileBrowserSearchDelay = 1000;
$wgFileBrowserSearchMinChars = 3;
$FileBrowserSearchLimit = 5;
```
