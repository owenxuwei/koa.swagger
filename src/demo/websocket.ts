import { Server } from "ws";
import * as http from 'http';
import { setInterval } from "timers";



const wss = new Server({  
    port: 3000, //监听接口  
    verifyClient: (info:{ origin: string; secure: boolean; req: http.IncomingMessage })=>{
        console.log(info.origin);  
        console.log(info.req.trailers);  
        console.log(info.secure);  
        // console.log(info.origin);  
        // var origin = info.origin.match(/^(:?.+\:\/\/)([^\/]+)/);  
        //if (origin.length >= 3 && origin[2] == "blog.luojia.me") {  
        //    return true; //如果是来自blog.luojia.me的连接，就接受  
        //}  
        // console.log("连接",origin[2]);  
        return true; //否则拒绝  
        //传入的info参数会包括这个连接的很多信息，你可以在此处使用console.log(info)来查看和选择如何验证连接
    } //可选，验证连接函数  
});  
//广播  
const broadcast = (content: string) => {
    wss.clients.forEach((client) => {
        client.send(content);
    });
}; 
// 初始化  
wss.on('connection', function(ws) {  
    // console.log(ws.clients.session);  
    // console.log("在线人数", wss.clients.length);  
    ws.send('你是第' + wss.clients.size + '位'); 
    // 发送消息  
    ws.on('message', (data)=> {  
        ws.send(`有人在发消息:${data}`);
    });  
    // 退出  
    ws.on('close', (code,resion)=> {  
        broadcast('有人退出了'); 
    });  
});  

setInterval(()=>{broadcast("hello")},2000)