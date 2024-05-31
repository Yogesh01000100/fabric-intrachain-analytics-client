import { create } from 'kubo-rpc-client';
import fs from 'fs';
import { TextDecoder } from 'util';

const client = create();

async function addFile(content) {
    const startTime = performance.now();
    const { cid } = await client.add(content);
    const endTime = performance.now();
    const uploadTime = endTime - startTime;
    return { cid, uploadTime };
}

async function getFile(cid) {
    const startTime = performance.now();
    let data = [];
    for await (const chunk of client.cat(cid)) {
        data.push(chunk);
    }
    const fileContent = Buffer.concat(data);
    const endTime = performance.now();
    const retrieveTime = endTime - startTime;
    return { fileContent, retrieveTime };
}

async function handleMultipleFiles() {
    const numberOfFiles = 2000;
    const files = [];
    const csvHeader = 'File Number,CID,Upload Time,Retrieve Time\n';
    let csvContent = csvHeader;

    for (let i = 1; i <= numberOfFiles; i++) {
        const content = `{
            "weight": 194,
            "height": 77,
            "age": 49,
            "bmi": 3.9,
            "children": 22,
            "gender": "female",
            "systolic_bp": 61,
            "diastolic_bp": 119,
            "temperature": 22.5,
            "pulse_rate": 118,
            "respiration_rate": 70,
            "glucose_level": 32,
            "cholesterol": 38,
            "hemoglobin": 0.84,
            "diabetes": "No"
          }
          ${i}!`;
        const { cid, uploadTime } = await addFile(content);
        files.push({ cid, uploadTime, fileNumber: i });
    }

    for (const file of files) {
        const { cid, uploadTime, fileNumber } = file;
        const { fileContent, retrieveTime } = await getFile(cid);
        console.log(`Retrieved file content: ${new TextDecoder().decode(fileContent)}`);
        csvContent += `${fileNumber},${cid},${uploadTime},${retrieveTime}\n`;
    }

    fs.writeFileSync('response_times.csv', csvContent);
}

async function fetchContentFromIPFS(cid) {
    try {
        const startTime = performance.now();
        let data = [];
        for await (const chunk of client.cat(cid)) {
            data.push(chunk);
        }
        const fileContent = Buffer.concat(data);
        const endTime = performance.now();
        const retrieveTime = endTime - startTime;

        // Log to console
        console.log(`Time taken to retrieve content: ${retrieveTime}ms`);
        const decodedContent = new TextDecoder().decode(fileContent);
        console.log(`Retrieved content: ${decodedContent}`);

        // Write retrieved content to a CSV file
        fs.writeFileSync('fetched_content.csv', `"File Content"\n"${decodedContent.replace(/"/g, '""')}"`);

        // Write response times to another CSV file
        const responseTimesContent = `CID,Retrieve Time (ms)\n"${cid}",${retrieveTime}`;
        fs.writeFileSync('response_times.csv', responseTimesContent);

    } catch (error) {
        console.error(`Failed to fetch content: ${error}`);
    }
}

fetchContentFromIPFS("QmSLyUUfykFp51HLhuEdPhMV6ewnEYRF98adhSy6UD6Kco").catch(console.error);

//handleMultipleFiles().catch(console.error);

//QmSLyUUfykFp51HLhuEdPhMV6ewnEYRF98adhSy6UD6Kco
//QmUYYVaHLpobSW2eFQRUC1oE4oZwLep6nk5hQ8KfQQMKgn