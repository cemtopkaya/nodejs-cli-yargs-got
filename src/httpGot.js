
const got = require("got");
const fs = require("fs");


module.exports = function (log) {

    const instance = got.extend({
        hooks: {
            beforeRequest: [
                options => {
                    log.appDebug(">> got options: %o", options)
                    log.appDebug(">> got options.headers: %o", options.headers)
                }
            ],
            afterResponse: [
                (response, retryWithMergedOptions) => {
                    log.appDebug(">> got response: %o", response.headers)

                    // No changes otherwise
                    return response;
                }
            ],
        }
    });

    const getHttpOptions = function (_cert = null) {
        return {
            https: getCert(_cert),
            http2: true,
            responseType: "text"
        }
    }

    const getHttpOptionsWithData = function (_data = null, _cert = null) {
        let httpOptions = getHttpOptions(_cert)
        log.appDebug('>> getHttpOptionsWithData > _data: %o > _cert: %o', _data, _cert)
        try {
            var parsedData = typeof (_data) == 'string' ? JSON.parse(_data) : _data
            log.appDebug("JSON Parse edildi ", parsedData);
            httpOptions.json = parsedData;
        } catch (error) {
            log.appError(">> getHttpOptionsWithData > error: ", error);
            throw error
        }
        return httpOptions;
    }

    const getCert = function (_cert = null) {
        log.appDebug("getCert > _cert: %o", _cert)
        if (_cert == null) return {};

        var obj = {
            certificate: _cert.cert ? fs.readFileSync(_cert.cert) : _cert.cert
            , key: _cert.key ? fs.readFileSync(_cert.key) : _cert.key
            , certificateAuthority: _cert.cacert ? fs.readFileSync(_cert.cacert) : _cert.cacert
            , pfx: _cert.pfx ? fs.readFileSync(_cert.pfx) : _cert.pfx
            , passphrase: _cert.pfx ? _cert.passphrase : _cert.passphrase
            , rejectUnauthorized: _cert.rejectUnauthorized
        }

        log.appDebug("getCert > https sertifika ??zellikleri TAM: %o", obj)
        for (key in obj) {
            if (obj[key] == undefined) delete obj[key]
        }
        log.appDebug("getCert > https sertifika ??zellikleri SADE: %o", obj)
        return obj;
    }

    return {
        get: async function (host, nf, entity, _data, _cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> get >> url: %s >> certOpts: %o", url, getCert(_cert));

            try {
                const { headers, body } = await got(url, getHttpOptions(_cert));
                log.appDebug({ headers, body })
                log.appInfo(body)
                return body
            } catch (error) {
                log.appError(error);
                // process.stderr.write(error)
                // console.error(">>> got > get > catch > error: ", error);
                throw error
            }
        },

        Delete: async function (host, nf, entity, _data, _cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}/${_data}`;
            log.appDebug(">> delete >> url: %s", url);

            try {
                const { headers, body } = await instance.delete(url, getHttpOptions(_cert));
                log.appDebug({ headers, body })
                log.appInfo({ body })
                return body
            } catch (error) {
                log.appError(error);
                throw error
            }
        },

        put: async function (host, nf, entity, _data, _cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> put >> url: %s >> _data: %o >>  _cert: %o >>  getCert(_cert): %o", url, _data, _cert, getCert(_cert));

            try {
                const { headers, body } = await instance.put(url, getHttpOptionsWithData(_data, _cert));

                log.appDebug({ headers, body })
                log.appInfo({ body })
                return body
            } catch (error) {
                log.appError(error);
                throw error
            }
        },

        post: async function (host, nf, entity, _data, _cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> post >> url: %s >> _data: %o", url, _data);

            try {
                const { headers, body } = await instance.post(url, getHttpOptionsWithData(_data, _cert));

                log.appDebug({ headers, body })
                log.appInfo({ body })
                return body
            } catch (error) {
                log.appError(error);
                throw error
            }
        },

        patch: async function (host, nf, entity, _data, _cert = null) {
            const url = `https://${host}/${nf}/v1/${entity}`;
            log.appDebug(">> patch >> url: %s >> _data: %o", url, _data);

            try {
                const { headers, body } = await instance.patch(url, getHttpOptionsWithData(_data, _cert));
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