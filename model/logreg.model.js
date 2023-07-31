const mongoose = require('mongoose')

const schemae = mongoose.Schema

const userSchema = schemae({
    name : { type: String , require:true },  
    email : { type: String , require:true },
    age : { type: Number , require:true },
    password : { type: String , require:true },
    isDeleted: { type: Boolean , enum: [true, false], default: false }

},{
    timestamps:true,
    versionkey:false
})

module.exports = mongoose.model('RegisterUser',userSchema)