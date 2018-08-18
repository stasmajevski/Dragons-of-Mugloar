const log4js = require('log4js');

log4js.configure({
  appenders: { battle: { type: 'file', filename: 'battle.log' } },
  categories: { default: { appenders: ['battle'], level: 'trace' } }
});

const logger = log4js.getLogger('battle');

function LOG(data){
  return logger.trace(data);
}

module.exports.LOG = LOG;


