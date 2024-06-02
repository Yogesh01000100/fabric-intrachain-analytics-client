const express = require('express');
const axios = require('axios');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());
const port = 3008;
const backendUrl = 'http://localhost:3010';

app.get('/fetch-diabetes-record', async (req, res) => {
    try {
        const response = await axios.get(`${backendUrl}/fetch-all-record`);
        const encryptedData = response.data.data[0].fileContent.data;

        const pythonProcess = spawn('python', ['./model.py']);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python process error: ${error}`);
                return res.status(500).send(`Failed to execute prediction model: ${error}`);
            }
            res.send(result);
        });

        if (Array.isArray(encryptedData)) {
            const buffer = Buffer.from(encryptedData);
            pythonProcess.stdin.write(buffer);
        } else {
            console.error('Expected encryptedData to be an array of byte values.');
            return res.status(500).send('Internal server error: Incorrect data format.');
        }

        pythonProcess.stdin.end();

    } catch (error) {
        console.error("Error fetching record from backend server:", error);
        res.status(500).send("Failed to fetch record from backend server.");
    }
});


app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
