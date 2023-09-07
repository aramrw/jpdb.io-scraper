# jpdb.io-scraper

## What Does It Do?

-- **Automated Word Extraction**: Automatically scrapes and compiles words from anime, light novels, and web novels _(if they are available on [jpdb.io](https://jpdb.io/))_.

-- **Frequency Insights**: Provides frequency analysis to help you identify useful words at your proficiency level.

-- **Quickly Scrape Where You Left Off**: Tracks what anime / novels you frequently scrape + suggests similar ones.
  
-- **Built In Frequency Sorter**: Gives you the option to sort words you scraped by using [this frequency dictionary](https://github.com/MarvNC/jpdb-freq-list) or 5 others from [here](https://drive.google.com/drive/folders/1g1drkFzokc8KNpsPHoRmDJ4OtMTWFuXi).

**If you would like to use your own frequency dictionary**:
+ Download one from [here](https://drive.google.com/drive/folders/1g1drkFzokc8KNpsPHoRmDJ4OtMTWFuXi) *or any other ones that are compatible with* [Yomichan](https://chrome.google.com/webstore/detail/yomichan/ogmnaimimemjmbakcfefmnahgdfhfami).
+ copy **index.json** into the **yomichan_dicts** folder *(Make sure to rename index to the name of the dictionary)*. You don't need the meta banks.
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

- **Max pages: infinite

- **Works with:** Any content available on [jpdb.io](https://jpdb.io), including **web novels**, **anime**, and **regular novels**, among other **titles** on the site.

## Special Thanks To:

- [jpdb.io](https://jpdb.io/)
- [jpdb's Discord Server](https://discord.com/invite/jWwVD7D2sZ)
