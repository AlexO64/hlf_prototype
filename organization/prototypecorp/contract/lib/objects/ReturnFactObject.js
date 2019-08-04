'use strict';

const PrototypeState = require('../PrototypeState.js');

// Object 4ibs: ReturnFact
// 1) ID
// 2) return plan ID
// 3) real return date
class ReturnFactObject extends PrototypeState {

    static getClass() {
        return 'org.protonet.ReturnFactObject';
    }

    static createInstance(id, deliveryPlanId, actualReturnTimestamp) {
        return new ReturnFactObject({id, deliveryPlanId, actualReturnTimestamp, bad:false});
    }

    constructor(obj) {
        super(ReturnFactObject.getClass(), [obj.id]);
        this.id = obj.id;
        this.deliveryPlanId = obj.deliveryPlanId;
        this.actualReturnTimestamp = this.verify_timestamp(obj, "actualReturnTimestamp");
        this.bad = obj.bad;
    }

    async validate(ctx) {
        // Verify referenced objects exist
        
        let deliveryPlan = await ctx.DeliveryPlanList.getState(this.deliveryPlanId);
        let returnPlan = await ctx.ReturnPlanList.getState(deliveryPlan.returnPlanId);

        // Calculate difference between when actual delivery occurred, and when it was scheduled
        let returnFactSeconds = parseInt(this.actualReturnTimestamp);
        let returnPlanSeconds = parseInt(returnPlan.scheduledReturnTimestamp);

        if(returnFactSeconds > returnPlanSeconds) {
            // Update the bad field
            this.bad = true;
        }
    }
}

module.exports = ReturnFactObject;
