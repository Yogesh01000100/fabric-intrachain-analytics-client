import { create } from 'kubo-rpc-client';
import fs from 'fs';

const client = create();

async function fetchContentFromIPFS(cid) {
    console.time("Fetch and Write Time");  // Start timing
    try {
        let data = [];
        for await (const chunk of client.cat(cid)) {
            data.push(chunk);
        }
        const fileContent = Buffer.concat(data);
        fs.writeFileSync('encrypted_data.dat', fileContent);
        console.log('done');
    } catch (error) {
        console.error(`Failed to fetch content from IPFS: ${error}`);
    } finally {
        console.timeEnd("Fetch and Write Time");  // End timing and log it
    }
}

fetchContentFromIPFS("QmaxB4NHBcofu2xY59rFwcYfX1euE9UvBxi1F8vkpDS3Rz").catch(console.error);
