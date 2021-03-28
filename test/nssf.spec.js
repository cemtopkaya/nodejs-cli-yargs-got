
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

    describe.only('Eksik parametre uyarılarında', function () {

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
                console.log(">>>> response: ", response);

                // THEN
            } catch (error) {
                expect(error)
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
                console.log(">>>> response: ", response);

                // THEN
            } catch (error) {
                expect(error)
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
                console.log(">>>> response: ", response);
                // expect(response.contains('ConnectionPoolSize'))
                // THEN
            } catch (error) {
                console.log(">>> errorrrr: ", error);
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