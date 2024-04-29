import axios from "axios";
import User from "../models/User.js";
import { spawn } from "child_process";

let count = 0;
export async function getHospitalData10(req, res) {
  try {
    const userId = req.query.userId;
    const keychainrefId = req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-10?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData20(req, res) {
  try {
    const userId = req.query.userId;
    const keychainrefId = req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-20?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData30(req, res) {
  try {
    const userId = req.query.userId;
    const keychainrefId = req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-30?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData40(req, res) {
  try {
    const userId = req.query.userId;
    const keychainrefId = req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-40?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHospitalData50(req, res) {
  try {
    const userId = req.query.userId;
    const keychainrefId = req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });

    if (user) {
      const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/get-hospital-data-hspb-50?keychainrefId=${keychainrefId}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;
      console.log("data received! : ", responseData, "count : ", (count += 1));
      return res.status(201).json({ responseData });
    } else {
      return res.status(404).json({ error: "User not found!" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function uploadEHR(req, res) {
  try {
    const userId = req.query.userId;
    const keychainrefId = req.query.keychainrefId;

    const user = await User.findOne({ u_id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

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

    const exitCode = await new Promise((resolve, reject) => {
      pythonProcess.on("close", resolve);
    });

    if (exitCode) {
      throw new Error(
        `Python script exited with code ${exitCode}, stderr: ${pythonError}`
      );
    }

    try {
      let pythonDataObject;
      try {
        pythonDataObject = JSON.parse(pythonData.trim());
      } catch (parseError) {
        console.error(
          "Failed to parse pythonData:",
          parseError,
          "Received data:",
          pythonData
        );
        return res
          .status(500)
          .json({ error: "Error parsing data from Python script." });
      }

      const bodyData = {
        patientId: userId,
        data: JSON.stringify({
          ipfsHash: pythonDataObject.IpfsHash,
        }),
      };
      console.log(bodyData);
    } catch (error) {
      console.error(error);
    }

    const apiUrl = `http://localhost:4100/api/cactus-healthcare-backend/uploadEHR?keychainrefId=${keychainrefId}`;

    const response = await axios.post(apiUrl, bodyData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(201).json({ apiResponse: response });
  } catch (error) {
    console.log("error!");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
