import { create } from 'kubo-rpc-client';


const client = create();

async function addFile(content) {
    console.time(`Upload time for: ${content}`);
    const { cid } = await client.add(content);
    console.timeEnd(`Upload time for: ${content}`);
    return cid;
}

async function getFile(cid) {
    console.time(`Retrieve time for CID: ${cid}`);
    let data = [];
    for await (const chunk of client.cat(cid)) {
        data.push(chunk);
    }
    const fileContent = Buffer.concat(data);
    console.timeEnd(`Retrieve time for CID: ${cid}`);
    return fileContent;
}

async function handleMultipleFiles() {
    const numberOfFiles = 10;
    const files = [];
    
    for (let i = 1; i <= numberOfFiles; i++) {
        const content = `Hello world from Hi file ${i}!`;
        const cid = await addFile(content);
        files.push(cid);
    }

    for (const cid of files) {
        const fileContent = await getFile(cid);
        console.log(`Retrieved file content: ${new TextDecoder().decode(fileContent)}`);
    }
}

handleMultipleFiles().catch(console.error);
