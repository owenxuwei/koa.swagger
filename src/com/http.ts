import * as http from 'http';
import { Buffer } from 'buffer';
import * as querystring from 'querystring';
import * as uuidV1 from 'uuid/v1';
import * as fs from "fs";
import { RequestOptions, ClientRequestArgs } from 'http';

export class Http {
    static Get(url: string,cookie?:string) {
        if(url.indexOf('https://')!=-1) throw "只支持http";
        let hostname="";
        let path="/";
        let port=80;
        
        url=url.substr(7);
        let index = url.indexOf('/');
        let str1="";
        if(index==-1) str1=url;
        else {
            str1 = url.substr(0, index);
            path = url.substr(index);
        }
        index = str1.indexOf(':');
        if (index == -1) hostname = str1;
        else {
            hostname = str1.substr(0, index);
            port = parseInt(str1.substr(index + 1));
        }
        let param: RequestOptions=<ClientRequestArgs>{
            host: hostname,
            port: port,
            path: path,
            method: 'GET',
            headers: {
              "Cookie":cookie
            }
        };
        return new Promise<any>((resolve, reject) => {
            var req = http.request(param, res => {
                let html = '';
                res.on('data', data => {
                    html += data;
                });
                res.on('end', () => {
                    resolve(html);
                });
            }).addListener('error', error => {
                reject(error);
            });
            req.end();
        });
    }
    static Post(url: string,contentyype?:string,body?:any,cookie?:string) {
        if(url.indexOf('https://')!=-1) throw "只支持http";
        let hostname="";
        let path="/";
        let port=80;
        
        url=url.substr(7);
        let index = url.indexOf('/');
        let str1="";
        if(index==-1) str1=url;
        else {
            str1 = url.substr(0, index);
            path = url.substr(index);
        }
        index = str1.indexOf(':');
        if (index == -1) hostname = str1;
        else {
            hostname = str1.substr(0, index);
            port = parseInt(str1.substr(index + 1));
        }
        return new Promise<any>((resolve, reject) => {
            if(!contentyype) contentyype="application/json";
            let bodydata="";
            if(body) bodydata = querystring.stringify(body); //数据以json格式发送
            let param: RequestOptions=<ClientRequestArgs>{
                host: hostname,
                port: port,
                path:path,
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                  'Content-Length': Buffer.byteLength(bodydata),
                  "Cookie":cookie
                }
            };
            var req = http.request(param, res => {
                let html = '';
                res.on('data', data => {
                    html += data;
                });
                res.on('end', () => {
                    resolve(html);
                });
            })
            .addListener('error', error => {
                reject(error);
            });
            req.write(bodydata); //发送请求
            req.end(); //请求发送完毕
        });
    }
    static GetDownLoad(url: string) {
        return new Promise<{path:string,session:string}>((resolve, reject) => {
            return http.get(url, res => {

                let result:Buffer=Buffer.from([]);
                res.on('data', (data:Buffer) => {
                    result= Buffer.concat([result,data]);
                });
                res.on('end', () => {
                    var headers:any=res.headers;
                    let session = headers["set-cookie"][0];
                    var uuid = uuidV1();
                    var path = uuid + ".jpg";
                    fs.writeFile(path, result, "binary", function(err){
                        if(err){
                            console.log(err);
                            reject(err);
                        }
                        else{
                            resolve({path:path,session:session});
                        }
                       
                    });
                    
                });
            }).addListener('error', error => {
                console.log(error);
                reject(error);
            });
        });
    }
}