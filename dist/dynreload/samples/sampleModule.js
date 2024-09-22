// sampleModule.js

let counter = 3;

module.exports = {
  getData: function() {
    return `Hello from sampleModule! Counter: ${counter}`;
  },
  
  incrementCounter: function() {
    counter++;
    return counter;
  },
  
  resetCounter: function() {
    counter = 0;
    return counter;
  },
  
  getCurrentTime: function() {
    return new Date().toLocaleString();
  }
};