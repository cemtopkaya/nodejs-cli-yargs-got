
// var assert = require('assert');
var childProcess = require('child_process')
console.log("burada");
const expect = require('chai').expect;
const cmd = require('./cmd');
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
                expect(error.includes('Missing required argument: dest'))
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
                expect(error.includes('Not enough arguments following: o'))
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
                expect(error.toString().includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE'))
            }
        });

        it('-r ile hatalı sunucu sertifikası kabul edildiğin NBI isteği sonuçlanır', async function () {
            // GIVEN
            var args = [
                'get', 'db'
                , '--dest', 'localhost:8103'
                , '-r', false
                // , '--loglevel=nolog'
                // , '-o' , outputFilePath
                // , '-q', true
            ];

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);
                console.log(">>>> response: ", response);
                expect(response.includes('ConnectionPoolSize'))
                // THEN
            } catch (error) {
                console.log(">>> errorrrr: ", error);
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

            try {
                // WHEN
                const response = await cmd.execute(nfJsFilePath, args);

                // THEN
            } catch (error) {
                expect(error.toString().includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE'))
            }
        });

        it.only('-r: true ile geçersiz sertifikanın reddedildiği ve cacert ile sunucu sertifikasının kök sertifikasının verildiğinde NBI isteği başarılı döner', async function () {
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
                // console.log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath).toString()
                // console.log(">>>> fileContent: ", fileContent);

                var actualResponseObject = JSON.parse(fileContent)
                expect(actualResponseObject).to.have.property('ConnectionRetryPeriod');

                expect(actualResponseObject).to.have.all.keys(...Object.keys(expectedObject));
            } catch (error) {
                console.log(">>>>>>>>>> error: ", error)
                throw (error)
            }
        }, 5000);

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
                // console.log(">>>> response: ", response);

                // THEN
                // Çıktı dosya oluşturulmuş olmalı
                expect(fs.existsSync(outputFilePath))

                var fileContent = fs.readFileSync(outputFilePath).toString()
                // console.log(">>>> fileContent: ", fileContent);

                var actualResponseObject = JSON.parse(fileContent)
                expect(actualResponseObject).to.have.property('ConnectionRetryPeriod');

                expect(actualResponseObject).to.have.all.keys(...Object.keys(expectedObject));
            } catch (error) {
                console.log(">>>>>>>>>> error: ", error)
                throw (error)
            }
        }, 5000);

    });

    describe('SET ile', function () {
    });
});