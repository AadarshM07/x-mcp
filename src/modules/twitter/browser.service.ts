import { Injectable, Logger } from '@nitrostack/core';
import { chromium, BrowserContext } from 'playwright';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

const PROFILE_DIR = path.join(os.homedir(), '.twitter-mcp', 'chrome-profile');
const STORAGE_BACKUP = path.join(os.homedir(), '.twitter-mcp', 'storage_state.json');

const BROWSER_ARGS = [
    '--no-sandbox',
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-site-isolation-trials',
    '--disable-web-security',
    '--restore-last-session',
];

const IGNORE_ARGS = ['--enable-automation'];

@Injectable()
export class BrowserService {
    private activeContext: BrowserContext | null = null;
    private launchPromise: Promise<BrowserContext> | null = null;

    async getPersistentContext(): Promise<BrowserContext> {
        if (this.activeContext) {
            return this.activeContext;
        }

        if (this.launchPromise) {
            return this.launchPromise;
        }

        this.launchPromise = (async () => {
            fs.mkdirSync(PROFILE_DIR, { recursive: true });

            const showBrowser = process.env.SHOW_BROWSER === 'true';
            const headless = !showBrowser; 

            const context = await chromium.launchPersistentContext(PROFILE_DIR, {
                headless,
                args: BROWSER_ARGS,
                ignoreDefaultArgs: IGNORE_ARGS,
                viewport: { width: 1280, height: 900 },
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            });

            const authToken = process.env.TWITTER_AUTH_TOKEN;
            const ct0 = process.env.TWITTER_CT0;

            if (authToken && ct0) {
                const cookies = [];
                for (const domain of ['.x.com', '.twitter.com']) {
                    cookies.push(
                        { name: 'auth_token', value: authToken, domain, path: '/', secure: true, sameSite: 'None' as const },
                        { name: 'ct0', value: ct0, domain, path: '/', secure: true, sameSite: 'None' as const }
                    );
                }
                await context.addCookies(cookies);
            }

            const profileCookies = path.join(PROFILE_DIR, 'Default', 'Cookies');
            if (fs.existsSync(STORAGE_BACKUP) && !fs.existsSync(profileCookies)) {
                try {
                    const state = JSON.parse(fs.readFileSync(STORAGE_BACKUP, 'utf-8'));
                    if (state.cookies) {
                        await context.addCookies(state.cookies);
                    }
                } catch (e) {
                    console.warn(`Failed to seed profile from storage state: ${e}`);
                }
            }
            
            context.on('close', () => {
                this.activeContext = null;
                this.launchPromise = null;
            });

            this.activeContext = context;
            return context;
        })();

        try {
            return await this.launchPromise;
        } catch (error) {
            this.launchPromise = null;
            throw error;
        }
    }

    async saveSession(context: BrowserContext): Promise<void> {
        try {
            fs.mkdirSync(path.dirname(STORAGE_BACKUP), { recursive: true });
            await context.storageState({ path: STORAGE_BACKUP });
        } catch (e) {
            console.warn(`Failed to save storage state: ${e}`);
        }
    }

    async closeSession(context: BrowserContext): Promise<void> {
        try {
            await this.saveSession(context);
            // We intentionally do not call context.close() here.
            // Keeping it open avoids "Opening in existing browser session" locks 
            // and significantly speeds up subsequent MCP tool calls.
        } catch (e) {
            console.warn(`Failed to close session: ${e}`);
        }
    }
}
