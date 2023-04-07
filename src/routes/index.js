const accountRouter = require("./account.route")
function route(app){
    app.use("/account", accountRouter)
}
module.exports = route