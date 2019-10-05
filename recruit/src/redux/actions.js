/*
   包含n个action creator
   异步action
   同步action
*/
import {reqRegister,reqLogin,reqUpdateUser,reqUser,reqUserList,reqChatMsgList,reqReadMsg} from '../api'
import {AUTH_SUCCESS,ERROR_MSG,RECEIVE_USER,RESET_USER,RECEIVE_USER_LIST,RECEIVE_MSG_LIST,RECEIVE_MSG,MSG_READ} from './action-types'
import io from 'socket.io-client'

function initIO(dispatch,userid){
   if(!io.socket){
      io.socket = io('ws://localhost:3000')
      io.socket.on('receiveMsg',function(chatMsg){
         console.log('客户端接收服务器发送的消息',chatMsg)
         if(userid === chatMsg.from || userid === chatMsg.to){
            dispatch(receiveMsg(chatMsg,userid))
         }
      })
   }
}

async function getMsgList(dispatch,userid){
   initIO(dispatch,userid)
   const response = await reqChatMsgList()
   const result = response.data
   if(result.code===0){
      const {users,chatMsgs} = result.data
      dispatch(receiveMsgList({users,chatMsgs,userid}))
   }
}

const authSuccess = (user) => ({ type:AUTH_SUCCESS,data:user})
const errorMsg = (msg) => ({ type:ERROR_MSG,data:msg})
const receiveUser = (user) => ({ type:RECEIVE_USER,data:user})
export const resetUser = (msg) => ({ type:RESET_USER,data:msg})
export const receiveUserList = (userList) => ({type:RECEIVE_USER_LIST,data:userList})
const receiveMsgList = ({users,chatMsgs,userid}) => ({type:RECEIVE_MSG_LIST,data:{users,chatMsgs,userid}})
const receiveMsg = (chatMsg,userid) => ({type:RECEIVE_MSG,data:{chatMsg,userid}})
const msgRead = ({count,from,to}) => ({type:MSG_READ,data:{count,from,to}})

export const register = (user) => {

   const {username,password,password2,type} = user

   if(!username){
      return errorMsg('用户名不能为空')
   }
   else if(password !== password2){
      return errorMsg('两次密码不一致')
   }

   return async dispatch => {
     const response = await reqRegister({username,password,type})
     const result = response.data
     if(result.code===0){//成功
         getMsgList(dispatch,result.data._id)
         dispatch(authSuccess(result.data))
     }
     else{//失败
         dispatch(errorMsg(result.msg))
     }
   }
}

export const login = (user) => {
   
   const {username,password} = user

   if(!username){
      return errorMsg('用户名不能为空')
   }
   else if(!password){
      return errorMsg('密码不能为空')
   }

   return async dispatch => {
     const response = await reqLogin(user)
     const result = response.data
     if(result.code===0){//成功
         getMsgList(dispatch,result.data._id)
         dispatch(authSuccess(result.data))
      }
      else{//失败
         dispatch(errorMsg(result.msg))
      }
   }
}

export const updateUser = (user) => {
   return async dispatch => {
      const response = await reqUpdateUser(user)
      const result = response.data
      if(result.code===0){//更新成功
         dispatch(receiveUser(result.data))
      }
      else{//更新失败
         dispatch(resetUser(result.msg))
      }
   }
}

export const getUser = () => {
   return async dispatch => {
      const response = await reqUser()
      const result = response.data
      if(result.code===0){
         getMsgList(dispatch,result.data._id)
         dispatch(receiveUser(result.data))
      }
      else{
         dispatch(resetUser(result.msg))
      }
   }
}

export const getUserList = (type) =>{
   return async dispatch => {
      const response = await reqUserList(type)
      const result = response.data
      if(result.code===0){
         dispatch(receiveUserList(result.data))
      }
   }
}

export const sendMsg = ({from,to,content}) =>{
   return dispatch => {
      console.log('客户端向服务器发送消息',{from,to,content})
      io.socket.emit('sendMsg',{from,to,content})
   }
}

export const readMsg =(from,to) => {
   return async dispatch => {
      const response = await reqReadMsg(from)
      const result = response.data
      if(result.code===0){
         const count = result.data
         dispatch(msgRead({count,from,to}))
      }
   }
}