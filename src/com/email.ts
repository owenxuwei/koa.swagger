import * as nodemailer from 'nodemailer';
import * as uuidV1 from 'uuid/v1';
// var transporter = nodemailer.createTransport({
//     service: 'smtp.qq.com',
//     auth: {
//         user: '964128467@qq.com',
//         pass: 'owen9188!!'
//     }
// });
var transporter = nodemailer.createTransport("smtps://964128467@qq.com:zlpkuqiigdlxbbce@smtp.qq.com");

export class Email {
    static async Send(qqaddr: string) {
        return new Promise<any>((resolve, reject) => {
            var mailOptions = {
                from: '964128467@qq.com', // sender address
                to: qqaddr, // list of receivers
                subject: uuidV1()+'未打卡', // Subject line
               // text: '未打卡', // plaintext body
                html: '<h1 class="'+uuidV1()+'"><b>未打卡</b></h1>' // html body
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log('Message sent: ' + info.response);
                    resolve(true);
                }
            });
        });
    }

}