import { ACrawler } from './classes/ACrawler';
import { BrandsVietnamCrawler } from './classes/BrandsVietnamCrawler';
import { HaravanCrawler } from './classes/HaravanCrawler';
import { IChinaCrawler } from './classes/IChinaCrawler';
import { KiotVietCrawler } from './classes/KiotVietCrawler';
import { Category } from './types/Category';
import { SunoCrawler } from './classes/SunoCrawler';
import { NhanhCrawler } from './classes/NhanhCrawler';
import { SapoCrawler } from './classes/SapoCrawler';
const fs = require('fs')
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();
var extend = require('util')._extend;
enum CrawlerPlugin {
  UNKNOWN = '',
  KIOTVIET = 'kiotviet',
  HARAVAN = 'haravan',
  BRANDSVIETNAM = 'brandsvietnam',
  ICHINA = 'ichina',
  SUNO = 'suno',
  FAST = 'fast',
  SAPO = 'sapo',
}

function getPlugin(url: string): CrawlerPlugin {
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
  let categoryItem,articleItem, xmlFile, articleCount = 0;
  fs.readFile('./wordpressTemplate.xml','utf8', (err,data)=>{
    if(err){
      console.log(err)
      return;
    }
    parser.parseString(data, (err, result) => {
      if(err){
        console.log(err);
        return;
      }
      articleItem = JSON.parse(JSON.stringify(result['rss']['channel'][0]['item'][0]));
      categoryItem = JSON.parse(JSON.stringify(result['rss']['channel'][0]));
      categoryItem['item'] = [];
      xmlFile = JSON.parse(JSON.stringify(result));
      xmlFile['rss']['channel'] = [];
    })
  })
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
    let crawler: ACrawler = null;
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
    let cat: Category = new Category('init', url);
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
      })
      xmlFile['rss']['channel'].push(cateItem);
    }
  }

  xmlFile = builder.buildObject(xmlFile);
  fs.writeFile('article.xml', xmlFile, (err) => {
    if(err) {
      return console.log(err);
    }
  })
}

main().then(() => console.log('=========DONE========='));
