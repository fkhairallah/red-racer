/**
 * This is a generated class and is not intended for modification.  To customize behavior
 * of this value object you may modify the generated sub-class of this class - Data.as.
 */

package valueObjects
{
import com.adobe.fiber.services.IFiberManagingService;
import com.adobe.fiber.valueobjects.IValueObject;
import flash.events.EventDispatcher;
import mx.collections.ArrayCollection;
import mx.events.PropertyChangeEvent;
import valueObjects.Highlowtidepred_type;

import flash.net.registerClassAlias;
import flash.net.getClassByAlias;
import com.adobe.fiber.core.model_internal;
import com.adobe.fiber.valueobjects.IPropertyIterator;
import com.adobe.fiber.valueobjects.AvailablePropertyIterator;

use namespace model_internal;

[ExcludeClass]
public class _Super_Data extends flash.events.EventDispatcher implements com.adobe.fiber.valueobjects.IValueObject
{
    model_internal static function initRemoteClassAliasSingle(cz:Class) : void
    {
    }

    model_internal static function initRemoteClassAliasAllRelated() : void
    {
        valueObjects.Highlowtidepred_type.initRemoteClassAliasSingleChild();
    }

    model_internal var _dminternal_model : _DataEntityMetadata;
    model_internal var _changedObjects:mx.collections.ArrayCollection = new ArrayCollection();

    public function getChangedObjects() : Array
    {
        _changedObjects.addItemAt(this,0);
        return _changedObjects.source;
    }

    public function clearChangedObjects() : void
    {
        _changedObjects.removeAll();
    }

    /**
     * properties
     */
    private var _internal_timeStamp : String;
    private var _internal_WS : Number;
    private var _internal_WD : int;
    private var _internal_WG : Number;
    private var _internal_X : int;
    private var _internal_R : int;
    private var _internal_data : ArrayCollection;
    model_internal var _internal_data_leaf:valueObjects.Highlowtidepred_type;
    private var _internal_date : String;

    private static var emptyArray:Array = new Array();

    // Change this value according to your application's floating-point precision
    private static var epsilon:Number = 0.0001;

    /**
     * derived property cache initialization
     */
    model_internal var _cacheInitialized_isValid:Boolean = false;

    model_internal var _changeWatcherArray:Array = new Array();

    public function _Super_Data()
    {
        _model = new _DataEntityMetadata(this);

        // Bind to own data or source properties for cache invalidation triggering

    }

    /**
     * data/source property getters
     */

    [Bindable(event="propertyChange")]
    public function get timeStamp() : String
    {
        return _internal_timeStamp;
    }

    [Bindable(event="propertyChange")]
    public function get WS() : Number
    {
        return _internal_WS;
    }

    [Bindable(event="propertyChange")]
    public function get WD() : int
    {
        return _internal_WD;
    }

    [Bindable(event="propertyChange")]
    public function get WG() : Number
    {
        return _internal_WG;
    }

    [Bindable(event="propertyChange")]
    public function get X() : int
    {
        return _internal_X;
    }

    [Bindable(event="propertyChange")]
    public function get R() : int
    {
        return _internal_R;
    }

    [Bindable(event="propertyChange")]
    public function get data() : ArrayCollection
    {
        return _internal_data;
    }

    [Bindable(event="propertyChange")]
    public function get date() : String
    {
        return _internal_date;
    }

    public function clearAssociations() : void
    {
    }

    /**
     * data/source property setters
     */

    public function set timeStamp(value:String) : void
    {
        var oldValue:String = _internal_timeStamp;
        if (oldValue !== value)
        {
            _internal_timeStamp = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "timeStamp", oldValue, _internal_timeStamp));
        }
    }

    public function set WS(value:Number) : void
    {
        var oldValue:Number = _internal_WS;
        if (isNaN(_internal_WS) == true || Math.abs(oldValue - value) > epsilon)
        {
            _internal_WS = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "WS", oldValue, _internal_WS));
        }
    }

    public function set WD(value:int) : void
    {
        var oldValue:int = _internal_WD;
        if (oldValue !== value)
        {
            _internal_WD = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "WD", oldValue, _internal_WD));
        }
    }

    public function set WG(value:Number) : void
    {
        var oldValue:Number = _internal_WG;
        if (isNaN(_internal_WG) == true || Math.abs(oldValue - value) > epsilon)
        {
            _internal_WG = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "WG", oldValue, _internal_WG));
        }
    }

    public function set X(value:int) : void
    {
        var oldValue:int = _internal_X;
        if (oldValue !== value)
        {
            _internal_X = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "X", oldValue, _internal_X));
        }
    }

    public function set R(value:int) : void
    {
        var oldValue:int = _internal_R;
        if (oldValue !== value)
        {
            _internal_R = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "R", oldValue, _internal_R));
        }
    }

    public function set data(value:*) : void
    {
        var oldValue:ArrayCollection = _internal_data;
        if (oldValue !== value)
        {
            if (value is ArrayCollection)
            {
                _internal_data = value;
            }
            else if (value is Array)
            {
                _internal_data = new ArrayCollection(value);
            }
            else if (value == null)
            {
                _internal_data = null;
            }
            else
            {
                throw new Error("value of data must be a collection");
            }
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "data", oldValue, _internal_data));
        }
    }

    public function set date(value:String) : void
    {
        var oldValue:String = _internal_date;
        if (oldValue !== value)
        {
            _internal_date = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "date", oldValue, _internal_date));
        }
    }

    /**
     * Data/source property setter listeners
     *
     * Each data property whose value affects other properties or the validity of the entity
     * needs to invalidate all previously calculated artifacts. These include:
     *  - any derived properties or constraints that reference the given data property.
     *  - any availability guards (variant expressions) that reference the given data property.
     *  - any style validations, message tokens or guards that reference the given data property.
     *  - the validity of the property (and the containing entity) if the given data property has a length restriction.
     *  - the validity of the property (and the containing entity) if the given data property is required.
     */


    /**
     * valid related derived properties
     */
    model_internal var _isValid : Boolean;
    model_internal var _invalidConstraints:Array = new Array();
    model_internal var _validationFailureMessages:Array = new Array();

    /**
     * derived property calculators
     */

    /**
     * isValid calculator
     */
    model_internal function calculateIsValid():Boolean
    {
        var violatedConsts:Array = new Array();
        var validationFailureMessages:Array = new Array();

        var propertyValidity:Boolean = true;

        model_internal::_cacheInitialized_isValid = true;
        model_internal::invalidConstraints_der = violatedConsts;
        model_internal::validationFailureMessages_der = validationFailureMessages;
        return violatedConsts.length == 0 && propertyValidity;
    }

    /**
     * derived property setters
     */

    model_internal function set isValid_der(value:Boolean) : void
    {
        var oldValue:Boolean = model_internal::_isValid;
        if (oldValue !== value)
        {
            model_internal::_isValid = value;
            _model.model_internal::fireChangeEvent("isValid", oldValue, model_internal::_isValid);
        }
    }

    /**
     * derived property getters
     */

    [Transient]
    [Bindable(event="propertyChange")]
    public function get _model() : _DataEntityMetadata
    {
        return model_internal::_dminternal_model;
    }

    public function set _model(value : _DataEntityMetadata) : void
    {
        var oldValue : _DataEntityMetadata = model_internal::_dminternal_model;
        if (oldValue !== value)
        {
            model_internal::_dminternal_model = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "_model", oldValue, model_internal::_dminternal_model));
        }
    }

    /**
     * methods
     */


    /**
     *  services
     */
    private var _managingService:com.adobe.fiber.services.IFiberManagingService;

    public function set managingService(managingService:com.adobe.fiber.services.IFiberManagingService):void
    {
        _managingService = managingService;
    }

    model_internal function set invalidConstraints_der(value:Array) : void
    {
        var oldValue:Array = model_internal::_invalidConstraints;
        // avoid firing the event when old and new value are different empty arrays
        if (oldValue !== value && (oldValue.length > 0 || value.length > 0))
        {
            model_internal::_invalidConstraints = value;
            _model.model_internal::fireChangeEvent("invalidConstraints", oldValue, model_internal::_invalidConstraints);
        }
    }

    model_internal function set validationFailureMessages_der(value:Array) : void
    {
        var oldValue:Array = model_internal::_validationFailureMessages;
        // avoid firing the event when old and new value are different empty arrays
        if (oldValue !== value && (oldValue.length > 0 || value.length > 0))
        {
            model_internal::_validationFailureMessages = value;
            _model.model_internal::fireChangeEvent("validationFailureMessages", oldValue, model_internal::_validationFailureMessages);
        }
    }


}

}
