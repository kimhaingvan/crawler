"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = require('cheerio');
class ACrawler {
    loadHtmlFromUrl(url) {
        return axios_1.default.get(url).then(res => res.data).catch(e => console.log(e));
    }
    async loadCheerioDoc(url) {
        const html = await this.loadHtmlFromUrl(url);
        return cheerio.load(html, {
            decodeEntities: false
        });
    }
}
exports.ACrawler = ACrawler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQUNyYXdsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xhc3Nlcy9BQ3Jhd2xlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtEQUEwQjtBQUcxQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbkMsTUFBc0IsUUFBUTtJQUNyQixlQUFlLENBQUMsR0FBVztRQUNoQyxPQUFPLGVBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFXO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3hCLGNBQWMsRUFBRSxLQUFLO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FHRjtBQWJELDRCQWFDIn0=