 import * as mqtt from 'mqtt';
//import {connect} from 'mqtt'

const createclient=()=>{
    var client = mqtt.connect('mqtt://qingketest.chinacloudapp.cn:8083', { username: "qk365", password: "qk365jdnet1606" });
    //var client = mqtt.connect('ws://192.168.103.251:5000/mqtt', { username: "mySecretUser", password: "mySecretPassword" });
    client.on('message', (topic, payload, packet) => {
        recieve++;
    })
    client.on('connect', () => {
        sum++;
        client.subscribe('presence', { qos: 2 })//订阅
    })
    client.on('error', (err) => {
        console.log(err)
    })
};

var sum=0;
var recieve=0
// for (var j = 0; j < 10000; j++) {
    createclient();
// }
setInterval(() => {
    console.log("连接总数:"+sum+" 接收消息数量:"+recieve)
}, 1000)