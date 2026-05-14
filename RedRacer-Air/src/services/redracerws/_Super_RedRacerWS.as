/**
 * This is a generated class and is not intended for modification.  To customize behavior
 * of this service wrapper you may modify the generated sub-class of this class - RedRacerWS.as.
 */
package services.redracerws
{
import com.adobe.fiber.core.model_internal;
import com.adobe.fiber.services.wrapper.WebServiceWrapper;
import com.adobe.serializers.utility.TypeUtility;
import mx.rpc.AbstractOperation;
import mx.rpc.AsyncToken;
import mx.rpc.soap.mxml.Operation;
import mx.rpc.soap.mxml.WebService;
import valueObjects.WSResponse;

[ExcludeClass]
internal class _Super_RedRacerWS extends com.adobe.fiber.services.wrapper.WebServiceWrapper
{
    
    // Constructor
    public function _Super_RedRacerWS()
    {
        // initialize service control
        _serviceControl = new mx.rpc.soap.mxml.WebService();
        var operations:Object = new Object();
        var operation:mx.rpc.soap.mxml.Operation;

        operation = new mx.rpc.soap.mxml.Operation(null, "emailRaceCourse");
         operation.resultType = valueObjects.WSResponse;
        operations["emailRaceCourse"] = operation;

        operation = new mx.rpc.soap.mxml.Operation(null, "emailGPX");
         operation.resultType = valueObjects.WSResponse;
        operations["emailGPX"] = operation;

        _serviceControl.operations = operations;
        try
        {
            _serviceControl.convertResultHandler = com.adobe.serializers.utility.TypeUtility.convertResultHandler;
        }
        catch (e: Error)
        { /* Flex 3.4 and earlier does not support the convertResultHandler functionality. */ }


        preInitializeService();
        model_internal::initialize();
    }
    
    //init initialization routine here, child class to override
    protected function preInitializeService():void
    {


        _serviceControl.service = "RedRacerWS";
        _serviceControl.port = "RedRacerWSSoap";
        wsdl = "http://timemachine.regattared.com/RedRacerWS.asmx?WSDL";
        model_internal::loadWSDLIfNecessary();
    }
    

    /**
      * This method is a generated wrapper used to call the 'emailRaceCourse' operation. It returns an mx.rpc.AsyncToken whose 
      * result property will be populated with the result of the operation when the server response is received. 
      * To use this result from MXML code, define a CallResponder component and assign its token property to this method's return value. 
      * You can then bind to CallResponder.lastResult or listen for the CallResponder.result or fault events.
      *
      * @see mx.rpc.AsyncToken
      * @see mx.rpc.CallResponder 
      *
      * @return an mx.rpc.AsyncToken whose result property will be populated with the result of the operation when the server response is received.
      */
    public function emailRaceCourse(key:int, salt:String, email:String, raceCourseString:String, elapsedTime:String) : mx.rpc.AsyncToken
    {
        model_internal::loadWSDLIfNecessary();
        var _internal_operation:mx.rpc.AbstractOperation = _serviceControl.getOperation("emailRaceCourse");
		var _internal_token:mx.rpc.AsyncToken = _internal_operation.send(key,salt,email,raceCourseString,elapsedTime) ;
        return _internal_token;
    }
     
    /**
      * This method is a generated wrapper used to call the 'emailGPX' operation. It returns an mx.rpc.AsyncToken whose 
      * result property will be populated with the result of the operation when the server response is received. 
      * To use this result from MXML code, define a CallResponder component and assign its token property to this method's return value. 
      * You can then bind to CallResponder.lastResult or listen for the CallResponder.result or fault events.
      *
      * @see mx.rpc.AsyncToken
      * @see mx.rpc.CallResponder 
      *
      * @return an mx.rpc.AsyncToken whose result property will be populated with the result of the operation when the server response is received.
      */
    public function emailGPX(key:int, salt:String, email:String, gpx:String) : mx.rpc.AsyncToken
    {
        model_internal::loadWSDLIfNecessary();
        var _internal_operation:mx.rpc.AbstractOperation = _serviceControl.getOperation("emailGPX");
		var _internal_token:mx.rpc.AsyncToken = _internal_operation.send(key,salt,email,gpx) ;
        return _internal_token;
    }
     
}

}
