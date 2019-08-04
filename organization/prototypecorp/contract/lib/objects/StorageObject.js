'use strict';

const PrototypeState = require('../PrototypeState.js');

// Object 1 : Storage
// 1) ID 
// 2) Name
// 3) Speed of unloading (tonn/hour)
// 4) allowable delay in delivery (days)
// 5) allowable delay in release (hours)
class StorageObject extends PrototypeState {

    static getClass() {
        return 'org.protonet.StorageObject';
    }

    static createInstance(id, name, unloadingSpeedInTonnesPerHour, allowableDeliveryDelayDays, allowableReleaseDelayHours) {
        return new StorageObject({id, name, unloadingSpeedInTonnesPerHour, allowableDeliveryDelayDays, allowableReleaseDelayHours});
    }

    constructor(obj) {
        super(StorageObject.getClass(), [obj.id]);
        this.id = obj.id;
        this.name = obj.name;
        this.unloadingSpeedInTonnesPerHour = this.verify_positive_integer(obj, "unloadingSpeedInTonnesPerHour");
        this.allowableDeliveryDelayDays = this.verify_positive_integer(obj, "allowableDeliveryDelayDays");
        this.allowableReleaseDelayHours = this.verify_positive_integer(obj, "allowableReleaseDelayHours");
    }

    async validate(ctx) {
        // No validation
    }
}

module.exports = StorageObject;
