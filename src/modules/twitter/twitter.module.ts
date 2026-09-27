import { Module } from '@nitrostack/core';
import { TwitterTools } from './twitter.tools.js';
import { TwitterService } from './twitter.service.js';
import { BrowserService } from './browser.service.js';

@Module({
    name: 'twitter',
    description: 'Twitter/X automation tools for AI agents',
    controllers: [TwitterTools],
    providers: [TwitterService, BrowserService],
})
export class TwitterModule { }
