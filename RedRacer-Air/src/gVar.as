package
{
	//import com.adobe.nativeExtensions.Vibration;
	
	import com.distriqt.extension.vibration.Vibration;
	
	import flash.display.StageAspectRatio;
	
	import mx.collections.ArrayCollection;
	
	import spark.collections.Sort;
	import spark.collections.SortField;
	import spark.managers.IPersistenceManager;
	
	import Chart.MapQuestChart;
	
	import Controller.SailController;
	
	import Model.DeviceCompass;
	import Model.DeviceVibration;
	import Model.Vessel;
	import Model.Course.CourseLeg;
	import Model.Course.CourseMark;
	import Model.Course.RaceCourse;
	import Model.Data.GPSPoint;
	import Model.Data.SailDataConnector;
	import Model.Performance.PerformancePoint;
	
	import Utilities.Bearing;
	import Utilities.Distance;
	
	[Bindable]public class gVar
	{
		public static var numberOfRuns:int;				// counts # of times this app is run
		public static var appVersion:String;			// version # of this app

		// these variables are persisted
		public static var deviceOrientation:String; 	// how the app starts
		public static var bearing:Bearing;				// bearing display preferences
		public static var distance:Distance;			// distance display preferences
		public static var startSequenceLength:Number;	// start sequence time in minutes

		public static var vessel:Vessel;				// vessel information
		public static var waypoints:ArrayCollection;	// list of waypoints
		public static var marks:ArrayCollection;		// list of marks

		public static var course:RaceCourse;			// Course
		
		public static var email:String;					// email address
		
		public static var performance:ArrayCollection;


		// this is not persisted for now
		public static var masterC:SailController;		// controls the whole sailing universe and collects all needed data
		public static var vData:SailDataConnector;		// connector to instruments: either internal GPS or WIFI
		public static var compass:DeviceCompass;		// create a device compass that all can listen to
		public static var vibrate:DeviceVibration;		// create a device vibration object
		public static var chart:MapQuestChart;			// create a mapquest map to use as a chart

		public static var countdownTime:Number=Number.NaN;// time of race start
		public static var animateFirstRun:Boolean = true;	// animate home screen first time around
		public static var locatePoint:GPSPoint;			// caches data used by LocatePoint view
		public static var navigateSegment:CourseLeg;	// caches data used by NavigateSegment view
		public static var timerStartTime:Date;			// stores timer start time
		public static var timerFinishList:ArrayCollection = new ArrayCollection;	// list of finish times
		
		//private static var vibrationServices:Vibration;	  // create a vibration service to be shared by all
				
		public static var courseList:ArrayCollection;	// list of course types
		
		public static function loadFromStorage(pm:IPersistenceManager):void {

			numberOfRuns = pm.getProperty("numberOfRuns") as int;
			appVersion = pm.getProperty("appVersion") as String;
			
			// if property is set, 
			if ( pm.getProperty("deviceOrientation") != null )
				deviceOrientation = pm.getProperty("deviceOrientation") as String;
			else 
				deviceOrientation = StageAspectRatio.PORTRAIT;
			
			// bearing display preferences
			bearing = new Bearing(-14.2);
			if ( pm.getProperty("bearing") != null )
				bearing.loadFromObject(pm.getProperty("bearing"));
			
			// distance display preferences
			distance = new Distance();
			if ( pm.getProperty("distance") != null )
				distance.loadFromObject(pm.getProperty("distance"));

			// start sequence default time
			startSequenceLength = pm.getProperty("startSequenceTime") as Number;
			if (isNaN(startSequenceLength)|| (startSequenceLength == 0)) startSequenceLength = 5;
						
			vessel = new Vessel("Blue Ginger",32);
			if ( pm.getProperty("vessel") != null )
				vessel.loadFromObject(pm.getProperty("vessel"));
			
			// start data collection in the right mode
			if (pm.getProperty("wifi") == null)
			{
				vData = new SailDataConnector(true, true, null , 10110); // start in standalone mode.

			}
			else
			{
				var wifiO:Object = pm.getProperty("wifi"); 
				vData = new SailDataConnector(wifiO.isStandaloneMode, wifiO.udpMode,	wifiO.ip,wifiO.port);
			}
			

			// Create a sort on 'name' field
			var sort:Sort = new Sort();
			var sortfield:SortField = new SortField("name");
			// Set the locale style to "en-US" to set the language for the sort.
			sortfield.setStyle("locale","en-US");
			sort.fields = [sortfield];

			// initialize waypoints
			waypoints = new ArrayCollection;
			for each (var o:Object in (pm.getProperty("waypoints") as ArrayCollection)) {
				waypoints.addItem(new GPSPoint(o));
			}
			
			waypoints.sort = sort;
			waypoints.refresh();

			// initialize marks
			marks = new ArrayCollection;
			var cm:CourseMark;
			
			// load each mark and connect it to the proper waypoint
			// if it's a relative point
			for each (o in (pm.getProperty("marks") as ArrayCollection)) {
				cm = new CourseMark();
				cm.loadFromObject(o, waypoints); // load 
				marks.addItem(cm);
			}
			marks.sort = sort;
			marks.refresh();
			
			// now load the course
			course = new RaceCourse();
			if ( pm.getProperty("course") != null )
			{
				course.loadFromObject(pm.getProperty("course"));
				//course.generateCourse(marks);
			}
			
			// the persisted email.
			email = pm.getProperty("email") as String;;
			
			// initialize perofrmance
			performance = new ArrayCollection;
			for each (o in (pm.getProperty("performance") as ArrayCollection)) {
				performance.addItem(new PerformancePoint(o));
			}

			
			// Master Sail Controller --> runs everything
			masterC = new SailController(vData,vessel, course);
			
			
			// create the vibration variables
			//if (Vibration.isSupported) vibrationServices = new Vibration; 
			compass = new DeviceCompass();
			vibrate = new DeviceVibration();
			
			chart = new MapQuestChart();

			
		}
		
		
		public static function saveToStorage(pm:IPersistenceManager):void {
			
			pm.setProperty("numberOfRuns",numberOfRuns);
			pm.setProperty("appVersion",appVersion);
			pm.setProperty("deviceOrientation",deviceOrientation);
			pm.setProperty("bearing",bearing);
			pm.setProperty("distance",distance);
			pm.setProperty("startSequenceTime",startSequenceLength);

			pm.setProperty("vessel",vessel);			
			pm.setProperty("waypoints",waypoints);
			pm.setProperty("marks",marks);
			pm.setProperty("course",course);
			pm.setProperty("email",email);
			pm.setProperty("performance", performance);
			pm.setProperty("wifi",vData);

			pm.save();
			
		}
		
	}
}