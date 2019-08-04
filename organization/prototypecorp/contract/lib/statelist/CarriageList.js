'use strict';

const PrototypeStateList = require('../PrototypeStateList.js');

const CarriageObject = require('../objects/CarriageObject.js');

class CarriageList extends PrototypeStateList {

    constructor(ctx) {
        super(ctx, 'org.protonet.CarriageList');
        this.use(CarriageObject);
    }

    async insert(object) {
        return this.addState(object);
    }

    async retrieve(key) {
        return this.getState(key);
    }
}

module.exports = CarriageList;