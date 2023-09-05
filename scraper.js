import puppeteer from 'puppeteer';
import readline from 'readline'
import fs from 'fs';
import chalk from 'chalk';
process.setMaxListeners(100); // You can adjust the number based on your needs

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.clear();

enterCustomLink();

async function enterCustomLink() {

  let finalEntryNumber = 0;
  console.log('\x1b[1m\x1b[37m%s\x1b[0m', "TITLE'S LIST: ");
  console.log('\x1b[34m%s\x1b[0m', "https://jpdb.io/prebuilt_decks?sort_by=word_count&order=reverse\n");
  rl.question("Enter anime/novel url: ", async (customUrl) => {
    if (customUrl.length < 15 && customUrl.includes("/vocabulary-list") && customUrl.includes("https://jpdb.io/")) {
      console.clear();
      console.log('\x1b[31m\x1b[1m%s\x1b[0m', "Invalid: Url must be longer than 15 characters.\n");
      console.log('\x1b[1m\x1b[37m%s\x1b[0m', "Example Link: ");
      console.log('\x1b[34m%s\x1b[0m', "https://jpdb.io/novel/5462/sword-art-online/vocabulary-list\n");
      await enterCustomLink();
    } else if (!customUrl.includes("/vocabulary-list") || !customUrl.includes("https://jpdb.io/")) {
      console.clear();
      console.log('\x1b[31m\x1b[1m%s\x1b[0m', "Invalid: Only enter anime/novel's vocabulary list url.\n");
      console.log('\x1b[1m\x1b[37m%s\x1b[0m', "Example Link: ");
      console.log('\x1b[34m%s\x1b[0m', "https://jpdb.io/novel/5462/sword-art-online/vocabulary-list\n");
      await enterCustomLink();
    } else {
      await foundcustomUrl(customUrl, finalEntryNumber);
    }
  });
}


async function foundcustomUrl(customUrl, finalEntryNumber) {
  console.clear();
  console.log(chalk.bold.red("Loading...\n"));

  if (!finalEntryNumber == 0) {
    let lastEntryNumber = 0;
    console.log(`\nYou ended at ` + chalk.bold.red(`${finalEntryNumber}`) + ` last time, start from here?\n` + chalk.bold.greenBright(`[1] Yes\n`) + chalk.bold.red(`[2] No`))
    rl.question('', (question) => {
      const finalEntryQuestion = question;
      switch (finalEntryQuestion) {
        case '1':
          lastEntryNumber = finalEntryNumber;
          ifLastOffset(lastEntryNumber);
          break;
        case '2':
          break;
        case 'yes':
          lastEntryNumber = finalEntryNumber;
          ifLastOffset(lastEntryNumber);
          break;
        case 'no':
          break;
        default:
          console.clear()
          console.log('Please enter 1 or 2!')
          foundcustomUrl(customUrl, finalEntryNumber);
          break;
      }
    })
  } else {
    const newCustomUrl = customUrl.toString();
    const browser = await puppeteer.launch({
      headless: "old",
    });

    const page = await browser.newPage();
    //console.log(`THIS IS THE CUSTOM URL ${newCustomUrl}`);
    await page.goto(`${newCustomUrl}`, { waitUntil: "load", timeout: 0 });

    // Get get the list of paragraph elements that show # of entries
    const paragraphElements = await page.evaluate(() => {
      const paragraphElements = document.querySelectorAll("p");
      return Array.from(paragraphElements, (element) => element.textContent.trim());
    });

    let foundParagraphElements = [];
    let coloredNumber;

    const urlSegments = customUrl.split('/')
    let urlName;
    if (!urlSegments[5] == "") {
      urlName = urlSegments[5].replace(/-/g, ' ');
    } else {
      const h4Elements = await page.evaluate(() => {
        const h4Elements = document.querySelectorAll("h4");
        return Array.from(h4Elements, (element) => element.textContent.trim());
      });
      for (const h4Elem of h4Elements) {
        let h4Segments = h4Elem.split(':');
        urlName = h4Segments[1].replace(/\s/g, '');
      }
    }
    let paragraphNumber;


    for (const paragraphElement of paragraphElements) {
      if (paragraphElement.includes("Showing")) {
        paragraphNumber = Number(paragraphElement.slice(19, paragraphElement.lastIndexOf(' ')));
        coloredNumber = chalk.bold.blue(`${urlName}`) + " has " + chalk.bold.red(`${paragraphNumber}`) + " entries."
        foundParagraphElements.push(Math.floor(paragraphNumber / 50));
      }
    }

    let frequencyCheckComplete = false;
    let newVocabOffset;

    if (!finalEntryNumber == 0) {
      await ifLastOffset(lastEntryNumber);
    } else {
      await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
    }

    async function frequencyCheck(frequencyCheckComplete, page, newVocabOffset) {
      //Navigate to frequency page
      let customUrlArray = newCustomUrl.split("/");
      let index = customUrlArray.lastIndexOf("vocabulary-list"); // Find the index of "vocabulary-list"
      let modifiedCustomUrl; // Declare the variable here

      if (index !== -1) {
        modifiedCustomUrl = customUrlArray.slice(0, index).join("/");
        let vocabListLink = `${modifiedCustomUrl}/vocabulary-list?sort_by=by-frequency-global&offset=${newVocabOffset}`;

        // Get get the list of div elements that shows frequency #
        await page.goto(vocabListLink)
        const divElements = await page.evaluate(() => {
          const divElements = document.getElementsByClassName("tag tooltip");
          return Array.from(divElements, (element) => element.textContent.trim());
        });

        console.clear();
        if (divElements[0] == null) {
          console.log("Frequency is ~ " + chalk.bold.red('30') + chalk.bold(',') + chalk.bold.red('000') + chalk.bold('+'))
        } else {
          console.log("Frequency is ~ " + chalk.bold.red(`${divElements[0]}\n`))
        }

        console.log("Would you like to continue?\n" + chalk.bold.greenBright(`[1] Yes\n`) + chalk.bold.red(`[2] No`))
        rl.question(" ", async (answer) => {
          let newAnswer = answer;
          switch (newAnswer) {
            case '1':
              frequencyCheckComplete = true;
              if (!finalEntryNumber == 0) {
                await ifLastOffset(lastEntryNumber);
              } else {
                await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
              }
              break;
            case '2':
              if (!finalEntryNumber == 0) {
                await ifLastOffset(lastEntryNumber);
                break;
              } else {
                await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
                break;
              }
            case 'yes':
              frequencyCheckComplete = true;
              if (!finalEntryNumber == 0) {
                await ifLastOffset(lastEntryNumber);
              } else {
                await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
              }
              break;
            case 'no':
              if (!finalEntryNumber == 0) {
                await ifLastOffset(lastEntryNumber);
              } else {
                await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
              }
              break;
            default:
              console.clear()
              console.log('Please enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2!"))
              await frequencyCheck(frequencyCheckComplete, page, newVocabOffset);
              break;
          }
        })
      }
    }

    // make the functions
    async function askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset) {
      console.clear();
      console.log(coloredNumber + "\n");
      if (frequencyCheckComplete == false) {
        console.log('Enter a search offset' + chalk.bold.red(' ->'))
        rl.question("", async (vocabOffset) => {
          let timerCounter = 3;
          // Attempt to parse the input as an integer
          newVocabOffset = parseInt(vocabOffset);
          if (!isNaN(newVocabOffset)) { // Check if it's a valid number
            if (newVocabOffset >= 0 && newVocabOffset <= paragraphNumber) {
              frequencyCheck(frequencyCheckComplete, page, newVocabOffset);
            } else if (newVocabOffset > paragraphNumber) {
              console.clear();
              console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.bold.red('bigger ') + 'than ' + chalk.bold.red(`${paragraphNumber}`) + ' !\n');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 1300));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 1200));
                }
              }
            } else if (newVocabOffset < 0) {
              console.clear();
              console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.bold.red('smaller ') + 'than ' + chalk.bold.red(`0`) + ' !\n');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 1300));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 1200));
                }
              }
            }
          } else {
            console.clear();
            console.log(chalk.bold.red('Error! ') + 'Not a valid number. Try again ' + '!\n');
            for (let i = 3; i > 0; i--) {
              console.log(chalk.bold.red(i));
              if (i === 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
              } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }

        });
      } else {
        let maxPages = Math.floor((Number(paragraphNumber) - Number(newVocabOffset)) / 50);
        console.clear();
        console.log(`Max available pages: ` + chalk.bold.red(`${maxPages}`))
        console.log("\nPlease enter " + chalk.bold("amount") + " of enter pages to scrape:")
        rl.question("", async (answer) => {
          let pageAmount = answer;
          if (!pageAmount.length == 0 && !Number(pageAmount) > Number(foundParagraphElements[1])) {
            await page.close();
          }

          const totalPages = Math.min(Number(pageAmount), 100);

          const parallelTasks = []; // Array to store the parallel scraping tasks
          let trackPages = 0;

          console.log("Scraping...");
          for (let i = 0; i <= totalPages; i++) {
            if (i == totalPages) {
              break
            }
            newVocabOffset += + 50;
            await scrapeCustomLink(newVocabOffset, newCustomUrl, browser);
            trackPages++;
            finalEntryNumber = newVocabOffset;
            console.clear();
            console.log("Page " + chalk.bold.red(`${trackPages}`) + " out of " + chalk.bold.greenBright(`${pageAmount}`))

          }


          console.log(chalk.bold.greenBright(`Successfully `) + "scraped all " + chalk.bold.greenBright(`${totalPages}`) + " pages.\n");
          console.log("Scrape Again?");
          scrapeAgain();

          function scrapeAgain() {
            console.log(chalk.bold.greenBright(`[1] Yes\n`) + chalk.bold.red(`[2] No`));
            rl.question("", async (yesNo) => {
              switch (Number(yesNo)) {
                case 1:
                  scrapeSameLinkAgain(newCustomUrl);
                  function scrapeSameLinkAgain(newCustomUrl) {
                    console.log("\nScrape " + chalk.bold.red(`${urlName}`) + " again?\n" + chalk.bold.greenBright(`[1] Yes\n`) + chalk.bold.red(`[2] No`));
                    rl.question("", async (sameLink) => {
                      if (Number(sameLink) == 1) {
                        foundcustomUrl(customUrl, finalEntryNumber);
                      } else if (Number(sameLink) == 2) {
                        enterCustomLink();
                      } else {
                        console.log(chalk.bold.red("Invalid choice.") + ("Please enter " + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2\n")));
                        scrapeSameLinkAgain();
                      }
                    });
                  }
                  break;
                case 2:
                  for (let i = 10; i > 0; i--) {
                    console.log(chalk.bold.red("\nG") + chalk.hex('#FF8800').bold("o") + chalk.bold.yellow("o") + chalk.bold.greenBright("d") + chalk.bold.blue("b") + chalk.hex('#FF00FF').bold("y") + chalk.bold.red("e") + chalk.hex('#FF8800').bold("!\n"));
                  }
                  process.exit();
                default:
                  console.log(chalk.bold.red("Invalid choice.") + ("Please enter " + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2\n")));
                  scrapeAgain();
                  break;
              }
            });
          }
        });
      }

    }

    async function ifLastOffset(lastEntryNumber) {
      console.log("YOU ARE RUNNING IFLASTOFFSET")
      //console.clear();
      console.log(`Max available pages: ` + chalk.bold.red(`${foundParagraphElements[0]}`))
      console.log("\nPlease enter " + chalk.bold("amount") + " of enter pages to scrape:")
      rl.question("", async (answer) => {
        let pageAmount = answer;
        if (!pageAmount.length == 0 && !Number(pageAmount) > Number(foundParagraphElements[1])) {
          await page.close();
        }

        let newVocabOffset = Number(lastEntryNumber);
        finalEntryNumber = 0;
        const totalPages = Math.min(Number(pageAmount), 100);

        const parallelTasks = []; // Array to store the parallel scraping tasks


        console.log("Scraping...");
        for (let i = 0; i <= totalPages; i++) {
          if (i == totalPages) {
            break
          }
          newVocabOffset += + 50;
          await scrapeCustomLink(newVocabOffset, newCustomUrl, browser);
          finalEntryNumber = newVocabOffset;
          //console.log(finalEntryNumber)
        }


        console.log(`Successfully scraped all ${totalPages} pages.\n`);
        console.log("Would you like to scrape again?");
        scrapeAgain();

        function scrapeAgain() {
          rl.question("1: Yes\n2: No\n", async (yesNo) => {
            switch (Number(yesNo)) {
              case 1:
                scrapeSameLinkAgain(newCustomUrl);
                function scrapeSameLinkAgain(newCustomUrl) {
                  rl.question(`\nScrape ${newCustomUrl} again?\n1: Yes\n2: No\n`, async (sameLink) => {
                    if (Number(sameLink) == 1) {
                      foundcustomUrl(customUrl);
                    } else if (Number(sameLink) == 2) {
                      enterCustomLink();
                    } else {
                      console.log("Invalid choice; Please enter 1 or 2\n");
                      scrapeSameLinkAgain();
                    }
                  });
                }

                break;
              case 2:
                console.log("\nGoodbye!");
                process.exit();
              default:
                "Invalid choice; Please enter 1 or 2";
                scrapeAgain();
                break;
            }
          });
        }
      });
    }

  }


}

async function scrapeCustomLink(newVocabOffset, newCustomUrl, browser) {
  // const browser = await puppeteer.launch({
  //   headless: "old",
  // });

  const page2 = await browser.newPage();

  //Navigate to frequency page
  let customUrlArray = newCustomUrl.split("/");
  let index = customUrlArray.lastIndexOf("vocabulary-list"); // Find the index of "vocabulary-list"
  let modifiedCustomUrl; // Declare the variable here

  if (index !== -1) {
    modifiedCustomUrl = customUrlArray.slice(0, index).join("/");
    let vocabListLink = `${modifiedCustomUrl}/vocabulary-list?sort_by=by-frequency-global&offset=${newVocabOffset}`;

    // Increase the timeout to 180 seconds (3 minutes)
    try {
      await page2.goto(`${vocabListLink}`, { waitUntil: "load", timeout: 0 });
      await page2.waitForXPath('/html/body/div[2]/h4')
    } catch (error) {
      console.log(`Error! Could not navigate to page!\n ${error}`)
      process.exit();
    }



  } else {
    console.log(`Error ${newCustomUrl}`);
  }

  // find next page button
  // Check if current page contains a Next Page button
  const nextPage = await page2.evaluate(() => {
    const nextPageElements = document.querySelectorAll("a");
    return Array.from(nextPageElements, (element) => element.textContent.toLowerCase());
  });

  let hasNextPage = false;

  for (const text of nextPage) {
    //console.log(text)
    if (text.includes("next")) {
      hasNextPage = true;
      break;
    }
  }

  if (!hasNextPage) {
    console.clear();
    console.log("Final page reached!\n");
    await browser.close();
    process.exit();
  }

  // Get list of ruby words
  await page2.waitForXPath("//ruby");
  const rubyWords = await page2.evaluate(() => {
    const anchorElements = document.querySelectorAll('a[href^="/vocabulary/"][href$="#a"]');
    return Array.from(anchorElements, (element) => {
      const href = element.getAttribute("href");

      const parts = href.split("/");
      // Get the second-to-last part
      const kanji = href.substring(href.lastIndexOf("/") + 1, href.length - 2); // Remove last 2 characters (#a)
      return kanji;
    });
  });

  if (rubyWords.length === 0 || rubyWords == null) {
    console.log(`Invalid offset amount: ${rubyWords}`);
    await browser.close();
    await enterCustomLink();
  } else {
    //console.log(rubyWords);
    writeKanji(rubyWords);

  }
  await page2.close();
}

async function writeKanji(rubyWords) {
  if (rubyWords.length === 0) {
    console.log(`No kanji words to write.`);
  } else {
    try {
      // Prepare the data to be appended with a newline
      const newData = rubyWords.join("\n") + "\n";

      // Append the data to the file asynchronously
      const outputFilePath = "./output/kanji_words.txt";
      await fs.promises.appendFile(outputFilePath, newData);

      //console.log(``);
    } catch (error) {
      console.error(`Error writing to file: ${error}`);
    }
  }
}
