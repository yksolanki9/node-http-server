const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  //Read data from the client
  socket.on("data", (data) => {
    console.log("Received data from client!", data.toString());

    //Respond to the client
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  });
});

server.listen(4221, "localhost");
