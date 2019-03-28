import * as child_process from 'child_process';
import * as uuidV1 from 'uuid/v1';
import * as fs from "fs";
import {resolve} from "path";
import { FileHelp } from './filehelp';
var exec = child_process.exec;
export class Exe {
    static Excute(path: string) {
        return new Promise<string>((resolve, reject) => {
            var uuid = uuidV1();
            var outtext = require('path').resolve(__dirname, uuid+ '.txt');
            console.log(outtext);
            const cmd=`tesseract ${path} "${uuid}" -l eng`;
            console.log(cmd);
            exec(cmd,(err,stdout,derr)=>{
                if(err){
                    reject(err);
                    console.log(err);
                }
                else{
                    console.log(stdout);
                    console.log(derr);
                    FileHelp.Read(uuid+ '.txt').then(result=>resolve(result)).catch(e=>reject(e))
                    .then(()=>{
                        fs.unlink(uuid+ '.txt',(e)=>{
                            if(e){
                                console.log('删除文件失败！');
                                console.log(e);
                            }
                        });
                    });
                }
            })
        });
    }
}