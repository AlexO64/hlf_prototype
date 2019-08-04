'use strict';

const { Contract, Context } = require('fabric-contract-api');

const StorageObject = require('./objects/StorageObject.js');
const StorageList = require('./statelist/StorageList.js');

const CarriageObject = require('./objects/CarriageObject.js');
const CarriageList = require('./statelist/CarriageList.js');

const DeliveryPlanObject = require('./objects/DeliveryPlanObject.js');
const DeliveryPlanList = require('./statelist/DeliveryPlanList.js');

const ReturnPlanObject = require('./objects/ReturnPlanObject.js');
const ReturnPlanList = require('./statelist/ReturnPlanList.js');

const DeliveryFactObject = require('./objects/DeliveryFactObject.js');
const DeliveryFactList = require('./statelist/DeliveryFactList.js');

const ReturnFactObject = require('./objects/ReturnFactObject.js');
const ReturnFactList = require('./statelist/ReturnFactList.js');

const { timestamp_to_date } = require('./utils.js');

// Custom contract context to store our custom data
class PrototypeContext extends Context {

    constructor() {
        super();
        this.StorageList = new StorageList(this);
        this.CarriageList = new CarriageList(this);
        this.DeliveryPlanList = new DeliveryPlanList(this);
        this.ReturnPlanList = new ReturnPlanList(this);
        this.DeliveryFactList = new DeliveryFactList(this);
        this.ReturnFactList = new ReturnFactList(this);
    }
}

// Contract implementation
class PrototypeContract extends Contract {

    constructor() {
        super('org.protonet.prototype');
    }

    // Use our custom context
    createContext() {
        return new PrototypeContext();
    }

    // Instatiation setup
    async instantiate(ctx) {
        let resetAllState = false; // Set to true to delete all states. Useful for testing
        if(resetAllState) {
            let iterator = await ctx.stub.getStateByRange('', '~');
            let result = {};
            while(!result.done) {
                result = await iterator.next();
                if(result.value) {
                    await ctx.stub.deleteState(result.value.key);
                }
            }
            await iterator.close();
        }
    }

    // Storage object
    async insertStorageObject(ctx, id, name, unloadingSpeedInTonnesPerHour, allowableDeliveryDelayDays, allowableReleaseDelayHours) {
        let object = StorageObject.createInstance(id, name, unloadingSpeedInTonnesPerHour, allowableDeliveryDelayDays, allowableReleaseDelayHours);
        await ctx.StorageList.insert(object);
        return object.toString();
    }

    async retrieveStorageObject(ctx, id) {
        let object = await ctx.StorageList.retrieve(id);
        return object.toString();
    }

    async deleteStorageObject(ctx, id) {
        await ctx.StorageList.delete(id);
        return true;
    }

    // Carriage object
    async insertCarriageObject(ctx, id, capacityInTonnes) {
        let object = CarriageObject.createInstance(id, capacityInTonnes);
        await ctx.CarriageList.insert(object);
        return object.toString();
    }

    async retrieveCarriageObject(ctx, id) {
        let object = await ctx.CarriageList.retrieve(id);
        return object.toString();
    }

    async deleteCarriageObject(ctx, id) {
        await ctx.CarriageList.delete(id);
        return true;
    }

    // DeliveryPlan object
    async insertDeliveryPlanObject(ctx, id, scheduledDeliveryTimestamp, carriageId, storageId) {
        let object = DeliveryPlanObject.createInstance(id, scheduledDeliveryTimestamp, carriageId, storageId);
        await ctx.DeliveryPlanList.insert(object);
        return object.toString();
    }

    async retrieveDeliveryPlanObject(ctx, id) {
        let object = await ctx.DeliveryPlanList.retrieve(id);
        return object.toString();
    }

    async deleteDeliveryPlanObject(ctx, id) {
        //remove existing references object
        const deliveryPlan = await ctx.DeliveryPlanList.retrieve(id); 
        if(deliveryPlan.deliveryFactId != null){
            try{
                await deleteDeliveryFactObject(ctx, deliveryPlan.deliveryFactId );
            }catch(err){ }
        }
        if(deliveryPlan.returnPlanId != null){
            try{
                await deleteReturnPlanObject(ctx, deliveryPlan.returnPlanId);
            }catch(err){ }
        }
        if(deliveryPlan.returnFactId != null){
            try{
                await deleteReturnFactObject(ctx, deliveryPlan.returnFactId);
            }catch(err){ }
        }
        
        await ctx.DeliveryPlanList.delete(id);
        return true;
    }

    // DeliveryFact object
    async insertDeliveryFactObject(ctx, id, deliveryPlanId, actualDeliveryTimestamp) {
        let object = DeliveryFactObject.createInstance(id, deliveryPlanId, actualDeliveryTimestamp);
        await ctx.DeliveryFactList.insert(object);

        // clear save reference to this object in delivery plan
        let deliveryPlan = await ctx.DeliveryPlanList.getState(deliveryPlanId);
        if(deliveryPlan.deliveryFactId != null){
            try{
                await deleteDeliveryFactObject(ctx, deliveryPlan.deliveryFactId );
            }catch(err){ }
        }
        deliveryPlan.deliveryFactId = id;
        await ctx.DeliveryPlanList.updateState(deliveryPlan);

        return object.toString();
    }

    async retrieveDeliveryFactObject(ctx, id) {
        let object = await ctx.DeliveryFactList.retrieve(id);
        return object.toString();
    }

    async deleteDeliveryFactObject(ctx, id) {
        await ctx.DeliveryFactList.delete(id);
        return true;
    }

    // ReturnPlan object
    async insertReturnPlanObject(ctx, id, deliveryPlanId, scheduledReturnTimestamp) {
        let object = ReturnPlanObject.createInstance(id, deliveryPlanId, scheduledReturnTimestamp);
        await ctx.ReturnPlanList.insert(object);

        // save reference to this object in delivery plan
        let deliveryPlan = await ctx.DeliveryPlanList.getState(deliveryPlanId);
        if(deliveryPlan.returnPlanId != null){
            try{
                await deleteReturnPlanObject(ctx, deliveryPlan.returnPlanId);
            }catch(err){ }
        }
        deliveryPlan.returnPlanId = id;
        await ctx.DeliveryPlanList.updateState(deliveryPlan);

        return object.toString();
    }

    async retrieveReturnPlanObject(ctx, id) {
        let object = await ctx.ReturnPlanList.retrieve(id);
        return object.toString();
    }

    async deleteReturnPlanObject(ctx, id) {
        await ctx.ReturnPlanList.delete(id);
        return true;
    }

    // ReturnFact object
    async insertReturnFactObject(ctx, id, deliveryPlanId, actualReturnTimestamp) {
        let object = ReturnFactObject.createInstance(id, deliveryPlanId, actualReturnTimestamp);
        await ctx.ReturnFactList.insert(object);

        // save reference to this object in delivery plan
        let deliveryPlan = await ctx.DeliveryPlanList.getState(deliveryPlanId);
        if(deliveryPlan.returnFactId != null){
            try{
                await deleteReturnFactObject(ctx, deliveryPlan.returnFactId);
            }catch(err){ }
        }
        deliveryPlan.returnFactId = id;
        await ctx.DeliveryPlanList.updateState(deliveryPlan);

        return object.toString();
    }

    async retrieveReturnFactObject(ctx, id) {
        let object = await ctx.ReturnFactList.retrieve(id);
        return object.toString();
    }

    async deleteReturnFactObject(ctx, id) {
        await ctx.ReturnFactList.delete(id);
        return true;
    }

    /*
    async queryStatus(ctx, id) {
        let returnFactValue = await ctx.ReturnFactList.retrieve(id);
        const returnFactActualReturnTimestamp = returnFactValue.actualReturnTimestamp;
        
        let returnPlanValue = await ctx.ReturnPlanList.retrieve(returnFactValue.returnPlanId);
        const returnPlanScheduledReturnTimestamp = returnPlanValue.scheduledReturnTimestamp;
        
        if( timestamp_to_date(returnFactActualReturnTimestamp) <= timestamp_to_date(returnPlanScheduledReturnTimestamp) ){
            return "Ok";
        }

        let deliveryFactValue = await ctx.DeliveryFactList.retrieve(id); 
        const  deliveryFactActualDeliveryTimestamp = deliveryFactValue.actualDeliveryTimestamp;   

        let deliveryPlanValue = await ctx.DeliveryPlanList.retrieve(deliveryFactValue.deliveryPlanId);
        const deliveryPlanScheduledDeliveryTimestamp = deliveryPlanValue.scheduledDeliveryTimestamp;

        if( timestamp_to_date(deliveryFactActualDeliveryTimestamp) <= timestamp_to_date(deliveryPlanScheduledDeliveryTimestamp) ){
            return "Storage";
        }
        return "Carrige";
        
    }  
    */ 

    async queryStatus(ctx, id) {
        const deliveryPlan = await ctx.DeliveryPlanList.retrieve(id); 
        if(deliveryPlan.deliveryFactId == null 
            || deliveryPlan.returnPlanId == null 
        || deliveryPlan.returnFactId == null ){
            return "Not executed";
        }
        const deliveryFactValue = await ctx.DeliveryFactList.retrieve(deliveryPlan.deliveryFactId); 
        const returnFactValue = await ctx.ReturnFactList.retrieve(deliveryPlan.returnFactId);

        if(returnFactValue.bad == false){
            return "Ok";
        }

        if(deliveryFactValue.bad == false){
            return "Storage";
        }
        return "Carrige";
        
    }    
}

module.exports = PrototypeContract;
