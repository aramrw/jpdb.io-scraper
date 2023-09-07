const fs = require("fs").promises;
//const _ = require("lodash");
const chalk = require("chalk");
const { count } = require("console");

const loadingAnimation = ["|", "/", "-", "\\"];
let animationIndex = 0;

const cc = {
  boldRed: chalk.bold.red,
  boldGreen: chalk.bold.greenBright,
  boldYellow: chalk.bold.yellow,
  boldBlue: chalk.bold.blue,
  yellow: chalk.yellowBright,
};

module.exports.sortWords = function (words) {
  // Your sorting logic here
};

module.exports.sortWords = async function () {
  console.clear();
  try {
    const wordsFolder = (await fs.readdir("./words", "utf-8"));
    //console.log(wordsDirectory[0])
    let wordsFile = './words/' + wordsFolder[0];

    if (wordsFolder.length == 0) {
      console.clear();
      console.log(cc.boldRed("Error! ") + cc.yellow('There are ') + cc.boldRed('0') + cc.yellow(' files in the ') + cc.boldRed('words') + cc.yellow(' folder!'));
      process.exit();
    } else {
      console.log(cc.yellow("Loading ") + cc.boldBlue('Scraped Words') + '...');
      scrapedWords = (await fs.readFile(wordsFile, "utf-8")).split("\n");
    }

    console.log(cc.yellow("Loading ") + cc.boldBlue('Yomichan dictionaries') + '...\n');
    const yomichanDictionaries = [
      require("./yomichan_dicts/jpdb.json"),
      // require("./yomichan_dicts/vn_v2.json"),
      // require("./yomichan_dicts/bccwj.json"),
      // require("./yomichan_dicts/wikipedia.json"),
      // require("./yomichan_dicts/anime-jdrama.json"),
      // require("./yomichan_dicts/novels.json"),
      // Add more dictionary paths as needed
    ];

    const messages = [];
    const processedWords = new Set();
    let counter = 0;

    console.clear();
    for (const scrapedWord of scrapedWords) {
      counter++;
      if (!processedWords.has(scrapedWord)) {
        //process.stdout.write(cc.boldRed(`\r${loadingAnimation[animationIndex]}`) + cc.yellow(` Processing word `) + cc.boldRed(': ') + cc.boldYellow(`[ `) + cc.boldRed(`${counter}`) + cc.boldYellow(` ] `) + cc.boldBlue(`${scrapedWord}`) + cc.yellow(' of ') + cc.boldYellow(`[ `) + cc.boldRed(`${scrapedWord.length}`) + cc.boldYellow(` ] `));
        process.stdout.write(cc.boldRed(`\r${loadingAnimation[animationIndex]}`) + cc.yellow(` Processing word `) + cc.boldRed(': ') + cc.boldYellow(`[ `) + cc.boldBlue(`${scrapedWord}`));
        animationIndex = (animationIndex + 1) % loadingAnimation.length;

        const matchingEntry = yomichanDictionaries.map((dictionary) => dictionary.find((entry) => entry[0] === scrapedWord)).find(Boolean);

        const frequency = matchingEntry ? matchingEntry[2]?.frequency : null;
        const value = frequency ? frequency.value : "N/A";

        messages.push({ word: scrapedWord, value });
        processedWords.add(scrapedWord);
      }
    }

    const sortedMessages = messages
      .filter((message) => message.value !== "N/A") // Filter out words with "N/A" value
      .sort((a, b) => a.value - b.value); // Sort the remaining words

    const formattedConsoleMessages = sortedMessages.map(({ word, value }) => `'${word}': "${value}"`);

    //console.log("\nWriting formatted console messages to 'formatted_console_output.txt'...");
    await fs.writeFile("./words/sorted.txt", formattedConsoleMessages.join("\n"), { encoding: "utf-8" });

    console.clear();
    console.log(cc.boldGreen("Successfully ") + cc.yellow('sorted ') + cc.boldGreen(`${counter}`) + ' of ' + cc.boldRed(`${scrapedWords.length} `) + cc.yellow('words\n'));
    console.log(cc.boldRed(`${scrapedWords.length} `) + cc.yellow("words have been written to ") + cc.boldRed("'sortedwords.txt'") + ".");
    process.exit();
  } catch (error) {
    console.error("An error occurred:", error);
  }
};