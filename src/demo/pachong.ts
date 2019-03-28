import { Https } from "./com/https";
//import { MySql } from "./com/mysql";
import { FileHelp } from "./com/filehelp";
// import "./demo/websocket";  
import "./com/DateExtend";
import { Http } from "./com/http";
import * as request from "request";
// import * as tesseract from 'tesseract.js';
import { Exe } from "./com/exe";
import * as fs from "fs";
import * as http from 'http';
import { RequestOptions, ClientRequestArgs } from 'http';
import { XML } from "./com/xml";
import { Email } from "./com/email";
import { setTimeout } from "timers";
process.env.TZ = 'Asia/Shanghai';
process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf8');

var getcode = async () => {
    const result = await Http.GetDownLoad('http://kq2.qk365.com/login/code');
    console.log(result);
    let code = await Exe.Excute(result.path);
    //console.log(code);
    code = code.replace(/\s/g, '');
    //console.log(code);
    //console.log('开始删除图片');
    fs.unlink(result.path, (e) => {
        if (e) {
            //console.log('删除图片失败！');
            //console.log(e);
        }
    });
    const userName_RegExp = /^[0-9a-zA-Z]+$/;
    if (code.length == 4 && userName_RegExp.test(code)) {
        console.log('成功识别验证码！'+code);
        return { code: code, session: result.session };
    }
    //console.log('code没识别出来');
    return null;
}

var getsuccesscode = async () => {
    while (true) {
        const result = await getcode().catch(er => {
            return null;
        });
        if (result) return result;
    }
}

var login = async (name: string, pwd: string) => {
    let result: any = await getsuccesscode();
    const cookie: string = result.session.split(';')[0];
    console.log('Cookie:' + cookie);
    var loginresult = await Http.Post('http://kq2.qk365.com/login', '', { username: name, password: pwd, validateCode: result.code }, cookie);
    if (loginresult) throw '登入失败！'+ name;
    return cookie;


}
var errcache: { [key: string]: number } = {};
var loginsuccess = async (name: string, pwd: string) => {
    errcache[name]=0;
    while (true) {
        console.log('开始登入！'+ name)
        const result = await login(name, pwd).catch(er => {
            console.log('登入失败！'+ name)
            return null;
        });
        if (result) return result;
        else errcache[name]++;
        if(errcache[name]==50){
            throw 'login count max！'+ name;
        }
    }
}
var usercookie: { [key: string]: string } = {};
var getlasttime = async (name: string, pwd: string) => {
    let cookie = "";
    if (usercookie[name]) cookie = usercookie[name];
    else {
        cookie = await loginsuccess(name, pwd);
        console.log("登入成功！"+ name);
        usercookie[name] = cookie;
    }
    console.log('Cookie:' + cookie);
    console.log("获取时间...");
    let content = await Http.Get('http://kq2.qk365.com/home', cookie);
    if (!content) {
        delete usercookie[name];
        throw '登入失败！';
    }
    content = content.replace(/\s+\n\s+/g, '');
    //console.log(content);
    var tablereg = /<table.*<\/table>/
    var tablestrs = content.match(tablereg);
    console.log(tablestrs[0]);
    if (!tablestrs) throw "为正确提取table数据！";
    const result = await XML.parse(tablestrs[0]);
    var datestr0:string = result.table.tr[1].td[0];
    var datestr1:string = result.table.tr[1].td[1];
   // const lastdate = <Date> datestr.toDate();
    if (datestr0) datestr0.trim();
    if (datestr1) datestr1.trim();
    if(!datestr0 && !datestr1) return false;//都没打卡 不提醒
    console.log(datestr0);
    console.log(datestr1);
    if (datestr0 && datestr1){
        if(datestr0 == datestr1) return true;
        else{
            const date1=new Date(datestr0);
            const date2=new Date(datestr1);
            const hour = (date2.getTime()-date1.getTime())/(60 * 60 * 1000);
            return hour<2;
        }
        //return datestr0 == datestr1;
        // var curdate2 = new Date(datestr1);
        // console.log(curdate2.getHours());
        // if(curdate2.getHours()<18){
        //     return true;
        // }
        // else return false;
    }
    else return true;
}

//getlasttime('徐韦','LEByXf40');

var getlasttimesuccess = async (name: string, pwd: string) => {
    while (true) {
        const result = await getlasttime(name, pwd).catch(er => {
            console.log('获取time失败！')
            return null;
        });
        if (result!==null) return result;
        else if(errcache[name]==50){
            return false;//不发邮件
        }
    }
}

var users = [
    { name: "yangmeiting", pwd: "SHEwoqishei209",email:"yangmeiting@qk365.com",need:true },
    { name: "xiaoxiao", pwd: "Xiaoxiao1",email:"xiaoxiao@qk365.com",need:true },
    { name: "wangwenbo", pwd: "Qingke365",email:"wangwenbo@qk365.com",need:true },
    { name: "liwanlong", pwd: "Liwl0811",email:"liwanlong@qk365.com",need:true },
    { name: "徐韦", pwd: "LEByXf40",email:"xuwei@qk365.com",need:true }
];


// Email.Send("964128467@qq.com").then((result) => {
//     console.log(result);
// })

var check = () => {
    
    users.forEach((user,index) => {
        if(user.need){
            getlasttimesuccess(user.name, user.pwd).then(same => {
                console.log('检测结果'+user.name);
                console.log(same);
                user.need = same;            
                if (same) {
                    setTimeout(()=>{
                        console.log('邮件提醒'+user.name);
                        Email.Send(user.email).then((result) => {
                            console.log(result);
                        })
                    },3000*index)
                }
            }).catch(e=>{
                console.log(e);
            });
        }
    })

}

var workingid:any=null;
var stopwork=()=>{
    if(workingid!==null){ 
        users.forEach(u=>{
            u.need=true;
        })
        clearInterval(workingid);
        workingid=null;
        console.log("检查结束！")
    }
}

var trigger=()=>{
    var curdate = new Date();
    if (curdate.getHours() != 18 && curdate.getHours() != 19) {
        stopwork();
        console.log("时间未到！")
        return;
    }
    if (curdate.getHours() == 18 && curdate.getMinutes() < 15) {
        stopwork();
        console.log("时间未到！")
        return;
    }
    if(workingid===null){
        console.log("开始检查！")
        check();
        workingid = setInterval(check , 1000 * 60 * 5);
    }
    else
     console.log("正在工作！")
}

setInterval(trigger , 1000 * 10);
// getsuccesscode().then(result => {
//     var cookie = result.session.split(';')[0];
//     console.log('Cookie:' + cookie);
//     Http.Post('http://kq2.qk365.com/login', '', { username: '徐韦', password: 'LEByXf40', validateCode: result.code }, cookie).then(result => {
//         if(!result){
//             console.log("登入成功！");
//             Http.Get('http://kq2.qk365.com/home',cookie).then((content)=>{
//                 content = content.replace(/\s/g,'');
//                 console.log(content);
//             })
//         }
//     }).catch(() => {
//         console.log("登入失败！");
//     })
// });

//  var code="8euv"
//  var cookie= "JSESSIONID=3BBF26148BF53193A686D5AC5AA417DF";
// Http.Post('http://kq2.qk365.com/login','',{username:'徐韦',password:'LEByXf40',validateCode:code},cookie).then((result)=>{
//     console.log("登入成功！");
//     Http.Get('http://kq2.qk365.com/home',cookie).then((result)=>{
//         console.log(result);
//     })
// }).catch(()=>{
//     console.log("登入失败！");
// })

// Http.Get('http://kq2.qk365.com/home',cookie).then((content)=>{
//     content = content.replace(/\s+\n\s+/g,'');
//     var tablereg=/<table.*<\/table>/
//     var tablestrs =  content.match(tablereg);
//     console.log(tablestrs[0]);
//     if(!tablestrs) throw "为正确提取table数据！";
//     XML.parse(tablestrs[0]).then(result=>{
//         var datestr=result.table.tr[1].td[1];
//         const lastdate=new Date(datestr);
//         console.log(lastdate);
//     })

// })

// Http.Post('http://kq2.qk365.com/login','',{username:'xuwei',password:'LEByXf40'}).then(result=>{
//     console.log(result);
// })

// Http.GetDownLoad('http://kq2.qk365.com/login/code').then(result => {
//     console.log(result);
//     Exe.Excute(result.path).then(code => {

//     })
// })

// var image = require('path').resolve(__dirname, 'test.png');
// Exe.Excute(image).then(result=>{
//     console.log(result);
// })
// tesseract.recognize(image,{lang: 'eng'})
//      .progress(function  (p) { console.log('progress', p)    })
//     .then(data => {
//         console.log('then\n', data.text)
//     })
//     .catch(err => {
//       console.log('catch\n', err);
//     })
//     .finally(e => {
//       console.log('finally\n');
//       process.exit();
//     });
// var testImage = __dirname + '/test.png';



// const mysql = new MySql({
//     host: '192.168.1.213',
//     user: 'root',
//     password: 'qk365@test',
//     database: 'division_dev'
// });
// mysql.Query('SELECT * from plan').then(result => {
//     console.log(result);
// }).catch(error => {
//     console.log(error);
// });

