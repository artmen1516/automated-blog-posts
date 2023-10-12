import { client } from "@gradio/client";
import * as core from '@actions/core';
import * as github from '@actions/github'

console.log(process.env.APP_PROMPT)

const app = await client("yuntian-deng/ChatGPT");
const result = await app.predict(5, [		
  process.env.APP_PROMPT, // Prompt
  1,
  1,
  0,
  [],
  null,
]);

console.log(result);

core.setOutput("result", result);
