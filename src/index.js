import * as core from '@actions/core';
import WebSocket from 'ws';
import publishPost from './utils/publishPost.js';

const startTime = new Date()
console.log('Starting script at ' + startTime.toTimeString())
console.log('----------------------------------')
console.log('Input to process:',process.env.APP_PROMPT)
console.log('----------------------------------')

// Create a new websocket connection to the server
const ws = new WebSocket('wss://yuntian-deng-chatgpt.hf.space/queue/join');
const randomSession = Math.floor(Math.random() * 1000000000000).toString();

// ----- Websocket event handlers -----

// Connection opened
ws.on('open', () => {
  console.log('Connected to the WebSocket server');
  console.log('Processing input...')
});

// Listen for messages and respond accordingly
ws.on('message', (data) => {
  // console.log(`Received: ${data}`);
  const message = JSON.parse(data);
  
  // if receive send_hash, send back random session_hash
  if (message.msg === "send_hash"){
    const response = {
      "fn_index":3,
      "session_hash": randomSession
    }
    ws.send(JSON.stringify(response));
  }
  // if receive send_data, send back prompt and session_hash
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
  // if receive estimation, print position in queue and eta
  if (message.msg === "estimation") {
    console.log('Position in queue:', message.rank, ', eta:', message.rank_eta.toFixed(2), 's')
    
    if (message.rank === 0) {
      console.log("Your turn, generating response...");
    }
  }

  // if receive process_completed, print response
  if (message.msg === "process_completed")
  {
    let response = message.output.data[0].flat()[1];
    response = response.replace(/&gt;/g, ">");
    response = response.replace(/&lt;/g, "<");
    response = response.replace(/&amp;/g, "&");
    response = response.replace(/<br ?\/?>/g, "");
    console.log("Chatbot Response:", response);
    core.setOutput("result", response);
    publishPost(response);
  }
});

// Connection closed
ws.on('close', () => {
  console.log('Connection closed');
  const endTime = new Date()
  console.log('----------------------------------')
  console.log('Finished at ' + endTime.toTimeString())
  console.log('Total time elapsed:', (endTime.getTime() - startTime.getTime())/1000, 'seconds')
});

// Connection error
ws.on('error', (error) => {
  console.error(`WebSocket error: ${error.message}`);
});
