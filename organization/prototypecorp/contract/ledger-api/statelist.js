/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const State = require('./state.js');

// @nt: Replacement for ctx.stub.createCompositeKey
// The stub version seems to insert special bytes into the string that cause getState and getStateByRange
// to not work correctly when fetching these keys
function createCompositeKey(objectType, attributes) {
    let result = String(objectType);
    for(let i = 0; i < attributes.length; ++i) {
        if(i > 0) {
            result += ":";
        }
        result += String(attributes[i]);
    }
    return result;
}

/**
 * StateList provides a named virtual container for a set of ledger states.
 * Each state has a unique key which associates it with the container, rather
 * than the container containing a link to the state. This minimizes collisions
 * for parallel transactions on different states.
 */
class StateList {

    /**
     * Store Fabric context for subsequent API access, and name of list
     */
    constructor(ctx, listName) {
        this.ctx = ctx;
        this.name = listName;
        this.supportedClasses = {};

    }

    /**
     * Add a state to the list. Creates a new state in worldstate with
     * appropriate composite key.  Note that state defines its own key.
     * State object is serialized before writing.
     */
    async addState(state) {
        // @nt: Call replacement for ctx.stub.createCompositeKey
        let key = createCompositeKey(this.name, state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    /**
     * Get a state from the list using supplied keys. Form composite
     * keys to retrieve state from world state. State data is deserialized
     * into JSON object before being returned.
     */
    async getState(key) {
        // @nt: Call replacement for ctx.stub.createCompositeKey
        let ledgerKey = createCompositeKey(this.name, State.splitKey(key));
        let data = await this.ctx.stub.getState(ledgerKey);
        if (data && data.toString('utf8')){
            let state = State.deserialize(data, this.supportedClasses);
            return state;
        } else {
            return null;
        }
    }

    async getStateByRange(startKey, endKey) {
        const startLedgerKey = createCompositeKey(this.name, State.splitKey(startKey));
        const endLedgerKey = createCompositeKey(this.name, State.splitKey(endKey));

        const iterator = await this.ctx.stub.getStateByRange(startLedgerKey, endLedgerKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                //console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    //console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                //console.log('end of data');
                await iterator.close();
                //console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    /**
     * Update a state in the list. Puts the new state in world state with
     * appropriate composite key.  Note that state defines its own key.
     * A state is serialized before writing. Logic is very similar to
     * addState() but kept separate becuase it is semantically distinct.
     */
    async updateState(state) {
        // @nt: Call replacement for ctx.stub.createCompositeKey
        let key = createCompositeKey(this.name, state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    // @nt: Added deleteState
    async deleteState(key) {
        let ledgerKey = createCompositeKey(this.name, State.splitKey(key));
        await this.ctx.stub.deleteState(ledgerKey);
    }

    /** Stores the class for future deserialization */
    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

}

module.exports = StateList;