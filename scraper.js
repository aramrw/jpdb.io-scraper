import puppeteer from 'puppeteer';
import readline from 'readline'
import fs from 'fs';
import chalk from 'chalk';
import { url } from 'inspector';
process.setMaxListeners(100); // You can adjust the number based on your needs

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const frequentlyUsedLinks = []
const chalkYellow = chalk.hex('#Ffce00'); // Using the hex code for gold color



console.clear();
enterCustomLink();
async function enterCustomLink() {
  let finalEntryNumber = 0;
  console.log(chalk.bold(chalk.bold.red("Anime ") + "& " + chalk.bold.red("Novel ") + "links:"));
  console.log(chalk.blue("https://jpdb.io/prebuilt_decks?sort_by=word_count&order=reverse\n"));
  console.log(chalkYellow("Enter an Anime / Novel Url ") + chalk.bold.red("->"));
  rl.question("", async (customUrl) => {
    if (customUrl.length < 15 && customUrl.includes("/vocabulary-list") && customUrl.includes("https://jpdb.io/")) {
      console.clear();
      console.log(chalk.bold.red("Invalid! ") + ("Url must be longer than 15 characters.\n"));
      console.log(chalk.bold("Example Link: "));
      console.log(chalk.blue("https://jpdb.io/novel/5462/sword-art-online/vocabulary-list\n"));
      await enterCustomLink();
    } else if (!customUrl.includes("/vocabulary-list") || !customUrl.includes("https://jpdb.io/")) {
      console.clear();
      console.log(chalk.bold.red("Invalid! ") + "Only enter anime/novel's " + chalk.bold.yellowBright("vocabulary list ") + "url.\n");
      console.log(chalk.bold.yellowBright("Example Link: "));
      console.log(chalk.blue("https://jpdb.io/novel/5462/sword-art-online/vocabulary-list\n"));
      await enterCustomLink();
    } else {
      await foundcustomUrl(customUrl, finalEntryNumber);
    }
  });
}


async function foundcustomUrl(customUrl, finalEntryNumber) {
  console.clear();
  console.log(chalk.bold.red("Loading...\n"));

  const newCustomUrl = customUrl.toString();
  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();
  //console.log(`THIS IS THE CUSTOM URL ${newCustomUrl}`);
  await page.goto(`${newCustomUrl}`, { waitUntil: "load", timeout: 0 });

  // Get get the list of paragraph elements that show # of entries

  const paragraphElements = await page.evaluate(() => {
    const paragraphElements = document.querySelectorAll("p");
    return Array.from(paragraphElements, (element) => element.textContent.trim());
  });

  // if url isnt right




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

  if (foundParagraphElements.length == 0 || foundParagraphElements == undefined || foundParagraphElements == undefined) {
    await browser.close();
    console.log(chalk.bold.red('Error! ') + 'Invalid url! Please try again.');
    for (let i = 3; i > 0; i--) {
      console.log(chalk.bold.red(i));
      if (i === 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.clear();
        await enterCustomLink();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  } else {

    let frequencyCheckComplete = false;
    let newVocabOffset;
    await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
  }

  async function askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset) {
    console.clear();
    console.log(coloredNumber + "\n");

    if (frequencyCheckComplete == false) {
      // if finalEntryNumber is found
      if (finalEntryNumber !== 0) {
        let maxPages = Math.floor((Number(paragraphNumber) - Number(newVocabOffset)) / 50);
        console.log('You ended at ' + chalk.bold.red(`${finalEntryNumber}`) + ' last time, start from here?\n' + chalk.bold.greenBright(`[1] Yes\n`) + chalk.bold.red(`[2] No\n`))
        rl.question("", async (answer) => {
          switch (answer) {
            case '1': // Yes
              newVocabOffset = finalEntryNumber;
              frequencyCheck(frequencyCheckComplete, page, newVocabOffset);
              break;
            case '2': // No
              finalEntryNumber = 0;
              await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
              break;
            case 'yes': // Yes
              newVocabOffset = finalEntryNumber;
              frequencyCheck(frequencyCheckComplete, page, newVocabOffset);
              break;
            case 'no': // No
              finalEntryNumber = 0;
              await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
              break;
            default:
              console.clear()
              console.log(chalk.bold.red('Error! ') + 'Please enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!\n'));
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                }
              }
              break;
          }
        })
        // if no finalEntryNumber is found
      } else {
        console.log(chalkYellow('Enter a search offset') + chalk.bold.red(' ->'))
        rl.question("", async (vocabOffset) => {
          let timerCounter = 3;
          // Attempt to parse the input as an integer
          newVocabOffset = parseInt(vocabOffset);
          if (!isNaN(newVocabOffset)) { // Check if it's a valid number
            if (newVocabOffset >= 0 && newVocabOffset <= paragraphNumber) {
              frequencyCheck(frequencyCheckComplete, page, newVocabOffset);
            } else if (newVocabOffset > paragraphNumber) {
              console.clear();
              console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.bold.red('bigger ') + 'than ' + chalk.bold.red(`${paragraphNumber}`) + '!\n');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                }
              }
            } else if (newVocabOffset < 0) {
              console.clear();
              console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.bold.red('smaller ') + 'than ' + chalk.bold.red(`0`) + '!\n');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                }
              }
            }
          } else {
            console.clear();
            console.log(chalk.bold.red('Error! ') + 'Not a valid number. Try again' + '!\n');
            for (let i = 3; i > 0; i--) {
              console.log(chalk.bold.red(i));
              if (i === 1) {
                await new Promise((resolve) => setTimeout(resolve, 800));
                askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
              } else {
                await new Promise((resolve) => setTimeout(resolve, 800));
              }
            }
          }
        });
      }
      // else statement that starts scraping
    } else {
      let maxPages = Math.floor((Number(paragraphNumber) - Number(newVocabOffset)) / 50);
      console.clear();
      console.log(`Max available pages: ` + chalk.bold.red(`${maxPages}`))
      console.log(chalkYellow("Please enter the ") + chalk.bold("amount ") + chalkYellow('of ') + chalk.bold.red('pages ') + chalkYellow('to scrape') + chalk.bold.red(' ->'));
      rl.question("", async (answer) => {

        // error handling for invalid input

        let pageAmount = answer;
        if (pageAmount.length <= 0 || Number(pageAmount) > Number(maxPages)) {
          console.clear();
          console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.bold.red("less ") + 'than ' + chalk.bold.red('0 ') + "or " + chalk.bold.red("greater " + 'than ' + (`${maxPages}`) + '!\n'));
          for (let i = 3; i > 0; i--) {
            console.log(chalk.bold.red(i));
            if (i === 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
            } else {
              await new Promise((resolve) => setTimeout(resolve, 800));
            }
          }
        } else {

          // starting scraping
          const totalPages = Math.min(Number(pageAmount), 100);
          const parallelTasks = []; // Array to store the parallel scraping tasks
          let trackPages = 0;
          console.clear();
          console.log(chalk.bold.red("Scraping") + '...');

          // if i want to divide by 50 for some reason

          // if (newVocabOffset % 50 !== 0) {
          //   newVocabOffset = Math.round(newVocabOffset / 50) * 50;
          // }

          newVocabOffset = newVocabOffset - 50;
          for (let i = 0; i <= totalPages; i++) {
            if (i > totalPages) {
              break;
            }
            newVocabOffset = newVocabOffset + 50;
            await scrapeCustomLink(newVocabOffset, newCustomUrl, browser);
            trackPages++;
            finalEntryNumber = newVocabOffset;
            console.clear();
            console.log("Page " + chalk.bold.green(`${trackPages - 1}`) + " out of " + chalk.bold.red(`${pageAmount}`))
          }

          // end scraping and log results

          console.log(newVocabOffset);
          console.log(chalk.bold.greenBright(`Successfully `) + "scraped all " + chalk.bold.greenBright(`${totalPages}`) + " pages.");
          scrapeSameLinkAgain(urlName, finalEntryNumber);

          // section ends here
        }
      });
    }
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

      console.log(chalkYellow("Would you like to continue?\n") + chalk.bold.greenBright(`[1] Yes\n`) + chalk.bold.red(`[2] No`))
      rl.question(" ", async (answer) => {
        let newAnswer = answer;
        switch (newAnswer) {
          case '1':
            frequencyCheckComplete = true;
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
            break;
          case '2':
            frequencyCheckComplete = false;

            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
            break;
          case 'yes':
            frequencyCheckComplete = true;
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
            break;
          case 'no':
            frequencyCheckComplete = false;
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
            break;
          default:
            console.clear()
            frequencyCheckComplete = false;
            console.log('Please enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2!"))
            for (let i = 3; i > 0; i--) {
              console.log(chalk.bold.red(i));
              if (i === 1) {
                frequencyCheckComplete = false;
                await new Promise((resolve) => setTimeout(resolve, 500));
                await frequencyCheck(frequencyCheckComplete, page, newVocabOffset);
              } else {
                await new Promise((resolve) => setTimeout(resolve, 800));
              }
            }
            await frequencyCheck(frequencyCheckComplete, page, newVocabOffset);
            break;
        }
      })
    }
  }


  function scrapeSameLinkAgain(urlName, finalEntryNumber) {

    rl.question(chalkYellow('\nWould you like to scrape again?') + chalk.bold.greenBright('\n1: Yes') + chalk.bold.red('\n2: No\n'), async (answer) => {
      switch (answer) {
        case '1':
          break;
        case '2':
          console.clear()
          console.log(chalk.bold.yellowBright('Goodbye!'))
          process.exit();
        case 'yes':
          break;
        case 'no':
          console.clear()
          console.log(chalk.bold.yellowBright('Goodbye!'))
          process.exit();
        default:
          console.clear()
          console.log(chalk.bold.red('Error! ') + 'Please enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!\n'));
          for (let i = 3; i > 0; i--) {
            console.log(chalk.bold.red(i));
            if (i === 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              scrapeSameLinkAgain(urlName, finalEntryNumber);
            } else {
              await new Promise((resolve) => setTimeout(resolve, 800));
            }
          }
          scrapeSameLinkAgain(urlName, finalEntryNumber);
          break;
      }
    });
    rl.question('\nScrape ' + chalk.bold.red(`${urlName}`) + ' again?' + chalk.bold.greenBright('\n1: Yes') + chalk.bold.red('\n2: No\n'), async (sameLink) => {
      if (Number(sameLink) == 1) {
        frequencyCheckComplete = false;
        askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
      } else if (Number(sameLink) == 2) {
        console.clear();
        finalEntryNumber = 0;
        enterCustomLink();
      } else {
        console.clear();
        console.log(chalk.bold.red('Error! ') + 'Please enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!\n'));
        for (let i = 3; i > 0; i--) {
          console.log(chalk.bold.red(`\n${i}`));
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
        scrapeSameLinkAgain(urlName, finalEntryNumber);
      }
    });
  }

}

async function scrapeCustomLink(newVocabOffset, newCustomUrl, browser) {
  // const browser = await puppeteer.launch({
  //   headless: "new",
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
      process.exit();
    }
  }
}
