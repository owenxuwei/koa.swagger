import * as xml2js from 'xml2js';
var parseString = xml2js.parseString;
export class XML {
    static async parse(xml) {
        return new Promise<any>((resolve, reject) => {
            parseString(xml, function (err, result) {
                if(err) reject(err);
                else resolve(result);
            });
        })
    }

}