async function get_got(host, entity, cert = null) {
    const url = `https://${host}/${_urlParam1}/v1/${entity}`;
    log.appDebug(">> get >> url: %s", url);

    try {
        const { headers, body } = await got(url, {
            https: yargsModule.httpModule.httpsConfig,
            http2: true,
            responseType: "json"
        });
        log.appDebug({ headers, body })
        log.appInfo(body)
        return body
    } catch (error) {
        log.appError(error);
        throw error
    }
}
async function get_http2(host, entity, cert = null) {
    const url = `https://${host}/${_urlParam1}/v1/${entity}`;
    log.appDebug(">> get >> url: %s", url);

    try {
        // const { headers, body } = await got(url, {
        //     https: yargsModule.httpModule.httpsConfig,
        //     http2: true,
        //     responseType: "json"
        // });
        var http2 = require('http2')
        let res = await new Promise((resolve) => {
            let client = null
            if (cert != null) {
                client = http2.connect(url, {
                    ca: fs.readFileSync(cert, 'utf8')
                });
            } else {
                client = http2.connect(url);
            }
            const req = client.request({
                [http2.constants.HTTP2_HEADER_SCHEME]: "https",
                [http2.constants.HTTP2_HEADER_METHOD]: http2.constants.HTTP2_METHOD_GET,
                [http2.constants.HTTP2_HEADER_PATH]: `${url}`,
            });

            req.setEncoding("utf8");
            const data = [];
            req.on("data", (chunk) => {
                data.push(chunk);
            });
            req.end();
            req.on("end", () => {
                resolve({ data: data.join() });
                client.close();
            });
        });
        // log.appDebug({ headers, body })
        log.appInfo(res)
        return res
    } catch (error) {
        log.appError(error);
        throw error
    }
}
async function get_https(host, entity, cert = null) {
    const url = `https://${host}/${_urlParam1}/v1/${entity}`;
    log.appDebug(">> get >> url: %s", url);

    try {
        var https = require('https')
        let res = await new Promise((resolve) => {

            const options = {
                // hostname: `${host}`,
                hostname: `localhost`,
                port: 8103,
                path: `/${_urlParam1}/v1/${entity}`,
                method: 'GET',
                key: fs.readFileSync('./certificates/client-key.pem'),
                cert: fs.readFileSync('./certificates/client-crt.pem'),
                agent: false
            };

            const req = https.request(options, (res) => {
                const data = [];
                res.on('data', (d) => {
                    data.push(chunk);
                });
                res.on("end", () => {
                    resolve({ data: data.join() });
                });
            });

            // req.setEncoding("utf8");
            req.on('error', (e) => {
                console.error(e.message);
            });
            req.end();
        });
        // log.appDebug({ headers, body })
        log.appInfo(res)
        return res
    } catch (error) {
        log.appError(error);
        throw error
    }
}