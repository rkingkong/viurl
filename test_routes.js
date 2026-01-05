console.log('Testing route files...\n');
const files = ['auth','users','posts','verification','tokens','messages','notifications','search','reports'];
files.forEach(f => {
  try {
    require('./src/routes/' + f);
    console.log('OK: ' + f + '.js');
  } catch(e) {
    console.log('FAIL: ' + f + '.js - ' + e.message);
  }
});
