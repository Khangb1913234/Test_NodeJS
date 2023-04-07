const mongoose = require("mongoose")

const schema = mongoose.Schema(
	{   
		email: {
			type: String,
			//required: [true, 'Email is required'],
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		},
		password: {
			type: String,
			//required: [true, 'Password is required'],
            
		},
        firstName: {
			type: String,
			required: [true, 'fisrtName is required'],
            maxlength: 50
		},
        lastName: {
			type: String,
			required: [true, 'lastName is required'],
            maxlength: 50,
		},
		role: {
            type: Number,
            required: [true, 'lastName is required']
        },
        image: {
            type: String
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        },
		accountId: {  
			type: String
		},
		provider: {
			type: String
		}
	},
	{
		timestamps: true
	}
)

module.exports = mongoose.model('account', schema)