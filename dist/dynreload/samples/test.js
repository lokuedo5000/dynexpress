const Dynreload = require('../src/main');

// Create a new instance of Dynreload
const dynreload = new Dynreload({
  basePath: __dirname,
  extensions: ['.js', '.json'],
  silent: false,
  cache: false
});

// Function to test module loading
function testModuleLoading(modulePath) {
  console.log(`Testing module: ${modulePath}`);
  try {
    const module = dynreload.preload(modulePath);
    console.log('Module loaded successfully');
    console.log('Module content:', module);
  } catch (error) {
    console.error('Error loading module:', error.message);
  }
  console.log('---');
}

// Test cases
testModuleLoading('./sampleModule.js');
// testModuleLoading('./nonexistentModule');
// testModuleLoading('./sampleJsonModule.json');

// Test reloading (make sure to modify sampleModule.js between runs)
console.log('Testing module reload:');
const module1 = dynreload.preload('./sampleModule.js');
console.log('First load:', module1.getData());

// Simulate a change in the module (you should manually change sampleModule.js)
console.log('Please modify sampleModule.js and press any key to continue...');
process.stdin.once('data', () => {
  const module2 = dynreload.preload('./sampleModule.js');
  console.log('Second load:', module2.getData());
  process.exit();
});

// Note: You'll need to create sampleModule.js and sampleJsonModule.json in the same directory for this test to work.
// Example sampleModule.js:
/*
module.exports = {
  getData: function() {
    return "Hello from sampleModule!";
  }
};
*/

// Example sampleJsonModule.json:
/*
{
  "name": "Sample JSON Module",
  "version": "1.0.0"
}
*/