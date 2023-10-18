
import { parse } from 'node-html-parser';
import axios from 'axios';
import { distance } from 'fastest-levenshtein';

const dummyHTML = `<!DOCTYPE html><html><head><title>DevOps: Achieving Seamless CI/CD with Automation and Best Practices</title></head><body><h1>DevOps: Achieving Seamless CI/CD with Automation and Best Practices</h1><article><h2>The Importance of CI/CD in Software Development</h2><p>In today’s rapidly evolving technological landscape, where businesses increasingly rely on software solutions, Continuous Integration/Continuous Deployment (CI/CD) has become a crucial practice for delivering software faster, more reliably, and with higher quality.</p><h2>Automation: The Backbone of CI/CD</h2><p>At the heart of CI/CD lies automation. By automating the entire software development lifecycle - from code compilation and testing to deployment and monitoring - organizations can accelerate the delivery of new features and bug fixes while minimizing human error and manual interventions.</p><h2>Best Practices for CI/CD Implementation</h2><p>Implementing CI/CD effectively requires adhering to a set of best practices. These practices are designed to streamline the development process and ensure that software releases are consistent, sustainable, and maintainable.</p><h3>1. Version Control System</h3><p>Using a version control system, such as Git, is essential for managing codebase changes effectively and collaborating seamlessly with team members. It provides a centralized location for code and helps with code review, bug tracking, and rollbacks.</p><h3>2. Continuous Integration</h3><p>Continuous Integration involves regularly merging code changes into a shared repository. It helps catch integration issues early and provides quick feedback, ensuring that the codebase is always in a releasable state. Integration tests, automated builds, and code quality checks are key components of successful CI.</p><h3>3. Continuous Deployment</h3><p>Following successful CI, Continuous Deployment automates the process of releasing software changes into a production environment. This involves deploying changes to staging environments first, running additional tests, and gradually deploying to production. It allows for faster feedback and minimizes the risk of breaking production environments.</p><h3>4. Test Automation</h3><p>Automating tests, such as unit testing, integration testing, and end-to-end testing, is critical for ensuring that new code changes do not introduce regressions or bugs. Test automation enables rapid and reliable feedback on code quality, reducing the likelihood of issues reaching production.</p><h3>5. Infrastructure as Code</h3><p>Implementing Infrastructure as Code (IaC) enables the automation and reproducibility of infrastructure provisioning. By defining infrastructure using code (e.g., using tools like Terraform or CloudFormation), teams can easily create, manage, and version infrastructure resources. IaC promotes consistency across environments and facilitates scalability.</p><h3>6. Continuous Monitoring</h3><p>Monitoring plays a critical role in the CI/CD pipeline. By implementing continuous monitoring, teams can detect issues in real-time, make data-driven decisions, and ensure the system is performing optimally. Integrating monitoring solutions, like Prometheus or Splunk, provides insights into metrics, logs, and traces.</p><h2>Conclusion</h2><p>CI/CD, when combined with automation and best practices, revolutionizes software development by reducing time-to-market, enhancing software quality, and improving team collaboration. By embracing CI/CD and utilizing the latest tools and approaches, organizations can stay ahead in a competitive market and deliver value to their customers consistently.</p></article></body></html>`

const parsedResponse = parse(dummyHTML);
const title = parsedResponse.querySelector('h1').innerHTML;
const article = parsedResponse.querySelector('article');
const subtitles = article.querySelectorAll('h2');
const sections = article.querySelectorAll('p');

const queryResult = await getAllPosts();
const allPosts = queryResult.data.result;
const similarityArray = allPosts.map(post => distance(title, post.title));
const isDuplicate = similarityArray.some(similarity => similarity > 80);
const combinedArray = allPosts.map((title, index) => ({
  title: title.title,
  distance: similarityArray[index]
}));
combinedArray.unshift({title: title, distance: 0});

console.log(combinedArray);

process.exit(0);
if (isDuplicate) {
  console.log("Duplicate post detected, not publishing and exiting...");
  process.exit(0);
}

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

let mutationContent = [firstTextBlock] 

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
} catch (error) {
  console.log(error);
}

function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

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

async function getAllPosts(){
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
