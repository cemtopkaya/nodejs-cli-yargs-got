
const got = require("got");
const fs = require("fs");

module.exports = function (log) {

    const getCert = function (cert) {
        if (!cert) return {};

        var obj = {
            certificate: cert.cert ? fs.readFileSync(cert.cert) : cert.cert
            , key: cert.key ? fs.readFileSync(cert.key) : cert.key
            , certificateAuthority: cert.cacert ? fs.readFileSync(cert.cacert) : cert.cacert
            , pfx: cert.pfx ? fs.readFileSync(cert.pfx) : cert.pfx
            , passphrase: cert.pfx ? cert.passphrase : cert.passphrase
            , rejectUnauthorized: !!cert.rejectUnauthorized
        }

        log.appDebug("https sertifika özellikleri TAM: %o", obj)
        for (key in obj) {
            if (obj[key] == undefined) delete obj[key]
        }
        log.appDebug("https sertifika özellikleri SADE: %o", obj)
        return obj;
    }

    return {
        get: async function (host, nf, entity, cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> get >> url: %s >> certOpts: %o", url, getCert(cert));

            try {
                const { headers, body } = await got(url, {
                    https: getCert(cert),
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
        },

        Delete: async function (host, nf, entity, data, cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}/${data}`;
            log.appDebug(">> delete >> url: %s", url);

            try {
                const { headers, body } = await got.delete(url, {
                    https: getCert(cert),
                    http2: true,
                    responseType: "json"
                });
                log.appDebug({ headers, body })
                log.appInfo({ body })
                return body
            } catch (error) {
                log.appError(error);
                throw error
            }
        },

        put: async function (host, nf, entity, data, cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> put >> url: %s >> data: %o >>  cert: %o>>  getCert(cert): %o", url, data, cert, getCert(cert));

            try {
                const { headers, body } = await got.put(url, {
                    https: getCert(cert),
                    http2: true,
                    json: typeof (data) == 'string' ? JSON.parse(data) : data,
                    responseType: "json",
                });

                log.appDebug({ headers, body })
                log.appInfo({ body })
                return body
            } catch (error) {
                log.appError(error);
                throw error
            }
        },

        post: async function (host, nf, entity, data, cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> post >> url: %s >> data: %o", url, data);

            try {
                const { headers, body } = await got.post(url, {
                    https: getCert(cert),
                    http2: true,
                    json: typeof (data) == 'string' ? JSON.parse(data) : data,
                    responseType: "json",
                });

                log.appDebug({ headers, body })
                log.appInfo({ body })
                return body
            } catch (error) {
                log.appError(error);
                throw error
            }
        },

        patch: async function (host, nf, entity, data, cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> patch >> url: %s >> data: %o", url, data);

            try {
                const { headers, body } = await got.patch(url, {
                    https: getCert(cert),
                    http2: true,
                    json: typeof (data) == 'string' ? JSON.parse(data) : data,
                    responseType: "json",
                });
                log.appDebug({ headers, body })
                log.appInfo({ body })
                return body
            } catch (error) {
                log.appError(error);
                throw error
            }
        }
    }
}