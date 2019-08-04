"use strict";

const fs = require("fs");
const yaml = require("js-yaml");
const { FileSystemWallet, Gateway } = require("fabric-network");

let hasFailure = false;

async function test(name, func) {
    process.stdout.write("Testing " + name + "...");
    try {
        await func();
        console.log("\x1b[32m", "success");
        process.stdout.write("\x1b[0m");
    } catch(e) {
        hasFailure = true;
        console.log("\x1b[31m", "failure ");
        console.log(e.message);
        process.stdout.write("\x1b[0m");
    }
}

function verify_equal(left, right) {
    if(left !== right) {
        throw Error("expected " + right + " but got " + left);
    }
}

function verify_includes(left, right) {
    if(!left.includes(right)) {
        throw Error("expected " + left + " to include " + right + " but it doesnt");
    }
}

async function main() {

    const gateway = new Gateway();

    try {
        // Load wallet
        const wallet = new FileSystemWallet("../../identity/user/user1/wallet");

        // Load connection profile
        const connectionProfile = yaml.safeLoad(fs.readFileSync("../../gateway/networkConnection.yaml", "utf8"));

        // Connect to gateway
        console.log("Connecting to gateway...");
        await gateway.connect(connectionProfile, {
            identity: "User1@org1.example.com",
            wallet: wallet,
            discovery: {
                enabled: false,
                asLocalhost: true
            }
        });

        // Get channel
        console.log("Retrieving channel...");
        const network = await gateway.getNetwork("mychannel");

        // Get contract
        console.log("Retrieving smart contract...");
        const contract = await network.getContract("prototypecontract", "org.protonet.prototype");

        // Use contract
        console.log("Running transactions...");

        await test("InsertStorageObject", async() => {
            try {
                await contract.submitTransaction("deleteStorageObject", "1");
            } catch(e) { /**/ }

            let response = await contract.submitTransaction("insertStorageObject", "1", "testStorage", "5", "1", "2");
            let object = JSON.parse(response);
            verify_equal(object.id, "1");
            verify_equal(object.name, "testStorage");
            verify_equal(object.unloadingSpeedInTonnesPerHour, "5");
            verify_equal(object.allowableDeliveryDelayDays, "1");
            verify_equal(object.allowableReleaseDelayHours, "2");
        });

        await test("RetrieveStorageObject", async() => {
            let response = await contract.evaluateTransaction("retrieveStorageObject", "1");
            let object = JSON.parse(response);
            verify_equal(object.id, "1");
            verify_equal(object.name, "testStorage");
            verify_equal(object.unloadingSpeedInTonnesPerHour, "5");
            verify_equal(object.allowableDeliveryDelayDays, "1");
            verify_equal(object.allowableReleaseDelayHours, "2");
        });

        await test("InsertCarriageObject", async() => {
            try {
                await contract.submitTransaction("deleteCarriageObject", "10");
            } catch(e) { /**/ }

            let response = await contract.submitTransaction("insertCarriageObject", "10", "100");
            let object = JSON.parse(response);
            verify_equal(object.id, "10");
            verify_equal(object.capacityInTonnes, "100");
        });

        await test("RetrieveCarriageObject", async() => {
            let response = await contract.evaluateTransaction("retrieveCarriageObject", "10");
            let object = JSON.parse(response);
            verify_equal(object.id, "10");
            verify_equal(object.capacityInTonnes, "100");
        });

        await test("InsertDeliveryPlanObject", async() => {
            try {
                await contract.submitTransaction("deleteDeliveryPlanObject", "6");
            } catch(e) {  }

            let response = await contract.submitTransaction("insertDeliveryPlanObject", "6", "1563836380", "10", "1");
            let object = JSON.parse(response);
            verify_equal(object.id, "6");
            verify_equal(object.scheduledDeliveryTimestamp, "1563836380");
            verify_equal(object.carriageId, "10");
            verify_equal(object.storageId, "1");
        });

        await test("RetrieveDeliveryPlanObject", async() => {
            let response = await contract.evaluateTransaction("retrieveDeliveryPlanObject", "6");
            let object = JSON.parse(response);
            verify_equal(object.id, "6");
            verify_equal(object.scheduledDeliveryTimestamp, "1563836380");
            verify_equal(object.carriageId, "10");
            verify_equal(object.storageId, "1");
        });

        await test("InsertDeliveryPlanObject_BadCarriageId", async() => {
            let error = "";
            try {
                await contract.submitTransaction("insertDeliveryPlanObject", "8", "1563836380", "11", "1");
            } catch(e) {
                error = e.message;
            }
            verify_includes(error, "org.protonet.CarriageList get key does not exist");
        });

        await test("InsertDeliveryPlanObject_BadStorageId", async() => {
            let error = "";
            try {
                await contract.submitTransaction("insertDeliveryPlanObject", "8", "1563836380", "10", "2");
            } catch(e) {
                error = e.message;
            }
            verify_includes(error, "org.protonet.StorageList get key does not exist");
        });

        await test("InsertDeliveryFactObject", async() => {
            try {
                await contract.submitTransaction("deleteDeliveryFactObject", "32");
            } catch(e) { }

            let response = await contract.submitTransaction("insertDeliveryFactObject", "32", "6", "1564143580");
            let object = JSON.parse(response);
            verify_equal(object.id, "32");
            verify_equal(object.deliveryPlanId, "6");
            verify_equal(object.actualDeliveryTimestamp, "1564143580");
            verify_equal(object.bad, true);
        });

        await test("RetrieveDeliveryFactObject", async() => {
            let response = await contract.evaluateTransaction("retrieveDeliveryFactObject", "32");
            let object = JSON.parse(response);
            verify_equal(object.id, "32");
            verify_equal(object.deliveryPlanId, "6");
            verify_equal(object.actualDeliveryTimestamp, "1564143580");
            verify_equal(object.bad, true);
        });

        await test("RetrieveDeliveryPlanObject", async() => {
            let response = await contract.evaluateTransaction("retrieveDeliveryPlanObject", "6");
            let object = JSON.parse(response);
            verify_equal(object.id, "6");
            verify_equal(object.scheduledDeliveryTimestamp, "1563836380");
            verify_equal(object.carriageId, "10");
            verify_equal(object.storageId, "1");
            verify_equal(object.deliveryFactId, "32");
        });

       await test("InsertDeliveryFactObject_BadDeliveryPlanId", async() => {
            let error = "";
            try {
                await contract.submitTransaction("insertDeliveryFactObject", "33", "7", "1563836380");
            } catch(e) {
                error = e.message;
            }
            verify_includes(error, "org.protonet.DeliveryPlanList get key does not exist");
        });

        await test("InsertReturnPlanObject", async() => {
            try {
                await contract.submitTransaction("deleteReturnPlanObject", "15");
            } catch(e) {  }

            let response = await contract.submitTransaction("insertReturnPlanObject", "15", "6", "1563836380");

            let object = JSON.parse(response);
            verify_equal(object.id, "15");
            verify_equal(object.deliveryPlanId, "6");
            verify_equal(object.scheduledReturnTimestamp, "1563836380");
        });

        await test("RetrieveReturnPlanObject", async() => {
            let response = await contract.evaluateTransaction("retrieveReturnPlanObject", "15");
            let object = JSON.parse(response);
            verify_equal(object.id, "15");
            verify_equal(object.deliveryPlanId, "6");
            verify_equal(object.scheduledReturnTimestamp, "1563836380");
        });

        await test("RetrieveDeliveryPlanObject", async() => {
            let response = await contract.evaluateTransaction("retrieveDeliveryPlanObject", "6");
            let object = JSON.parse(response);
            verify_equal(object.id, "6");
            verify_equal(object.scheduledDeliveryTimestamp, "1563836380");
            verify_equal(object.carriageId, "10");
            verify_equal(object.storageId, "1");
            verify_equal(object.deliveryFactId, "32");
            verify_equal(object.returnPlanId, "15");
        
        });

        await test("InsertReturnPlanObject_BadDeliveryPlanId", async() => {
            let error = "";
            try {
                await contract.submitTransaction("insertReturnPlanObject", "8", "bad delivery plan id", "1563836380");
            } catch(e) {
                error = e.message;
            }
            verify_includes(error, "org.protonet.DeliveryPlanList get key does not exist");
        });     


        await test("InsertReturnFactObject", async() => {
            try {
                await contract.submitTransaction("deleteReturnFactObject", "51");
            } catch(e) {  }

            let response = await contract.submitTransaction("insertReturnFactObject", "51", "6", "1563836380");
            let object = JSON.parse(response);
            verify_equal(object.id, "51");
            verify_equal(object.deliveryPlanId, "6");
            verify_equal(object.actualReturnTimestamp, "1563836380");
        });

        await test("RetrieveReturnFactObject", async() => {
            let response = await contract.evaluateTransaction("retrieveReturnFactObject", "51");
            let object = JSON.parse(response);
            verify_equal(object.id, "51");
            verify_equal(object.deliveryPlanId, "6");
            verify_equal(object.actualReturnTimestamp, "1563836380");
        });

        await test("RetrieveDeliveryPlanObject", async() => {
            let response = await contract.evaluateTransaction("retrieveDeliveryPlanObject", "6");
            let object = JSON.parse(response);
            verify_equal(object.id, "6");
            verify_equal(object.scheduledDeliveryTimestamp, "1563836380");
            verify_equal(object.carriageId, "10");
            verify_equal(object.storageId, "1");
            verify_equal(object.deliveryFactId, "32");
            verify_equal(object.returnPlanId, "15");
            verify_equal(object.returnFactId, "51");

        });

        await test("InsertReturnFactObject_BadReturnPlanId", async() => {
            let error = "";
            try {
                await contract.submitTransaction("insertReturnFactObject", "52", "16", "1563836380");
            } catch(e) {
                error = e.message;
            }
            verify_includes(error, "org.protonet.DeliveryPlanList get key does not exist");
        });

        await test("queryStatus", async() => {
            let response = await contract.evaluateTransaction("queryStatus", "6");
            console.log(response);
        });
     
        if(hasFailure) {
            console.log("Some tests failed");
        } else {
            console.log("All tests succeeded!");
        }

    } catch (error) {

        // Print error
        console.log("Encountered error: " + error);

    } finally {

        // Disconnect from network
        console.log("Disconnecting from gateway");
        gateway.disconnect();
    }
}

main();
