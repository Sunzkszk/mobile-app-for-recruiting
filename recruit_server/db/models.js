const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/recruit')

const md5 = require('blueimp-md5')

const conn = mongoose.connection

conn.on('connected',function(){
   console.log('数据库连接成功');
})

const userSchema = mongoose.Schema({
   username : { type:String,required:true },//用户名
   password : {type:String,required:true },//密码
   type : { type : String,required:true },//用户类型
   header : { type : String },//头像名称
   post : { type : String },//职位
   info : { type : String },//个人或职位简介
   company : { type : String },//公司名称
   salary : { type : String },//月薪
})

const UserModel = mongoose.model('user',userSchema)

exports.UserModel = UserModel

const chatSchema = mongoose.Schema({
   from : { type:String,required:true},
   to : {type:String,required:true},
   chat_id : {type:String,required:true},
   content : {type:String,required:true},
   read : {type:Boolean,default:false},
   create_time : {type:Number},
})

const ChatModel = mongoose.model('chat',chatSchema)

exports.ChatModel = ChatModel







