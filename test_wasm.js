const http = require('http');

http.get('http://localhost:3000/stockfish/stockfish-nnue-16-single.wasm', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);

    let data = [];
    res.on('data', (chunk) => {
        data.push(chunk);
    });

    res.on('end', () => {
        const buffer = Buffer.concat(data);
        console.log(`Read ${buffer.length} bytes.`);

        // Print first 20 bytes as hex and ascii
        const slice = buffer.slice(0, 20);
        console.log('HEX:', slice.toString('hex').match(/../g)?.join(' '));
        console.log('ASCII:', slice.toString('ascii'));
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
