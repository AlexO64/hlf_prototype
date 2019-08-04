'use strict';

const PrototypeStateList = require('../PrototypeStateList.js');

const DeliveryPlanObject = require('../objects/DeliveryPlanObject.js');

class DeliveryPlanList extends PrototypeStateList {
    constructor(ctx) {
        super(ctx, 'org.protonet.DeliveryPlanList');
        this.use(DeliveryPlanObject);
    }
}

module.exports = DeliveryPlanList;