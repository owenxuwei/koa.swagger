class Base64 {  
    
     // private property  
    static _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";  
    
     // public method for encoding  
    public Base64ToUtf8(input) {  
         var output = "";  
         var chr1, chr2, chr3, enc1, enc2, enc3, enc4;  
         var i = 0;  
         input = this._utf8_encode(input);  
         while (i < input.length) {  
             chr1 = input.charCodeAt(i++);  
             chr2 = input.charCodeAt(i++);  
             chr3 = input.charCodeAt(i++);  
             enc1 = chr1 >> 2;  
             enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);  
             enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);  
             enc4 = chr3 & 63;  
             if (isNaN(chr2)) {  
                 enc3 = enc4 = 64;  
             } else if (isNaN(chr3)) {  
                 enc4 = 64;  
             }  
             output = output +  
             Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +  
             Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);  
         }  
         return output;  
     }  

     UnicodeToUtf8(str) {  
        var res:any[] = [];  
        for ( var i=0; i<str.length; i++ ) {  
         res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);  
        }  
        return "\\u" + res.join("\\u");  
    }  

    Utf8ToUnicode(str) {  
        str = str.replace(/\\/g, "%");  
        return unescape(str);  
    }  
    
     // public method for decoding  
     public Utf8ToBase64(input) {  
         var output = "";  
         var chr1, chr2, chr3;  
         var enc1, enc2, enc3, enc4;  
         var i = 0;  
         input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
         while (i < input.length) {  
             enc1 = Base64._keyStr.indexOf(input.charAt(i++));  
             enc2 = Base64._keyStr.indexOf(input.charAt(i++));  
             enc3 = Base64._keyStr.indexOf(input.charAt(i++));  
             enc4 = Base64._keyStr.indexOf(input.charAt(i++));  
             chr1 = (enc1 << 2) | (enc2 >> 4);  
             chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);  
             chr3 = ((enc3 & 3) << 6) | enc4;  
             output = output + String.fromCharCode(chr1);  
             if (enc3 != 64) {  
                 output = output + String.fromCharCode(chr2);  
             }  
             if (enc4 != 64) {  
                 output = output + String.fromCharCode(chr3);  
             }  
         }  
         output = this._utf8_decode(output);  
         return output;  
     }  
    
     // private method for UTF-8 encoding  
     private _utf8_encode(string) {  
         string = string.replace(/\r\n/g,"\n");  
         var utftext = "";  
         for (var n = 0; n < string.length; n++) {  
             var c = string.charCodeAt(n);  
             if (c < 128) {  
                 utftext += String.fromCharCode(c);  
             } else if((c > 127) && (c < 2048)) {  
                 utftext += String.fromCharCode((c >> 6) | 192);  
                 utftext += String.fromCharCode((c & 63) | 128);  
             } else {  
                 utftext += String.fromCharCode((c >> 12) | 224);  
                 utftext += String.fromCharCode(((c >> 6) & 63) | 128);  
                 utftext += String.fromCharCode((c & 63) | 128);  
             }  
    
         }  
         return utftext;  
     }  
    
     // private method for UTF-8 decoding  
     private _utf8_decode(utftext) {  
         var string = "";  
         var i = 0;  
         var c=0 , c1=0 , c2 = 0,c3=0;  
         while ( i < utftext.length ) {  
             c = utftext.charCodeAt(i);  
             if (c < 128) {  
                 string += String.fromCharCode(c);  
                 i++;  
             } else if((c > 191) && (c < 224)) {  
                 c2 = utftext.charCodeAt(i+1);  
                 string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
                 i += 2;  
             } else {  
                 c2 = utftext.charCodeAt(i+1); 
                 c3 = utftext.charCodeAt(i+2);  
                 string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
                 i += 3;  
             }  
         }  
         return string;  
     }  
 } 

interface Date {
    AddDay(day: number): Date;
    AddHour(day: number): Date;
    Minus(d:Date):number;
    Format(fmt: string): string;
}
Date.prototype.AddDay = function (day: number) {
    return new Date(this.getTime() + day * 24 * 60 * 60 * 1000);
};
Date.prototype.AddHour = function (hour: number) {
    return new Date(this.getTime() + hour * 60 * 60 * 1000);
};
Date.prototype.Minus = function (d:Date) {
    const result = this.getTime() - d.getTime();
    return result / (24 * 60 * 60 * 1000);
};
Date.prototype.Format = function (fmt: string) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

interface String{
    Utf8ToUnicode():Array<number>;
    toBase64():string;
    base64ToString():string;
    getpayload():any;
    toDate():Date;
}
String.prototype.getpayload = function(){
    const data = this;
    const cargs = data.split('.');
    if(cargs.length!=3) throw '非法token';
    return JSON.parse( cargs[1].base64ToString());
}
String.prototype.toBase64 = function(){
    return new Base64().Base64ToUtf8(this);
}
String.prototype.base64ToString = function(){
    return new Base64().Utf8ToBase64(this);
}
String.prototype.toDate = function(){
    let str:string=<string>this;
    return new Date(str).AddHour(8);
}


