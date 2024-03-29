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

//Parse the request data
const parseRequest = (data) => {
  //Split the data by CRLF
  const parsedBody = data.toString().split(CRLF);

  //Parse the request line
  const [method, path, httpVersion] = parsedBody[0].split(' ');

  //Get all the headers in JSON format
  const bodyStartIndex = parsedBody.findIndex(val => val === '');
  const headersString = parsedBody.slice(1, bodyStartIndex);
  const headers = getJsonFromStringArray(headersString);

  return {
    method,
    path,
    httpVersion,
    headers
  }
}

//Generate response status line based on status code
const getResponseStatusLine = (statusCode) => {
  return HTTP_VERSION + ' ' +  statusCode + ' ' + HTTP_STATUS_CODE[statusCode] + ' ' + CRLF
}

//Convert string to JSON
const getStringFromJson = (json) => {
  return Object.entries(json).map(([key, value]) => `${key}: ${value}`).join(CRLF) + CRLF
}

//Convert array of strings to JSON
const getJsonFromStringArray = (arr) => {
  return arr.reduce((acc, curr) => {
    const [key, value] = curr.split(':').map(val => val.trim());
    return {
      ...acc,
      [key]: value
    }
  } , {});
}

//Generate Representation Headers
const generateRepresentationHeaders = (body) => {
  const headerJson = {
   'Content-Type': 'text/plain',
   'Content-Length': body?.length ?? 0
  }

  return getStringFromJson(headerJson)
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
    const {path, headers} = parseRequest(data);

    let body;
    if(path.includes('/echo/')) {
      body = path.split('/echo/')[1];
    } else if(path === '/user-agent') {
      body = headers['User-Agent'];
    }

    // const body = path === '/user-agent' ? getHeader() : getRandomString(path);
    const res = generateResponse(body || path === '/' ? 200 : 404, body);

    //Respond to the client
    socket.write(res);
  });
});

server.listen(4221, "localhost");
