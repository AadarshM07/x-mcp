import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { XAppModule } from './modules/xapp/xapp.module.js';

/**
 * Root Application Module
 * 
 * X MCP Server
 * Tools for reading and writing to X via Playwright automation.
 */
@McpApp({
    module: AppModule,
    server: {
        name: 'x-mcp',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'app',
    description: 'X MCP server',
    imports: [
        ConfigModule.forRoot(),
        XAppModule
    ],
})
export class AppModule { }
