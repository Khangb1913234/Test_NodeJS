const jwt = require('jsonwebtoken')
const Account = require('../models/account.model')

module.exports = async function(req, res, next) {
    try {
        let token = req.header('Authorization')
        if (!token) {
            return res.status(403).json({ err: 'Không có quyền' })
        }
        token = token.substr(7)
        let decode = jwt.verify(token, process.env.JWT_SECRET)
        const account = await Account.findById(decode.id)
        if (!account) {
            res.status(404).json({ msg: 'Tài khoản không tồn tại' })
            return
        }
        req.account = account
        next()
    } 
    catch(err) {
        console.error(err.message)
        res.status(500).json({ err: `Err: ${err.message}` })
    }
}