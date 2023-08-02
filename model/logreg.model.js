const mongoose = require('mongoose')

const schemae = mongoose.Schema

const userSchema = schemae({
    firstname : { type: String , require:true },  
    lastname : { type: String , require:true },  
    fullname : { type: String , require:true },  
    email : { type: String , require:true },
    isEmailVerified:{type:Boolean,enum:[true,false],default:false},
    otp:{type:String,require:true},
    otpExpiryTime:{type:String,require:true},
    password:{type:String,require:true},  
    isDeleted: { type: Boolean , enum: [true, false], default: false },
    isStatus:{type:String,enum:["Active","Inactive"],default:"Active"}

},{
    timestamps:true,
    versionkey:false
})

module.exports = mongoose.model('RegisterUser',userSchema)