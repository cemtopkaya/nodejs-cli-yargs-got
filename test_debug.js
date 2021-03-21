var debug = require('debug')
// const log = debug('sinif:fonksiyon:gunluk-seviyesi')
const log = debug('modulA:fonkB:log')
// 'modulA:fonkB:log' ad alanını console.log aracılığıyla günlüğe kaydedecek şekilde ayarlayın
log.log = console.log.bind(console);
const err = debug('modulA:fonkB:error')
err.log = console.error.bind(console);
const a = {
    b: () => {
        log("Bir LOG kaydı")
        err("Bir ERROR kaydı")
    },
    c: () => {
        const log = debug('modulA:fonkC:log')
        log.log = console.log.bind(console);
        const inf = debug('modulA:fonkC:info')
        inf.log = console.log.bind(console);
        var obj = {
            a: 1, b: {
                b: 1,
                c: {
                    c: 2
                }
            }
        }
        log("C içinde LOG kaydı %o", obj)
        inf("C içinde INFO kaydı")
    }
}
a.b()
a.c()