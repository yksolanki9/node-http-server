const net = require("net");

const HTTP_VERSION = 'HTTP/1.1';
const CR = '\r';
const LF = '\n';
const CRLF = CR + LF;

//HTTP Status code and status string map
const HTTP_STATUS_CODE = {
  200: 'OK',
  404: 'Not Found'
}

//Parse and get request method, path and http version from request line
const parseRequestLine = (data) => {
  const requestLine = data.toString().split(CRLF)[0];
  return requestLine.split(' ');
}

//Generate response status line based on status code
const getResponseStatusLine = (statusCode) => {
  return HTTP_VERSION + ' ' +  statusCode + ' ' + HTTP_STATUS_CODE[statusCode] + ' ' + CRLF
}

//Convert string to JSON
const getStringFromJson = (json) => {
  return Object.entries(json).map(([key, value]) => `${key}: ${value}`).join(CRLF) + CRLF
}

//Generate Representation Headers
const generateRepresentationHeaders = (body) => {
  const headerJson = {
   'Content-Type': 'text/plain',
   'Content-Length': body?.length ?? 0
  }

  return getStringFromJson(headerJson)
}

//Get random string from path
const getRandomString = (path) => {
  return path.split('/echo/')[1];
}

//Generate response string
const generateResponse = (statusCode, body) => {
  let res = getResponseStatusLine(statusCode);

  if (body) {
    res += generateRepresentationHeaders(body);
    res += LF + body + CRLF;
  }
  return res + CRLF;
}

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  //Read data from the client
  socket.on("data", (data) => {
    const [, path] = parseRequestLine(data);
    const randomString = getRandomString(path);
    const res = generateResponse(randomString || path === '/' ? 200 : 404, randomString);

    //Respond to the client
    socket.write(res);
  });
});

server.listen(4221, "localhost");
