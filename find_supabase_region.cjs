const net = require('net');

const regions = [
    'us-east-1',
    'us-west-1',
    'us-west-2',
    'eu-west-1',
    'eu-west-2',
    'eu-central-1',
    'ap-south-1',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'sa-east-1',
    'ca-central-1'
];

async function checkPort(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000); // 2 second timeout

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, host);
    });
}

async function main() {
    console.log("Scanning Supabase regions on port 6543...");
    for (const region of regions) {
        const host = `aws-0-${region}.pooler.supabase.com`;
        process.stdout.write(`Testing ${host}... `);
        const isOpen = await checkPort(host, 6543);
        if (isOpen) {
            console.log("OPEN! Trying to find correct routing...");
            // Even if it's open, Supavisor routes globally, but it only ACCEPTS the project ID if we are in the RIGHT region?
            // Wait, Supavisor actually accepts connections globally and routes them to the right region automatically now!
            // Let's test this theory!
        } else {
            console.log("CLOSED.");
        }
    }
}
main();
