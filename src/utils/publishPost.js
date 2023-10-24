
import { parse } from 'node-html-parser';
import axios from 'axios';
import { distance } from 'fastest-levenshtein';

export async function publishPost(post) {

  const parsedResponse = parse(post);
  const title = parsedResponse.querySelector('h1').innerHTML;
  const article = parsedResponse.querySelector('article');
  const subtitles = article.querySelectorAll('h2');
  const sections = article.querySelectorAll('p');
  
  const queryResult = await getAllPosts();
  const allPosts = queryResult.data.result;
  const similarityArray = allPosts.map(post => distance(title, post.title));
  const isDuplicate = similarityArray.some(similarity => similarity < 20);
  const combinedArray = allPosts.map((title, index) => ({
    title: title.title,
    distance: similarityArray[index]
  }));
  combinedArray.unshift({title: title, distance: 0});
  
  console.log("Comparing post to existing posts...")
  console.log(combinedArray);
  
  // Currently disabled because I'm testing dynamic prompts to prevent duplicates,
  // Maybe this is a better solution than checking for duplicates.
  // if (isDuplicate) {
  //   console.log("Duplicate post detected, not publishing and exiting...");
  //   process.exit(0);
  // }

  let mutationContent = [] 
  
  subtitles.forEach((subtitle, index) => {
  
    let titleBlock = {
      "_type": "block",
      "markDefs": [],
      "_key": randomString(32),
      "style": "h4",
      "children": [{
        "_key": randomString(32),
        "_type": "span",
        "marks": [],
        "text": subtitle.innerHTML,
      }],
    }
  
    let textBlock = {
      "_type": "block",
      "markDefs": [],
      "_key": randomString(32),
      "style": "normal",
      "children": [{
        "_key": randomString(32),
        "_type": "span",
        "marks": [],
        "text": sections[index].innerHTML,
      }],
    }
  
    mutationContent.push(titleBlock);
    mutationContent.push(textBlock);
  });
  
  let lastTitleBlock = {
    "_type": "block",
    "markDefs": [],
    "_key": randomString(32),
    "style": "h4",
    "children": [{
      "_key": randomString(32),
      "_type": "span",
      "marks": [],
      "text": "---IMPORTANT---",
    }],
  }
  
  let lastTextBlock = {
    "_type": "block",
    "markDefs": [],
    "_key": randomString(32),
    "style": "normal",
    "children": [{
      "_key": randomString(32),
      "_type": "span",
      "marks": [],
      "text": "Hello!, this is an automated blog post, it was generated using GPT-3.5. While GPT is a powerful tool for generating content, it's not infallible, and there's a possibility that some of the information presented in this post may not be entirely accurate or up-to-date. If you have any questions or concerns about the content of this post, please contact me.",
    }],
  }
  
  mutationContent.push(lastTitleBlock);
  mutationContent.push(lastTextBlock);
  
  let mutationResult = {
    "mutations": [
      {
        "create": {
          "_id": "auto.",
          "_type": "post",
          "title": title,
          "slug": {
            "current": slugify(title),
            "_type": "slug"
          },
          "labels": ["automated-blog-post", "automation", "ai", "gpt"],
          "content": mutationContent,
        }
      }
    ]
  }
  
  try {
    axios.post(
      'https://zfsyewq1.api.sanity.io/v2021-10-21/data/mutate/production', 
      mutationResult,
      { headers: {
        'authorization': `Bearer ${process.env.SANITY_API_TOKEN}`,
        'Content-Type': 'application/json',
      }})

    console.log("Post published successfully!");
  } catch (error) {
    console.log(error);
  }
}

// Get all posts from my Sanity.io dataset
export async function getAllPosts(){
  let result = null;
  try {
    result = axios.get('https://zfsyewq1.api.sanity.io/v2021-10-21/data/query/production?query=*[_type%20==%20%22post%22]{title}',
    { headers: {
      'authorization': `Bearer ${process.env.SANITY_API_TOKEN}`,
      'Content-Type': 'application/json',
    }});
  } catch(error) {
    console.log(error);
  }
  return result;
}

// ---- Helper Functions ----

// Generate a random string of a given length
function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// Convert a string to a slug
function slugify(str) {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}

