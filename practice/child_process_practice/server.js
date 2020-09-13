const path = require('path')
const {spawn} = require('child_process')

function runScript(){
  return spawn('python', [
    "-u",
    path.join(__dirname, 'myscript.py'),
    "--foo", "some value for foo",
  ]);
}

const subprocess = runScript()

subprocess.stdout.on('data', (data) => {
  recv = data;
});

subprocess.stderr.on('close', () => {
  console.log("Closed");
})

console.log(`${recv}`)