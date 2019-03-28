import app from './app'
import dbhelper from './database/sqllite'
// const app = require('./app');
dbhelper.init();

const server = app.listen(3001, () => {
  console.log('Server is running at http://localhost:3001');
  console.log('Press CTRL-C to stop \n');
});

module.exports = server;