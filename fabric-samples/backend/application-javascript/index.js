'use strict';
const express = require('express');
const path = require('path');
const fs = require('fs');
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
app.use(express.json());

const port = 3000;

const channelName = process.env.CHANNEL_NAME || 'mychannel';
const chaincodeName = 'basic';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'c84c1dd3-8d65-5ba9-996f-84e9dc9599ae';


let gateway;
let count=0;
// Connect to the Hyperledger Fabric network when the server starts
(async () => {
	try {
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
		const fileExists = fs.existsSync(ccpPath);

		if (!fileExists) {
			throw new Error(`no such file or directory: ${ccpPath}`);
		}

		const contents = fs.readFileSync(ccpPath, 'utf8');
		const ccp = JSON.parse(contents);

		const wallet = await Wallets.newFileSystemWallet(walletPath);

		gateway = new Gateway();
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true },
		});

		console.log('Connected to the Hyperledger Fabric network');
	} catch (error) {
		console.error(`Error connecting to the network: ${error}`);
		process.exit(1);
	}
})();


app.post('/createDoctor', async (req, res) => {
	const { doctorId, data } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		await contract.submitTransaction(
			'CreateDoctor',
			doctorId,
			JSON.stringify(data)
		);

		res
			.status(201)
			.json({
				success: true,
				message: 'Doctor created successfully',
				doctorId,
			});
	} catch (error) {
		console.error(`Error creating doctor profile: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getMyProfileDoctor/:doctorId',
	cacheMiddleware(5),
	async (req, res) => {
		const { doctorId } = req.params;

		try {
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			const result = await contract.evaluateTransaction(
				'GetMyProfileDoctor',
				doctorId
			);
			console.log('request received!',count+=1);
			const profile = JSON.parse(result.toString());
			res.status(200).json(profile);
		} catch (error) {
			console.error(`Error retrieving doctor profile: ${error}`);
			res.status(500).json({ error: error.message });
		}
	}
);

app.post('/createPatient', async (req, res) => {
	const { patientId, data } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		await contract.submitTransaction(
			'CreatePatient',
			patientId,
			JSON.stringify(data)
		);

		res
			.status(201)
			.json({
				success: true,
				message: 'Patient created successfully',
				patientId,
			});
	} catch (error) {
		console.error(`Error creating patient profile: ${error}`);
		res.status(500).json({ error: error.message });
	}
});


app.get('/getMyProfilePatient/:patientId',
	cacheMiddleware(5),
	async (req, res) => {
		const { patientId } = req.params;
		try {
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			const result = await contract.evaluateTransaction(
				'GetMyProfilePatient',
				patientId
			);

			const profile = JSON.parse(result.toString());
			res.status(200).json(profile);
		} catch (error) {
			console.error(`Error retrieving patient profile: ${error}`);
			res.status(500).json({ error: error.message });
		}
	}
);


app.post('/createAssistantDoctor', async (req, res) => {
	const { assistantDoctorId, data } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		await contract.submitTransaction(
			'CreateAssistantDoctor',
			assistantDoctorId,
			JSON.stringify(data)
		);

		res
			.status(201)
			.json({
				success: true,
				message: 'AssistantDoctor created successfully',
				assistantDoctorId,
			});
	} catch (error) {
		console.error(`Error creating AssistantDoctor profile: ${error}`);
		res.status(500).json({ error: error.message });
	}
});


app.get('/getMyProfileAssistantDoctor/:assistantDoctorId',
	cacheMiddleware(5),
	async (req, res) => {
		const { assistantDoctorId } = req.params;
		try {
			const network = await gateway.getNetwork(channelName);
			const contract = network.getContract(chaincodeName);

			const result = await contract.evaluateTransaction(
				'GetMyProfileAssistantDoctor',
				assistantDoctorId
			);

			const profile = JSON.parse(result.toString());
			res.status(200).json(profile);
		} catch (error) {
			console.error(`Error retrieving AssistantDoctor profile: ${error}`);
			res.status(500).json({ error: error.message });
		}
	}
);

app.post('/updateHospitalDetails', async (req, res) => {
	const { hospitalId, details } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		await contract.submitTransaction('UpdateHospitalDetails', hospitalId, JSON.stringify(details));

		res.status(200).json({
			success: true,
			message: 'Hospital details updated successfully',
		});
	} catch (error) {
		console.error(`Failed to update hospital details: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/logMaintenanceActivity', async (req, res) => {
	const { activityDetails } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		const result = await contract.submitTransaction('LogMaintenanceActivity', JSON.stringify(activityDetails));
		const resultJson = JSON.parse(result.toString());

		res.status(200).json({
			success: true,
			message: 'Maintenance activity logged successfully',
			activityId: resultJson.activityId,
		});
	} catch (error) {
		console.error(`Failed to log maintenance activity: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/updatePatientCareRecord', async (req, res) => {
	const { patientId, careRecord } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		await contract.submitTransaction('UpdatePatientCareRecord', patientId, JSON.stringify(careRecord));

		res.status(200).json({
			success: true,
			message: 'Patient care record updated successfully',
		});
	} catch (error) {
		console.error(`Failed to update patient care record: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/logTestResults', async (req, res) => {
	const { patientId, testResults } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		await contract.submitTransaction('LogTestResults', patientId, JSON.stringify(testResults));

		res.status(200).json({
			success: true,
			message: 'Test results logged successfully',
		});
	} catch (error) {
		console.error(`Failed to log test results: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/logEmergencyResponse', async (req, res) => {
	const { incidentId, responseDetails } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('LogEmergencyResponse', incidentId, JSON.stringify(responseDetails));
		res.status(200).json({ success: true, message: 'Emergency response logged successfully.' });
	} catch (error) {
		console.error(`Error logging emergency response: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/manageUserPermissions', async (req, res) => {
	const { userId, permissions } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('ManageUserPermissions', userId, JSON.stringify(permissions));
		res.status(200).json({ success: true, message: 'User permissions updated successfully.' });
	} catch (error) {
		console.error(`Error updating user permissions: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/updateITInfrastructure', async (req, res) => {
	const { updateDetails } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('UpdateITInfrastructure', JSON.stringify(updateDetails));
		res.status(200).json({ success: true, message: 'IT infrastructure updated successfully.' });
	} catch (error) {
		console.error(`Error updating IT infrastructure: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/submitResearchFindings', async (req, res) => {
	const { researchId, findings } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('SubmitResearchFindings', researchId, JSON.stringify(findings));
		res.status(200).json({ success: true, message: 'Research findings submitted successfully.' });
	} catch (error) {
		console.error(`Error submitting research findings: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/createConsultationAppointment', async (req, res) => {
	const { patientId, consultantId, details } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.submitTransaction('CreateConsultationAppointment', patientId, consultantId, JSON.stringify(details));
		const resultJson = JSON.parse(result.toString());
		res.status(200).json({
			success: true,
			message: 'Consultation appointment created successfully.',
			consultationId: resultJson.consultationId,
		});
	} catch (error) {
		console.error(`Failed to create consultation appointment: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/acceptAppointment', async (req, res) => {
	const { appointmentId } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('AcceptAppointment', appointmentId);
		res.status(200).json({ success: true, message: 'Appointment accepted successfully.' });
	} catch (error) {
		console.error(`Failed to accept appointment: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/sendEHRToAppointment', async (req, res) => {
	const { appointmentId, ehrId } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('SendEHRToAppointment', appointmentId, ehrId);
		res.status(200).json({ success: true, message: 'EHR linked to appointment successfully.' });
	} catch (error) {
		console.error(`Failed to link EHR to appointment: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getEHRForDoctor/:appointmentId', async (req, res) => {
	const { appointmentId } = req.params;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('GetEHRForDoctor', appointmentId);
		res.status(200).json(JSON.parse(result.toString()));
	} catch (error) {
		console.error(`Failed to retrieve EHR for doctor: ${error}`);
		res.status(500).json({ error: error.message });
	}
});
app.get('/getEHRForPatient/:patientId', async (req, res) => {
	const { patientId } = req.params;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('GetEHRForPatient', patientId);
		res.status(200).json(JSON.parse(result.toString()));
	} catch (error) {
		console.error(`Failed to retrieve EHR for patient: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/updateMedicationDispensation', async (req, res) => {
	const { patientId, medicationDetails } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		await contract.submitTransaction('UpdateMedicationDispensation', patientId, JSON.stringify(medicationDetails));
		res.status(200).json({ success: true, message: 'Medication dispensation updated successfully.' });
	} catch (error) {
		console.error(`Failed to update medication dispensation: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/logSecurityIncident', async (req, res) => {
	const { incidentDetails } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.submitTransaction('LogSecurityIncident', JSON.stringify(incidentDetails));
		const resultJson = JSON.parse(result.toString());
		res.status(200).json({
			success: true,
			message: 'Security incident logged successfully.',
			incidentId: resultJson.incidentId,
		});
	} catch (error) {
		console.error(`Failed to log security incident: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getPatientStatus/:patientId', async (req, res) => {
	const { patientId } = req.params;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.evaluateTransaction('GetPatientStatus', patientId);
		res.status(200).json(JSON.parse(result.toString()));
	} catch (error) {
		console.error(`Failed to get patient status: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/scheduleDietaryConsultation', async (req, res) => {
	const { patientId, dietitianId, consultationDetails } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.submitTransaction('ScheduleDietaryConsultation', patientId, dietitianId, JSON.stringify(consultationDetails));
		const resultJson = JSON.parse(result.toString());
		res.status(200).json({
			success: true,
			message: 'Dietary consultation scheduled successfully.',
			consultationId: resultJson.consultationId,
		});
	} catch (error) {
		console.error(`Failed to schedule dietary consultation: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/updateITInfrastructure', async (req, res) => {
	const { updateDetails } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.submitTransaction('UpdateITInfrastructure', JSON.stringify(updateDetails));
		const resultJson = JSON.parse(result.toString());
		res.status(200).json({
			success: true,
			message: 'IT infrastructure update logged successfully.',
			updateId: resultJson.updateId,
		});
	} catch (error) {
		console.error(`Failed to update IT infrastructure: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/submitResearchFindings', async (req, res) => {
	const { researchId, findings } = req.body;
	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);
		const result = await contract.submitTransaction('SubmitResearchFindings', researchId, JSON.stringify(findings));
		const resultJson = JSON.parse(result.toString());
		res.status(200).json({
			success: true,
			message: 'Research findings submitted successfully.',
			researchId: resultJson.researchId,
		});
	} catch (error) {
		console.error(`Failed to submit research findings: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getAppointmentData/:userId', async (req, res) => {
	const { userId } = req.params;

	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		const result = await contract.evaluateTransaction('GetAppointmentData', userId);
		const resultJson = JSON.parse(result.toString());

		res.json({
			success: true,
			message: 'Appointment data retrieved successfully based on user role',
			data: resultJson
		});
	} catch (error) {
		console.error(`Failed to retrieve appointment data based on user role: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getAppointmentDataForReceptionist/:appointmentId', async (req, res) => {
	const { appointmentId } = req.params;

	try {

		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		const result = await contract.evaluateTransaction('GetAppointmentDataForReceptionist',appointmentId);
		const resultJson = JSON.parse(result.toString());

		res.json({
			success: true,
			message: 'Appointment data retrieved successfully for receptionist.',
			data: resultJson
		});
	} catch (error) {
		console.error(`Failed to retrieve appointment data for receptionist: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.post('/createAppointment', async (req, res) => {
	const { patientId, doctorId, appointmentDetails } = req.body;

	const userId = req.user.userId;

	try {
		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		const result = await contract.submitTransaction('CreateAppointment', patientId, doctorId, JSON.stringify(appointmentDetails), userId);
		const resultJson = JSON.parse(result.toString());

		res.json({
			success: true,
			message: 'Appointment created successfully',
			data: resultJson
		});
	} catch (error) {
		console.error(`Failed to create appointment: ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.get('/getHospitalRole10', async (req, res) => {

	try {

		const network = await gateway.getNetwork(channelName);
		const contract = network.getContract(chaincodeName);

		const result = await contract.evaluateTransaction('commonFunction1');
		const resultJson = JSON.parse(result.toString());

		res.json({
			success: true,
			message: 'Hospital data retrieved successfully!',
			data: resultJson
		});
	} catch (error) {
		console.error(`Failed to retrieve data:  ${error}`);
		res.status(500).json({ error: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});
