// console.log("log ile stdout çıktısı")
// console.error("error ile stderr çıktısı")

// process.stdout.write("process.stdout.write log ile stdout çıktısı")
// process.stderr.write("process.stderr.write error ile stderr çıktısı")

var hata = { ozellik: "değeri", icHata:[{adi:"Hata 1"},{adi:"Hata 2"}]}
console.log("String toplama"+ hata)
console.log("String: %s", hata)
console.log("Kendisi: %0", hata)
console.log('%0', hata)