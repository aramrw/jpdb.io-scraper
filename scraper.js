const { readlink } = require("fs");
const puppeteer = require("puppeteer");
const readline = require("readline");
const { arrayBuffer } = require("stream/consumers");
const fs = require("fs");
process.setMaxListeners(50); // You can adjust the number based on your needs

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt the user for input
enterAnimeName();

function enterAnimeName() {
  rl.question("Please enter the novel or anime title: ", async (searchQuery) => {
    if (searchQuery.length < 2) {
      console.log("Anime title must be longer than 2 letters");
      enterAnimeName();
    } else {
      await mainApp(searchQuery);
    }
  });
}

function mainApp(searchQuery) {
  (async () => {
    const browser = await puppeteer.launch({
      headless: "old",
    });
    const page = await browser.newPage();

    // Navigate to jpdb.io
    await page.goto("https://jpdb.io/prebuilt_decks");

    // Input the user's search query
    await page.type('input[name="q"]', searchQuery);

    // Click the search button
    await page.keyboard.press("Enter");

    // Wait for the results to load
    let resultsLoaded = false;
    try {
      await page.waitForXPath("/html/body/div/div/div/div/div/a", { timeout: 1000 });
      resultsLoaded = true;
    } catch (e) {
      //console.log(`"${searchQuery}" doesnt exist.`)
    }

    if (resultsLoaded) {
      // Get the list of anime names
      const animeNames = await page.evaluate(() => {
        const nameElements = document.querySelectorAll("h5");
        return Array.from(nameElements, (element) => element.textContent.trim());
      });

      // Check anime name
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      const matchingAnime = [];

      let animeFound = false;
      let animeAmount = 0;

      const lowerCaseAnimeNamesArray = animeNames.map((name) => name.toLowerCase());

      for (const animeName of animeNames) {
        //const lowerCaseAnimeName = animeName.toLowerCase();
        const exactMatch = lowerCaseAnimeNamesArray.some((name) => name.includes(lowerCaseSearchQuery));
        const closeMatch = lowerCaseAnimeNamesArray.some((name) => name.slice(-15).includes(lowerCaseSearchQuery.slice(-15)));

        if (exactMatch || closeMatch) {
          animeFound = true;
          matchingAnime.push(animeName);
        }
      }

      if (animeFound) {
        //console.log(` ${matchingAnime.length} Anime including "${searchQuery}" have been FOUND.\n`);
        //display matching anime names
        matchingAnime.forEach((anime, index) => {
          console.log(`${index + 1}: ${anime}`);
        });

        // pick the correct anime
        pickAnimeNumber(matchingAnime);
        function pickAnimeNumber(matchingAnime) {
          rl.question("Select an anime by entering its number: \n", async (selection) => {
            const selectedIndex = parseInt(selection) - 1;
            if (selectedIndex >= 0 && selectedIndex < matchingAnime.length) {
              const selectedAnime = matchingAnime[selectedIndex];
              console.log(`You selected: ${selectedAnime}.\n`);

              // Wait for anchor links
              await page.waitForXPath("/html/body/div/div/div/div/div/a"); // always works

              // Get the list of anchor links
              const anchorLinks = await page.evaluate(() => {
                const nameElements = document.querySelectorAll("a");
                return Array.from(nameElements, (element) => element.getAttribute("href"));
              });

              let anchorLinkFound = false;
              const modifiedSelectedAnime = selectedAnime.replace(":", "").split(" ").join("-").toLowerCase();

              for (const anchorLink of anchorLinks) {
                // Debug
                //console.log(anchorLink);
                function foundHref(selectedAnime, anchorLink) {
                  rl.question("Please enter search offset divisible by 50: ", async (vocabOffset) => {
                    rl.question("Please # of enter pages to scrape: ", async (pageAmount) => {
                      const newVocabOffset = Number(vocabOffset);
                      const totalPages = Math.min(Number(pageAmount), 100);
                      let pageTracker = 0;

                      for (let i = 1; i <= totalPages; i++) {
                        await scrapePage(anchorLink, selectedAnime, newVocabOffset + (i - 1) * 50);
                        pageTracker++;
                        console.log(`${pageTracker} of ${totalPages} pages`);
                      }
                      await browser.close();
                      console.log(`Successfully scraped all ${pageTracker} pages.\n`);
                      console.log("Would you like to scrape another anime?");

                      scrapeAgain();

                      function scrapeAgain() {
                        rl.question("1: Yes\n2: No\n", async (yesNo) => {
                          switch (Number(yesNo)) {
                            case 1:
                              enterAnimeName();
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
                  });
                }

                if (!anchorLink.includes("/stats") && anchorLink.toLowerCase().includes(modifiedSelectedAnime)) {
                  // Check url
                  //console.log(anchorLink);
                  anchorLinkFound = true;
                  await browser.close();
                  foundHref(selectedAnime, anchorLink);
                  // Enter a search offset + pages
                } else if (!anchorLink.includes("/stats") && anchorLink.includes("/web-novel")) {
                  // Check url
                  //console.log(anchorLink);
                  foundHref(selectedAnime, anchorLink);
                } else {
                  if ((anchorLinkFound = false)) {
                    console.log(`Anchor link for ${modifiedSelectedAnime} not found!\n`);
                    await browser.close();
                    enterAnimeName();
                  }
                }
              }
              // TODO: scrape frequency data
            } else {
              console.log("Invalid Selection.\n");
              await browser.close();
              enterAnimeName();
            }
          });
        }
      } else {
        console.log(`0 Anime including "${searchQuery}" have been found. \n`);
        await browser.close();
        enterAnimeName();
      }
    } else {
      console.log(`0 Anime including "${searchQuery}" have been found. \n`);
      await browser.close();
      enterAnimeName();
    }
  })();
}

async function scrapePage(anchorLink, selectedAnime, newVocabOffset) {
  const browser = await puppeteer.launch({
    headless: "old",
  });
  const page = await browser.newPage();

  let vocabListLink = anchorLink.toString() + `/vocabulary-list?offset=${newVocabOffset}&sort_by=by-frequency-global`;
  await page.goto(`https://jpdb.io${vocabListLink}`);
  //console.log(`vocab link: ${vocabListLink}`);

  // Check if current page contains a Next Page button
  const nextPage = await page.evaluate(() => {
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
    console.log("No next button!\n");
    await browser.close();
    process.exit();
  }

  // Get list of ruby words
  await page.waitForXPath("//ruby");
  const rubyWords = await page.evaluate(() => {
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
  } else {
    //console.log(rubyWords);
    writeKanji(rubyWords);
  }

  await browser.close();
}

async function writeKanji(rubyWords) {
  if (rubyWords.length === 0) {
    console.log(`No kanji words to write.`);
  } else {
    try {
      // Prepare the data to be appended with a newline
      const newData = rubyWords.join("\n") + "\n";

      // Append the data to the file asynchronously
      const outputFilePath = "kanji_words.txt";
      await fs.promises.appendFile(outputFilePath, newData);

      //console.log(``);
    } catch (error) {
      console.error(`Error writing to file: ${error}`);
    }
  }
}
