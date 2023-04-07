const path = require("path")
const multer = require("multer")

// var storage = multer.diskStorage({
//     destination: "./src/public/avatar",
//     filename: function (req, file, cb) {
//       let name = path.extname(file.originalname)
//       cb(null, Date.now() + name);
//     },
// })
var storage = multer.memoryStorage()

var upload = multer ({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: function(req, file, callback){
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg"){
            callback(null, true)
        }
        else{
            console.log("Chỉ ảnh png hoặc jpg")
            return callback(new Error('Chỉ ảnh png hoặc jpg'), false)
        }
        callback(null, true)
    }

})

module.exports = upload