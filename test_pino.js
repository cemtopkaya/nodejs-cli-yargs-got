const pino = require('pino');
const logger = pino({
    prettyPrint: true,
    level: process.env.LOG_LEVEL || 'info'
}, process.stderr);

var obje = {
    a: 1, b: {
        b: 1,
        c: {
            c: 2
        }
    }
}
logger.debug('DEBUG seviyesi. String: %s, Object: %o', obje, obje);

function deneme(){
    const child = logger.child({ etiket_adi: 'root:deneme' })
    child.info('İç günlükleyici INFO seviyesi');
}

deneme()
logger.error('ERROR seviyesi');