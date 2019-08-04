'use strict';

const PrototypeState = require('../PrototypeState.js');

// Object 2: Carriage
// 1) ID
// 2) Capacity (tonn)
class CarriageObject extends PrototypeState {

    static getClass() {
        return 'org.protonet.CarriageObject';
    }

    static createInstance(id, capacityInTonnes) {
        return new CarriageObject({id, capacityInTonnes});
    }

    constructor(obj) {
        super(CarriageObject.getClass(), [obj.id]);
        this.id = obj.id;
        this.capacityInTonnes = this.verify_positive_integer(obj, "capacityInTonnes");
    }

    async validate(ctx) {
        // No validation
    }
}

module.exports = CarriageObject;
