var express = require('express');
var router = express.Router();
const md5 = require('blueimp-md5')
const {UserModel,ChatModel} = require('../db/models')

const filter = { password : 0 } //指定过滤的属性

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//注册路由
router.post('/register',function(req,res,next){
   const { username , password , type } = req.body
   UserModel.findOne({username},function(err,user){
      if(user){
         res.send({
            code:1,
            msg:'此用户已存在'
         })
      }
      else{
         new UserModel({username,type,password:md5(password)}).save(function(err,user){
            
            res.cookie('userid',user._id,{maxAge:1000*60*60*24})
            
            const data = {username,type,_id:user._id}  //不应该把密码返回给前台
            res.send({
               code:0,
               data,
            })
         })
      }
   })
})

//登录路由
router.post('/login',function(req,res,next){
   const { username , password } = req.body
   UserModel.findOne({username,password:md5(password)},filter,function(err,user){
      if(user){
         res.cookie('userid',user._id,{maxAge:1000*60*60*24})
         res.send({
            code:0,
            data:user
         })
      }
      else{
         res.send({
            code:1,
            msg:'用户名或密码不正确'
         })
      }
   })
})

//更新用户信息的路由
router.post('/update',function(req,res,next){
  const userid = req.cookies.userid
   if(!userid){
      return res.send({
         code:1,
         msg:'请先登录'
      })
   }
   const user = req.body
   UserModel.findByIdAndUpdate({_id:userid},user,function(error,oldUser){
      if(!oldUser){
         res.clearCookie('userid')
         res.send({
            code:1,
            msg:'请先登录'
         })
      }
      else{
         const { _id,username,type} = oldUser
         const data = Object.assign(user,{ _id,username,type})
         res.send({
            code:0,
            data,
         })
      }
   })
})


//获取用户信息的路由
router.get('/user',function(req,res,next){
   const userid = req.cookies.userid
   if(!userid){
      return res.send({
         code:1,
         msg:'请先登录'
      })
   }
   UserModel.findOne({_id:userid},filter,function(error,user){
      res.send({
         code:0,
         data:user
      })
   })
})

//获取用户列表(根据类型)
router.get('/userlist',function(req,res,next){
   const {type} = req.query
   UserModel.find({type},filter,function(err,users){
      res.send({code:0,data:users})
   })
})

//获取当前用户所有相关聊天信息列表
router.get('/msglist',function(req,res,next){
   const userid = req.cookies.userid
   UserModel.find(function(err,userDocs){
      const users = userDocs.reduce((users,user)=>{
         users[user._id] = {username:user.username,header:user.header}
         return users
      },{})
      ChatModel.find({'$or':[{from:userid},{to:userid}]},filter,function(err,chatMsgs){
         res.send({
            code:0,
            data:{users,chatMsgs}
         })
      })
   })
})

//修改指定消息为已读
router.post('/readmsg',function(req,res,next){
   const from = req.body.from
   const to = req.cookies.userid
   ChatModel.update({from,to,read:false},{read:true},{multi:true},function(err,doc){
      console.log('/readmsg',doc)
      res.send({
         code:0,
         data:doc.nModified
      })
   })
})





module.exports = router;
