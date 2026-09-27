I just wanted to automate my X (formerly Twitter) handle, gain connections, and build an audience - all while sleeping. This Model Context Protocol (MCP) server allows AI agents to fully control an X account to create posts, search for relevant posts, analyze users, follow interesting people, and reply automatically.

## How it works
This server is built on top of [Nitrostack](https://nitrostack.ai) and uses **Playwright** to run a simulated browser. Unlike fragile API bots that get banned or run into rate limits, this server literally drives a real browser instance, making it behave exactly like a human user. It uses your own auth tokens to maintain a persistent session.

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and add your X authentication tokens. You can extract these from your browser cookies when logged into X:
   ```env
   TWITTER_AUTH_TOKEN=your_auth_token_here
   TWITTER_CT0=your_ct0_cookie_here
   
   # Set to 'true' to watch the browser process, or 'false' to run silently in the background
   SHOW_BROWSER=false
   ```

3. **Start the server**
   Use your agent or run locally based on the framework you're using.

## Currently Available Tools

| Tool Name | Description |
|-----------|-------------|
| `x_search` | Search X for posts by keyword |
| `x_feed` | Read your X home feed |
| `x_user` | Get an X user profile details |
| `x_post` | Publish a new post on X |
| `x_reply` | Reply to a specific post |
| `x_like` | Like a specific post |
| `x_repost` | Repost a specific post |
| `x_follow` | Follow a user on X |

For detailed information on how to use each tool, including input schemas and use-cases, check out the [Tools Documentation](docs/tools.md).
