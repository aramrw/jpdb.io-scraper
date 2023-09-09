const puppeteer = require("puppeteer");
const readline = require("readline");
const fs = require("fs").promises;
const chalk = require("chalk");
const { stdout } = require("process");

process.setMaxListeners(100); // You can adjust the number based on your needs

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const frequentlyUsedLinks = []
const chalkYellow = chalk.hex('#Ffce00'); // Using the hex code for gold color

let finalEntryNumber = 0;
startProgram();

async function startProgram() {
  console.clear()
  rl.question(chalkYellow('Choose which ') + chalk.bold.blue('program ') + chalkYellow('to start ') + chalk.bold.blue('->\n') + chalk.bold.yellow('\n[1] Word Scraper\n') + chalk.bold.blue('[2] Frequency Sorter\n') + chalk.bold.magenta('[3] Kanji Sorter\n') + chalk.bold.cyan('[4] Suggested Links\n') + chalk.bold.red('[5] Clear Output Files\n'), async (answer) => {
    switch (answer) {
      case '1':
        console.clear();
        enterCustomLink();
        break;
      case '2':
        console.clear();
        await sortWords();
        break;
      case '3':
        console.clear();
        await sortByKanji();
        break;
      case '4':
        console.clear();
        await suggestLinks();
        break;
      case '5':
        console.clear();
        await clearFiles();
        break;
      default:
        console.clear()
        console.log(chalk.bold.red('Only ') + 'enter ' + chalk.bold.yellow("1 ") + "/ " + chalk.bold.blue("2 ") + "/ " + chalk.bold.red("3 ") + "/ " + chalk.bold.cyan("4") + " / " + chalk.bold.magenta("5") + '!');
        for (let i = 3; i > 0; i--) {
          console.log(chalk.bold.red(i));
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            startProgram();
          } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
        break;
    }

  });
}

async function enterCustomLink() {
  finalEntryNumber = 0;
  console.log(chalk.bold(chalk.bold.red("Anime ") + "& " + chalk.bold.red("Novel ") + "links:"));
  console.log(chalk.blue("https://jpdb.io/prebuilt_decks?sort_by=word_count&order=reverse\n"));
  console.log(chalkYellow("Enter an Anime / Novel Url ") + chalk.bold.red("->"));
  rl.question("", async (customUrl) => {
    if (customUrl.length < 7 && customUrl.includes("/vocabulary-list") && customUrl.includes("https://jpdb.io/")) {
      console.clear();
      console.log(chalk.bold.red("Invalid! ") + ("Url must be" + chalk.bold.red("longer") + "than" + chalk.bold.red("7") + "characters.\n"));
      console.log(chalk.bold("Example Link: "));
      console.log(chalk.blue("https://jpdb.io/novel/5462/sword-art-online/vocabulary-list\n"));
      await enterCustomLink();
    }
    else if (customUrl.length < 5) {
      console.clear();
      console.log(chalk.bold.red("Invalid Url!\n"));
      console.log(chalk.bold.yellowBright("Example Link: "));
      console.log(chalk.blue("https://jpdb.io/novel/5462/sword-art-online/vocabulary-list\n"));
      await enterCustomLink();
    }
    else if ((!customUrl.includes("/vocabulary-list")) || (!customUrl.includes("https://jpdb.io/"))) {
      console.clear();
      console.log(chalk.bold.red("Invalid! ") + "Only enter anime/novel's " + chalk.bold.yellowBright("vocabulary list ") + "url.\n");
      console.log(chalk.bold.yellowBright("Example Link: "));
      console.log(chalk.blue("https://jpdb.io/novel/5462/sword-art-online/vocabulary-list"));
      for (let i = 3; i > 0; i--) {
        console.log(chalk.bold.red(i));
        if (i === 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.clear();
          console.log(chalk.bold.yellowBright("Example Link: "));
          console.log(chalk.blue("https://jpdb.io/novel/5462/sword-art-online/vocabulary-list\n"));
          await enterCustomLink();
        } else {
          await new Promise((resolve) => setTimeout(resolve, 700));
        }
      }
    }
    else {
      await foundcustomUrl(customUrl, finalEntryNumber);
    }
  });
}

async function foundcustomUrl(customUrl, finalEntryNumber) {
  console.clear();
  console.log(chalk.bold.red("Loading") + chalk.bold("...\n"));

  const newCustomUrl = customUrl.toString();
  const browser = await puppeteer.launch({
    //executablePath: `${__dirname}/node_modules/puppeteer/chrome/win64-115.0.5790.170/chrome-win64/chrome.exe`,
    headless: "new",
  });

  const page = await browser.newPage();

  // catch invalid url;
  let validUrl = true;

  try {
    await page.goto(`${newCustomUrl}`, { waitUntil: "load", timeout: 0 });
  } catch (error) {
    validUrl = false;
    console.log(chalk.bold.red('Error! ') + 'Invalid url. Please try again.')
    for (let i = 3; i > 0; i--) {
      console.log(chalk.bold.red(i));
      if (i === 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.clear();
        browser.close();
        enterCustomLink();
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  const paragraphElements = await page.evaluate(() => {
    const paragraphElements = document.querySelectorAll("p");
    return Array.from(paragraphElements, (element) => element.textContent.trim());
  });
  let foundParagraphElements = [];
  let coloredNumber;
  const urlSegments = customUrl.split('/')
  let urlName;

  const h4Elements = await page.evaluate(() => {
    const h4Elements = document.querySelectorAll("h4");
    return Array.from(h4Elements, (element) => element.textContent.trim());
  });

  for (const h4Elem of h4Elements) {
    try {
      const colonIndex = h4Elem.indexOf(':'); // Find the index of the first ":"
      urlName = colonIndex !== -1 ? h4Elem.slice(colonIndex + 1).trim() : h4Elem.trim();
    } catch {
      validUrl = false;
      console.log(chalk.bold.red('Error! ') + 'Invalid url. Please try again.')
      for (let i = 3; i > 0; i--) {
        console.log(chalk.bold.red(i));
        if (i === 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.clear();
          browser.close();
          enterCustomLink();
          break;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

  }

  if (validUrl == true) {
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
      console.clear();
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
      await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
    }
  }

  async function askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser) {
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
              frequencyCheck(frequencyCheckComplete, page, newVocabOffset, paragraphNumber, coloredNumber, newCustomUrl, browser, finalEntryNumber, urlName);
              break;
            case '2': // No
              finalEntryNumber = 0;
              await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
              break;
            case 'yes': // Yes
              newVocabOffset = finalEntryNumber;
              frequencyCheck(frequencyCheckComplete, page, newVocabOffset, paragraphNumber, coloredNumber, newCustomUrl, browser, finalEntryNumber, urlName);
              break;
            case 'no': // No
              finalEntryNumber = 0;
              await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
              break;
            default:
              console.clear()
              console.log(chalk.bold.red('Error! ') + 'Only enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!'));
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
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
              await frequencyCheck(frequencyCheckComplete, page, newVocabOffset, paragraphNumber, coloredNumber, newCustomUrl, browser, finalEntryNumber, urlName);
            } else if (newVocabOffset > paragraphNumber) {
              console.clear();
              console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.bold.red('bigger ') + 'than ' + chalk.bold.red(`${paragraphNumber}`) + '!');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                }
              }
            } else if (newVocabOffset < 0) {
              console.clear();
              console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.bold.red('smaller ') + 'than ' + chalk.bold.red(`0`) + '!');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                  askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 800));
                }
              }
            }
          } else {
            console.clear();
            console.log(chalk.bold.red('Error! ') + 'Not a valid number. Try again' + '!');
            for (let i = 3; i > 0; i--) {
              console.log(chalk.bold.red(i));
              if (i === 1) {
                await new Promise((resolve) => setTimeout(resolve, 800));
                askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
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
      console.log(chalk.bold.red(`Max `) + `available pages: ` + chalk.bold.red(`${maxPages}`))

      // if there are no more pages
      if (maxPages == 0) {
        console.log(chalk.bold.red('\nError! ') + 'No pages to scrape!')
        for (let i = 3; i > 0; i--) {
          console.log(chalk.bold.red(i));
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            frequencyCheckComplete = false
            finalEntryNumber = 0;
            askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      } else {
        console.log(chalkYellow("Please enter the ") + chalk.bold("amount ") + chalkYellow('of ') + chalk.bold.red('pages ') + chalkYellow('to scrape') + chalk.bold.red(' ->'));
        rl.question("", async (answer) => {

          // error handling for invalid input

          let pageAmount = answer;
          if (Number(pageAmount) > Number(maxPages) || Number(pageAmount) < 0 || Number(pageAmount) < 0 || isNaN(pageAmount)) {
            console.clear();
            console.log(chalk.bold.red('Error! ') + 'Value ' + chalk.bold.red('cannot ') + 'be ' + chalk.red("less ") + 'than ' + chalk.bold.red('0 ') + "or " + chalk.red("greater ") + 'than ' + chalk.bold.red(`${maxPages}`) + '!');
            for (let i = 3; i > 0; i--) {
              console.log(chalk.bold.red(i));
              if (i === 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
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
              await scrapeCustomLink(newVocabOffset, newCustomUrl, browser, urlName);
              trackPages++;
              finalEntryNumber = newVocabOffset;
              console.clear();
              console.log("Page " + chalk.bold.green(`${trackPages - 1}`) + " out of " + chalk.bold.red(`${pageAmount}`))
            }

            // end scraping and log results
            console.log(chalk.bold.greenBright(`Successfully `) + "scraped all " + chalk.bold.greenBright(`${totalPages}`) + " pages.");
            scrapeSameLinkAgain(urlName, finalEntryNumber, frequencyCheckComplete, newVocabOffset, browser, newCustomUrl, page, paragraphNumber, coloredNumber);

            // section ends here
          }
        });
      }
    }
  }

  async function frequencyCheck(frequencyCheckComplete, page, newVocabOffset, paragraphNumber, coloredNumber, newCustomUrl, browser, finalEntryNumber, urlName) {
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
        console.log("Frequency is ~ " + chalk.bold.red('30') + chalk.bold(',') + chalk.bold.red('000') + chalk.bold(' +\n'))
      } else {
        console.log("Frequency is ~ " + chalk.bold.red(`${divElements[0]}\n`))
      }

      console.log(chalkYellow("Would you like to continue?\n") + chalk.bold.greenBright(`[1] Yes\n`) + chalk.bold.red(`[2] Back`))
      rl.question(" ", async (answer) => {
        let newAnswer = answer;
        switch (newAnswer) {
          case '1':
            frequencyCheckComplete = true;
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
            break;
          case '2':
            frequencyCheckComplete = false;

            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
            break;
          case 'yes':
            frequencyCheckComplete = true;
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
            break;
          case 'no':
            frequencyCheckComplete = false;
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
            break;
          default:
            console.clear()
            frequencyCheckComplete = false;
            console.log('Only enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2!"))
            for (let i = 3; i > 0; i--) {
              console.log(chalk.bold.red(i));
              if (i === 1) {
                frequencyCheckComplete = false;
                await new Promise((resolve) => setTimeout(resolve, 500));
                await frequencyCheck(frequencyCheckComplete, page, newVocabOffset, paragraphNumber, coloredNumber, newCustomUrl, browser, finalEntryNumber, urlName);
              } else {
                await new Promise((resolve) => setTimeout(resolve, 800));
              }
            }
            await frequencyCheck(frequencyCheckComplete, page, newVocabOffset, paragraphNumber, coloredNumber, newCustomUrl, browser, finalEntryNumber, urlName);
            break;
        }
      })
    }
  }


  function scrapeSameLinkAgain(urlName, finalEntryNumber, frequencyCheckComplete, newVocabOffset, browser, newCustomUrl, page, paragraphNumber, coloredNumber) {

    rl.question(chalkYellow('\nWould you like to scrape again?') + chalk.bold.greenBright('\n1: Yes') + chalk.bold.red('\n2: No\n'), async (answer) => {
      let scrapeAgain;
      switch (answer) {
        case '1':
          scrapeAgain = true;
          break;
        case '2':
          scrapeAgain = false;
          break;
        case 'yes':
          scrapeAgain = true;
          break;
        case 'no':
          scrapeAgain = false;
          break;
        default:
          console.clear()
          console.log(chalk.bold.red('Error! ') + 'Only enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!'));
          for (let i = 3; i > 0; i--) {
            console.log(chalk.bold.red(i));
            if (i === 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
              scrapeSameLinkAgain(urlName, finalEntryNumber, frequencyCheckComplete, newVocabOffset, browser, newCustomUrl, page, paragraphNumber, coloredNumber);
            } else {
              await new Promise((resolve) => setTimeout(resolve, 800));
            }
          }
          scrapeSameLinkAgain(urlName, finalEntryNumber, frequencyCheckComplete, newVocabOffset, browser, newCustomUrl, page, paragraphNumber, coloredNumber);
          break;
      }
      if (scrapeAgain == true) {
        console.clear();
        rl.question('Scrape ' + chalk.bold.red(`${urlName}`) + ' again?' + chalk.bold.greenBright('\n1: Yes') + chalk.bold.red('\n2: No\n'), async (sameLink) => {
          if (Number(sameLink) == 1) {
            frequencyCheckComplete = false;
            await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
          } else if (Number(sameLink) == 2) {
            console.clear();
            finalEntryNumber = 0;
            enterCustomLink();
          } else {
            console.clear();
            console.log(chalk.bold.red('Error! ') + 'Only enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!'));
            for (let i = 3; i > 0; i--) {
              console.log(chalk.bold.red(`\n${i}`));
              if (i === 1) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                await askOffset(finalEntryNumber, frequencyCheckComplete, paragraphNumber, coloredNumber, newVocabOffset, urlName, page, newCustomUrl, browser);
              } else {
                await new Promise((resolve) => setTimeout(resolve, 800));
              }
            }
            scrapeSameLinkAgain(urlName, finalEntryNumber, frequencyCheckComplete, newVocabOffset, browser, newCustomUrl, page, paragraphNumber, coloredNumber);
          }
        });
      } else if (scrapeAgain == false) {
        browser.close();
        askSorting();
      }
    });
  }
}

async function scrapeCustomLink(newVocabOffset, newCustomUrl, browser, urlName) {


  // suggest links file
  let linksFile = (await fs.readFile('./suggest/links.txt', 'utf8')).split('\n');
  let linkExists = false;
  let linksFileCounter = 0;

  if (linksFile[0] == "") {
    await fs.appendFile('./suggest/links.txt', `[1] ${urlName}_${newCustomUrl}\n`);
  } else {
    for (const link of linksFile) {
      if (link !== "") {
        linksFileCounter++;
        const splitLinks = link.split(/_|]/);
        if (splitLinks[1].trim() == urlName.trim()) {
          linkExists = true;
          break;
        }
      }
    }
  }

  if (linkExists == false) {
    ((linksFile.length - 1) % 8 === 0)
      ? (linksFileCounter = 1, await fs.appendFile('./suggest/links.txt', `[${linksFileCounter}] ${urlName}_${newCustomUrl}\n`))
      : await fs.appendFile('./suggest/links.txt', `[${linksFileCounter + 1}] ${urlName}_${newCustomUrl}\n`);
  }

  // scraping

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
    console.log(chalk.bold.red("Final page reached!\n"));
    await browser.close();
    await askSorting();
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

async function askSorting() {
  console.clear();
  rl.question(chalkYellow("Would you like to") + chalk.bold.green(' Sort ') + chalkYellow("scraped words by ") + chalk.bold.blue('Frequency') + chalkYellow(' or ') + chalk.bold.magenta('Kanji') + chalkYellow('?\n') + chalk.bold.greenBright(chalk.bold.blue('\n[1] Frequency')) + chalk.bold.magenta(('\n[2] Kanji')) + chalk.bold.red(('\n[3] No Thanks\n')), async (answer) => {
    switch (answer) {
      case '1':
        await sortWords();
        break;
      case '2':
        await sortByKanji();
        break;
      case '3':
        console.clear();
        for (let i = 3; i > 0; i--) {
          console.log(chalk.bold.red(i));
          if (i === 1) {
            frequencyCheckComplete = false;
            await new Promise((resolve) => setTimeout(resolve, 200));
            stdout.write(chalk.bold.blue('Goodbye!\n'));
            process.exit();
          } else {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      default:
        console.clear()
        console.log('Only enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!'));
        for (let i = 3; i > 0; i--) {
          console.log(chalk.bold.red(i));
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await sortWords();
          } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
        break;
    }

  })
}

async function sortWords() {

  const loadingAnimation = ["|", "/", "-", "\\"];
  let animationIndex = 0;

  const cc = {
    boldRed: chalk.bold.red,
    boldGreen: chalk.bold.greenBright,
    boldYellow: chalk.bold.yellow,
    boldBlue: chalk.bold.blue,
    yellow: chalk.yellowBright,
  };

  console.clear();
  try {
    const wordsFolder = (fs.readdir("./output", "utf-8"));
    //console.log(wordsDirectory[0])

    let scrapedWords;

    if (wordsFolder.length == 0) {
      console.clear();
      console.log(cc.boldRed("Error! ") + cc.yellow('There are ') + cc.boldRed('0') + cc.yellow(' files in the ') + cc.boldRed('words') + cc.yellow(' folder!'));
      for (let i = 3; i > 0; i--) {
        console.log(chalk.bold.red(i));
        if (i === 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          programFailed = true;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }
    else {
      console.log(cc.yellow("Loading ") + cc.boldBlue('Scraped Words') + '...');
      let wordsFile = './output/words.txt'
      scrapedWords = (await fs.readFile(wordsFile, "utf-8")).split("\n");
    }

    if (scrapedWords[0] == "") {
      console.clear();
      console.log(cc.boldRed('Error! ') + ('There are no words in ') + cc.boldRed(`words.txt`) + '!')
      for (let i = 3; i > 0; i--) {
        console.log(chalk.bold.red(i));
        if (i === 1) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          startProgram();
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } else {
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
          //process.stdout.write(cc.boldRed(`\r${ loadingAnimation[animationIndex]}`) + cc.yellow(` Processing word`) + cc.boldRed(': ') + cc.boldYellow(`[`) + cc.boldRed(`${ counter }`) + cc.boldYellow(` ]`) + cc.boldBlue(`${ scrapedWord }`) + cc.yellow(' of ') + cc.boldYellow(`[`) + cc.boldRed(`${ scrapedWord.length }`) + cc.boldYellow(` ]`));
          //process.stdout.write(cc.boldRed(`\r${ loadingAnimation[animationIndex]}`) + cc.yellow(` Processing word`) + cc.boldRed(': ') + cc.boldYellow(`[`) + cc.boldBlue(`${ scrapedWord }`) + cc.boldYellow(']'));
          process.stdout.write(cc.boldRed(`\r${loadingAnimation[animationIndex]}`) + cc.yellow(` Processing word`) + cc.boldRed(': ') + cc.boldBlue(`${scrapedWord}`));
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
      await fs.writeFile("./output/frequency.txt", formattedConsoleMessages.join("\n"), { encoding: "utf-8" });

      console.clear();
      console.log(cc.boldGreen("Successfully ") + cc.yellow('sorted ') + cc.boldGreen(`${counter}`) + ' of ' + cc.boldRed(`${scrapedWords.length} `) + cc.yellow('words\n'));
      console.log(cc.boldRed(`${scrapedWords.length} `) + cc.yellow("words have been written to ") + cc.boldRed("'frequency.txt'") + ".");
      process.exit();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }

};

async function suggestLinks(customUrl, finalEntryNumber) {

  finalEntryNumber = null
  const linksMain = (await fs.readFile('./suggest/links.txt', "utf-8")).split("\n");
  let links = [...linksMain];
  let counter = 0;
  let currentHrefArray = [];

  async function displayNames(counter) {
    // first page of links
    if (counter - 8 < 0 || counter == 0) {
      console.log(chalkYellow('Please select which ') + chalk.bold.blue('link ') + chalkYellow('you would like to ') + chalk.bold.blue('scrape ') + chalk.bold.red('->\n'))
      // Display 8 link names
      for (const link of links) {
        if (link !== "" && counter !== 8 && counter !== linksMain.length - 1) {
          counter++
          const splitLink = link.split('_')
          const name = splitLink[0];
          const href = `${splitLink[1]}`;

          // display the link name 
          currentHrefArray.push(href);
          console.log(chalk.hex(colors[counter - 1]).bold(`${name}`))
        }
      }
      if (counter !== linksMain.length - 1) {
        // ask for input
        console.log(chalkYellow('\nEnter ') + chalk.bold("'") + chalk.bold.red('+') + chalk.bold("'") + chalkYellow(' for') + chalk.bold.red(' Next') + chalkYellow(' Page ') + chalk.bold.red('->'))
        rl.question(chalk.bold.blue('\nSelect ') + chalk.bold(': '), async (answer) => {
          switch (answer) {
            case '+':
              counter = 8;
              displayNames(counter);
              break;
            case '1':
              customUrl = currentHrefArray[0]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '2':
              customUrl = currentHrefArray[1]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '3':
              customUrl = currentHrefArray[2]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '4':
              customUrl = currentHrefArray[3]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '5':
              customUrl = currentHrefArray[4]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '6':
              customUrl = currentHrefArray[5]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '7':
              customUrl = currentHrefArray[6]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '8':
              customUrl = currentHrefArray[7]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            default:
              console.clear();
              if (answer !== '+') {
                console.log(chalk.bold.red('Only ') + 'enter ' + chalk.bold("'") + chalk.bold.red('+') + chalk.bold("'") + '!');
                for (let i = 3; i > 0; i--) {
                  console.log(chalk.bold.red(i));
                  if (i === 1) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    console.clear();
                    counter -= (linksMain.length - 1) - links.length;
                    displayNames(counter);
                    break;
                  } else {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }
                }
              } else {
                console.clear();
                console.log('Only enter ' + chalk.bold.red("1") + " through " + chalk.bold.red("8" + '!'));
                for (let i = 3; i > 0; i--) {
                  console.log(chalk.bold.red(i));
                  if (i === 1) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    console.clear();
                    counter = 0;
                    displayNames(counter);
                    break;
                  } else {
                    await new Promise((resolve) => setTimeout(resolve, 400));
                  }
                }
              }
              break
          }
        })
      } else {
        // pick a link
        rl.question(chalk.bold.blue('\nSelect ') + chalk.bold(': '), async (answer) => {
          switch (answer) {
            case '1':
              customUrl = currentHrefArray[0]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '2':
              customUrl = currentHrefArray[1]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '3':
              customUrl = currentHrefArray[2]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '4':
              customUrl = currentHrefArray[3]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '5':
              customUrl = currentHrefArray[4]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '6':
              customUrl = currentHrefArray[5]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '7':
              customUrl = currentHrefArray[6]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
            case '8':
              customUrl = currentHrefArray[7]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
              break;
              customUrl = currentHrefArray[7]
              await foundcustomUrl(customUrl);
              break;
            default:
              console.clear();
              console.log('Only enter ' + chalk.bold.red("1") + " through " + chalk.bold.red("8" + '!'));
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  console.clear();
                  counter = 0;
                  displayNames(counter);
                  break;
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }
              }
              break;
          }
        })
      }

    }
    // last page of links
    else if (counter + 8 >= (linksMain.length - 1)) {
      links = [...linksMain];
      const splicedLinks = links.splice(counter);
      console.clear();
      console.log('\n' + counter + '\n')
      //console.log('\n' + (linksMain.length - 1) + '\n')
      console.log(chalkYellow('Please select which ') + chalk.bold.blue('link ') + chalkYellow('you would like to ') + chalk.bold.blue('scrape ') + chalk.bold.red('->\n'))
      // Display 8 link names
      let colorCounter = 0;
      // Display 8 link names
      for (const link of splicedLinks) {
        if (link !== "" && colorCounter !== 8 && counter !== linksMain.length) {
          colorCounter++
          counter++
          const splitLink = link.split('_')
          const name = splitLink[0];
          const href = `${splitLink[1]}`;
          // display the link name 
          currentHrefArray.push(href)
          console.log(chalk.hex(colors[colorCounter - 1]).bold(`${name}`))
        }
      }
      // log question 
      console.log(chalk.bold.red('\n<- ') + chalkYellow('Enter ') + chalk.bold("'") + chalk.bold.red('-') + chalk.bold("'") + chalkYellow(' for ') + chalk.bold.red('Previous ') + chalkYellow('Page '))

      // pick a link

      rl.question(chalk.bold.blue('\nSelect ') + chalk.bold(': '), async (answer) => {
        let validNumber;
        if (answer > 0 && answer <= currentHrefArray.length) {
          validNumber = Number(answer);
        }
        switch (answer) {
          case '-':
            //counter -= ((linksMain.length - 1) - links.length) - 8;
            if (counter - 8 == 0 || counter - 8 < 0) {
              counter = 0;
              console.clear();
              displayNames(counter);
            } else {
              counter = links.length
              counter -= 8;
              console.clear();
              displayNames(counter);
            }
            break;
          case '1':
            customUrl = currentHrefArray[0]
            finalEntryNumber = 0;
            await foundcustomUrl(customUrl, finalEntryNumber);
            break;
          case `${validNumber}`:
            if (counter == 1) {
              customUrl = currentHrefArray[0]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
            } else {
              console.log(currentHrefArray[validNumber])
              process.exit();

              // SOMETHING IS WRONG WITH VALID NUMBER AND THE LINKS, GET LINKS THAT ARE UNIQUE TO TEST IT 

              customUrl = currentHrefArray[validNumber]
              finalEntryNumber = 0;
              await foundcustomUrl(customUrl, finalEntryNumber);
            }
            break;
          default:
            console.clear();
            if (answer !== '-' && answer !== '+') {
              console.log(chalk.bold.red('Only ') + 'enter ' + chalk.bold("'") + chalk.bold.blue('-') + chalk.bold("'") + '!');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 300));
                  console.clear();
                  counter -= (linksMain.length - 1) - links.length;
                  displayNames(counter);
                  break;
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                }
              }
              break;
            } else {
              console.clear();
              console.log('Only enter ' + chalk.bold.red("1") + " through " + chalk.bold.red("8" + '!'));
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  console.clear();
                  counter = 0;
                  displayNames(counter);
                  break;
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }
              }
            }
            break
        }
      })
    }
    // in between pages of links
    else {
      links = [...linksMain];
      const splicedLinks = links.splice(counter);
      console.clear();
      console.log('\n' + counter + '\n')
      console.log(chalkYellow('Please select which ') + chalk.bold.blue('link ') + chalkYellow('you would like to ') + chalk.bold.blue('scrape ') + chalk.bold.red('->\n'))
      let colorCounter = 0;
      // Display 8 link names
      for (const link of splicedLinks) {
        if (link !== "" && colorCounter !== 8 && counter !== linksMain.length) {
          colorCounter++
          counter++
          const splitLink = link.split('_')
          const name = splitLink[0];
          const href = `${splitLink[1]}`;
          // display the link name 
          currentHrefArray.push(href)
          console.log(chalk.hex(colors[colorCounter - 1]).bold(`${name}`))
        }
      }

      //logging question 
      console.log(chalkYellow('\nEnter ') + chalk.bold("'") + chalk.bold.red('+') + chalk.bold("'") + chalkYellow(' for ') + chalk.bold.red('Next ') + chalkYellow('Page ') + chalk.bold.red('->\n'))
      console.log(chalk.bold.blue('<- ') + chalkYellow('Enter ') + chalk.bold("'") + chalk.bold.blue('-') + chalk.bold("'") + chalkYellow(' for ') + chalk.bold.blue('Previous ') + chalkYellow('Page '))

      // pick a link
      rl.question(chalk.bold.blue('\nSelect ') + chalk.bold(': '), async (answer) => {
        switch (answer) {
          case '+':
            displayNames(counter);
            break;
          case '-':
            if (counter - 8 == 0) {
              counter = 0;
              console.clear();
              displayNames(counter);
            } else {
              counter -= 16;
              console.clear();
              displayNames(counter);
            }
            break;
          default:
            console.clear();
            if (answer !== '-') {
              console.log(chalk.bold.red('Only ') + 'enter ' + chalk.bold("'") + chalk.bold.blue('-') + chalk.bold("'") + '!');
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 300));
                  console.clear();
                  counter -= (linksMain.length - 1) - links.length;
                  displayNames(counter);
                  break;
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                }
              }
            } else {
              console.clear();
              console.log('Only enter ' + chalk.bold.red("1") + " through " + chalk.bold.red("8" + '!'));
              for (let i = 3; i > 0; i--) {
                console.log(chalk.bold.red(i));
                if (i === 1) {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  console.clear();
                  counter = 0;
                  displayNames(counter);
                  break;
                } else {
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }
              }
            }
        }

      })
    }
  }

  if (links[0] == "") {
    console.clear();
    console.log(chalk.bold.red('Error! ') + 'There are no links in ' + chalk.bold.red('links.txt') + '!')
    for (let i = 3; i > 0; i--) {
      console.log(chalk.bold.red(i));
      if (i === 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        startProgram();
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  colors = [
    '7AC757',
    'A9C841',
    'D7C633',
    'FD7835',
    'FF5833',
    'FF5447',
    'FF6C47',
    'FF8547',
  ];

  await displayNames(counter)

}

async function sortByKanji() {


  console.clear();
  let knownKanji;
  let words;

  try {
    words = (await fs.readFile('./output/words.txt', 'utf-8')).split('\n');
  } catch (error) {
    console.log(chalk.bold.red('Error!') + ' There are no words in ' + chalk.bold.red('words.txt') + '!\n')
  }
  try {
    let knownKanji = (await fs.readFile('./kanji/knownkanji.txt', 'utf-8')).replace(/[\r\n]/g, '');
  } catch (error) {
    console.log(chalk.bold.red('Error!') + ' There are no words in ' + chalk.bold.red('knownkanji.txt') + '!\n')
  }
  const allKanji = (await fs.readFile('./kanji/allkanji.txt', 'utf-8')).replace(/[\r\n]/g, '');

  if (words[0] == "") {
    console.clear();
    console.log(chalk.bold.red('Error! ') + ('There are no words in ') + chalk.bold.red(`words.txt`) + '!')
    for (let i = 3; i > 0; i--) {
      console.log(chalk.bold.red(i));
      if (i === 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        startProgram();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  } else {
    //make arrays from files 
    //const kanjiArray = Array.from(knownKanji);
    const wordsArray = Array.from(words);
    const allKanjiArray = Array.from(allKanji);
    let counter = 0;
    let kanjiCounter = 0;
    let newChar = '';
    charCounter = 0;
    const foundWords = []

    for (const kanji of allKanjiArray) {
      kanjiCounter++;
      for (const word of wordsArray) {
        let charCounter = 0; // Reset charCounter for each new word
        for (const char of word) {
          charCounter++;
          newChar = word.charAt(charCounter - 1); // Use charCounter - 1 to access characters correctly
          if (newChar.includes(kanji) && !foundWords.includes(word)) { // Check if newChar contains the kanji
            foundWords.push(word);
            fs.appendFile('./output/kanji.txt', word + '\n');
            stdout.write(chalk.bold.greenBright('Successfully ') + 'sorted ' + chalk.bold.red(`${kanjiCounter}`) + ' kanji' + ' from ' + chalk.bold.red(`${wordsArray.length - 1}`) + ' words\r');
            break; // Exit the loop once a match is found in the word
          }
        }
      }
    }

    const kanjiFile = (await fs.readFile('./output/kanji.txt', 'utf-8')).split('\n');
    console.log(chalk.bold.red(`\n${kanjiFile.length - 1} `) + ("words have been written to ") + chalk.bold.red("'kanji.txt'") + ".");
    process.exit();


  }

}

async function clearFiles() {
  console.clear();
  trulyClear = false;
  rl.question(chalk.bold.red('Are you sure ') + 'you would like to clear ' + chalk.red.bold('all ') + 'files?\n' + chalk.bold.greenBright('\n1: Yes') + chalk.bold.red('\n2: No\n'), async (answer) => {
    switch (answer) {
      case '1':
        trulyClear = true
        break;
      case '2':
        startProgram();
        break;
      default:
        console.clear()
        console.log('Only enter ' + chalk.bold.greenBright("1") + " or " + chalk.bold.red("2" + '!'));
        for (let i = 3; i > 0; i--) {
          console.log(chalk.bold.red(i));
          if (i === 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await clearFiles();
          } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
        break;
    }
    if (trulyClear == true) {
      console.clear();
      try {
        let counter = 0;
        const outputFiles = ['words.txt', 'frequency.txt', 'kanji.txt'];
        fs.writeFile('./output/words.txt', '');
        fs.writeFile('./output/frequency.txt', '');
        fs.writeFile('./output/kanji.txt', '');
        for (const file of outputFiles) {
          counter++;
          stdout.write(('\rCleared ') + chalk.bold.red(`${counter}`) + ' of ' + chalk.bold.red(`${outputFiles.length}`) + ' files.');
        }

        if (counter === outputFiles.length) {
          console.log(chalk.bold.greenBright('\nSuccessfully ') + 'cleared all ' + chalk.bold.red(`${outputFiles.length}`) + ' files.');
          for (let i = 3; i > 0; i--) {
            console.log(chalk.bold.red(i));
            if (i === 1) {
              await new Promise((resolve) => setTimeout(resolve, 200));
              startProgram();
            } else {
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
        }

      } catch (error) {
        console.log(error);
      }
    }

  })
}

async function writeKanji(rubyWords) {
  if (rubyWords.length === 0) {
    console.log(`No kanji words to write.`);
  } else {
    try {
      // Prepare the data to be appended with a newline
      const newData = rubyWords.join("\n") + "\n";

      // Append the data to the file asynchronously
      const outputFilePath = "./output/words.txt";
      await fs.appendFile(outputFilePath, newData);

      //console.log(``);
    } catch (error) {
      console.error(`Error writing to file: ${error}`);
      process.exit();
    }
  }
}