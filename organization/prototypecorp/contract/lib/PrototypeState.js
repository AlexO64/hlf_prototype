'use strict';

const State = require('../ledger-api/state.js');

// Base class for other contract State objects
class PrototypeState extends State {

    constructor(stateClass, keyParts) {
        super(stateClass, keyParts);
        this.currentState = "created";
    }

    // Validate this object for insertion into a PrototypeStateList
    // Should check things like referenced objects exist, values are within range, etc
    async validate(ctx) {
        // No validation by default
    }

    // Convert this object to it's JSON string representation
    toString() {
        return JSON.stringify(this);
    }

    // Helper functions to reduce property verification boilerplate
    verify_integer(object, property) {
        const propertyValue = object[property];
        if(isNaN(parseInt(propertyValue))) {
            throw Error(property + " is not a valid number");
        }
        return propertyValue;
    }

    verify_positive_integer(object, property) {
        const propertyValue = this.verify_integer(object, property);
        if(propertyValue < 0) {
            throw Error(property + " cannot be negative");
        }
        return propertyValue;
    }

    verify_timestamp(object, property) {
        const propertyValue = object[property];
        if(isNaN(new Date(propertyValue * 1000))) { // Timestamp is in seconds, convert to milliseconds
            throw Error(property + " is not a valid timestamp");
        }
        return propertyValue;
    }
}

module.exports = PrototypeState;
