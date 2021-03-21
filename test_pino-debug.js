const pino = require('pino');
const logger = pino({
    prettyPrint: true,
    level: process.env.LOG_LEVEL || 'info'
}, process.stderr);


logger.error('PINO: ERROR seviyesi');
logger.info('PINO: INFO seviyesi');
logger.debug('PINO: DEBUG seviyesi');

// pino'nun child metoduyla İle ek özellik ekleyelim
function fn_pino() {
    console.log('\n\n\n\n\n\n\n\n\n\n\n')
    const pinoCocukInfo = logger.child({ etiket: 'anonim fn:pino cocuk:info' })
    pinoCocukInfo.info("root:fn_pino:INFO seviyesi")
}
fn_pino();

// var info = require('debug') satırından önce 1 kez çalıştırılmalı
const pinoDebug = require('pino-debug')
pinoDebug(logger, {
    auto: true,
    map: {
        //'debug-paketi:root:INFO' > console.info 'ya bağlar
        'debug-paketi:root:INFO': 'info',
        //'root:fn:info'           > console.error 'a bağlar :)
        'root:fn:info': 'error', 
        //'debug-paketi:*:INFO'           > console.error 'a bağlar
        'debug-paketi:*:INFO': 'error', 
        '*': 'trace'                    // kalan her şeyi - console.trace
    }
});


// debug Paketi ile kayıt oluşturmak
console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
var dbgInfo_root = require('debug')('debug-paketi:root:INFO');
dbgInfo_root("DEBUG Paketi > root:INFO etiketi")

function fn() {
    console.log('\n\n')
    var dbgInfo_root_fn = require('debug')('debug-paketi:root:fn:INFO');
    dbgInfo_root_fn("DEBUG Paketi > debug-paketi:root:fn:INFO etiketi");
}
fn();

// var debug = require('debug')('example:server');

// logger.debug('debug seviyesinde görünür olacak');
// var obje = { ozellik: "değer", sayi: 12, dizi: [1, 2, 3] }
// logger.info('String: %s, Object: %o', obje, obje);
// debug("abi ne iş")


// logger.debug('info Seviyesi en alt düzeydir. Üst seviyelerde görünür');
// var obje = { ozellik: "değer", sayi: 12, dizi: [1, 2, 3] }
// logger.info('String: %s, Object: %o', obje, obje);