# automated-blog-posts
An scheduled tool to publish new posts in my blog using HuggingFace Spaces and Sanity

## What is this?
This is a tool that I use to publish new posts in my blog. It uses [HuggingFace Spaces](https://huggingface.co/spaces) to generate the posts from a chatbot and [Sanity](https://www.sanity.io/) to store the posts and publish them in my blog.

## How does it work?

### 1. Scheduled Job
I use [GitHub Actions](https://github.com/features/actions) to schedule a job that runs from Monday to Friday at 8:00 AM. This job runs the script `index.js` that is in charge of generating the new post and publishing it in Sanity.

### 2. Generate Post
The script `index.js` uses [HuggingFace Spaces](https://huggingface.co/spaces) to generate the new post. It uses the [yuntian-deng/ChatGPT](https://huggingface.co/spaces/yuntian-deng/ChatGPT) space using `gpt-3.5-turbo` to generate the post.

### 3. Publish Post
The script `index.js` uses the [Sanity HTTP API Mutations](https://www.sanity.io/docs/http-mutations) to create the new post in Sanity. 

## Requirements

### Environment Variables
The script uses the following environment variables to generate the post:

Repository Environment Variables:
- `APP_PROMPT`: The prompt that the chatbot will use to generate the post.

Repository Secrets:
- `SANITY_API_TOKEN`: The API token of your Sanity project.
- `SANITY_PROJECT_ID`: The project id of your Sanity project.
- `SANITY_DATASET`: The dataset of your Sanity project.

### Sanity Schema
Post Document 

```
{
  title: 'Posts',
  name: 'post',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    {
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      title: 'Labels',
      name: 'labels',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      title: 'Content',
      name: 'content',
      type: 'richText',
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title,
        media: ComposeIcon,
      }
    },
  },
}
```


