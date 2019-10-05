/*
*包含所有工具函数的模块
*/


export function getRedirectTo(type,header){
    let path = ''
    if(type==='laoban'){
       path = '/laoban'
    }
    else{
       path = '/dashen'
    }
    //判断是否需要跳转到信息完善界面
    if(!header){
       path += 'info'
    }
    return path
 }
