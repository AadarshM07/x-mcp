import { ToolDecorator as Tool, ExecutionContext, Injectable, z } from '@nitrostack/core';
import { TwitterService } from './xapp.service.js';

@Injectable({ deps: [TwitterService] })
export class TwitterTools {
    constructor(private readonly twitterService: TwitterService) { }

    @Tool({
        name: 'x_search',
        description: 'Search X for posts by keyword',
        inputSchema: z.object({
            query: z.string().describe('Search query'),
            maxResults: z.number().optional().default(10).describe('Max tweets to return (default 10)'),
        })
    })
    async searchTweets(args: { query: string; maxResults: number }, ctx: ExecutionContext) {
        ctx.logger.info(`Searching tweets for query: ${args.query}`);
        return await this.twitterService.searchTweets(args.query, args.maxResults);
    }

    @Tool({
        name: 'x_user',
        description: 'Get an X user profile',
        inputSchema: z.object({
            username: z.string().describe('X username (without @)'),
        })
    })
    async getUserProfile(args: { username: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Getting profile for ${args.username}`);
        return await this.twitterService.getUserProfile(args.username);
    }

    @Tool({
        name: 'x_post',
        description: 'Publish a post on X',
        inputSchema: z.object({
            text: z.string().max(280).describe('Tweet text'),
        })
    })
    async postTweet(args: { text: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Posting tweet`);
        return await this.twitterService.postTweet(args.text);
    }

    @Tool({
        name: 'x_reply',
        description: 'Reply to a specific post on X',
        inputSchema: z.object({
            tweetUrl: z.string().describe('URL of the tweet to reply to'),
            text: z.string().describe('Reply text'),
        })
    })
    async replyToTweet(args: { tweetUrl: string; text: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Replying to tweet ${args.tweetUrl}`);
        return await this.twitterService.replyToTweet(args.tweetUrl, args.text);
    }

    @Tool({
        name: 'x_like',
        description: 'Like a specific post on X',
        inputSchema: z.object({
            tweetUrl: z.string().describe('URL of the tweet to like'),
        })
    })
    async likeTweet(args: { tweetUrl: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Liking tweet ${args.tweetUrl}`);
        return await this.twitterService.likeTweet(args.tweetUrl);
    }

    @Tool({
        name: 'x_repost',
        description: 'Repost (retweet) a specific post on X',
        inputSchema: z.object({
            tweetUrl: z.string().describe('URL of the tweet to retweet'),
        })
    })
    async retweet(args: { tweetUrl: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Retweeting tweet ${args.tweetUrl}`);
        return await this.twitterService.retweet(args.tweetUrl);
    }

    @Tool({
        name: 'x_follow',
        description: 'Follow a user on X',
        inputSchema: z.object({
            username: z.string().describe('X username to follow (without @)'),
        })
    })
    async followUser(args: { username: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Following user ${args.username}`);
        return await this.twitterService.followUser(args.username);
    }

    @Tool({
        name: 'x_feed',
        description: 'Read your X home feed',
        inputSchema: z.object({
            maxResults: z.number().optional().default(20).describe('Max tweets to return (default 20)'),
        })
    })
    async readFeed(args: { maxResults: number }, ctx: ExecutionContext) {
        ctx.logger.info(`Reading feed`);
        return await this.twitterService.readFeed(args.maxResults);
    }
}
