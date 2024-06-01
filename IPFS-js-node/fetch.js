import { create } from 'kubo-rpc-client';
import fs from 'fs';

const client = create();

async function fetchContentFromIPFS(cid) {
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
    }
}

fetchContentFromIPFS("QmaxB4NHBcofu2xY59rFwcYfX1euE9UvBxi1F8vkpDS3Rz").catch(console.error);
