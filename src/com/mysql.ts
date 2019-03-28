import * as mysql from 'mysql';

export class MySql {
    pool: mysql.Pool;
    constructor(config: mysql.PoolConfig) {
        this.pool = mysql.createPool(config);
    }
    /**
     * SELECT `username`, `email` FROM `users` WHERE id = 1
     * 
     * "UPDATE posts SET title = :title", { title: "Hello MySQL" }
     * @param sql sql语句
     * @param values 参数
     */
    Query(sql: string, values?: any) {
        return new Promise<any>((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) reject(err);
                else conn.query(sql, values, (error, results, fields) => {
                    if (error) reject(error);
                    else resolve(results);
                });
            });
        });
    }
}