'use strict';

const PrototypeStateList = require('../PrototypeStateList.js');

const ReturnPlanObject = require('../objects/ReturnPlanObject.js');

class ReturnPlanList extends PrototypeStateList {
    constructor(ctx) {
        super(ctx, 'org.protonet.ReturnPlanList');
        this.use(ReturnPlanObject);
    }
}

module.exports = ReturnPlanList;