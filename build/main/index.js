"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BrandsVietnamCrawler_1 = require("./classes/BrandsVietnamCrawler");
const HaravanCrawler_1 = require("./classes/HaravanCrawler");
const IChinaCrawler_1 = require("./classes/IChinaCrawler");
const KiotVietCrawler_1 = require("./classes/KiotVietCrawler");
const Category_1 = require("./types/Category");
const SunoCrawler_1 = require("./classes/SunoCrawler");
const NhanhCrawler_1 = require("./classes/NhanhCrawler");
const SapoCrawler_1 = require("./classes/SapoCrawler");
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();
var extend = require('util')._extend;
var CrawlerPlugin;
(function (CrawlerPlugin) {
    CrawlerPlugin["UNKNOWN"] = "";
    CrawlerPlugin["KIOTVIET"] = "kiotviet";
    CrawlerPlugin["HARAVAN"] = "haravan";
    CrawlerPlugin["BRANDSVIETNAM"] = "brandsvietnam";
    CrawlerPlugin["ICHINA"] = "ichina";
    CrawlerPlugin["SUNO"] = "suno";
    CrawlerPlugin["FAST"] = "fast";
    CrawlerPlugin["SAPO"] = "sapo";
})(CrawlerPlugin || (CrawlerPlugin = {}));
function getPlugin(url) {
    if (url.includes('kiotviet.vn')) {
        return CrawlerPlugin.KIOTVIET;
    }
    if (url.includes('hocvien.haravan.com')) {
        return CrawlerPlugin.HARAVAN;
    }
    if (url.includes('brandsvietnam.com')) {
        return CrawlerPlugin.BRANDSVIETNAM;
    }
    if (url.includes('ichina.vn')) {
        return CrawlerPlugin.ICHINA;
    }
    if (url.includes('suno.vn')) {
        return CrawlerPlugin.SUNO;
    }
    if (url.includes('nhanh.vn')) {
        return CrawlerPlugin.FAST;
    }
    if (url.includes('sapo.vn')) {
        return CrawlerPlugin.SAPO;
    }
    return CrawlerPlugin.UNKNOWN;
}
async function main() {
    let categoryItem, articleItem, xmlFile, articleCount = 0;
    fs.readFile('./wordpressTemplate.xml', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        parser.parseString(data, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            articleItem = JSON.parse(JSON.stringify(result['rss']['channel'][0]['item'][0]));
            categoryItem = JSON.parse(JSON.stringify(result['rss']['channel'][0]));
            categoryItem['item'] = [];
            xmlFile = JSON.parse(JSON.stringify(result));
            xmlFile['rss']['channel'] = [];
        });
    });
    const fileName = process.argv[2];
    if (!fileName) {
        return console.error('Filename required');
    }
    const urls = [
        ' https://support.sapo.vn/danh-sach-viec-can-lam-pos',
        ' https://support.sapo.vn/tong-quan-quan-ly-san-pham',
        ' https://support.sapo.vn/tong-quan-quan-ly-kho-hang',
        'https://support.sapo.vn/tim-hieu-ve-don-hang-1',
        ' https://support.sapo.vn/tong-quan-quan-ly-giao-hang',
        'https://support.sapo.vn/tong-quan-quan-ly-doi-tac-van-chuyen',
        'https://support.sapo.vn/tong-quan-quan-ly-tai-khoan',
        ' https://support.sapo.vn/tong-quan-quan-ly-khach-hang',
        'https://support.sapo.vn/tong-quan-quan-ly-nha-cung-cap',
        'https://support.sapo.vn/tong-quan-quan-ly-so-quy',
        'https://support.sapo.vn/tong-quan-quan-ly-ma-vach',
        'https://support.sapo.vn/tong-quan-ve-bao-hanh',
        ' https://support.sapo.vn/tong-quan-cau-hinh',
        'https://support.sapo.vn/tong-quan-bao-cao-ban-hang',
        'https://support.sapo.vn/tong-quan-bao-cao-kho',
        'https://support.sapo.vn/tong-quan-bao-cao-tai-chinh',
        'https://support.sapo.vn/tao-don-ban-tai-cua-hang-pos',
        'https://support.sapo.vn/tong-quan-kenh-facebook',
    ];
    for (const url of urls) {
        let crawler = null;
        switch (getPlugin(url)) {
            case CrawlerPlugin.KIOTVIET:
                crawler = new KiotVietCrawler_1.KiotVietCrawler();
                break;
            case CrawlerPlugin.HARAVAN:
                crawler = new HaravanCrawler_1.HaravanCrawler();
                break;
            case CrawlerPlugin.BRANDSVIETNAM:
                crawler = new BrandsVietnamCrawler_1.BrandsVietnamCrawler();
                break;
            case CrawlerPlugin.ICHINA:
                crawler = new IChinaCrawler_1.IChinaCrawler();
                break;
            case CrawlerPlugin.SUNO:
                crawler = new SunoCrawler_1.SunoCrawler();
                break;
            case CrawlerPlugin.FAST:
                crawler = new NhanhCrawler_1.NhanhCrawler();
                break;
            case CrawlerPlugin.SAPO:
                crawler = new SapoCrawler_1.SapoCrawler();
                break;
            default:
                console.log(`UNKNOWN PLUGIN: ${url}`);
                break;
        }
        if (crawler == null) {
            console.log('Plugin not found:', url);
            continue;
        }
        let cat = new Category_1.Category('init', url);
        cat.nextPageUrl = url;
        while (cat.nextPageUrl) {
            cat = await crawler.crawlFromCategory(cat.nextPageUrl);
            console.log(cat);
            console.log('WRITE TO XLSX');
            let cateItem = extend({}, categoryItem);
            cateItem.title = cat.title;
            cateItem.link = cat.url;
            cat.articles.forEach(article => {
                let artItem = JSON.parse(JSON.stringify(articleItem));
                artItem.title = article.title;
                artItem.link = article.url;
                artItem['category'][0]['_'] = cat.title;
                artItem['category'][0]['$']['nicename'] = cat.title;
                artItem['content:encoded'] = article.bodyHtml;
                artItem['wp:post_id'] = articleCount++;
                cateItem.item.push(artItem);
            });
            xmlFile['rss']['channel'].push(cateItem);
        }
    }
    xmlFile = builder.buildObject(xmlFile);
    fs.writeFile('article.xml', xmlFile, (err) => {
        if (err) {
            return console.log(err);
        }
    });
}
main().then(() => console.log('=========DONE========='));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5RUFBc0U7QUFDdEUsNkRBQTBEO0FBQzFELDJEQUF3RDtBQUN4RCwrREFBNEQ7QUFDNUQsK0NBQTRDO0FBQzVDLHVEQUFvRDtBQUNwRCx5REFBc0Q7QUFDdEQsdURBQW9EO0FBQ3BELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNyQyxJQUFLLGFBU0o7QUFURCxXQUFLLGFBQWE7SUFDaEIsNkJBQVksQ0FBQTtJQUNaLHNDQUFxQixDQUFBO0lBQ3JCLG9DQUFtQixDQUFBO0lBQ25CLGdEQUErQixDQUFBO0lBQy9CLGtDQUFpQixDQUFBO0lBQ2pCLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtBQUNmLENBQUMsRUFUSSxhQUFhLEtBQWIsYUFBYSxRQVNqQjtBQUVELFNBQVMsU0FBUyxDQUFDLEdBQVc7SUFDNUIsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1FBQy9CLE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQztLQUMvQjtJQUNELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1FBQ3ZDLE9BQU8sYUFBYSxDQUFDLE9BQU8sQ0FBQztLQUM5QjtJQUNELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFF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