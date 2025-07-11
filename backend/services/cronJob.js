const cron = require('node-cron');
const { processQueueDirectly } = require('./queueManager');

cron.schedule('*/2 * * * *', async () => {
  console.log('🔁 Cron running to assign pending orders...');
  await processQueueDirectly();
});
