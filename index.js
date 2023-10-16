import * as core from '@actions/core';
import * as github from '@actions/github'
import WebSocket from 'ws';

const startTime = new Date()
console.log('Starting script at ' + startTime.toTimeString())
console.log('----------------------------------')
console.log('Input to process:',process.env.APP_PROMPT)
console.log('----------------------------------')

const ws = new WebSocket('wss://yuntian-deng-chatgpt.hf.space/queue/join');
const randomSession = Math.floor(Math.random() * 1000000000000).toString();

ws.on('open', () => {
  console.log('Connected to the WebSocket server');
  console.log('Processing input...')
});

ws.on('message', (data) => {
  // console.log(`Received: ${data}`);
  const message = JSON.parse(data);
  
  if (message.msg === "send_hash"){
    const response = {
      "fn_index":3,
      "session_hash": randomSession
    }
    ws.send(JSON.stringify(response));
  }
  if (message.msg === "send_data"){
    const response = {
      "fn_index":3,
      "data":[
        process.env.APP_PROMPT,
        1,
        1,
        1,
        [],
        null
      ],
      "event_data":null,
      "session_hash": randomSession
    }
    ws.send(JSON.stringify(response));
  }

  if (message.msg === "estimation") {
    console.log('Position in queue:', message.rank, ', eta:', message.rank_eta.toFixed(2), 's')
  
    if (message.rank === 0) {
      console.log("Your turn, generating response...");
    }
  }

  if (message.msg === "process_completed")
  {
    console.log("Chatbot Response:", message.output.data[0].flat()[1]);
    core.setOutput("result", message.output.data[0].flat()[1]);
  }
});

ws.on('close', () => {
  console.log('Connection closed');
  const endTime = new Date()
  console.log('----------------------------------')
  console.log('Finished at ' + endTime.toTimeString())
  console.log('Total time elapsed:', (endTime.getTime() - startTime.getTime())/1000, 'seconds')
});

ws.on('error', (error) => {
  console.error(`WebSocket error: ${error.message}`);
});
