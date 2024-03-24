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

    const parsedData = data.toString().split('\r\n');
    const path = parsedData[0].split(' ')[1];

    const res = {status: 404, message: 'Not Found'};
    if(path === '/'){
      res.status = 200;
      res.message = 'OK'
    }

    //Respond to the client
    socket.write(`HTTP/1.1 ${res.status} ${res.message}\r\n\r\n`);
  });
});

server.listen(4221, "localhost");
