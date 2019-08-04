'use strict';

const PrototypeState = require('../PrototypeState.js');

// Object 3: DeliveryPlan
// 1) ID
// 2) Scheduled date of delivery
// 3) Carriage ID
// 4) Storage ID

// filling up later
// 5) Delivery fact Id
// 6) Return plan Id
// 7) Return fact Id

class DeliveryPlanObject extends PrototypeState {

    static getClass() {
        return 'org.protonet.DeliveryPlanObject';
    }

    static createInstance(id, scheduledDeliveryTimestamp, carriageId, storageId) {
        return new DeliveryPlanObject(
            {
                id, 
                scheduledDeliveryTimestamp, 
                carriageId, 
                storageId,
                deliveryFactId : null,
                returnPlanId : null,
                returnFactId : null
            });
    }

    constructor(obj) {
        super(DeliveryPlanObject.getClass(), [obj.id]);
        this.id = obj.id;
        this.scheduledDeliveryTimestamp = this.verify_timestamp(obj, "scheduledDeliveryTimestamp");
        this.carriageId = obj.carriageId;
        this.storageId = obj.storageId;
        this.deliveryFactId = obj.deliveryFactId;
        this.returnPlanId = obj.returnPlanId;
        this.returnFactId = obj.returnFactId;
    }



    async validate(ctx) {
        // Verify referenced objects exist
        await ctx.StorageList.getState(this.storageId);
        await ctx.CarriageList.getState(this.carriageId);
    }
}

module.exports = DeliveryPlanObject;
