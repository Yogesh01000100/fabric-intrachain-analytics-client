import { gateways } from "../network/fabricNetwork.js";
import { create } from "kubo-rpc-client";
import { spawn } from "child_process";
import axios from "axios";
import fs from 'fs';
import os from 'os';

const homeDirectory = os.homedir();
const client = create();

function encryptWithPython(jsonData) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      `${homeDirectory}/intrachain-client-network/fabric-samples/backend/backend-service/controllers/python_service.py`,
    ]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`Python script exited with code ${code}`);
        reject(`Python script exited with code ${code}`);
      } else {
        const filePath = `${homeDirectory}/intrachain-client-network/fabric-samples/backend/backend-service/encrypted_data.dat`;
        resolve(filePath);
      }
    });
    pythonProcess.stdin.write(jsonData);
    pythonProcess.stdin.end();
  });
}

export const uploadEHR = async (req, res) => {
  try {
    const channelName = "mychannel";
    const chaincodeName = "basic";
    const patientId = req.query.userId;
    const gateway = gateways[patientId];

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is empty" });
    }
    async function addToIpfs(filePath) {
      const fileBuffer = fs.readFileSync(filePath);
      try {
        const { cid } = await client.add(fileBuffer);
        console.log(`Data added to IPFS with CID: ${cid}`);
        return cid;
      } catch (error) {
        console.error("Error adding data to IPFS:", error);
        throw error;
      }
    }

    const filePath = await encryptWithPython(JSON.stringify(req.body));
    const cid = await addToIpfs(filePath);

    console.log(`File uploaded with CID: ${cid}`);

    const labreport = {
      disease: {
        diabetes: cid,
      },
    };
    console.log("from ipfs : ", labreport);
    // add to blockchain
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    await contract.submitTransaction(
      "UploadEHR",
      patientId,
      JSON.stringify({ LabReports: labreport })
    );

    res.json({
      success: true,
      cid: cid,
      message: "Data uploaded successfully!",
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const FetchEHR = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const patientId = req.query.userId;
  const gateway = gateways[patientId];

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty" });
  }

  try {
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("FetchEHR", patientId);
    const resultJson = JSON.parse(result.toString());
    res.json({
      success: true,
      message: "Hospital data retrieved successfully!",
      data: resultJson,
    });
  } catch (error) {
    console.log(`Failed to retrieve data for user ${patientId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const FetchAllDiabetesRecords = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const adminGateway = gateways["admin"]; // admin priviledges

  try {
    const network = await adminGateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("FetchAllDiabetesRecords");
    const resultsJson = JSON.parse(result.toString());

    const fetches = resultsJson.map(async (record) => {
      const cid = record.LabReports.disease.diabetes["/"];
      const data = [];
      for await (const chunk of client.cat(cid)) {
        data.push(chunk);
      }
      const fileContent = Buffer.concat(data);

      return {
        fileContent
      };
    });

    const detailedRecords = await Promise.all(fetches);

    res.json({
      success: true,
      message: "All diabetes records retrieved successfully, with detailed data from IPFS!",
      data: detailedRecords,
    });
  } catch (error) {
    console.error(`Failed to retrieve diabetes records: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole10 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  const keychainrefId = req.query.keychainrefId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    //console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    //const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb?keychainrefId=${keychainrefId}`;
    //const response = await axios.get(apiUrl);
    //const responseData = response.data;
    //console.log("data received! : ", responseData, "count : ", (count += 1));

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("commonFunction1");
    const resultJson = JSON.parse(result.toString());
    console.log("data : ", resultJson, "count: ", (count += 1));
    res.json({
      success: true,
      message: "Hospital data retrieved successfully!",
      data: responseData,
    });
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole20 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    //console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-my-profile-patient-hspb?user_id=${userId}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    console.log("data received! : ", responseData);

    /*const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('commonFunction1');
		const resultJson = JSON.parse(result.toString());
		console.log('data : ', resultJson, 'count: ', (count += 1));
		res.json({
			success: true,
			message: 'Hospital data retrieved successfully!',
			data: resultJson,
		}); */
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole30 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    //console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-my-profile-patient-hspb?user_id=${userId}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    console.log("data received! : ", responseData);

    /*const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('commonFunction1');
		const resultJson = JSON.parse(result.toString());
		console.log('data : ', resultJson, 'count: ', (count += 1));
		res.json({
			success: true,
			message: 'Hospital data retrieved successfully!',
			data: resultJson,
		}); */
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole40 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  //console.log("gateways in controller: ", fabricNetwork.gateways);
  const gateway = fabricNetwork.gateways[userId];
  //console.log("user gateway->", gateway);
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    // console.log(gateways[userId]);
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    // if keychain id is same then proceed with these if not matching or it has a different keychain_id more than 1 then forward the req
    // to the cactus server-> if else condition
    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-my-profile-patient-hspb?user_id=${userId}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    console.log("data received! : ", responseData);

    /*const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('commonFunction1');
		const resultJson = JSON.parse(result.toString());
		console.log('data : ', resultJson, 'count: ', (count += 1));
		res.json({
			success: true,
			message: 'Hospital data retrieved successfully!',
			data: resultJson,
		}); */
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};

export const getHospitalRole50 = async (req, res) => {
  const channelName = "mychannel";
  const chaincodeName = "basic";
  const userId = req.query.userId;
  const gateway = fabricNetwork.gateways[userId];
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID must be provided as a query parameter" });
  }

  const user = await User.findOne({ u_id: userId });

  if (!gateway || !user) {
    return res
      .status(400)
      .json({ error: "Error at gateway! Invalid or unspecified user ID" });
  }

  try {
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("commonFunction1");
    const resultJson = JSON.parse(result.toString());
    console.log("data : ", resultJson, "count: ", (count += 1));
    res.json({
      success: true,
      message: "Hospital data retrieved successfully!",
      data: resultJson,
    });
  } catch (error) {
    console.log(`Failed to retrieve data for user ${userId}: ${error}`);
    res.status(500).json({ error: error.message });
  }
};
