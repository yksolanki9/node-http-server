const net = require("net");
const fs = require("fs");

const HTTP_VERSION = "HTTP/1.1";
const CR = "\r";
const LF = "\n";
const CRLF = CR + LF;

//HTTP Status code and status string map
const HTTP_STATUS_CODE = {
  200: "OK",
  404: "Not Found",
};

//Parse the request data
const parseRequest = (data) => {
  //Split the data by CRLF
  const parsedBody = data.toString().split(CRLF);

  //Parse the request line
  const [method, path, httpVersion] = parsedBody[0].split(" ");

  //Get all the headers in JSON format
  const bodyStartIndex = parsedBody.findIndex((val) => val === "");
  const headersString = parsedBody.slice(1, bodyStartIndex);
  const headers = getJsonFromStringArray(headersString);

  const body =
    parsedBody.length > bodyStartIndex + 1
      ? parsedBody[bodyStartIndex + 1]
      : undefined;

  return {
    method,
    path,
    httpVersion,
    headers,
    body,
  };
};

//Generate response status line based on status code
const getResponseStatusLine = (statusCode) => {
  return (
    HTTP_VERSION +
    " " +
    statusCode +
    " " +
    HTTP_STATUS_CODE[statusCode] +
    " " +
    CRLF
  );
};

//Convert string to JSON
const getStringFromJson = (json) => {
  return (
    Object.entries(json)
      .map(([key, value]) => `${key}: ${value}`)
      .join(CRLF) + CRLF
  );
};

//Convert array of strings to JSON
const getJsonFromStringArray = (arr) => {
  return arr.reduce((acc, curr) => {
    const [key, value] = curr.split(":").map((val) => val.trim());
    return {
      ...acc,
      [key]: value,
    };
  }, {});
};

//Generate Representation Headers
const generateRepresentationHeaders = (body, headers) => {
  const headerJson = {
    "Content-Type": "text/plain",
    "Content-Length": body?.length ?? 0,
    ...headers,
  };

  return getStringFromJson(headerJson);
};

//Generate response string
const generateResponse = (statusCode, body, headers = {}) => {
  let res = getResponseStatusLine(statusCode);
  res += generateRepresentationHeaders(body, headers);
  res += !!body ? LF + body : CRLF;
  return res;
};

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
    server.close();
  });

  //Read data from the client
  socket.on("data", (buffer) => {
    const {
      method,
      path,
      headers: reqHeaders,
      body: reqBody,
    } = parseRequest(buffer);

    let body;
    let headers = {};
    let statusCode = 404;

    if (path === '/') {
      statusCode = 200;
    } else if (path.includes("/echo/")) {
      body = path.split("/echo/")[1];
    } else if (path === "/user-agent") {
      body = reqHeaders["User-Agent"];
    } else if (path.includes("/files/")) {
      const filePath = process.argv[3] + path.split("/files/")[1];
      
      if (method === "GET") {
        try {
          const file = fs.readFileSync(filePath);
          headers = {
            "Content-Type": "application/octet-stream",
          };
          body = file;
        } catch (e) {}
      } else if (method === "POST") {
        fs.writeFileSync(filePath, reqBody);
        statusCode = 201;
      }
    }

    if (body) {
      statusCode = 200;
    }

    const res = generateResponse(
      statusCode,
      body,
      headers
    );

    //Respond to the client
    socket.write(res);
  });
});

server.listen(4221, "localhost");
