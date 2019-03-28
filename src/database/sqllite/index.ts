import * as sqlite from "sqlite3"
import { RunResult } from "sqlite3";

var sqlite3 = sqlite.verbose();
var db = new sqlite3.Database(__dirname+ '/test.db');
 
// db.serialize(function() {
//   db.run(`CREATE TABLE COMPANY(
//     Id INT PRIMARY KEY     NOT NULL,
//     Name           TEXT    NOT NULL,
//     Author            INT     NOT NULL
//  );`);
 
// //   var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
// //   for (var i = 0; i < 10; i++) {
// //       stmt.run("Ipsum " + i);
// //   }
// //   stmt.finalize();
 
// //   db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
// //       console.log(row.id + ": " + row.info);
// //   });
// });
 
// db.close();

const init = () => {
    db.serialize(function () {
        db.run(`CREATE TABLE  if not exists  Book(
          Id INTEGER PRIMARY KEY  AUTOINCREMENT,
          Name           TEXT    NOT NULL,
          Author            INT     NOT NULL
       );`);
        //  db.close();
    })
}

const execute = (sql:string,params:any[])=>{
    return new Promise( (resolve,reject)=>{
        db.serialize(()=> {
            db.run(sql,params,(err)=>{
                if(err) reject(err);
                const result = this;
                resolve(result);
                // db.close();
            });
        });
    });
}

const query = (sql:string)=>{
    return new Promise( (resolve,reject)=>{
        db.serialize(()=> {
            db.all(sql,(err,rows)=>{
                if(err) reject(err);
                resolve(rows);
                // db.close();
            });
        });
    });
}

const dbhelper ={
    init,query,execute
}

export default dbhelper;