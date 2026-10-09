import fetch from 'node-fetch';

export class Pixiv {
    constructor() {
        this.cookies = "";
        this.agent = "";
        this.browser = undefined;
    }

    /**
     * Requires puppeteer
     * @param {string} username
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    async login(username, password) {
        if (!this.browser) {
            // Dynamic import for Puppeteer to prevent crashes if it's not installed
            const puppeteer = (await import('puppeteer')).default;
            this.browser = await puppeteer.launch({ headless: true });
        }

        const page = await this.createPage();
        await page.goto("https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2Fen%2F&lang=en&source=pc&view_type=page", { waitUntil: "networkidle2" });
        
        const log = await page.$("#container-login input[type='text']");
        const pass = await page.$("#container-login input[type='password']");
        const sub = await page.$("#container-login button");

        await log.type(username, { delay: 50 });
        await pass.type(password, { delay: 50 });
        await sub.click({ delay: 100 });

        await page.waitForTimeout(3000);

        const form = await page.$("#container-login li");
        const cap = form != null;
        if (cap) {
            await page.close();
            await this.browser.close();
            this.browser = undefined;
            return false;
        }

        await page.waitForNavigation({ waitUntil: "domcontentloaded" });

        this.cookies = "";
        for (let c of await page.cookies()) {
            this.cookies += c.name + "=" + c.value + "; ";
        }

        this.agent = await this.browser.userAgent();
        this.cookies = this.cookies.substring(0, this.cookies.length - 2);

        await page.close();
        await this.browser.close();
        this.browser = undefined;
        return true;
    }

    /**
     * Login without puppeteer
     * @param {string} cookies
     * @param {string} useragent
     */
    staticLogin(cookies, useragent) {
        this.cookies = cookies;
        this.agent = useragent;
    }

    /**
     * Check if logged in
     * @returns {boolean}
     */
    isLogged() {
        return this.cookies !== "" && this.agent !== "";
    }

    /**
     * Check if logged in
     * @returns {boolean}
     * @deprecated Use isLogged() instead
     */
    isLoged() {
        return this.isLogged();
    }

    /**
     * Logout and close browser if puppeteer is used
     */
    async logout() {
        if (this.browser) await this.browser.close();
        this.browser = undefined;
        this.cookies = "";
        this.agent = "";
    }

    /**
     * Get illustrations from a tag
     * @param {string} tag
     * @param {{ mode: string, page: number }} options
     */
    async getIllustsByTag(tag, options = { mode: "safe", page: 1 }) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/search/artworks/${tag}?word=${tag}&order=date_d&mode=${options.mode}&p=${options.page}&type=all&lang=en`));
        const json = await res.json();
        return json.body?.illustManga?.data || [];
    }

    /**
     * Get daily ranking
     * @param {{ mode: string }} options
     */
    async getDailyRanking(options = { mode: "all" }) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/top/illust?mode=${options.mode}&lang=en`));
        const json = await res.json();
        return json.body?.page?.ranking?.items?.map((i) => i.id) || [];
    }

    /**
     * Get user information
     * @param {string|number} id
     */
    async getUserInformation(id) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/user/${id}?full=1`));
        const json = await res.json();
        return json.body;
    }

    /**
     * Get recommended users
     */
    async getRecommendedUsers() {
        const res = await this.fetch(new URL("https://www.pixiv.net/ajax/top/illust?mode=all&lang=en"));
        const json = await res.json();
        return json.body?.page?.recommendedUser?.map((i) => i.id) || [];
    }

    /**
     * Get favorite tags
     */
    async getFavoriteTags() {
        const res = await this.fetch(new URL("https://www.pixiv.net/ajax/top/illust?mode=all&lang=en"));
        const json = await res.json();
        return json.body?.page?.myFavoriteTags || [];
    }

    /**
     * Get recommended illusts
     */
    async getRecommendedIllusts() {
        const res = await this.fetch(new URL("https://www.pixiv.net/ajax/top/illust?mode=all&lang=en"));
        const json = await res.json();
        return json.body?.page?.recommended?.ids || [];
    }

    /**
     * Count illustrations from a tag
     * @param {string} tag
     * @param {{ mode: string }} options
     */
    async getTagIllustCount(tag, options = { mode: "safe" }) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/search/artworks/${tag}?word=${tag}&order=date_d&mode=${options.mode}&p=1&s_mode=s_tag_full&type=all&lang=en`));
        const json = await res.json();
        return json.body?.illustManga?.total || 0;
    }

    /**
     * Get related tags from a tag
     * @param {string} tag
     */
    async getRelatedTags(tag) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/search/artworks/${tag}?word=${tag}&order=date_d&mode=safe&p=1&s_mode=s_tag_full&type=all&lang=en&limit=60`));
        const json = await res.json();
        return (json.body?.relatedTags || []).map((r) => ({
            tag_name: r,
            tag_translation: (json.body.tagTranslation?.[r] || {}).en
        }));
    }

    /**
     * Get new illustrations
     * @param {{ mode: string, limit: number }} options
     */
    async getNewIllusts(options = { mode: "safe", limit: 20 }) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/illust/new?lastId=0&limit=${options.limit}&type=illust&r18=${options.mode === "r18"}&lang=en`));
        const json = await res.json();
        return json.body?.illusts || [];
    }

    /**
     * Get recommended illustrations for an ID
     * @param {string|number} id
     * @param {{ limit: number }} options
     */
    async getRecommendIllusts(id, options = { limit: 20 }) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/illust/${id}/recommend/init?limit=${options.limit}&lang=en`));
        const json = await res.json();
        return json.body?.illusts || [];
    }

    /**
     * Get details about an Artwork by ID
     * @param {string|number} id
     */
    async getIllustByID(id) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/illust/${id}`));
        const json = (await res.json()).body;
        const profileUser = (await this.getUserInformation(json.userId))?.image;

        const arr = [];
        for (let a = 0; a < json.pageCount; a++) {
            arr.push({
                mini: json.urls.mini.replace("p0", "p" + a),
                original: json.urls.original.replace("p0", "p" + a),
                regular: json.urls.regular.replace("p0", "p" + a),
                small: json.urls.small.replace("p0", "p" + a),
                thumb: json.urls.thumb.replace("p0", "p" + a),
            });
        }

        return {
            AI: json.aiType == 2,
            restricted: json.xRestrict == 1,
            bookmark: json.bookmarkCount,
            comment: json.commentCount,
            createDate: json.createDate,
            uploadDate: json.uploadDate,
            description: json.description,
            height: json.height,
            illustID: json.illustId,
            illustType: json.illustType,
            like: json.likeCount,
            pageCount: json.pageCount,
            tags: json.tags,
            view: json.viewCount,
            width: json.width,
            user: {
                id: json.userId,
                name: json.userName,
                profileImg: (profileUser?.replace("i.pximg.net", "i.pixiv.re")) || null
            },
            urls: arr,
            title: json.title
        };
    }

    /**
     * Get details about an Artwork from object
     */
    async getIllustByArtwork(artwork) {
        return this.getIllustByID(artwork.id);
    }

    /**
     * Get illustrations from a user ID
     * @param {string|number} id
     * @param {{ limit: number }} options
     */
    async getIllustsByUserID(id, options = { limit: 100 }) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/ajax/user/${id}/profile/all?lang=en`));
        const json = await res.json();
        const arr = [];
        
        if (options.limit === 0) options.limit = Number.MAX_VALUE;
        let i = 1;

        if (json.body?.illusts) {
            for (let ID of Object.keys(json.body.illusts)) {
                if (i > options.limit) break;
                arr.push(await this.getIllustByID(ID));
                i++;
            }
        }
        return arr;
    }

    /**
     * Get illustrations from a user object
     */
    async getIllustsByUser(user) {
        return this.getIllustsByUserID(user.id);
    }

    /**
     * Predict tags from keyword
     * @param {string} tag
     */
    async predict(tag) {
        const res = await this.fetch(new URL(`https://www.pixiv.net/rpc/cps.php?keyword=${tag}&lang=en`));
        const json = await res.json();
        return json.candidates;
    }

    /**
     * Download image buffer from URL
     * @param {string} url
     * @returns {Promise<Buffer>}
     */
    async download(url) {
        const res = await this.fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Internal Fetch Wrapper
     */
    async fetch(url) {
        return fetch(url.toString(), {
            headers: {
                'Referer': 'https://www.pixiv.net/',
                'User-Agent': (this.agent !== "" ? this.agent : 'Cloudflare Workers'),
                'cookie': ((this.cookies !== "" && this.agent !== "") ? this.cookies : undefined)
            }
        });
    }

    async createPage() {
        if (!this.browser) return null;
        const page = await this.browser.newPage();
        page.setDefaultNavigationTimeout(0);
        page.setDefaultTimeout(0);
        return page;
    }
}