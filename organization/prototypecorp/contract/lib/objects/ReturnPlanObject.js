'use strict';

const PrototypeState = require('../PrototypeState.js');

// Object 4: ReturnPlan
// 1) ID 
// 2) Scheduled date of return
// 3) Delivery plan ID

class ReturnPlanObject extends PrototypeState {

    static getClass() {
        return 'org.protonet.ReturnPlanObject';
    }

    static createInstance(id, deliveryPlanId, scheduledReturnTimestamp) {
        return new ReturnPlanObject({id, deliveryPlanId, scheduledReturnTimestamp});
    }

    constructor(obj) {
        super(ReturnPlanObject.getClass(), [obj.id])
        this.id = obj.id;
        this.deliveryPlanId = obj.deliveryPlanId;
        this.scheduledReturnTimestamp = this.verify_timestamp(obj, "scheduledReturnTimestamp");
    }

    async validate(ctx) {
        // Verify referenced objects exist
        await ctx.DeliveryPlanList.getState(this.deliveryPlanId);
    }
}

module.exports = ReturnPlanObject;
