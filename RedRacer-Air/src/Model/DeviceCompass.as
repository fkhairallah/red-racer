package Model
{
	import com.distriqt.extension.compass.Compass;
	import com.distriqt.extension.compass.events.CompassEvent;
	
	import flash.events.EventDispatcher;
	
	/**
	 * DeviceCompass Class 
	 * @author fady
	 * 
	 * This class exists here instead of a shared library because I wasn't able to determine
	 * how to properly setup an ANE in a library file. Not worth the effort for now.
	 * 
	 * The role of this class is to consolidate all access to the compass data into a single
	 * stream. This prevents multiple views from stepping over each other and turning the data 
	 * stream on and off.
	 * 
	 * Centralization of this class also allows for easy swapping of ANE if needed
	 */	
	
	public class DeviceCompass extends EventDispatcher
	{
		private var deviceCompass:Compass;
		private var numberOfListeners:int;
		private static const distriqt_Key:String = "2267808aedfd6ad036d375ad7341341f85aaac97boCTjJUm9Dgpw+2L3PUri6FYw/qJLY/Sh3IWn02x4DEkYNn/yH5cMU6DWEg3JpcRo4HE7KMGhnEm2FnBpcBAWYg2W3bZlKMNgMX+uOxCWw0fmC9kq8j4QS1irdPh82/ng4Y7x8jSTJjkba3ufCod9VWPBBjCsDO/fruqM82pKUR3qWc/8GJT0/pdiTbV1/X0lMJ2bUUTxfAB8tJ1JSqKdP+OHeyZ7wCH8Z1+T0pSKMfA24Mfne23Tl5Q8VM131go9O7j4OkaLrdFDnC6fmQVDCtq6YzIYCDGXST+cXz48knlLvURY8aUSg3/25qjrSSl9loJU/P/sqNYRxCIvInD2g==";
		
		
		
		public function get isSupported():Boolean{ return Compass.isSupported};
		
		public function DeviceCompass()
		{
			Compass.init(distriqt_Key);
			// start tracking compass and vibrate when pointed to the mark
			if (Compass.isSupported)
			{
				Compass.service.addEventListener(CompassEvent.HEADING_UPDATED, updateHeading);
				Compass.service.register();
				numberOfListeners = 0;
			}
			
		}
		
		// add a listener to the service
		public function listen(xFunction:Function):void
		{
			if (Compass.isSupported)
			{
				Compass.service.addEventListener(CompassEvent.HEADING_UPDATED,xFunction);
				numberOfListeners++;
				Compass.service.register(1);
			}
		}
		
		// remove a listener from the service
		public function unlisten(xFunction:Function):void
		{
			if (Compass.isSupported)
			{
				Compass.service.removeEventListener(CompassEvent.HEADING_UPDATED,xFunction);
				numberOfListeners--;
			}
		}
		
		private function updateHeading(event:CompassEvent):void
		{
			// stop the service if no one is listening
			if (numberOfListeners <= 0) Compass.service.unregister();
		}
	}
}