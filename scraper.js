const puppeteer = require('puppeteer');
const readline = require('readline');
const { arrayBuffer } = require('stream/consumers');

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
        //await page.$x('/html/body/div[2]/form/input[1]', searchQuery);

        await page.type('input[name="q"]', searchQuery);

        // Click the search button
        await page.keyboard.press('Enter');

        // Wait for the results to load
        await page.waitForXPath('/html/body/div/div/div/div/div/a');

        // Get the list of anime names
        const animeNames = await page.evaluate(() => {
            const nameElements = document.querySelectorAll('h5');
            return Array.from(nameElements, element => element.textContent.trim());
        })

        // Check anime name 
        // console.log(`Checking jpdb.io for ${searchQuery} against ${animeNames}...`); 

        const lowerCaseSearchQuery = searchQuery.toLowerCase();

        let animeFound = false;
        let animeAmount =0;

        for (const animeName of animeNames) {
            
            const lowerCaseAnimeNames = animeName.toLowerCase();
            let includesTitle = lowerCaseAnimeNames.includes(lowerCaseSearchQuery);

            if(includesTitle) {
                animeFound = true;
                animeAmount++;
        }}

        if(animeFound) {
            console.log(` ${animeAmount} Anime including "${searchQuery}" have been FOUND.`)
        }else{
            console.log(`0 Anime including "${searchQuery}" have been found.`);
        }
       

        // Exit the script
        await browser.close();
        process.exit(); 
        
    });
})();
