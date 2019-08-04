'use strict';

const StateList = require('../ledger-api/statelist.js');

// State list that does not allow addState for an already existing key
class PrototypeStateList extends StateList {

    constructor(ctx, name) {
        super(ctx, name);
    }

    async addState(object) {
        await object.validate(this.ctx);

        let exists = await this.hasState(object.getKey());
        if(exists) {
            throw Error(this.name + " add key already exists");
        }

        return super.addState(object);
    }

    async getState(key) {
        let object = await super.getState(key);
        if(!object) {
            throw Error(this.name + " get key does not exist");
        }

        return object;
    }

    async updateState(object) {
        await object.validate(this.ctx);

        let exists = await this.hasState(object.getKey());
        if(!exists) {
            throw Error(this.name + " update key does not exist");
        }

        return super.updateState(object);
    }

    async hasState(key) {
        return super.getState(key);
    }

    async deleteState(key) {
        let exists = await this.hasState(key);
        if(!exists) {
            throw Error(this.name + " delete key does not exist");
        }

        // @nt: should we check foreign key rules being broken somehow here?

        return super.deleteState(key);
    }

    // Short name aliases for the above
    async insert(object) {
        return this.addState(object);
    }
    async retrieve(key) {
        return this.getState(key);
    }
    async exists(key) {
        return this.hasState(key);
    }
    async delete(key) {
        return this.deleteState(key);
    }
}

module.exports = PrototypeStateList;