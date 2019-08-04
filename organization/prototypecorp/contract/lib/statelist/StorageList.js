'use strict';

const PrototypeStateList = require('../PrototypeStateList.js');

const StorageObject = require('../objects/StorageObject.js');

class StorageList extends PrototypeStateList {
    constructor(ctx) {
        super(ctx, 'org.protonet.StorageList');
        this.use(StorageObject);
    }
}

module.exports = StorageList;