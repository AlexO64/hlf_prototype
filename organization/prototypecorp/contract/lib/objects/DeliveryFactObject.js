'use strict';

const PrototypeState = require('../PrototypeState.js');
const { timestamp_to_date } = require('../utils.js');

// Object 3ibs: DeliveryFact
// 1) ID
// 2) delivery plan ID
// 3) real delivery date
class DeliveryFactObject extends PrototypeState {

    static getClass() {
        return 'org.protonet.DeliveryFactObject';
    }

    static createInstance(id, deliveryPlanId, actualDeliveryTimestamp) {
        return new DeliveryFactObject({id, deliveryPlanId, actualDeliveryTimestamp, bad:false});
    }

    constructor(obj) {
        super(DeliveryFactObject.getClass(), [obj.id]);
        this.id = obj.id;
        this.deliveryPlanId = obj.deliveryPlanId;
        this.actualDeliveryTimestamp = this.verify_timestamp(obj, "actualDeliveryTimestamp");
        this.bad = obj.bad;
    }

    async validate(ctx) {
        // Verify referenced objects exist
        let deliveryPlan = await ctx.DeliveryPlanList.getState(this.deliveryPlanId);

        // Get storage object
        let storageObject = await ctx.StorageList.getState(deliveryPlan.storageId);

        // Calculate difference between when actual delivery occurred, and when it was scheduled
        let deliveryDelaySeconds = parseInt(this.actualDeliveryTimestamp) - parseInt(deliveryPlan.scheduledDeliveryTimestamp);

        // Convert to days
        let deliveryDelayDays = deliveryDelaySeconds / (3600 * 24);

        // Check if delay exceeds allowable delay
        if(deliveryDelayDays > storageObject.allowableDeliveryDelayDays) {
            // Update the bad field
            this.bad = true;
        }
    }
}

module.exports = DeliveryFactObject;
