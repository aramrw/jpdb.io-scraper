# jpdb.io-scraper

## What Does It Do?

 ### Automatically scrapes and compiles words from **anime**, **visual novels**, **web / light novels**, + more from [jpdb.io](https://jpdb.io/).

- **Frequency Insights**: Provides frequency analysis to help you identify useful words at your proficiency level before you scrape them.

- **Quickly Scrape Where You Left Off**: Tracks what anime / novels you frequently scrape + suggests similar ones.
  
- **Built In Frequency Sorter**: Gives you the option to sort words you scraped by using [this frequency dictionary](https://github.com/MarvNC/jpdb-freq-list) or 5 others from [here](https://drive.google.com/drive/folders/1g1drkFzokc8KNpsPHoRmDJ4OtMTWFuXi). 

[**Here's the standalone version of the sorter without the scraper**](https://github.com/aramrw/jp-frequency_sorter)


**Using Your Own frequency Dictonary(s)**:
+ Download one fIom [here](https://drive.google.com/drive/folders/1g1drkFzokc8KNpsPHoRmDJ4OtMTWFuXi) *or any other ones that are compatible with* [Yomichan](https://chrome.google.com/webstore/detail/yomichan/ogmnaimimemjmbakcfefmnahgdfhfami).
+ copy **index.json** into the **yomichan_dicts** folder *(Make sure to rename **index.json** to the **name of the dictionary**)*. You don't need the meta banks.
```
├── Anime & J-Drama Frequency Dictionary
│ ├── index.json 
│ ├── term_meta_bank1.md
│ └── term_meta_bank2.md
...more meta_banks.md
```

## Getting Started

Please note that the current version of this tool only works with **Node.js v18.17.1** in the **VsCode Terminal**.

### Install Dependencies 

```
npm install puppeteer
```
```
npm install chalk
```

## Additional Information

- **Max pages: infinite.

## Special Thanks To:

- [jpdb.io](https://jpdb.io/)
- [jpdb's Discord Server](https://discord.com/invite/jWwVD7D2sZ)
