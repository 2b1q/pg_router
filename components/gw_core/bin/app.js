const cluster = require('cluster');

require(cluster.isMaster ? './master' : './gw_core_worker');

// uncaughtException handler
process.on('uncaughtException', (err) => {
  console.error(new Date().toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});
