import { BrandsVietnamCrawler } from './classes/BrandsVietnamCrawler';
import { HaravanCrawler } from './classes/HaravanCrawler';
import { IChinaCrawler } from './classes/IChinaCrawler';
import { KiotVietCrawler } from './classes/KiotVietCrawler';
import { Category } from './types/Category';
import { SunoCrawler } from './classes/SunoCrawler';
import { NhanhCrawler } from './classes/NhanhCrawler';
import { SapoCrawler } from './classes/SapoCrawler';
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
                crawler = new KiotVietCrawler();
                break;
            case CrawlerPlugin.HARAVAN:
                crawler = new HaravanCrawler();
                break;
            case CrawlerPlugin.BRANDSVIETNAM:
                crawler = new BrandsVietnamCrawler();
                break;
            case CrawlerPlugin.ICHINA:
                crawler = new IChinaCrawler();
                break;
            case CrawlerPlugin.SUNO:
                crawler = new SunoCrawler();
                break;
            case CrawlerPlugin.FAST:
                crawler = new NhanhCrawler();
                break;
            case CrawlerPlugin.SAPO:
                crawler = new SapoCrawler();
                break;
            default:
                console.log(`UNKNOWN PLUGIN: ${url}`);
                break;
        }
        if (crawler == null) {
            console.log('Plugin not found:', url);
            continue;
        }
        let cat = new Category('init', url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3BELE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNyQyxJQUFLLGFBU0o7QUFURCxXQUFLLGFBQWE7SUFDaEIsNkJBQVksQ0FBQTtJQUNaLHNDQUFxQixDQUFBO0lBQ3JCLG9DQUFtQixDQUFBO0lBQ25CLGdEQUErQixDQUFBO0lBQy9CLGtDQUFpQixDQUFBO0lBQ2pCLDhCQUFhLENBQUE7SUFDYiw4QkFBYSxDQUFBO0lBQ2IsOEJBQWEsQ0FBQTtBQUNmLENBQUMsRUFUSSxhQUFhLEtBQWIsYUFBYSxRQVNq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