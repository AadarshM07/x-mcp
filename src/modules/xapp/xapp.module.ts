import { Module } from '@nitrostack/core';
import { XAppTools } from './xapp.tools.js';
import { XAppService } from './xapp.service.js';
import { BrowserService } from './browser.service.js';

@Module({
    name: 'xapp',
    description: 'X automation tools for AI agents',
    controllers: [XAppTools],
    providers: [XAppService, BrowserService],
})
export class XAppModule { }
