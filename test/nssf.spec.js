const expect = require('chai').expect;
const cmd = require('./cmd');
const { log, loge } = require('./mocha-setup').logFunctions;
const { EOL } = require('os');
const fs = require('fs');


describe('NSSF', function () {

    const nfJsFilePath = './src/nssf.js'
    const outputFilePath = './cikti.txt'

    describe('Eksik parametre uyarılarında', function () {

        it('dest Noksan bırakılamaz hatası verir', async function () {
            // GIVEN
            var args = [
                'get', 'db'
                //   '--dest', 'localhost:8103'
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
                'get', 'db'
                // , '--dest', 'localhost:8103'
                // , '-r', 'false'
                // , '--loglevel=nolog'
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
                'get', 'db'
                , '--dest', 'localhost:8103'
                , '-r', true
                // , '--loglevel=nolog'
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
                'get', 'db'
                , '--dest', 'localhost:8103'
                , '-r', false
                // , '--loglevel=nolog'
                // , '-o' , outputFilePath
                // , '-q', true
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
                throw(error)
            }

        });

        it('--cacert ile verilen dosya yolu yanlış olduğunda hata döner', async function () {
            // GIVEN
            var args = [
                'get', 'db'
                , '--dest', 'localhost:8103'
                , '-r', true
                , '--cacert', './test/nssf_localhost1.crt'
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
                , '--dest', 'localhost:8103'
                , '-r', true
                , '--cacert', './test/nssf_localhost.crt'
                // , '--loglevel=nolog'
                // , '-o' , outputFilePath
                // , '-q', true
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
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'nfprofile'
            ];
            const expectedObject = { "allowedNfDomains": [], "allowedNfTypes": ["NSSF", "AMF"], "allowedNssais": [{ "sd": "", "sst": 1 }], "allowedPlmns": [], "amfInfo": { "amfRegionId": "", "amfSetId": "", "backupInfoAmfFailure": [], "backupInfoAmfRemoval": [], "guamiList": [], "n2InterfaceAmfInfo": { "amfName": "", "ipv4EndpointAddress": [], "ipv6EndpointAddress": [] }, "taiList": [], "taiRangeList": [] }, "ausfInfo": { "groupId": "", "routingIndicators": [], "supiRanges": [] }, "bsfInfo": { "dnnList": [], "ipDomainList": [], "ipv4AddressRanges": [], "ipv6PrefixRanges": [] }, "capacity": 0, "chfInfo": { "gpsiRangeList": [], "plmnRangeList": [], "supiRangeList": [] }, "customInfo": null, "defaultNotificationSubscriptions": [], "fqdn": "", "heartBeatTimer": 3, "interPlmnFqdn": "", "ipv4Addresses": ["10.10.23.8"], "ipv6Addresses": [], "load": 0, "locality": "", "nfInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "nfProfileChangesInd": false, "nfProfileChangesSupportInd": false, "nfServicePersistence": false, "nfServices": [{ "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8100, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nsselection", "supportedFeatures": "", "versions": [{ "apiFullVersion": "v1", "apiVersionInUri": "/nnssf-nsselection/v1", "expiry": "" }] }, { "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8101, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nssaiavailability", "supportedFeatures": "", "versions": [{ "apiFullVersion": "", "apiVersionInUri": "/nnssf-nssaiavailability/v1", "expiry": "" }] }], "nfStatus": "REGISTERED", "nfType": "NSSF", "nsiList": [], "pcfInfo": { "dnnList": [], "rxDiamHost": "", "rxDiamRealm": "", "supiRanges": [] }, "perPlmnSnssaiList": [], "plmnList": [], "priority": 0, "recoveryTime": "", "sNssais": [{ "sd": "", "sst": 1 }], "smfInfo": { "accessType": [], "pgwFqdn": "", "sNssaiSmfInfoList": [], "taiList": [], "taiRangeList": [] }, "udmInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "routingIndicators": [], "supiRanges": [] }, "udrInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "supiRanges": [], "supportedDataSets": [] }, "upfInfo": { "interfaceUpfInfoList": [], "iwkEpsInd": false, "pduSessionTypes": [], "sNssaiUpfInfoList": [], "smfServingArea": [] } }


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
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
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
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'security'
            ];
            const expectedObject = { "JWTAuthenticate": true, "MutualAuthenticate": false, "OAuth2": { "PrivateKey": "certificate/jwt.key", "PublicKey": "certificate/jwt.pub" }, "TLS": { "PrivateKey": "certificate/client.key" }, "TLSSecure": true }
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
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'logging'
            ];
            const expectedObject = { "Directory": "/var/log/cinar/nssf/", "DisplayLog": true, "FileName": "NSSF", "LogLevel": "DEBUG" }
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
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'nrf'
            ];
            const expectedObject = [{ "ClientCount": 4, "ClientTimeout": 3000, "DiscServicePort": 8006, "IPAddress": "10.10.23.8", "NfmServicePort": 8001, "OAuth2ServicePort": 8007, "TAccessTokenPeriod": 10000, "TCheckPeriod": 60000, "TDiscoveryPeriod": 3000, "TRetryPeriod": 3000 }]
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
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'db'
            ];
            const expectedObject = {
                "ConnectionPoolSize": 4,
                "ConnectionRetryPeriod": 60000,
                "ConnectionTimeout": 1000,
                "DatabaseName": "cinarnssftest",
                "DatabaseType": "MONGO",
                "Password": "P5vKG6vE",
                "Port": 27017,
                "Server": "10.5.0.22",
                "Tables": [
                    "cinarnsicollection",
                    "cinarnssrulescollection",
                    "cinarconfigurednssaicollection",
                    "cinaramfavailabilitycollection",
                    "cinarnssfsubscinarcollection"
                ],
                "UserName": "cnrusr"
            }


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

        it('nsiprofiles\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                '--dest', 'localhost:8102'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'nsiprofiles'
            ];
            const expectedObject = []
            const fileContentStartsWith = '[]'

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

        it('nssrules\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                '--dest', 'localhost:8102'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'nssrules'
            ];
            const expectedObject = []
            const fileContentStartsWith = '[]'

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

        it('configurednssai\'nin Bilgileri çekilir', async function () {
            // GIVEN
            var args = [
                '--dest', 'localhost:8102'
                , '-r', 'false'
                , '--loglevel=nolog'
                , '-o', outputFilePath
                , '-q', true
                , 'get', 'configurednssai'
            ];
            const expectedObject = []
            const fileContentStartsWith = '[]'

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

    });

    describe('SET ile', function () {
        it('nfprofile "allowedNfTypes" Dizisine kabul edilmeyecek bilgi gönderilir ve 400 hata kodu döner', async function () {
            // GIVEN
            var newData = { "allowedNfDomains": [], "allowedNfTypes": ["CEM", "NSSF", "AMF"], "allowedNssais": [{ "sd": "", "sst": 1 }], "allowedPlmns": [], "amfInfo": { "amfRegionId": "", "amfSetId": "", "backupInfoAmfFailure": [], "backupInfoAmfRemoval": [], "guamiList": [], "n2InterfaceAmfInfo": { "amfName": "", "ipv4EndpointAddress": [], "ipv6EndpointAddress": [] }, "taiList": [], "taiRangeList": [] }, "ausfInfo": { "groupId": "", "routingIndicators": [], "supiRanges": [] }, "bsfInfo": { "dnnList": [], "ipDomainList": [], "ipv4AddressRanges": [], "ipv6PrefixRanges": [] }, "capacity": 0, "chfInfo": { "gpsiRangeList": [], "plmnRangeList": [], "supiRangeList": [] }, "customInfo": null, "defaultNotificationSubscriptions": [], "fqdn": "", "heartBeatTimer": 3, "interPlmnFqdn": "", "ipv4Addresses": ["10.10.23.8"], "ipv6Addresses": [], "load": 0, "locality": "", "nfInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "nfProfileChangesInd": false, "nfProfileChangesSupportInd": false, "nfServicePersistence": false, "nfServices": [{ "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8100, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nsselection", "supportedFeatures": "", "versions": [{ "apiFullVersion": "v1", "apiVersionInUri": "/nnssf-nsselection/v1", "expiry": "" }] }, { "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8101, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nssaiavailability", "supportedFeatures": "", "versions": [{ "apiFullVersion": "", "apiVersionInUri": "/nnssf-nssaiavailability/v1", "expiry": "" }] }], "nfStatus": "REGISTERED", "nfType": "NSSF", "nsiList": [], "pcfInfo": { "dnnList": [], "rxDiamHost": "", "rxDiamRealm": "", "supiRanges": [] }, "perPlmnSnssaiList": [], "plmnList": [], "priority": 0, "recoveryTime": "", "sNssais": [{ "sd": "", "sst": 1 }], "smfInfo": { "accessType": [], "pgwFqdn": "", "sNssaiSmfInfoList": [], "taiList": [], "taiRangeList": [] }, "udmInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "routingIndicators": [], "supiRanges": [] }, "udrInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "supiRanges": [], "supportedDataSets": [] }, "upfInfo": { "interfaceUpfInfoList": [], "iwkEpsInd": false, "pduSessionTypes": [], "sNssaiUpfInfoList": [], "smfServingArea": [] } }
            var args = [
                '--dest', 'localhost:8103'
                , '-r', 'false'
                // , '--loglevel','info'
                , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
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
        
        it.only('nfprofile "allowedNfDomains" Dizisine kabul bir metin elemanı eklenir ve gönderilir, sonuç 200 koduyla başarılı döner', async function () {
            // GIVEN
            var newData = { "allowedNfDomains": ["cem"], "allowedNfTypes": ["NSSF", "AMF"], "allowedNssais": [{ "sd": "", "sst": 1 }], "allowedPlmns": [], "amfInfo": { "amfRegionId": "", "amfSetId": "", "backupInfoAmfFailure": [], "backupInfoAmfRemoval": [], "guamiList": [], "n2InterfaceAmfInfo": { "amfName": "", "ipv4EndpointAddress": [], "ipv6EndpointAddress": [] }, "taiList": [], "taiRangeList": [] }, "ausfInfo": { "groupId": "", "routingIndicators": [], "supiRanges": [] }, "bsfInfo": { "dnnList": [], "ipDomainList": [], "ipv4AddressRanges": [], "ipv6PrefixRanges": [] }, "capacity": 0, "chfInfo": { "gpsiRangeList": [], "plmnRangeList": [], "supiRangeList": [] }, "customInfo": null, "defaultNotificationSubscriptions": [], "fqdn": "", "heartBeatTimer": 3, "interPlmnFqdn": "", "ipv4Addresses": ["10.10.23.8"], "ipv6Addresses": [], "load": 0, "locality": "", "nfInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "nfProfileChangesInd": false, "nfProfileChangesSupportInd": false, "nfServicePersistence": false, "nfServices": [{ "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8100, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nsselection", "supportedFeatures": "", "versions": [{ "apiFullVersion": "v1", "apiVersionInUri": "/nnssf-nsselection/v1", "expiry": "" }] }, { "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8101, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nssaiavailability", "supportedFeatures": "", "versions": [{ "apiFullVersion": "", "apiVersionInUri": "/nnssf-nssaiavailability/v1", "expiry": "" }] }], "nfStatus": "REGISTERED", "nfType": "NSSF", "nsiList": [], "pcfInfo": { "dnnList": [], "rxDiamHost": "", "rxDiamRealm": "", "supiRanges": [] }, "perPlmnSnssaiList": [], "plmnList": [], "priority": 0, "recoveryTime": "", "sNssais": [{ "sd": "", "sst": 1 }], "smfInfo": { "accessType": [], "pgwFqdn": "", "sNssaiSmfInfoList": [], "taiList": [], "taiRangeList": [] }, "udmInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "routingIndicators": [], "supiRanges": [] }, "udrInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "supiRanges": [], "supportedDataSets": [] }, "upfInfo": { "interfaceUpfInfoList": [], "iwkEpsInd": false, "pduSessionTypes": [], "sNssaiUpfInfoList": [], "smfServingArea": [] } }
            var args = [
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel','debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'nfprofile'
            ];
            const expectedMessagePart = '{"allowedNfDomains":["cenk"'


            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                const responseBody = response.trim().split(EOL).pop()
                log(">>>> responseBody: ", responseBody);

                // THEN
                expect('{"allowedNfDomains":["cem"'.includes(expectedMessagePart)).to.be.true
                // expect(responseBody.includes(expectedMessagePart)).to.be.true
            } catch (error) {
                loge(">>>>>>>>>> error: ", error)
                throw(error)
            }
        });

        it('nfprofile\'nin Bilgileri güncellenir', async function () {
            // GIVEN
            var newData = { "allowedNfDomains": [], "allowedNfTypes": ["CEM", "NSSF", "AMF"], "allowedNssais": [{ "sd": "", "sst": 1 }], "allowedPlmns": [], "amfInfo": { "amfRegionId": "", "amfSetId": "", "backupInfoAmfFailure": [], "backupInfoAmfRemoval": [], "guamiList": [], "n2InterfaceAmfInfo": { "amfName": "", "ipv4EndpointAddress": [], "ipv6EndpointAddress": [] }, "taiList": [], "taiRangeList": [] }, "ausfInfo": { "groupId": "", "routingIndicators": [], "supiRanges": [] }, "bsfInfo": { "dnnList": [], "ipDomainList": [], "ipv4AddressRanges": [], "ipv6PrefixRanges": [] }, "capacity": 0, "chfInfo": { "gpsiRangeList": [], "plmnRangeList": [], "supiRangeList": [] }, "customInfo": null, "defaultNotificationSubscriptions": [], "fqdn": "", "heartBeatTimer": 3, "interPlmnFqdn": "", "ipv4Addresses": ["10.10.23.8"], "ipv6Addresses": [], "load": 0, "locality": "", "nfInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "nfProfileChangesInd": false, "nfProfileChangesSupportInd": false, "nfServicePersistence": false, "nfServices": [{ "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8100, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nsselection", "supportedFeatures": "", "versions": [{ "apiFullVersion": "v1", "apiVersionInUri": "/nnssf-nsselection/v1", "expiry": "" }] }, { "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8101, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nssaiavailability", "supportedFeatures": "", "versions": [{ "apiFullVersion": "", "apiVersionInUri": "/nnssf-nssaiavailability/v1", "expiry": "" }] }], "nfStatus": "REGISTERED", "nfType": "NSSF", "nsiList": [], "pcfInfo": { "dnnList": [], "rxDiamHost": "", "rxDiamRealm": "", "supiRanges": [] }, "perPlmnSnssaiList": [], "plmnList": [], "priority": 0, "recoveryTime": "", "sNssais": [{ "sd": "", "sst": 1 }], "smfInfo": { "accessType": [], "pgwFqdn": "", "sNssaiSmfInfoList": [], "taiList": [], "taiRangeList": [] }, "udmInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "routingIndicators": [], "supiRanges": [] }, "udrInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "supiRanges": [], "supportedDataSets": [] }, "upfInfo": { "interfaceUpfInfoList": [], "iwkEpsInd": false, "pduSessionTypes": [], "sNssaiUpfInfoList": [], "smfServingArea": [] } }
            var args = [
                '--dest', 'localhost:8103'
                , '-r', 'false'
                , '--loglevel', 'debug'
                // , '-q', true
                , '--data', `'${JSON.stringify(newData)}'`
                , 'set', 'nfprofile'
            ];
            const expectedObject = { "allowedNfDomains": [], "allowedNfTypes": ["CEM", "NSSF", "AMF"], "allowedNssais": [{ "sd": "", "sst": 1 }], "allowedPlmns": [], "amfInfo": { "amfRegionId": "", "amfSetId": "", "backupInfoAmfFailure": [], "backupInfoAmfRemoval": [], "guamiList": [], "n2InterfaceAmfInfo": { "amfName": "", "ipv4EndpointAddress": [], "ipv6EndpointAddress": [] }, "taiList": [], "taiRangeList": [] }, "ausfInfo": { "groupId": "", "routingIndicators": [], "supiRanges": [] }, "bsfInfo": { "dnnList": [], "ipDomainList": [], "ipv4AddressRanges": [], "ipv6PrefixRanges": [] }, "capacity": 0, "chfInfo": { "gpsiRangeList": [], "plmnRangeList": [], "supiRangeList": [] }, "customInfo": null, "defaultNotificationSubscriptions": [], "fqdn": "", "heartBeatTimer": 3, "interPlmnFqdn": "", "ipv4Addresses": ["10.10.23.8"], "ipv6Addresses": [], "load": 0, "locality": "", "nfInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "nfProfileChangesInd": false, "nfProfileChangesSupportInd": false, "nfServicePersistence": false, "nfServices": [{ "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8100, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nsselection", "supportedFeatures": "", "versions": [{ "apiFullVersion": "v1", "apiVersionInUri": "/nnssf-nsselection/v1", "expiry": "" }] }, { "allowedNfDomains": [], "allowedNfTypes": [], "allowedNssais": [], "allowedPlmns": [], "apiPrefix": "", "capacity": 0, "chfServiceInfo": { "primaryChfServiceInstance": "", "secondaryChfServiceInstance": "" }, "defaultNotificationSubscriptions": [], "fqdn": "", "interPlmnFqdn": "", "ipEndPoints": [{ "ipv4Address": "10.10.23.8", "ipv6Address": "", "port": 8101, "transport": "" }], "load": 0, "nfServiceStatus": "REGISTERED", "priority": 0, "recoveryTime": "", "scheme": "http", "serviceInstanceId": "81fdab8a-8605-11ea-bc55-0242ac130003", "serviceName": "nnssf-nssaiavailability", "supportedFeatures": "", "versions": [{ "apiFullVersion": "", "apiVersionInUri": "/nnssf-nssaiavailability/v1", "expiry": "" }] }], "nfStatus": "REGISTERED", "nfType": "NSSF", "nsiList": [], "pcfInfo": { "dnnList": [], "rxDiamHost": "", "rxDiamRealm": "", "supiRanges": [] }, "perPlmnSnssaiList": [], "plmnList": [], "priority": 0, "recoveryTime": "", "sNssais": [{ "sd": "", "sst": 1 }], "smfInfo": { "accessType": [], "pgwFqdn": "", "sNssaiSmfInfoList": [], "taiList": [], "taiRangeList": [] }, "udmInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "routingIndicators": [], "supiRanges": [] }, "udrInfo": { "externalGroupIdentifiersRanges": [], "gpsiRanges": [], "groupId": "", "supiRanges": [], "supportedDataSets": [] }, "upfInfo": { "interfaceUpfInfoList": [], "iwkEpsInd": false, "pduSessionTypes": [], "sNssaiUpfInfoList": [], "smfServingArea": [] } }


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
    });
});