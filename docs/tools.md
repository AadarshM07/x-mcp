# X MCP Tools Documentation

This document outlines the available tools in the X MCP Server and how they work. These tools are designed to be chained together by AI Agents to perform complex autonomous workflows.

## `x_search`
```json
{
  "query": "string",
  "maxResults": "number (optional, default 10)"
}
```
*Expected Output: A structured string containing a list of posts, including the author's display name, handle, verified status, post text, timestamp, and post URL.*

Use it when you want to find new posts or potential connections based on a specific keyword or topic (e.g., "looking to connect in tech").

## `x_feed`
```json
{
  "maxResults": "number (optional, default 20)"
}
```
*Expected Output: A JSON string array of posts containing the author, text, timestamp, handle, verified status, and post URL.*

Use it when you want your agent to read your personal timeline to see what the people you follow are talking about or to interact with your algorithmically recommended feed.

## `x_user`
```json
{
  "username": "string"
}
```
*Expected Output: A string containing the user's name, handle, bio, follower count, and following count.*

Use it when you need to analyze someone's profile before deciding to interact with them, so you can gauge their relevance, audience size, and interests.

## `x_post`
```json
{
  "text": "string"
}
```
*Expected Output: A success message confirming the post was published.*

Use it when you want to publish a standalone thought, thread, or update directly to your timeline.

## `x_reply`
```json
{
  "tweetUrl": "string",
  "text": "string"
}
```
*Expected Output: A success message confirming the reply was posted.*

Use it when you want to engage with a specific post you discovered via `x_search` or `x_feed` to build connections or share your thoughts.

## `x_like`
```json
{
  "tweetUrl": "string"
}
```
*Expected Output: A success message confirming the post was liked.*

Use it when you want a lightweight way to show engagement and get on someone's radar without taking the time to write a full reply.

## `x_repost`
```json
{
  "tweetUrl": "string"
}
```
*Expected Output: A success message confirming the post was reposted.*

Use it when you want to amplify content from other creators to your own audience.

## `x_follow`
```json
{
  "username": "string"
}
```
*Expected Output: A success message, or a specific string stating "You are already following [username]." if they are already followed.*

Use it when you want to build your network. Following a user often triggers a notification on their end. The tool strictly checks if you already follow them first.
