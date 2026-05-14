/**
 * This is a generated class and is not intended for modification.  To customize behavior
 * of this value object you may modify the generated sub-class of this class - HighLowAndMetadata.as.
 */

package valueObjects
{
import com.adobe.fiber.services.IFiberManagingService;
import com.adobe.fiber.valueobjects.IValueObject;
import flash.events.EventDispatcher;
import mx.collections.ArrayCollection;
import mx.events.PropertyChangeEvent;
import valueObjects.Data;

import flash.net.registerClassAlias;
import flash.net.getClassByAlias;
import com.adobe.fiber.core.model_internal;
import com.adobe.fiber.valueobjects.IPropertyIterator;
import com.adobe.fiber.valueobjects.AvailablePropertyIterator;

use namespace model_internal;

[ExcludeClass]
public class _Super_HighLowAndMetadata extends flash.events.EventDispatcher implements com.adobe.fiber.valueobjects.IValueObject
{
    model_internal static function initRemoteClassAliasSingle(cz:Class) : void
    {
    }

    model_internal static function initRemoteClassAliasAllRelated() : void
    {
        valueObjects.Data.initRemoteClassAliasSingleChild();
        valueObjects.Highlowtidepred_type.initRemoteClassAliasSingleChild();
    }

    model_internal var _dminternal_model : _HighLowAndMetadataEntityMetadata;
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
    private var _internal_stationId : String;
    private var _internal_stationName : String;
    private var _internal_latitude : Number;
    private var _internal_longitude : Number;
    private var _internal_state : String;
    private var _internal_dataSource : String;
    private var _internal_COOPSDisclaimer : String;
    private var _internal_beginDate : String;
    private var _internal_endDate : String;
    private var _internal_datum : String;
    private var _internal_unit : String;
    private var _internal_timeZone : String;
    private var _internal_HighLowValues : ArrayCollection;
    model_internal var _internal_HighLowValues_leaf:valueObjects.Data;

    private static var emptyArray:Array = new Array();

    // Change this value according to your application's floating-point precision
    private static var epsilon:Number = 0.0001;

    /**
     * derived property cache initialization
     */
    model_internal var _cacheInitialized_isValid:Boolean = false;

    model_internal var _changeWatcherArray:Array = new Array();

    public function _Super_HighLowAndMetadata()
    {
        _model = new _HighLowAndMetadataEntityMetadata(this);

        // Bind to own data or source properties for cache invalidation triggering

    }

    /**
     * data/source property getters
     */

    [Bindable(event="propertyChange")]
    public function get stationId() : String
    {
        return _internal_stationId;
    }

    [Bindable(event="propertyChange")]
    public function get stationName() : String
    {
        return _internal_stationName;
    }

    [Bindable(event="propertyChange")]
    public function get latitude() : Number
    {
        return _internal_latitude;
    }

    [Bindable(event="propertyChange")]
    public function get longitude() : Number
    {
        return _internal_longitude;
    }

    [Bindable(event="propertyChange")]
    public function get state() : String
    {
        return _internal_state;
    }

    [Bindable(event="propertyChange")]
    public function get dataSource() : String
    {
        return _internal_dataSource;
    }

    [Bindable(event="propertyChange")]
    public function get COOPSDisclaimer() : String
    {
        return _internal_COOPSDisclaimer;
    }

    [Bindable(event="propertyChange")]
    public function get beginDate() : String
    {
        return _internal_beginDate;
    }

    [Bindable(event="propertyChange")]
    public function get endDate() : String
    {
        return _internal_endDate;
    }

    [Bindable(event="propertyChange")]
    public function get datum() : String
    {
        return _internal_datum;
    }

    [Bindable(event="propertyChange")]
    public function get unit() : String
    {
        return _internal_unit;
    }

    [Bindable(event="propertyChange")]
    public function get timeZone() : String
    {
        return _internal_timeZone;
    }

    [Bindable(event="propertyChange")]
    public function get HighLowValues() : ArrayCollection
    {
        return _internal_HighLowValues;
    }

    public function clearAssociations() : void
    {
    }

    /**
     * data/source property setters
     */

    public function set stationId(value:String) : void
    {
        var oldValue:String = _internal_stationId;
        if (oldValue !== value)
        {
            _internal_stationId = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "stationId", oldValue, _internal_stationId));
        }
    }

    public function set stationName(value:String) : void
    {
        var oldValue:String = _internal_stationName;
        if (oldValue !== value)
        {
            _internal_stationName = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "stationName", oldValue, _internal_stationName));
        }
    }

    public function set latitude(value:Number) : void
    {
        var oldValue:Number = _internal_latitude;
        if (isNaN(_internal_latitude) == true || Math.abs(oldValue - value) > epsilon)
        {
            _internal_latitude = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "latitude", oldValue, _internal_latitude));
        }
    }

    public function set longitude(value:Number) : void
    {
        var oldValue:Number = _internal_longitude;
        if (isNaN(_internal_longitude) == true || Math.abs(oldValue - value) > epsilon)
        {
            _internal_longitude = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "longitude", oldValue, _internal_longitude));
        }
    }

    public function set state(value:String) : void
    {
        var oldValue:String = _internal_state;
        if (oldValue !== value)
        {
            _internal_state = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "state", oldValue, _internal_state));
        }
    }

    public function set dataSource(value:String) : void
    {
        var oldValue:String = _internal_dataSource;
        if (oldValue !== value)
        {
            _internal_dataSource = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "dataSource", oldValue, _internal_dataSource));
        }
    }

    public function set COOPSDisclaimer(value:String) : void
    {
        var oldValue:String = _internal_COOPSDisclaimer;
        if (oldValue !== value)
        {
            _internal_COOPSDisclaimer = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "COOPSDisclaimer", oldValue, _internal_COOPSDisclaimer));
        }
    }

    public function set beginDate(value:String) : void
    {
        var oldValue:String = _internal_beginDate;
        if (oldValue !== value)
        {
            _internal_beginDate = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "beginDate", oldValue, _internal_beginDate));
        }
    }

    public function set endDate(value:String) : void
    {
        var oldValue:String = _internal_endDate;
        if (oldValue !== value)
        {
            _internal_endDate = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "endDate", oldValue, _internal_endDate));
        }
    }

    public function set datum(value:String) : void
    {
        var oldValue:String = _internal_datum;
        if (oldValue !== value)
        {
            _internal_datum = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "datum", oldValue, _internal_datum));
        }
    }

    public function set unit(value:String) : void
    {
        var oldValue:String = _internal_unit;
        if (oldValue !== value)
        {
            _internal_unit = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "unit", oldValue, _internal_unit));
        }
    }

    public function set timeZone(value:String) : void
    {
        var oldValue:String = _internal_timeZone;
        if (oldValue !== value)
        {
            _internal_timeZone = value;
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "timeZone", oldValue, _internal_timeZone));
        }
    }

    public function set HighLowValues(value:*) : void
    {
        var oldValue:ArrayCollection = _internal_HighLowValues;
        if (oldValue !== value)
        {
            if (value is ArrayCollection)
            {
                _internal_HighLowValues = value;
            }
            else if (value is Array)
            {
                _internal_HighLowValues = new ArrayCollection(value);
            }
            else if (value == null)
            {
                _internal_HighLowValues = null;
            }
            else
            {
                throw new Error("value of HighLowValues must be a collection");
            }
            this.dispatchEvent(mx.events.PropertyChangeEvent.createUpdateEvent(this, "HighLowValues", oldValue, _internal_HighLowValues));
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
    public function get _model() : _HighLowAndMetadataEntityMetadata
    {
        return model_internal::_dminternal_model;
    }

    public function set _model(value : _HighLowAndMetadataEntityMetadata) : void
    {
        var oldValue : _HighLowAndMetadataEntityMetadata = model_internal::_dminternal_model;
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
