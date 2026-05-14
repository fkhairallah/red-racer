package Model
{
	import com.distriqt.extension.vibration.Vibration;

	public class DeviceVibration
	{
		private static const distriqt_Key:String = "2267808aedfd6ad036d375ad7341341f85aaac97boCTjJUm9Dgpw+2L3PUri6FYw/qJLY/Sh3IWn02x4DEkYNn/yH5cMU6DWEg3JpcRo4HE7KMGhnEm2FnBpcBAWYg2W3bZlKMNgMX+uOxCWw0fmC9kq8j4QS1irdPh82/ng4Y7x8jSTJjkba3ufCod9VWPBBjCsDO/fruqM82pKUR3qWc/8GJT0/pdiTbV1/X0lMJ2bUUTxfAB8tJ1JSqKdP+OHeyZ7wCH8Z1+T0pSKMfA24Mfne23Tl5Q8VM131go9O7j4OkaLrdFDnC6fmQVDCtq6YzIYCDGXST+cXz48knlLvURY8aUSg3/25qjrSSl9loJU/P/sqNYRxCIvInD2g==";

		public function DeviceVibration()
		{
			Vibration.init( distriqt_Key );
		}
		
		public function vibrate(time:int = 250):void
		{
			if (Vibration.isSupported)
			{
				Vibration.service.vibrate(time);
			}
		}
	}
}