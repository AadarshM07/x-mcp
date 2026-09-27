import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { TwitterModule } from './modules/twitter/twitter.module.js';

/**
 * Root Application Module
 * 
 * Twitter MCP Server
 * Tools for reading and writing to Twitter/X via Playwright automation.
 */
@McpApp({
    module: AppModule,
    server: {
        name: 'twitter-mcp',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'app',
    description: 'Twitter MCP server',
    imports: [
        ConfigModule.forRoot(),
        TwitterModule
    ],
})
export class AppModule { }
