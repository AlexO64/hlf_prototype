"use strict";

const fs = require("fs");
const yaml = require("js-yaml");
const { FileSystemWallet, Gateway } = require("fabric-network");

// Load wallet
const wallet = new FileSystemWallet("../identity/user/user1/wallet");

module.exports.invoke_contract = async(method, argsArray) => {

    let response;

    // Create gateway object
    const gateway = new Gateway();

    try {
        // Load connection profile
        const connectionProfile = yaml.safeLoad(fs.readFileSync("../gateway/networkConnection.yaml", "utf8"));

        // Connect to gateway
        await gateway.connect(connectionProfile, {
            identity: "User1@org1.example.com",
            wallet: wallet,
            discovery: {
                enabled: false,
                asLocalhost: true
            }
        });

        // Get channel
        const network = await gateway.getNetwork("mychannel");

        // Get contract
        const contract = await network.getContract("prototypecontract", "org.protonet.prototype");

        // Add method type to beginning of argument list
        argsArray.unshift(method);

        // Invoke the submitTransaction function
        response = await contract.submitTransaction.apply(contract, argsArray);
        response = JSON.parse(response);

    } catch(e) {
        // Propagate error messages
        if(e.message) {
            response = { error: e.message };
        } else {
            response = { error: e };
        }
    }

    gateway.disconnect();
    return JSON.stringify(response);
};
