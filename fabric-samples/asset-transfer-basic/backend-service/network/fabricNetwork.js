const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const gateways = {};
const walletPath = path.join(__dirname, 'wallet');

exports.initializeGateways = async (userIds) => {
    const ccpPath = '/home/yogesh/Documents/Program.s/Interoperable-EHR-Management/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';

    
	const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
	const wallet = await Wallets.newFileSystemWallet(walletPath);

	for (let userId of userIds) {
		try {
			const gateway = new Gateway();
			await gateway.connect(ccp, {
				wallet,
				identity: userId,
				discovery: { enabled: true, asLocalhost: true },
			});
			gateways[userId] = gateway;
            //console.log("gateway: ",gateways);
		} catch (error) {
			console.error(`Failed to initialize gateway for user ${userId}:`, error);
		}
	}
};

exports.gateways = gateways;
