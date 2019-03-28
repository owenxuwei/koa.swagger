import * as https from 'https';

export class Https {
    static Get(url: string) {
        return new Promise<any>((resolve, reject) => {
            return https.get(url, res => {
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
        });
    }
}