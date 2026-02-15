const path = require('path');
console.log('__dirname:', __dirname);
console.log('Resolved path to ../models/Prank:', path.resolve(__dirname, '../models/Prank'));
try {
    const Prank = require('../models/Prank');
    console.log('Successfully required Prank model');
} catch (e) {
    console.error('Error requiring Prank model:', e);
}
