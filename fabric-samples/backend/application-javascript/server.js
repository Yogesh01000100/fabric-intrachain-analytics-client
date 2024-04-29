'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');
const cache = require('memory-cache');

const cacheMiddleware = (duration) => {
	return (req, res, next) => {
		const key = '__express__' + (req.originalUrl || req.url);
		const cachedBody = cache.get(key);
		if (cachedBody) {
			res.send(cachedBody);
			return;
		} else {
			res.sendResponse = res.send;
			res.send = (body) => {
				cache.put(key, body, duration * 1000);
				res.sendResponse(body);
			};
			next();
		}
	};
};

const app = express();
const port = 3007;

// Assuming the channel and chaincode names
const channelName = 'mychannel';
const chaincodeName = 'basic';

// Path to the wallet directory
const walletPath = path.join(__dirname, 'wallet');

// Object to store gateway connections
const gateways = {};

app.use(express.json());

// Middleware to extract user ID from request and set it for later use
app.use((req, res, next) => {
	const userId = req.query.userId;
	if (!userId) {
		return res
			.status(400)
			.json({ error: 'User ID must be provided as a query parameter' });
	}
	req.userId = userId;
	next();
});

// Function to initialize gateways for all user IDs
async function initializeGateways(userIds) {
	const ccpPath = path.resolve(
		__dirname,
		'..',
		'..',
		'test-network',
		'organizations',
		'peerOrganizations',
		'org1.example.com',
		'connection-org1.json'
	);
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
		} catch (error) {
			console.error(
				`Failed to initialize gateway for user ${userId}: ${error}`
			);
		}
	}
}
let count = 0;
// API endpoint to retrieve hospital data
app.get('/getHospitalRole10', async (req, res) => {
	const userId = req.userId;
	const gateway = gateways[userId];

	if (!gateway) {
		return res.status(400).json({ error: 'Invalid or unspecified user ID' });
	}

	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('commonFunction1');
		const resultJson = JSON.parse(result.toString());
		console.log('data : ', resultJson, 'count: ', (count += 1));
		res.json({
			success: true,
			message: 'Hospital data retrieved successfully!',
			data: resultJson,
		});
	} catch (error) {
		console.log(`Failed to retrieve data for user ${userId}: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getHospitalRole20', async (req, res) => {
	const userId = req.userId;
	const gateway = gateways[userId];

	if (!gateway) {
		return res.status(400).json({ error: 'Invalid or unspecified user ID' });
	}

	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('commonFunction2');
		const resultJson = JSON.parse(result.toString());
		console.log('data : ', resultJson, 'count: ', (count += 1));
		res.json({
			success: true,
			message: 'Hospital data retrieved successfully!',
			data: resultJson,
		});
	} catch (error) {
		console.log(`Failed to retrieve data for user ${userId}: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getHospitalRole30', async (req, res) => {
	const userId = req.userId;
	const gateway = gateways[userId];

	if (!gateway) {
		return res.status(400).json({ error: 'Invalid or unspecified user ID' });
	}

	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('commonFunction3');
		const resultJson = JSON.parse(result.toString());
		console.log('data : ', resultJson, 'count: ', (count += 1));
		res.json({
			success: true,
			message: 'Hospital data retrieved successfully!',
			data: resultJson,
		});
	} catch (error) {
		console.log(`Failed to retrieve data for user ${userId}: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

// initializing gateway connections
const userIds = [
	'c84c1dd3-8d65-5ba9-996f-84e9dc9599ae',
	'15cf6f0c-c698-5124-96fe-086b68417334',
	'f93f038b-9fbf-53a9-9d64-73e31cbe027a',
	'ea8aebfa-4007-50b4-9bbc-3e053aad75c9',
	'4157b19d-b510-5f20-a3ce-98592f654322',
	'8d25d806-7037-53a3-be02-8f150083fe3a',
	'febe9983-99c8-5f1d-8016-2c814727be6a',
	'ed116d1b-c4e7-5276-8379-740a55157e1a',
	'd27bc6ae-b34d-5b48-ba7a-e9094a55908e',
	'0986e77d-9c84-59fd-8799-bf6e44346845',
	'245e857c-4743-58df-a7e2-a42f2554da29',
	'43a54462-2892-58b1-9389-3a70493cad98',
	'2bffae7d-a687-5735-b5b5-ebf9321855c5',
	'72250669-273a-58b0-828b-d701e210eca7',
	'bfbd8935-c1dc-519e-a289-8b8ecc87a726',
	'e96418d7-779a-5eb7-8f83-5697f2b42d49',
	'c264e3bf-fd2c-501d-8fa6-c725495d5a90',
	'87235a69-fb41-537d-adbe-b6643512a906',
	'29a7a2c7-9b4b-568d-be7c-e19a9a884a31',
	'fc6d33b5-b32e-5010-9b7b-db8045d25de8',
	'2a800950-52a1-52f3-b4ae-7452fb3b86c2',
	'8d6ac14c-95fa-55f6-b852-0615db896d56',
	'0de05d4a-4f1b-52d4-b5e8-4d9a720faa01',
	'f595675e-a669-57d8-9783-abfb8887b7f1',
	'caba15bf-62f4-56f4-878e-da8e9272a7d8',
	'a72d8410-cecf-578d-8691-8baf307eb127',
	'e2ce772c-1a11-58bb-8792-06727e7a13a1',
	'91d86e8d-c67b-5f65-8aa4-d81be8ff0fdf',
	'f78f7f3e-e203-5d0a-99b1-20c422dd5d67',
	'28d1d1ea-c970-566c-bdba-a5f99baefd54',
];
initializeGateways(userIds)
	.then(() => {
		app.listen(port, () => {
			console.log(`Server listening at http://localhost:${port}`);
		});
	})
	.catch((error) => {
		console.error(`Failed to start the server: ${error}`);
	});
