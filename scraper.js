const { readlink } = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline');
const { arrayBuffer } = require('stream/consumers');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Prompt the user for input
    rl.question('Please enter the novel or anime title: ', async (searchQuery) => {
        // Navigate to jpdb.io
        await page.goto('https://jpdb.io/prebuilt_decks');

        // Input the user's search query
        await page.type('input[name="q"]', searchQuery);

        // Click the search button
        await page.keyboard.press('Enter');

        // Wait for the results to load
        await page.waitForXPath('/html/body/div/div/div/div/div/a');

        // Get the list of anime names
        const animeNames = await page.evaluate(() => {
            const nameElements = document.querySelectorAll('h5');
            return Array.from(nameElements, element => element.textContent.trim());
        });

        // Check anime name
        const lowerCaseSearchQuery = searchQuery.toLowerCase();
        const matchingAnime = [];

        let animeFound = false;
        let animeAmount = 0;

        for (const animeName of animeNames) {
            const lowerCaseAnimeNames = animeName.toLowerCase();
            let includesTitle = lowerCaseAnimeNames.includes(lowerCaseSearchQuery);
            if (includesTitle) {
                animeFound = true;
                matchingAnime.push(animeName);
            }
        }

        if (animeFound) {
            console.log(` ${matchingAnime.length} Anime including "${searchQuery}" have been FOUND.\n`);

            //display matching anime names
            matchingAnime.forEach((anime, index) => {
                console.log(`${index + 1}: ${anime}`);
            })

            // pick the correct anime
            rl.question('Select an anime by entering its number: \n', async (selection) => {
                const selectedIndex = parseInt(selection) - 1;
                if (selectedIndex >= 0 && selectedIndex < matchingAnime.length) {
                    const selectedAnime = matchingAnime[selectedIndex];
                    console.log(`You selected: ${selectedAnime}.\n`);

                    // Wait for anchor links 
                    await page.waitForXPath('/html/body/div/div/div/div/div/a');

                    // Get the list of anchor links
                    const anchorLinks = await page.evaluate(() => {
                        const nameElements = document.querySelectorAll('a');
                        return Array.from(nameElements, element => element.getAttribute('href'));
                    });

                    let anchorLinkFound = false;
                    let skipCounter = 0;
                    const modifiedSelectedAnime = selectedAnime.replace(':', '').split(' ').join('-').toLowerCase();

                    for (const anchorLink of anchorLinks) {
                            if(!(anchorLink.includes("/stats")) && anchorLink.includes(modifiedSelectedAnime)){
                                skipCounter++;

                                // console.log(anchorLink); Check anchor url
                                if (anchorLink.includes(modifiedSelectedAnime)) {
                                    anchorLinkFound = true;

                                    rl.question('Please enter search offset: ', async (vocabOffset) => {
                                        vocabListLink = anchorLink.toString() + `/vocabulary-list?offset=${vocabOffset}&sort_by=by-frequency-global`;
                                        await page.goto(`https://jpdb.io${vocabListLink}`);
                                        console.log(`Frequency link of ${selectedAnime} found.\n`);
                                        
                                        // TODO: scrape frequency data
                                    await page.waitForXPath('//ruby');

                                        // Get list of ruby words
                                        const rubyWords = await page.evaluate(() => {
                                        const nameElements = document.querySelectorAll('ruby');
                                        return Array.from(nameElements, element => element.textContent.trim());
                                    });
                                        if(rubyWords == "" || rubyWords == null){
                                            console.log(`Invalid offset amount: ${rubyWords}`);
                                        }else{
                                             // Write rubyWords to a text file
                                            const outputFilePath = "ruby_words.txt"
                                            fs.writeFileSync(outputFilePath, rubyWords.join('\n'), { encoding: 'utf-8' });
                                            

                                            console.log(`Ruby words written to ${outputFilePath}`);
                                        }
                                       
                                    })
                                    
                                }else{
                                    if(anchorLinkFound = false){
                                        console.log(`Anchor link for ${modifiedSelectedAnime} not found!\n`);
                                        break;
                                    }
                                }
                            }else{
                                if(anchorLinkFound = false){
                                    console.log(`Anchor link for ${modifiedSelectedAnime} not found!\n`);
                                    break;
                                }
                            }
                       
                    }
                        // TODO: scrape frequency data
                } else {
                    console.log('Invalid Selection.\n');
                }
            });

        } else {
            console.log(`0 Anime including "${searchQuery}" have been found. \n`);
            await browser.close();
            process.exit();
        }

    });
})();
