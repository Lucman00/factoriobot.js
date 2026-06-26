import './src/config.js';
import { startBot } from './src/bot.js';

startBot().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});