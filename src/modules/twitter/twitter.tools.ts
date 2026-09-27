import { ToolDecorator as Tool, ExecutionContext, Injectable, z } from '@nitrostack/core';
import { TwitterService } from './twitter.service.js';

@Injectable({ deps: [TwitterService] })
export class TwitterTools {
    constructor(private readonly twitterService: TwitterService) {}

    @Tool({
        name: 'twitter_search',
        description: 'Search Twitter/X for tweets by keyword',
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
        name: 'twitter_user',
        description: 'Get a Twitter/X user profile',
        inputSchema: z.object({
            username: z.string().describe('Twitter username (without @)'),
        })
    })
    async getUserProfile(args: { username: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Getting profile for ${args.username}`);
        return await this.twitterService.getUserProfile(args.username);
    }

    @Tool({
        name: 'twitter_post',
        description: 'Post a tweet on Twitter/X',
        inputSchema: z.object({
            text: z.string().max(280).describe('Tweet text'),
        })
    })
    async postTweet(args: { text: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Posting tweet`);
        return await this.twitterService.postTweet(args.text);
    }

    @Tool({
        name: 'twitter_reply',
        description: 'Reply to a specific tweet',
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
        name: 'twitter_like',
        description: 'Like a specific tweet',
        inputSchema: z.object({
            tweetUrl: z.string().describe('URL of the tweet to like'),
        })
    })
    async likeTweet(args: { tweetUrl: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Liking tweet ${args.tweetUrl}`);
        return await this.twitterService.likeTweet(args.tweetUrl);
    }

    @Tool({
        name: 'twitter_retweet',
        description: 'Retweet a specific tweet',
        inputSchema: z.object({
            tweetUrl: z.string().describe('URL of the tweet to retweet'),
        })
    })
    async retweet(args: { tweetUrl: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Retweeting tweet ${args.tweetUrl}`);
        return await this.twitterService.retweet(args.tweetUrl);
    }

    @Tool({
        name: 'twitter_follow',
        description: 'Follow a user on Twitter/X',
        inputSchema: z.object({
            username: z.string().describe('Twitter username to follow (without @)'),
        })
    })
    async followUser(args: { username: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Following user ${args.username}`);
        return await this.twitterService.followUser(args.username);
    }

    @Tool({
        name: 'twitter_feed',
        description: 'Read your Twitter/X home feed',
        inputSchema: z.object({
            maxResults: z.number().optional().default(20).describe('Max tweets to return (default 20)'),
        })
    })
    async readFeed(args: { maxResults: number }, ctx: ExecutionContext) {
        ctx.logger.info(`Reading feed`);
        return await this.twitterService.readFeed(args.maxResults);
    }
}
