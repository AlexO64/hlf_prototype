'use strict';

const PrototypeStateList = require('../PrototypeStateList.js');

const DeliveryFactObject = require('../objects/DeliveryFactObject.js');

class DeliveryFactList extends PrototypeStateList {
    constructor(ctx) {
        super(ctx, 'org.protonet.DeliveryFactList');
        this.use(DeliveryFactObject);
    }
}

module.exports = DeliveryFactList;