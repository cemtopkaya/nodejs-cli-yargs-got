exports.logFunctions = {
    log: function (...params) {

        if (process.env.DEBUG_TEST == 'true')
            console.log(...params)
    },
    loge: function (...params) {

        if (process.env.DEBUG_TEST == 'true')
            console.error(...params)
    }
}