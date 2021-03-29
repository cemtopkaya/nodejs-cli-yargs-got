const expect = require('chai').expect;
const cmd = require('./cmd');
const { log, loge } = require('./mocha-setup').logFunctions;
const { EOL } = require('os');
const fs = require('fs');


var argsMaster = [
    // mutual authentication için public ve private sertifika veriyoruz
    '--cert="./certificates/client-crt.pem"'
    , '--key="./certificates/client-key.pem"'

    , '--dest="localhost:8204"'
    , '-r=false'
    , '-p=true'
    , '-q=true'
    , '--loglevel="info"'
];

describe('NEF', function () {

    const nfJsFilePath = './src/nef.js'
    const outputFilePath = './cikti.txt'

    describe('Eksik parametre uyarılarında', function () {

        it('dest Noksan bırakılamaz hatası verir', async function () {
            // GIVEN
            var args = [
                'get', 'db'
                //   '--dest', 'localhost:8204'
                // , '-r', 'false'
                // , '--loglevel=nolog'
                // , '-o', outputFilePath
                // , '-q', true
            ];

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);

                // THEN
            } catch (error) {
                expect(error.includes('Missing required argument: dest')).be.true
            }
        });

        it('-o ile çıktı dosyasının yolu noksan bırakılamaz hatası verir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('-r=') || a.startsWith('--loglevel'))))
                , 'get', 'db'
                // , '--dest', 'localhost:8204'
                // , '-r', 'false'
                , '--loglevel=nolog'
                , '-o' //, outputFilePath
                // , '-q', true
            ];

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);

                // THEN
            } catch (error) {
                expect(error.includes('Not enough arguments following: o')).be.true
            }
        });

        it('-r ile hatalı sunucu sertifikası reddedildiğinde NBI isteği hata verir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('-r=') || a.startsWith('--loglevel'))))
                , '-r=true'
                , 'get', 'db'
                , '--loglevel=nolog'
                // , '-o' , outputFilePath
                // , '-q', true
            ];

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);

                // THEN
            } catch (error) {
                expect(error.toString().includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')).be.true
            }
        });

        it('-r=false ile hatalı sunucu sertifikası kabul edildiğinde NBI isteği sonuçlanır', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('-r=') || a.startsWith('--loglevel'))))
                , '-r=false'
                , '--loglevel=nolog'
                , 'get', 'db'
                // , '-o' , outputFilePath
            ];
            const expectedMessagePart = '{"ConnectionPoolSize":'

            // WHEN
            try {
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()

                // THEN
                expect(responseBody.startsWith(expectedMessagePart)).to.be.true
            } catch (error) {
                loge(">>> error: ", error)
                throw (error)
            }

        });

        it('--cacert ile verilen dosya yolu yanlış olduğunda hata döner', async function () {
            // GIVEN
            var args = [
                'get', 'db'
                , '--dest', 'localhost:8204'
                , '-r', true
                , '--cacert', './test/nef_localhost1.crt'
                // , '--loglevel=nolog'
                // , '-o' , outputFilePath
                // , '-q', true
            ];
            const expectedErrorMsg = 'Sunucu doğrulama sertifikası belirtilen yerde yok!'

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                // THEN
            } catch (error) {
                console.log("ERRRRORRRR ", error);
                expect(error.includes(expectedErrorMsg)).be.true
            }
        });

        it('-r: true ile geçersiz sertifikanın reddedildiği ve cacert ile sunucu sertifikasının kök sertifikasının verildiğinde NBI isteği başarılı döner', async function () {
            /**
             * --rejectUnauthorized=true olarak işaretlendiğinde geçersiz sertifika durumunda hata verir
             *  > Sertifikanın verildiği domain adı (DNS) veya IP adresi 
             *    eğer istek yapılan sunucunun sertifikasında kayıtlı değilse
             *  > Sertifikanın geçerlilik süresi geçmişse
             *  > Kök sertifika otoritesi tarafından imzalanmamış ise
             * 
             * Sunucu tarafındaki sertifika eğer bir kök sertifikayla imzalanmış ise 
             * cacert parametresine bu kök serfifikanın açık anahtarı (public key) verilir
             */
            // GIVEN
            var args = [
                'get', 'db'
                , '--dest', 'localhost:8204'
                , '-r', true
                , '--cacert', './test/nef_localhost.crt'
                , '--loglevel=debug'
                // , '-o' , outputFilePath
                , '-p', true
            ];

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                console.log(">>> response:", response);
                // THEN
            } catch (error) {
                expect(error.toString().includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE'))
            }
        });
    })

    describe('GET ile', function () {

        this.beforeEach(() => {
            // Çıktı dosyası var ise her test başında siliyoruz.
            if (fs.existsSync(outputFilePath)) {
                fs.unlinkSync(outputFilePath)
            }
        })

        it('nfprofile\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('--loglevel'))))
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , 'get', 'nfprofile'
            ];
            const expectedObject = {"allowedNfDomains":[],"allowedNfTypes":["NEF","PCF","UDM","UDR","AF"],"allowedNssais":[{"sd":"","sst":1}],"allowedPlmns":[],"fqdn":"","heartBeatTimer":3,"interPlmnFqdn":"","ipv4Addresses":["10.10.23.8"],"ipv6Addresses":[],"nfInstanceId":"d7d2e36b-dbe5-4f79-bbcd-c15ff2137bcb","nfServices":[{"allowedNfDomains":[],"allowedNfTypes":[],"allowedNssais":[],"allowedPlmns":[],"fqdn":"","interPlmnFqdn":"","ipEndPoints":[{"ipv4Address":"10.10.23.8","ipv6Address":"","port":8201,"transport":""}],"nfServiceStatus":"REGISTERED","recoveryTime":"","scheme":"http","serviceInstanceId":"d7d2e36b-dbe5-4f79-bbcd-c15ff2137bcb","serviceName":"nnef-pfdmanagement","versions":[{"apiFullVersion":"v1","apiVersionInUri":"/nnef-pfdmanagement/v1","expiry":""}]}],"nfStatus":"REGISTERED","nfType":"NEF","sNssais":[{"sd":"","sst":1}]}

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath, 'utf-8')
                log(">>>> fileContent: ", fileContent);

                expect(fileContent.startsWith('{"allowedNfDomains":')).to.be.true

                var actualResponseObject = JSON.parse(fileContent.trim())
                expect(actualResponseObject).to.have.all.keys(Object.keys(expectedObject));
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('general\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('--loglevel'))))
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , 'get', 'general'
            ];
            const expectedObject = { "ClientCount": 4, "ClientTimeout": 3000, "HomePlmnId": { "mcc": "001", "mnc": "001" }, "NumberofServingServerThreads": 4 }
            const fileContentStartsWith = '{"ClientCount":'

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath, 'utf-8')
                log(">>>> fileContent: ", fileContent);

                expect(fileContent.startsWith(fileContentStartsWith)).to.be.true

                var actualResponseObject = JSON.parse(fileContent.trim())
                expect(actualResponseObject).to.have.all.keys(Object.keys(expectedObject));
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('security\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('-r=') || a.startsWith('--loglevel'))))
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , 'get', 'security'
            ];
            const expectedObject = {"JWTAuthenticate":false,"MutualAuthenticate":false,"OAuth2":{"PrivateKey":"11certificate/jwt.key","PublicKey":"11certificate/jwt.pub"},"TLS":{"PrivateKey":"11certificate/client.key"},"TLSSecure":false}

            const fileContentStartsWith = '{"JWTAuthenticate":'

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath, 'utf-8')
                log(">>>> fileContent: ", fileContent);

                expect(fileContent.startsWith(fileContentStartsWith)).to.be.true

                var actualResponseObject = JSON.parse(fileContent.trim())
                expect(actualResponseObject).to.have.all.keys(Object.keys(expectedObject));
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('logging\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('--loglevel'))))
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , 'get', 'logging'
            ];
            const expectedObject = { "Directory": "/var/log/cinar/nrf/", "DisplayLog": true, "FileName": "NRF", "LogLevel": "DEBUG" }
            const fileContentStartsWith = '{"Directory":'

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath, 'utf-8')
                log(">>>> fileContent: ", fileContent);

                expect(fileContent.startsWith(fileContentStartsWith)).to.be.true

                var actualResponseObject = JSON.parse(fileContent.trim())
                expect(actualResponseObject).to.have.all.keys(Object.keys(expectedObject));
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('nrf\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('--loglevel'))))
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , 'get', 'nrf'
            ];
            const expectedObject = [{ "ClientCount": 4, "ClientTimeout": 3000, "DiscServicePort": 8006, "IPAddress": "10.10.23.8", "NfmServicePort": 8001, "OAuth2ServicePort": 8007, "TAccessTokenPeriod": 10000, "TCheckPeriod": 60000, "TRetryPeriod": 3000 }]
            const fileContentStartsWith = '[{"ClientCount":'

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath, 'utf-8')
                log(">>>> fileContent: ", fileContent);

                expect(fileContent.startsWith(fileContentStartsWith)).to.be.true

                // var actualResponseObject = JSON.parse(fileContent.trim())
                // expect(actualResponseObject).to.have.all.keys(Object.keys(expectedObject));
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('db\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('--loglevel'))))
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'db'
            ];
            const expectedObject = { "ConnectionPoolSize": 4, "ConnectionRetryPeriod": 5000, "ConnectionTimeout": 1000, "DatabaseName": "cinarnrftest", "DatabaseType": "MONGO", "Password": "P5vKG6vE", "Port": 30558, "Server": "10.10.21.12", "Tables": ["cinarnfcollection", "cinarsubscollection", "cinarnfstatecollection"], "UserName": "cnrusr" }


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath, 'utf-8')
                log(">>>> fileContent: ", fileContent);

                var actualResponseObject = JSON.parse(fileContent.trim())
                log(">>>> actualResponseObject: ", actualResponseObject);
                log(">>>> Object.keys(actualResponseObject): ", Object.keys(actualResponseObject));
                log(">>>> Object.keys(expectedObject): ", Object.keys(expectedObject));
                expect(actualResponseObject).to.have.all.keys(Object.keys(expectedObject));
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });
    });

    describe('SET ve DELETE ile', function () {
        it('nfprofile "allowedNfTypes" Dizisine kabul edilmeyecek bilgi gönderilir ve 400 hata kodu döner', async function () {
            // GIVEN
            var newData = {"allowedNfDomains":[],"allowedNfTypes":["CEM","NEF","PCF","UDM","UDR","AF"],"allowedNssais":[{"sd":"","sst":1}],"allowedPlmns":[],"fqdn":"","heartBeatTimer":3,"interPlmnFqdn":"","ipv4Addresses":["10.10.23.8"],"ipv6Addresses":[],"nfInstanceId":"d7d2e36b-dbe5-4f79-bbcd-c15ff2137bcb","nfServices":[{"allowedNfDomains":[],"allowedNfTypes":[],"allowedNssais":[],"allowedPlmns":[],"fqdn":"","interPlmnFqdn":"","ipEndPoints":[{"ipv4Address":"10.10.23.8","ipv6Address":"","port":8201,"transport":""}],"nfServiceStatus":"REGISTERED","recoveryTime":"","scheme":"http","serviceInstanceId":"d7d2e36b-dbe5-4f79-bbcd-c15ff2137bcb","serviceName":"nnef-pfdmanagement","versions":[{"apiFullVersion":"v1","apiVersionInUri":"/nnef-pfdmanagement/v1","expiry":""}]}],"nfStatus":"REGISTERED","nfType":"NEF","sNssais":[{"sd":"","sst":1}]}
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('--loglevel') || a.startsWith('-q'))))
                , '--loglevel=info'
                , `--data='${JSON.stringify(newData)}'`
                , 'set', 'nfprofile'
            ];
            const expectedMessagePart = 'HTTPError: Response code 400 (Bad Request)'

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                log(">>>> response: ", response);

                // THEN
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                expect(error.includes(expectedMessagePart)).to.be.true
            }
        });

        it('nfprofile "allowedNfDomains" Dizisine kabul bir metin elemanı eklenir ve gönderilir, sonuç 200 koduyla başarılı döner', async function () {
            // GIVEN
            var newData = {"allowedNfDomains":["CEM"],"allowedNfTypes":["NEF","PCF","UDM","UDR","AF"],"allowedNssais":[{"sd":"","sst":1}],"allowedPlmns":[],"fqdn":"","heartBeatTimer":3,"interPlmnFqdn":"","ipv4Addresses":["10.10.23.8"],"ipv6Addresses":[],"nfInstanceId":"d7d2e36b-dbe5-4f79-bbcd-c15ff2137bcb","nfServices":[{"allowedNfDomains":[],"allowedNfTypes":[],"allowedNssais":[],"allowedPlmns":[],"fqdn":"","interPlmnFqdn":"","ipEndPoints":[{"ipv4Address":"10.10.23.8","ipv6Address":"","port":8201,"transport":""}],"nfServiceStatus":"REGISTERED","recoveryTime":"","scheme":"http","serviceInstanceId":"d7d2e36b-dbe5-4f79-bbcd-c15ff2137bcb","serviceName":"nnef-pfdmanagement","versions":[{"apiFullVersion":"v1","apiVersionInUri":"/nnef-pfdmanagement/v1","expiry":""}]}],"nfStatus":"REGISTERED","nfType":"NEF","sNssais":[{"sd":"","sst":1}]}
            var args = [
                ...(argsMaster.filter(a => !(a.startsWith('--loglevel') || a.startsWith('-q'))))
                , '--loglevel=debug'
                , `--data='${JSON.stringify(newData)}'`
                , 'set', 'nfprofile'
            ];
            const expectedMessagePart = '{"allowedNfDomains":["CEM"'


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                log(">>>> responseBody: ", responseBody);

                // THEN
                expect(responseBody.includes(expectedMessagePart)).to.be.true
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('general güncellenir ve sonuç nesne gönderilen ile aynı döner', async function () {
            // GIVEN
            var newData = {
                "ClientCount": 94,
                "ClientTimeout": 93000,
                "HomePlmnId": {
                    "mcc": "901",
                    "mnc": "901"
                },
                "NumberofServingServerThreads": 94
            }
            var args = [
                '--dest', 'localhost:8204'
                , '-r', 'false'
                , '--loglevel', 'debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'general'
            ];
            const expectedResponseObject = newData


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                let actualObject = JSON.parse(responseBody);
                log(">>>> newData: ", newData);
                log(">>>> actualObject: ", actualObject);

                // THEN
                expect(actualObject).to.eql(newData)
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('security güncellenir ve sonuç nesne gönderilen ile aynı döner', async function () {
            // GIVEN
            var newData = {
                "JWTAuthenticate": false,
                "MutualAuthenticate": false,
                "OAuth2": {
                    "PrivateKey": "11certificate/jwt.key",
                    "PublicKey": "11certificate/jwt.pub"
                },
                "TLS": {
                    "PrivateKey": "11certificate/client.key"
                },
                "TLSSecure": false
            }

            var args = [
                '--dest', 'localhost:8204'
                , '-r', 'false'
                , '--loglevel', 'debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'security'
            ];
            const expectedResponseObject = newData


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                let actualObject = JSON.parse(responseBody);
                log(">>>> newData: ", newData);
                log(">>>> actualObject: ", actualObject);

                // THEN
                expect(actualObject).to.eql(newData)
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('logging güncellenir ve sonuç nesne gönderilen ile aynı döner', async function () {
            // GIVEN
            var newData = {
                "Directory": "/var/log/cinar/nssf/22",
                "DisplayLog": false,
                "FileName": "NSSF11",
                "LogLevel": "INFO"
            }

            var args = [
                '--dest', 'localhost:8204'
                , '-r', 'false'
                , '--loglevel', 'debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'logging'
            ];
            const expectedResponseObject = newData


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                let actualObject = JSON.parse(responseBody);
                log(">>>> newData: ", newData);
                log(">>>> actualObject: ", actualObject);

                // THEN
                expect(actualObject).to.eql(newData)
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('nrf güncellenir ve sonuç nesne gönderilen ile aynı döner', async function () {
            // GIVEN
            var newData = [
                {
                    "ClientCount": 14,
                    "ClientTimeout": 13000,
                    "DiscServicePort": 18006,
                    "IPAddress": "110.10.23.8",
                    "NfmServicePort": 18001,
                    "OAuth2ServicePort": 18007,
                    "TAccessTokenPeriod": 110000,
                    "TCheckPeriod": 160000,
                    "TDiscoveryPeriod": 13000,
                    "TRetryPeriod": 13000
                }
            ]

            var args = [
                '--dest', 'localhost:8204'
                , '-r', 'false'
                , '--loglevel', 'debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'nrf'
            ];
            const expectedResponseObject = newData


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                let actualObject = JSON.parse(responseBody);
                log(">>>> newData: ", newData);
                log(">>>> actualObject: ", actualObject);

                // THEN
                expect(actualObject).to.eql(newData)
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it('db güncellenir ve sonuç nesne gönderilen ile aynı döner', async function () {
            // GIVEN
            var newData = {
                "ConnectionPoolSize": 14,
                "ConnectionRetryPeriod": 160000,
                "ConnectionTimeout": 11000,
                "DatabaseName": "1cinarnssftest",
                "DatabaseType": "1MONGO",
                "Password": "1P5vKG6vE",
                "Port": 127017,
                "Server": "110.5.0.2",
                "Tables": [
                    "1cinarnsicollection",
                    "1cinarnssrulescollection",
                    "1cinarconfigurednssaicollection",
                    "1cinaramfavailabilitycollection",
                    "1cinarnssfsubscinarcollection"
                ],
                "UserName": "1cnrusr"
            }

            var args = [
                '--dest', 'localhost:8204'
                , '-r', 'false'
                , '--loglevel', 'debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'db'
            ];
            const expectedResponseObject = newData


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                let actualObject = JSON.parse(responseBody);
                log(">>>> newData: ", newData);
                log(">>>> actualObject: ", actualObject);

                // THEN
                expect(actualObject).to.eql(newData)
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });

        it.skip('nf-put-log-priority güncellenir ve sonuç nesne gönderilen ile aynı döner', async function () {
            // GIVEN
            var newData = { "LogLevel": "INFO" }

            var args = [
                '--dest', 'localhost:8205'
                , '-r', 'false'
                , '--loglevel', 'debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'nf-put-log-priority'
            ];
            const expectedResponseObject = newData


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                let actualObject = JSON.parse(responseBody);
                log(">>>> newData: ", newData);
                log(">>>> actualObject: ", actualObject);

                // THEN
                expect(actualObject).to.eql(newData)
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw (error)
            }
        });
    });
});