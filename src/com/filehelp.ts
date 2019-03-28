import * as fs from "fs";

export class FileHelp {

    static Read(path:string) {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        })
    }

    static Write(path:string,data:string) {
        return new Promise<string>((resolve, reject) => {
            fs.writeFile(path, data, (err) => {
                if (err) reject(err);
                else resolve();
            });
        })
    }
}