exports.validateName = function(req, res, next){
    try{
        if(req.body.firstName){
            if(req.body.firstName.length > 50){
                res.status(400).json({err: "Tên không được dài quá 50 kí tự"})
                return
            }
        }
        else{
            res.status(400).json({err: "Tên không được trống"})
            return
        }
        if(req.body.lastName){
            if(req.body.lastName.length > 50){
                res.status(400).json({err: "Họ không được dài quá 50 kí tự"})
                return
            }
        }
        else{
            res.status(400).json({err: "Họ không được trống"})
            return
        }
        next()
    }
    catch(err){
        console.error(err.message)
        res.status(500).json({ err: `Err: ${err.message}` })
    }
}

exports.validateEmail = function(req, res, next){
    try{
        if(req.body.email){
            const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if(!validateEmail.test(req.body.email)){
                res.status(400).json({err: "Email không hợp lệ"})
                return
            }
        }
        else{
            res.status(400).json({err: "Email không được trống"})
            return
        }
        next()
        
    }
    catch(err){
        console.error(err.message)
        res.status(500).json({ err: `Err: ${err.message}` })
    }
}
exports.validatePassword = function(req, res, next){
    try{
        if(req.body.password && req.body.confirmPassword){
            if(req.body.password !== req.body.confirmPassword){
                res.status(400).json(({err: "2 password không giống nhau"}))
                return
            }
            const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{10,}$/
            if(!validatePassword.test(req.body.password)){
                res.status(400).json({err: "Password phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số, 1 kí tự đặc biệt và có độ dài tối thiểu là 10 kí tự"})
                return
            }
        }
        else{
            res.status(400).json({err: "Password không được trống"})
            return
        }
        next()
    }
    catch(err){
        console.error(err.message)
        res.status(500).json({ err: `Err: ${err.message}` })
    }
}
