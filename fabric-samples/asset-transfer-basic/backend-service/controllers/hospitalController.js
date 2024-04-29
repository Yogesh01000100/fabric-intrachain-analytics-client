const fabricNetwork = require("../network/fabricNetwork");
const User = require("../models/userModel.js");
const axios = require("axios");

const { spawn } = require("child_process");

let count = 0;
exports.getHospitalRole10 = async (req, res) => {
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
    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb?keychainrefId=${keychainrefId}`;
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    console.log("data received! : ", responseData, "count : ", (count += 1));

    /*const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('commonFunction1');
		const resultJson = JSON.parse(result.toString());
		console.log('data : ', resultJson, 'count: ', (count += 1));*/
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

exports.getHospitalRole20 = async (req, res) => {
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

exports.getHospitalRole30 = async (req, res) => {
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

exports.getHospitalRole40 = async (req, res) => {
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

exports.getHospitalRole50 = async (req, res) => {
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

exports.uploadEHR = async (req, res) => {
  try {
    const channelName = "mychannel";
    const chaincodeName = "basic";
    const patientId = req.query.userId;
    const gateway = fabricNetwork.gateways[patientId];

    const jsonData = JSON.stringify(req.body);
    const pythonProcess = spawn("python3", [
      "controllers/python_service.py",
      jsonData,
    ]);

    let pythonData = "";
    let pythonError = "";

    for await (const chunk of pythonProcess.stdout) {
      pythonData += chunk;
    }
    for await (const error of pythonProcess.stderr) {
      pythonError += error;
    }

    const exitCode = await new Promise((resolve) => {
      pythonProcess.on("close", resolve);
    });

    if (exitCode) {
      throw new Error(
        `Python script exited with code ${exitCode}, stderr: ${pythonError}`
      );
    }

    // Fix the Python data
    const fixedPythonData = pythonData.replace(/'/g, '"').trim();
    let pythonDataObject;
    try {
      pythonDataObject = JSON.parse(fixedPythonData);
    } catch (parseError) {
      throw new Error(`Failed to parse pythonData: ${fixedPythonData}`);
    }
    const labreport = {
      disease: {
        diabetes: pythonDataObject.IpfsHash,
      },
    };
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // Correctly pass the parameters to the chaincode function
    const transactionResult = await contract.submitTransaction(
      "UploadEHR",
      patientId,
      JSON.stringify({ LabReports: labreport })
    );

    const resultJson = JSON.parse(transactionResult.toString());

    res.json({
      success: true,
      message: "Data uploaded successfully!",
      data: resultJson,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ error: error.message });
  }
};
