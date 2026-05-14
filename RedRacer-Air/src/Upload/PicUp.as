package Upload
{
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.MediaEvent;
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	import flash.media.CameraRoll;
	import flash.media.CameraUI;
	import flash.media.MediaPromise;
	import flash.media.MediaType;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	import flash.utils.IDataInput;
	
	public class PicUp extends Sprite
	{
		private var cameraUI:CameraUI = new CameraUI();
		private var dataSource:IDataInput;
		private var eventSource:IEventDispatcher;
		private const serverURL:String = "http://www.regattared.com/docs/";
		private var tempDir:File;
		
		public function PicUp()
		{
			//this.stage.align = StageAlign.TOP_LEFT;
			//this.stage.scaleMode = StageScaleMode.NO_SCALE;

			if( CameraUI.isSupported )
			{
				trace( "Initializing camera..." );
				cameraUI.addEventListener( MediaEvent.COMPLETE, imageSelected );
				cameraUI.addEventListener( Event.CANCEL, canceled );
				cameraUI.addEventListener( ErrorEvent.ERROR, mediaError );
				cameraUI.launch( MediaType.IMAGE );
			}
			else
			{
				trace( "CameraUI is not supported.");
				if(CameraRoll.supportsBrowseForImage)
				{
					trace("Camera Roll Supported");
//					
//					_roll = new CameraRoll();
//					_addRollListeners();
//					_roll.browseForImage();
				} else {
					trace("Camera Roll Not Supported");
				}
				
			}

		}
		
		private function imageSelected( event:MediaEvent ):void
		{
			trace( "Media selected..." );
			var imagePromise:MediaPromise = event.data;
			
			if( imagePromise.file != null && false)
			{
				imagePromise.file.upload( new URLRequest( serverURL ) );
			}
			else
			{
				dataSource = imagePromise.open();
				
				if( imagePromise.isAsync )
				{
					trace( "Asynchronous media promise." );
					var eventSource:IEventDispatcher = dataSource as IEventDispatcher;				
					eventSource.addEventListener( Event.COMPLETE, onMediaLoaded );				
				}
				else
				{
					trace( "Synchronous media promise." );
					readMediaData();
				}
			}
		}
		
		private function onMediaLoaded( event:Event ):void
		{
			trace("Media load complete");
			readMediaData();
		}
				
		private function canceled( event:Event ):void
		{
			trace( "Media select canceled" );
			//cameraUI.launch( MediaType.IMAGE );  //Upload another image
		}
		
		private function readMediaData():void
		{
			var imageBytes:ByteArray = new ByteArray();
			dataSource.readBytes( imageBytes );

			tempDir = File.createTempDirectory();
			var now:Date = new Date();
			var filename:String = "IMG" + now.fullYear + now.month + now.day + now.hours + now.minutes + now.seconds + ".jpg";
			var temp:File = tempDir.resolvePath( filename );
			var stream:FileStream = new FileStream();
			stream.open( temp, FileMode.WRITE );
			stream.writeBytes( imageBytes );
			stream.close();
			
			temp.addEventListener( Event.COMPLETE, uploadComplete );
			temp.addEventListener( IOErrorEvent.IO_ERROR, ioError );

			try
			{
				temp.upload( new URLRequest( serverURL ) );
			}
			catch( e:Error )
			{
				trace( e );
				removeTempDir();
				cameraUI.launch( MediaType.IMAGE );
			}
		}
		
		private function uploadComplete( event:Event ):void
		{
			trace( "Upload successful." );
			removeTempDir();
			cameraUI.launch( MediaType.IMAGE );
		}
		
		private function removeTempDir():void
		{
			tempDir.deleteDirectory( true );
			tempDir = null;
		}
		
		private function ioError( error:IOErrorEvent ):void
		{
			trace( "Upload failed: " + error.text );
			removeTempDir();
			cameraUI.launch( MediaType.IMAGE );
		}
		
		private function mediaError( error:ErrorEvent ):void
		{
			trace( "Error:" + error.text );
			trace("stopping");
			//cameraUI.launch( MediaType.IMAGE );
		}
				
	}
}