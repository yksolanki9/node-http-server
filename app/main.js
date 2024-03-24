const net = require("net");

const HTTP_VERSION = 'HTTP/1.1';
const CLRF = '\r\n'

//HTTP Status code and status string map
const HTTP_STATUS_CODE = {
  200: 'OK',
  404: 'Not Found'
}

//Parse and get request method, path and http version from request line
const parseRequestLine = (data) => {
  const requestLine = data.toString().split(CLRF)[0];
  return requestLine.split(' ');
}

//Generate response status line based on status code
const getResponseStatusLine = (statusCode) => {
  return HTTP_VERSION + ' ' +  statusCode + ' ' + HTTP_STATUS_CODE[statusCode] + ' ' + CLRF + CLRF
}

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  //Read data from the client
  socket.on("data", (data) => {
    const [, path] = parseRequestLine(data);

    //Respond to the client
    socket.write(path === '/' ? getResponseStatusLine(200) : getResponseStatusLine(404));
  });
});

server.listen(4221, "localhost");
