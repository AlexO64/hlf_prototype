'use strict';

const PrototypeStateList = require('../PrototypeStateList.js');

const ReturnFactObject = require('../objects/ReturnFactObject.js');

class ReturnFactList extends PrototypeStateList {
    constructor(ctx) {
        super(ctx, 'org.protonet.ReturnFactList');
        this.use(ReturnFactObject);
    }
}

module.exports = ReturnFactList;