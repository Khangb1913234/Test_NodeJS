const mongoose = require("mongoose")
const Account = require("../models/account.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer')
const dotenv = require("dotenv")
dotenv.config()


exports.register = async function(req, res, next){                 
    try{
        const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!validateEmail.test(req.body.email)){
            res.status(400).json({err: "Email không hợp lệ"})
            return
        }
        if(req.body.password !== req.body.confirmPassword){
            res.status(400).json(({err: "2 password không giống nhau"}))
            return
        }
        const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{10,}$/
        if(!validatePassword.test(req.body.password)){
            res.status(400).json({err: "Password phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số, 1 kí tự đặc biệt và có độ dài tối thiểu là 10 kí tự"})
            return
        }
        const account = await Account.findOne({email: req.body.email})
        if(account){
            res.json({err: "Email đã được sử dụng"})
            return
        }
        const newAccount = new Account(
            {
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: 0
            }
        )
        await newAccount.save()
        res.status(200).json({msg: "Đăng kí thành công"})
    }
    catch(err){
        console.log("Lỗi đăng kí")
        res.status(500).json({err: `Err: ${err.message}`})
    }
    
}
exports.loginFacebook = async function(req, res, nex){             
    try{
        let account = await Account.findOne({accountId: req.session.passport.user.id, provider: req.session.passport.user.provider})
        if(!account){
            res.status(404).json({err: "Tài khoản không tồn tại"})
            return
        }
        else{
            const token = jwt.sign({id: account._id}, process.env.JWT_SECRET, {expiresIn: 3600})
            res.status(200).json({msg: "Đăng nhập thành công", account: account, token: token})
        }
    }
    catch(err){
        console.log("Lỗi đăng nhập bằng facebook")
        res.status(500).json({err: `Err: ${err.message}`})
    }
    
}
exports.login = async function(req, res, next){
    try{
        const account = await Account.findOne({email: req.body.email})
        if(!account){
            res.status(404).json({err: "Email không tồn tại"})
            return 
        }
        else{
            const check = bcrypt.compareSync(req.body.password, account.password)
            if(!check){
                res.status(401).json({err: "Sai mật khẩu"})
                return
            }
            else{
                const token = jwt.sign({id: account._id}, process.env.JWT_SECRET, {expiresIn: 3600})
                res.status(200).json({msg: "Đăng nhập thành công", account: account, token: token})
            }
        }
    }
    catch(err){
        console.log("Lỗi đăng nhập")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}

exports.findAll = async function(req, res, next){
    try{
        if(req.account.role != 1){                          //Quyền admin: 1
            res.status(403).json({err: "Không có quyền"})
            return
        }
        else{  
            const page = req.query.page || 1; 
            const limit = 5; 
            const skip = (page - 1) * limit; 
            const accounts = await Account.find({}).skip(skip).limit(limit)
            const count = await Account.countDocuments();
            res.status(200).json({accounts: accounts, currentPage: page, totalPage: Math.ceil(count / limit)})
        }
    }
    catch(err){
        console.log("Không thể tìm tất cả tài khoản")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}

exports.findOne = async function(req, res, next){
    try{
        const id = req.params.id
        if((req.account.role == 1) || (req.account.role == 0 && req.account._id == id)){
            const findAccount = await Account.findOne({_id: id})
            if(!findAccount){
                res.status(404).json({err: "Tài khoản không tồn tại"})
                return
            }
            else{
                res.status(200).json({account: findAccount})
            }
        }
        else{
            res.status(403).json({err: "Không có quyền"})
            return
        }
    }
    catch(err){
        console.log("Không thể tìm tài khoản")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}

exports.update = async function(req, res, next){
    try{
        const id = req.params.id
        if((req.account.role == 1) || (req.account.role == 0 && req.account._id == id)){
            const data = req.body
            if(data.email){
                const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if(!validateEmail.test(data.email)){
                    res.status(400).json({err: "Email không hợp lệ"})
                    return
                }
                const checkAccount = await Account.findOne({email: data.email})
                if(checkAccount){
                    res.status(400).json({err: "Email đã được sử dụng"})
                    return
                }
            }
            if(data.oldPassword && data.password){
                const check = bcrypt.compareSync(req.body.oldPassword, account.password)
                if(!check){
                    res.status(401).json({err: "Sai mật khẩu"})
                    return
                }
                if(data.password !== data.confirmPassword){
                    res.status(400).json({err: "2 password không khớp nhau"})
                    return
                }
                const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{10,}$/
                if(!validatePassword.test(data.password)){
                    res.status(400).json({err: "Password phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số, 1 kí tự đặc biệt và có độ dài tối thiểu là 10 kí tự"})
                    return
                }
                data.password = bcrypt.hashSync(data.password, 10)
            }
            if(req.file){
                data.image = req.file.buffer.toString("base64")
            }
            
            if(req.account.role == 1){
                const modifyAccount = await Account.findOneAndUpdate({_id: id}, data, {new: true})
                if(!modifyAccount){
                    res.status(404).json({err: "Tài khoản không tồn tại"})
                    return
                }
                else{
                    res.status(200).json({msg: "Cập nhật tài khoản", account: modifyAccount})
                }
            }
            else{
                const {role, ...updatedFields} = data;
                const modifyAccount = await Account.findOneAndUpdate({_id: id}, {$set: updatedFields}, {new: true})
                if(!modifyAccount){
                    res.status(404).json({err: "Tài khoản không tồn tại"})
                    return
                }
                else{
                    res.status(200).json({msg: "Cập nhật tài khoản", account: modifyAccount})
                }
            }
        }
        else{
            res.status(403).json({err: "Không có quyền"})
            return
        }
        
    }
    catch(err){
        console.log("Không thể cập nhật tài khoản")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}

exports.delete = async function(req, res, next){
    try{
        const id = req.params.id
        if(req.account.role != 1){
            res.status(403).json({err: "Không có quyền"})
            return
        }
        else{
            const deleteAccount = await Account.findOneAndDelete({_id: id})
            if(!deleteAccount){
                res.status(404).json({err: "Tài khoản không tồn tại"})
                return
            }
            else{
                res.status(200).json({msg: "Xóa tài khoản", account: deleteAccount})
            }
        }
    }
    catch(err){
        console.log("Không thể xóa tài khoản")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}

exports.forgotPassword = async function(req, res, next){
    try{
        const account = await Account.findOne({email: req.body.email})
        if(!account){
            res.status(404).json({err: "Tài khoản không tồn tại"})
            return
        }
        const resetPasswordToken = jwt.sign({id: account._id}, process.env.JWT_RESET_PASSWORD, {expiresIn: 600})
        const now = new Date()
        const expire = new Date(now.getTime() + 10 * 60000);
        const modifyAccount = await Account.findOneAndUpdate({email: req.body.email}, {resetPasswordToken: resetPasswordToken, resetPasswordExpires: expire}, {new: true})
        if(!modifyAccount){
            res.status(404).json({err: "Tài khoản không tồn tại"})
            return
        }
        else{
            const link = `http://localhost:5005/account/resetPasswordToken/${resetPasswordToken}`
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: process.env.EMAIL_NAME,
                  pass: process.env.EMAIL_APP_PASSWORD,
                },
            });
            const mailOptions = {
                from: 'Admin <no-reply@gmail.com>',
                to: account.email,
                subject: 'RESET PASSWORD',
                text: 'Text content of the email',
                html: `<p>Click vào link bên dưới để reset password. Lưu ý link sẽ hết hạn sau 10 phút</p><a href=${link}>Click here to reset password</a>`,
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error(error);
                } else {
                  //console.log('Email sent: ' + info.response)
                  res.status(200).json({msg: info.response})
                }
            });
        }
    }
    catch(err){
        console.log("Không thể gửi mail reset password")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}

exports.resetPassword = async function(req, res, next){
    try{
        const account = await Account.findOne({resetPasswordToken: req.body.resetPasswordToken})
        if(!account){
            res.status(404).json({err: "Mã xác nhận không khớp"})
            return
        }
        else{
            const now = new Date()
            const expire = new Date(account.resetPasswordExpires)
            if((now.getTime() / 1000) > (expire.getTime() / 1000)){
                res.status(400).json({err: "Mã xác nhận đã hết hạn"})
                return
            }
            else{
                if(req.body.password !== req.body.confirmPassword){
                    res.status(400).json({err: "2 password không khớp nhau"})
                    return
                }
                const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{10,}$/
                if(!validatePassword.test(req.body.password)){
                    res.status(400).json({err: "Password phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số, 1 kí tự đặc biệt và có độ dài tối thiểu là 10 kí tự"})
                    return
                }
                const modifyAccount = await Account.findOneAndUpdate({resetPasswordToken: req.body.resetPasswordToken}, 
                                                                    {password: bcrypt.hashSync(req.body.password, 10), 
                                                                    resetPasswordToken: null, resetPasswordExpires: null}, {new: true})
                if(!modifyAccount){
                    res.status(404).json({err: "Mã xác nhận không khớp"})
                    return
                }
                else{
                    res.status(200).json({msg: "Reset password"})
                }
            }
        }
    }
    catch(err){
        console.log("Không thể reset password")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}

function generate_string(n) {
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < n; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    return text
}

exports.seedData = async function(req, res, next){
    try{
        if(req.account.role != 1){
            res.status(403).json({err: "Không có quyền"})
            return
        }
        else{
            let list = []
            for(let i = 0; i < req.params.number; i++){
                let newAccount = new Account({
                    email: generate_string(5) + "@gmail.com",
                    password: bcrypt.hashSync("Test12345@", 10),
                    firstName: generate_string(5),
                    lastName: generate_string(5),
                    role: 0 
                })
                list.push(newAccount)
            }
            const accounts = await Account.insertMany(list)
            if(!accounts){
                res.status(400).json({err: "Không thể tạo dữ liệu mẫu"})
                return
            }
            else{
                res.status(200).json({accounts: accounts})
            }
        }
    }
    catch(err){
        console.log("Có lỗi khi tạo dữ liệu mẫu")
        res.status(500).json({err: `Err: ${err.message}`})
    }
}