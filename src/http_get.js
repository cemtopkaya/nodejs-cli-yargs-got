const http2 = require("http2");
const { get } = require("http2-client");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";



const retrieveGot = async (url, path, cert = null) => {
  const got = require('got');

    try {
      const {headers, body}= await got(url, {http2: true});
      // const response = await got(url, {http2: true});
      // console.log(response.json());
      console.log(headers);
      console.log(body);
      //=> '<!doctype html> ...'
    } catch (error) {
      console.log(error);
      //=> 'Internal server error ...'
    }
}

const retrieveWrapper = (url, path, cert = null) => {
  const http2 = require("http2-wrapper");

  const options = {
    hostname: "localhost:8009",
    protocol: "https:", // Try changing this to https:
    path: "/nrf-settings/v1/general",
    method: "GET",
    headers: {
      "content-length": 6,
    },
  };

  try {
    return new Promise(async (resolve) => {
      const request = await http2.auto(options, (response) => {
        console.log("statusCode:", response.statusCode);
        console.log("headers:", response.headers);

        const body = [];
        response.on("data", (chunk) => body.push(chunk));
        response.on("end", () => {
          console.log("body:", Buffer.concat(body).toString());
          resolve(body);
        });
      });
      request.on("error", console.error);
      request.write("123");
      request.end("456");
    });
  } catch (error) {
    console.error(error);
  }
};

const retrieveGet = (url, path, cert = null) => {
  let h2Target = url;
  return new Promise((resolve, reject) => {
    get(h2Target, (res, err, body) => {
      console.log(
        `
  Url : ${h2Target}
  Status : ${res.statusCode}
  HttpVersion : ${res.httpVersion}
  res :
      `,
        body
      );
      resolve(res);
    });
  });
};

const retrieveOrg = (url, path, cert = null) =>
  new Promise((resolve, reject) => {
    let client = null;
    if (cert != null) {
      client = http2.connect(url, {
        key: fs.readFileSync(cert),
      });
    } else {
      client = http2.connect(url);
    }
    const req = client.request({
      [http2.constants.HTTP2_HEADER_SCHEME]: "https",
      [http2.constants.HTTP2_HEADER_METHOD]: http2.constants.HTTP2_METHOD_GET,
      [http2.constants.HTTP2_HEADER_PATH]: `${path}`,
    });

    req.setEncoding("utf8");
    const data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });

    req.on("error", (err) => {
      console.log(">>> Bağlanacağı adres: ", url, err);
      reject(err);
      client.close();
    });

    req.on("end", () => {
      resolve({ data: data.join() });
      client.close();
    });

    req.end();
  });

function retrieve(url, path, cert = null) {
  path = "nrf-settings/v1/" + path;
  console.log(url, path, cert);
  return new Promise((resolve) => {
    let client = null;
    if (cert) {
      client = http2.connect(url, {
        key: fs.readFileSync(cert),
      });
    } else {
      client = http2.connect(url);
    }
    const req = client.request({
      [http2.constants.HTTP2_HEADER_SCHEME]: "https",
      [http2.constants.HTTP2_HEADER_METHOD]: http2.constants.HTTP2_METHOD_GET,
      [http2.constants.HTTP2_HEADER_PATH]: `${path}`,
    });

    req.setEncoding("utf8");
    const data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      resolve({ data: data.join() });
      client.close();
    });

    req.end();
  });
}

const https = require("https");

const retrieves = (url, path, cert = null) => {
  const fullUrl = url + path;
  console.log(fullUrl);
  return new Promise((resolve, reject) => {
    https
      .get(fullUrl, (res) => {
        console.log("statusCode:", res.statusCode);
        console.log("headers:", res.headers);

        res.on("data", (d) => {
          process.stdout.write(d);
          resolve(d);
        });
      })
      .on("error", (e) => {
        console.error(">>>>>>>>>>>", e);
        reject(e);
      });
  });
};

module.exports = {
  // put: put,
  // post: post,
  // retrieve: retrieve,
  // retrieve: retrieveOrg,
  // retrieve: retrieveGet,
  // retrieve: retrieveWrapper,
  retrieve: retrieveGot,
  // del: del,
};
