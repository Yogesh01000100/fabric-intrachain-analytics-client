import { initializeGateways, gateways } from "../network/fabricNetwork.js";

import User from "../models/userModel.js";
import axios from "axios";
import { create } from "kubo-rpc-client";

const client = create();

let id = 1;
let count = 0;

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

export const uploadEHR = async (req, res) => {
  try {
    const channelName = "mychannel";
    const chaincodeName = "basic";
    const patientId = req.query.userId;
    const gateway = gateways[patientId];

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is empty" });
    }
    const jsonData = JSON.stringify(req.body); // add homomorphic encryption here
    console.log(jsonData);
    // encrypt the data and send to ipfs

    const { cid } = await client.add(jsonData);
    console.log(`File uploaded with CID: ${cid}`);

    const labreport = {
      disease: {
        diabetes: cid,
      },
    };
    console.log("from ipfs : ", labreport);
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    await contract.submitTransaction(
      "UploadEHR",
      id,
      JSON.stringify({ LabReports: labreport })
    );
    id++;

    res.json({
      success: true,
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
  const { userId } = req.body;
  console.log("Id: ", userId);
  const gateway = gateways['c84c1dd3-8d65-5ba9-996f-84e9dc9599ae'];

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty" });
  }

  try {
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    const result = await contract.evaluateTransaction("FetchEHR", userId);
    const resultJson = JSON.parse(result.toString());
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
