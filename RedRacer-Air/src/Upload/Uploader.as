package Upload
{
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.StatusEvent;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.utils.ByteArray;
	
	public class Uploader extends EventDispatcher
	{
		private var loader:URLLoader;
		private var maxBlockSize:int;
		private var urlBase:String;
		private var multiPart:Boolean = false;
		private var numberOfBlocks:int;
		private var blockNumber:int;
		private var bufferData:ByteArray;
		
		public function Uploader(_dest:String,_maxBlockSize:int=int.MAX_VALUE,target:IEventDispatcher=null)
		{
			super(target);
			maxBlockSize = _maxBlockSize;
			urlBase = _dest;
		}
		
		public function upload( data:ByteArray, fileName:String = null):void
		{
			if( fileName == null ) //Generate a random name with correct file type
			{
				//Try to detect the file type
				var buffer:ByteArray = new ByteArray();
				data.readBytes( buffer, 0, 8 );
				data.position = 0;
				
				var type:String = sniffFileType( buffer );
				var now:Date = new Date();
				fileName = "IMG" + now.fullYear + now.month +now.day + 
					now.hours + now.minutes + now.seconds + "." + type;
			}
			
			loader = new URLLoader();
			loader.dataFormat= URLLoaderDataFormat.BINARY;
			
			urlBase += "?key=42&file=" + fileName;
			
			bufferData = data;
			bufferData.position = 0;
			
			numberOfBlocks = Math.ceil(bufferData.length / maxBlockSize);
			blockNumber = 1;
			sendNextDataBlock();
		}
		
		private function sendNextDataBlock():void
		{
			var request:URLRequest = new URLRequest( urlBase + "&bn=" + blockNumber.toString() );
			var startPointer:int = (blockNumber-1) * maxBlockSize; // starts at 0, then increments my maxBlockSize
			var lengthPointer:int = Math.min((bufferData.length - startPointer),maxBlockSize); // lastblock should be smaller than maxBlockSize
			var data:ByteArray = new ByteArray;
			bufferData.readBytes(data,0,lengthPointer);
			trace(blockNumber, startPointer,lengthPointer, data.length);
			request.data = data;
			request.method = URLRequestMethod.POST;
			request.contentType = "application/octet-stream";
			loader.addEventListener( Event.COMPLETE, onUploadComplete );
			loader.addEventListener(IOErrorEvent.IO_ERROR, onUploadError );
			loader.load(request);			
		}
		
		protected function onUploadComplete( event:Event ):void
		{
			if (numberOfBlocks == blockNumber ) dispatchEvent( event );
			else { // we're doing multi-part 
				event.stopImmediatePropagation(); // so stop propagation of the complete event
				var evt:StatusEvent = new StatusEvent(StatusEvent.STATUS);
				evt.code = int(blockNumber * 100 /numberOfBlocks).toString();
				dispatchEvent(evt);	// signal the change

				// send the next block
				blockNumber++;
				sendNextDataBlock();
			}
		}
		
		protected function onUploadError( error:IOErrorEvent ):void
		{
			dispatchEvent( error );
		}
		
		protected function sniffFileType( firstEightBytes:ByteArray ):String
		{
			var type:String = "unknown";
			//JPG
			if( firstEightBytes[0] == 0xff &&
				firstEightBytes[1] == 0xd8 ) type = "jpg";
			else //PNG
				if( firstEightBytes[0] == 0x89 && 
					firstEightBytes[1] == 0x50 && 
					firstEightBytes[2] == 0x4e && 
					firstEightBytes[3] == 0x47 && 
					firstEightBytes[4] == 0x0d && 
					firstEightBytes[5] == 0x0a && 
					firstEightBytes[6] == 0x1a && 
					firstEightBytes[7] == 0x0a) type = "png";
			if( type == "unknown" ) throw new Error( "Unsupported file type" );
			return type;
		}
		
	}
}