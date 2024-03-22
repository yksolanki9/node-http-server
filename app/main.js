const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

const client = net.createConnection({port: 4221}, () => {
  console.log('Connected to server!');
})

//Listener for when data is received on the connection
client.on('data', (data) => {
  console.log('Received data from server!', data);

  //Write data back to the server
  client.write('HTTP/1.1 200 OK\r\n\r\n');
  client.end();
})

server.listen(4221, "localhost");
