import { client } from "@gradio/client";
import * as core from '@actions/core';
import * as github from '@actions/github'

const startTime = new Date()
console.log('Starting script at ' + startTime.toTimeString())
console.log('----------------------------------')
console.log('Input to process:',process.env.APP_PROMPT)

const app = await client("yuntian-deng/ChatGPT");

console.log('Processing input...')
const result = app.submit(5, [		
  process.env.APP_PROMPT, // Prompt
  1,
  1,
  0,
  [],
  null,
]);

let finalResult = "";

result.on("status", (status) => {
  if (status.stage === "pending" && status.position != undefined && status.eta != undefined) {
    console.log('Position in queue:', status.position, ', eta:', status.eta.toFixed(2), 's')

    if (status.position === 0) {
      console.log("Your turn, generating response...");
    } 
  } 
  else if (status.stage === "complete") {
    console.log("Chatbot Response:", finalResult.data[0].flat()[1]);
    core.setOutput("result", finalResult.data[0].flat()[1]);

    const endTime = new Date()
    console.log('----------------------------------')
    console.log('Finished at ' + endTime.toTimeString())
    console.log('Total time elapsed:', (endTime.getTime() - startTime.getTime())/1000, 'seconds')
  }

  else if (status.stage === "error") {
    console.log("Chatbot Error:", result.data);
    core.setOutput("result", "Error");
  }
}).on("data", (data) => {
  finalResult = data
});