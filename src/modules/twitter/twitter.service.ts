import { Injectable, Logger } from '@nitrostack/core';
import { BrowserService } from './browser.service.js';

@Injectable({ deps: [BrowserService] })
export class TwitterService {
    constructor(private readonly browserService: BrowserService) {}

    private async waitForLoad(page: any) {
        try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch (e) {
        }
        await page.waitForTimeout(2000);
    }

    async postTweet(text: string): Promise<string> {
        const context = await this.browserService.getPersistentContext();
        try {
            const page = context.pages()[0] || await context.newPage();
            await page.goto("https://x.com/compose/post");
            await this.waitForLoad(page);

            const textbox = page.locator('[data-testid="tweetTextarea_0"]').first().or(page.locator('[role="textbox"]').first());
            await textbox.click();
            await page.keyboard.insertText(text);

            const postButton = page.locator('[data-testid="tweetButton"]').first();
            await postButton.click();
            await page.waitForTimeout(3000);

            return `Tweet posted: ${text.substring(0, 50)}...`;
        } finally {
            await this.browserService.closeSession(context);
        }
    }

    async replyToTweet(tweetUrl: string, text: string): Promise<string> {
        const context = await this.browserService.getPersistentContext();
        let page;
        try {
            page = await context.newPage();
            await page.goto(tweetUrl);
            await this.waitForLoad(page);

            const inlineTextbox = page.locator('[data-testid="tweetTextarea_0"]').first();
            
            await Promise.any([
                inlineTextbox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
                page.locator('[data-testid="reply"]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
            ]);

            if (await inlineTextbox.isVisible()) {
                await inlineTextbox.click();
                await page.waitForTimeout(500); // Wait for editor to focus
            } else {
                const replyButton = page.locator('[data-testid="reply"]').first();
                await replyButton.click();
                await page.waitForSelector('[data-testid="tweetTextarea_0"]', { state: 'visible', timeout: 5000 });
                await page.locator('[data-testid="tweetTextarea_0"]').first().click();
                await page.waitForTimeout(500); // Wait for editor to focus
            }

            await page.keyboard.type(text, { delay: 30 });
            await page.waitForTimeout(1000); 
            const postButton = page.locator('[data-testid="tweetButtonInline"]').or(page.locator('[data-testid="tweetButton"]')).first();
            await postButton.click();
            await page.waitForTimeout(3000);

            return `Replied to tweet: ${text.substring(0, 50)}...`;
        } catch (e: any) {
            return `Failed to reply to tweet: ${e.message}`;
        } finally {
            if (page) await page.close().catch(() => {});
            await this.browserService.closeSession(context);
        }
    }

    async likeTweet(tweetUrl: string): Promise<string> {
        const context = await this.browserService.getPersistentContext();
        try {
            const page = context.pages()[0] || await context.newPage();
            await page.goto(tweetUrl);
            await this.waitForLoad(page);

            const likeButton = page.locator('[data-testid="like"]').first();
            await likeButton.click();
            await page.waitForTimeout(2000);

            return `Liked tweet: ${tweetUrl}`;
        } finally {
            await this.browserService.closeSession(context);
        }
    }

    async retweet(tweetUrl: string): Promise<string> {
        const context = await this.browserService.getPersistentContext();
        try {
            const page = context.pages()[0] || await context.newPage();
            await page.goto(tweetUrl);
            await this.waitForLoad(page);

            const retweetButton = page.locator('[data-testid="retweet"]').first();
            await retweetButton.click();

            const confirmButton = page.locator('text=Retweet').first();
            await confirmButton.click();
            await page.waitForTimeout(2000);

            return `Retweeted tweet: ${tweetUrl}`;
        } finally {
            await this.browserService.closeSession(context);
        }
    }

    async followUser(username: string): Promise<string> {
        let context;
        try {
            context = await this.browserService.getPersistentContext();
            const page = context.pages()[0] || await context.newPage();
            
            try {
                await page.goto(`https://x.com/${username}`);
                await this.waitForLoad(page);
            } catch (e: any) {
                return `Failed to load profile page for ${username}. Error: ${e.message}`;
            }

            try {
                await page.waitForSelector('button[data-testid$="-follow"], button[data-testid$="-unfollow"], button[aria-label^="Follow @"], button[aria-label^="Following @"]', { state: 'attached', timeout: 10000 });
            } catch (e: any) {
                const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
                return `Could not find any follow or unfollow buttons on the page for ${username}. Error: ${e.message}. Page context: ${bodyText.replace(/\n/g, ' ')}`;
            }

            const isFollowing = await page.locator('button[data-testid$="-unfollow"]')
                .or(page.locator('button[aria-label^="Following @"]'))
                .count() > 0;

            if (isFollowing) {
                return `You are already following ${username}.`;
            }

            const followButton = page.locator('button[data-testid$="-follow"]')
                .or(page.locator('button[aria-label^="Follow @"]'))
                .or(page.locator('button').filter({ hasText: /^Follow$/ }))
                .first();
            
            try {
                await followButton.evaluate((node) => (node as any).click());
                await page.waitForTimeout(2000);
                return `Successfully followed ${username}`;
            } catch (error: any) {
                const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
                return `Failed to click the follow button for ${username}. Error: ${error.message}. Page context: ${bodyText.replace(/\n/g, ' ')}`;
            }
        } catch (e: any) {
            return `Unexpected error during followUser: ${e.stack || e.message}`;
        } finally {
            if (context) {
                await this.browserService.closeSession(context);
            }
        }
    }

    async readFeed(maxResults: number = 20): Promise<string> {
        const context = await this.browserService.getPersistentContext();
        try {
            const page = context.pages()[0] || await context.newPage();
            await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 20000 });
            await page.waitForSelector('[data-testid="tweet"]', { timeout: 15000 });

            const tweets: any[] = [];
            let scrollAttempts = 0;
            const maxScrollAttempts = 10;

            while (tweets.length < maxResults && scrollAttempts < maxScrollAttempts) {
                const tweetElements = await page.locator('[data-testid="tweet"]').all();

                for (const tweetElement of tweetElements) {
                    if (tweets.length >= maxResults) break;

                    try {
                        const tweetData = await tweetElement.evaluate((node: HTMLElement) => {
                            const textEl = node.querySelector('div[data-testid="tweetText"]');
                            const text = textEl ? (textEl as HTMLElement).innerText : "";

                            const userNameEl = node.querySelector('div[data-testid="User-Name"]');
                            let author = "";
                            let handle = "";
                            let isVerified = false;

                            if (userNameEl) {
                                const authorSpan = userNameEl.querySelector('div span');
                                if (authorSpan) author = (authorSpan as HTMLElement).innerText;

                                const spans = Array.from(userNameEl.querySelectorAll('span'));
                                for (const span of spans) {
                                    if (span.innerText && span.innerText.startsWith('@')) {
                                        handle = span.innerText.replace('@', '');
                                        break;
                                    }
                                }

                                isVerified = !!userNameEl.querySelector('svg[data-testid="icon-verified"]');
                            }

                            const timeEl = node.querySelector('time');
                            const timestamp = timeEl ? timeEl.getAttribute('datetime') : "";

                            let tweetUrl = "";
                            if (timeEl) {
                                const aTag = timeEl.closest('a');
                                if (aTag) tweetUrl = aTag.href;
                            }

                            return { author, handle, isVerified, text, timestamp, tweetUrl };
                        });

                        if (!tweets.some(t => t.text === tweetData.text && t.author === tweetData.author)) {
                            tweets.push(tweetData);
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (tweets.length < maxResults) {
                    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
                    await page.waitForTimeout(2000);
                    scrollAttempts++;
                }
            }
            return JSON.stringify(tweets);
        } catch (e: any) {
            return JSON.stringify({ error: `Failed to read feed: ${e.message}` });
        } finally {
            await this.browserService.closeSession(context);
        }
    }

    async searchTweets(query: string, maxResults: number = 10): Promise<string> {
        const context = await this.browserService.getPersistentContext();
        try {
            const page = context.pages()[0] || await context.newPage();
            const encodedQuery = encodeURIComponent(query);
            await page.goto(`https://x.com/search?q=${encodedQuery}&f=live`);
            await page.waitForSelector('[data-testid="tweet"]', { timeout: 10000 });

            const tweetElements = await page.locator('[data-testid="tweet"]').all();
            const results = [];
            
            for (let i = 0; i < Math.min(tweetElements.length, maxResults); i++) {
                try {
                    const el = tweetElements[i];
                    const tweetData = await el.evaluate((node: HTMLElement) => {
                        const textEl = node.querySelector('div[data-testid="tweetText"]');
                        const text = textEl ? (textEl as HTMLElement).innerText : "";

                        const userNameEl = node.querySelector('div[data-testid="User-Name"]');
                        let author = "Unknown";
                        let handle = "Unknown";
                        let isVerified = false;

                        if (userNameEl) {
                            const authorSpan = userNameEl.querySelector('div span');
                            if (authorSpan) author = (authorSpan as HTMLElement).innerText;

                            const spans = Array.from(userNameEl.querySelectorAll('span'));
                            for (const span of spans) {
                                if (span.innerText && span.innerText.startsWith('@')) {
                                    handle = span.innerText.replace('@', '');
                                    break;
                                }
                            }

                            isVerified = !!userNameEl.querySelector('svg[data-testid="icon-verified"]');
                        }

                        const timeEl = node.querySelector('time');
                        const timestamp = timeEl ? timeEl.getAttribute('datetime') : "Unknown";

                        let tweetUrl = "";
                        if (timeEl) {
                            const aTag = timeEl.closest('a');
                            if (aTag) tweetUrl = aTag.href;
                        }

                        return { author, handle, isVerified, text, timestamp, tweetUrl };
                    });

                    results.push(
                        `${i+1}. Author: ${tweetData.author}${tweetData.isVerified ? ' (Verified)' : ''}\n` +
                        `   Handle: ${tweetData.handle}\n` +
                        `   Tweet URL: ${tweetData.tweetUrl}\n` +
                        `   Text: ${tweetData.text}\n` +
                        `   Timestamp: ${tweetData.timestamp}\n`
                    );
                } catch (e) {
                    continue;
                }
            }

            if (results.length === 0) return `No tweets found for query: ${query}`;
            return results.join("\n");
        } finally {
            await this.browserService.closeSession(context);
        }
    }

    async getUserProfile(username: string): Promise<string> {
        const context = await this.browserService.getPersistentContext();
        try {
            const page = context.pages()[0] || await context.newPage();
            await page.goto(`https://x.com/${username}`);
            await page.waitForTimeout(3000);

            const bioEl = page.locator('[data-testid="UserDescription"]');
            const bio = await bioEl.count() > 0 ? await bioEl.innerText() : "No bio";

            const followersEl = page.locator('a[href$="/verified_followers"] span span, a[href$="/followers"] span span').first();
            const followers = await followersEl.count() > 0 ? await followersEl.innerText() : "?";

            const followingEl = page.locator('a[href$="/following"] span span').first();
            const following = await followingEl.count() > 0 ? await followingEl.innerText() : "?";

            const nameEl = page.locator('[data-testid="UserName"] span').first();
            const name = await nameEl.count() > 0 ? await nameEl.innerText() : username;

            return `Name: ${name}\nUsername: @${username}\nBio: ${bio}\nFollowers: ${followers}\nFollowing: ${following}`;
        } finally {
            await this.browserService.closeSession(context);
        }
    }
}
