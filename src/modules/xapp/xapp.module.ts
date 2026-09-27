import { Module } from '@nitrostack/core';
import { TwitterTools } from './xapp.tools.js';
import { TwitterService } from './xapp.service.js';
import { BrowserService } from './browser.service.js';

@Module({
    name: 'twitter',
    description: 'Twitter/X automation tools for AI agents',
    controllers: [TwitterTools],
    providers: [TwitterService, BrowserService],
})
export class TwitterModule { }
