const userModel = require('../model/logreg.model')
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');
const mailer = require('../helper/mailer')


class loginRegisterController{

    //<<<<<<<<<<<<<<<<<<<<<  authentication part >>>>>>>>>>>>>>>>>>>>>>>>>>>>

    async userAuth(req, res, next){
        try{
            if(!_.isEmpty(req.user)){                   
                next();
            } else {
                res.status(200).json({
                    message: "UnAuthorized User  Please Login",
                    data:[]
                });                                          
            }

        }catch(err){
            throw(err);
        }
    }
//<<<<<<<<<<<<<<<<<<<<<<< show welcome status >>>>>>>>>>>>>>>>>>>>>>>>

    async welcomeStatus(req,res){
        try{
            
       res.status(200).json({
        message:"welcome",
        data:[]
       })

        }catch(err){
            throw err
        }

    }
//  <<<<<<<<<<<<<< user Register >>>>>>>>>>>>>>>>>>

    async register(req,res){
        try{
            if (_.isEmpty(req.body.firstname)) {
                return res.status(400).json({
                    message:"firstname is required",
                    data:[]
                })
            }

            if (_.isEmpty(req.body.lastname)) {
                return res.status(400).json({
                    message:"lastname is required",
                    data:[]
                })
            }



            if (_.isEmpty(req.body.email)) {
                return res.status(400).json({
                    message:"Email is Required",
                    data:[]
                })
            }

            
          

            if (_.isEmpty(req.body.password)) {
                return res.status(400).json({
                    message:"password is Required",
                    data:[]
                })
            }

            if (_.isEmpty(req.body.confirm_password)) {
                return res.status(400).json({
                    message:"confirm password is Required",
                    data:[]
                })
            }

        let is_email_exist = await userModel.findOne({email: req.body.email})

        if (!_.isEmpty(is_email_exist)) {
            return res.status(400).json({
                message: " this email is already exist ",
                data:[]
            }) 
        }

        if (req.body.password !== req.body.confirm_password) {
            return res.status(400).json({
                message:"password and confirm password is does not matching ",
                data:[]
            }) 
        }
        req.body.fullname= req.body.firstname + " " + req.body.lastname

        req.body.password = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10))

        const otpGenerated = `OTP-${Math.round(Math.random() * 10000)}`
        req.body.otp = otpGenerated
        const currentTime = dayjs().unix()
        // console.log(currentTime);

        req.body.otpExpirtTime = currentTime
        const dateTimeObject = new Date()
        await mailer.sendMail(process.env.EMAIL,req.body.email,'Succesfully Registered', `hiw ${req.body.fullname} your account has been registered, <br> Date :${dateTimeObject.toDateString()} <br> Time : ${dateTimeObject.toTimeString()}<br> use this otp to varify your gmail ${otpGenerated} <br> this otp is valid for 1 minute `)

        let saveData = await userModel.create(req.body)
        if (!_.isEmpty(saveData)&& saveData._id ) {
            res.status(200).json({
                message:" Your registration has been sucessfully completed ",
                data:[saveData]
            })
            
        }else{
            res.status(400).json({
                message:" something went wrong ",
                data:[]
            })
        }
         }catch(err){
            throw err
        }

    }
// <<<<<<<<<<<<<<<< user login >>>>>>>>>>>>>>>>
    async login(req,res){
        try{
            if (_.isEmpty(req.body.email)) {
                return res.status(400).json({
                    message:"Email is required",
                    data:[]
                })
             }
             if (_.isEmpty(req.body.password)) {
                return res.status(400).json({
                    message:"password is required",
                    data:[]
                })
             }

             let email_exist = await userModel.findOne({email: req.body.email})
            

             if (_.isEmpty(email_exist)) {
                res.status(400).json({
                    message:"email does not exist with this account",
                    data:[]
                })
                
             } else{
                const hash_password = email_exist.password
                if (bcrypt.compareSync(req.body.password,hash_password)) {
                    let token = jwt.sign({
                        id:email_exist._id,
                    },'abcdefg',{expiresIn:"2d"})
                    res.cookie('user_token',token)
                    res.status(200).json({
                        message:"Login sucessfull",
                      
                        
                    })
                }else{
                    res.status(401).json({
                        message: "Bad credentials",
                        data:[]
                    });   
                }
             }



        }catch(err){
            throw err

        }


    }
//   <<<<<<<<<<<< user dashboard >>>>>>>>>>>>>>>>>>
    async dashboard(req,res){
        try{
            if (!_.isEmpty(req.user)) {
                let login_user = await userModel.findOne({_id:req.user.id})
                res.status(200).json({
                    message:`Welcome ${login_user.name}`,
                    data:[login_user]
                })
            }else{
                res.status(401).json({
                    message:"plz login",
                    data:[]
                })
            }

        }catch(err){
            throw err

        }

    }

    // <<<<<<<<<< logout section >>>>>>>>>>>>>>>

    async logout(req,res){
        try{
            res.clearCookie('user_token')
            res.status(200).json({
                message:"your account has been loggedOut",
                data:[]
            })

        }catch(err){
            throw err

        }
    }



}

module.exports = new loginRegisterController()