const puppeteer = require('puppeteer');

async function testPuppeteerAllJobs() {
    let browser = null;
    try {
        console.log('🚀 Launching Puppeteer browser...');
        
        browser = await puppeteer.launch({
            headless: true, // Set to false to see the browser
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        const page = await browser.newPage();
        
        // Set user agent and viewport to mimic real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });
        
        // Set additional headers to appear more like a real browser
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        });
        
        console.log('🌐 Navigating to AllJobs.co.il...');
        const searchUrl = 'https://www.alljobs.co.il/?q=developer';
        
        // Try to navigate with more forgiving options
        try {
            await page.goto(searchUrl, { 
                waitUntil: 'domcontentloaded', 
                timeout: 15000 
            });
        } catch (timeoutError) {
            console.log('⚠️  Navigation timeout, but continuing...');
        }
        
        console.log('📄 Page loaded, checking for security verification...');
        
        // Check if we hit anti-bot protection
        const pageTitle = await page.title();
        const pageText = await page.evaluate(() => document.body.innerText);
        
        if (pageTitle.includes('Radware') || pageText.includes('Verifying your browser')) {
            console.log('🛡️  Detected anti-bot protection. Waiting for verification...');
            
            // Wait longer for the verification to complete
            let attempts = 0;
            while (attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts++;
                
                const currentTitle = await page.title();
                const currentText = await page.evaluate(() => document.body.innerText);
                
                if (!currentTitle.includes('Radware') && !currentText.includes('Verifying your browser')) {
                    console.log('✅ Anti-bot verification completed!');
                    break;
                }
                
                console.log(`⏳ Still verifying... (attempt ${attempts}/10)`);
            }
            
            if (attempts >= 10) {
                console.log('❌ Anti-bot verification did not complete. The site may be blocking automated access.');
                return false;
            }
        } else {
            // Wait a bit for JavaScript to load content
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Try to find job-related elements
        console.log('🔍 Looking for job elements...');
        
        // Check various possible selectors for job listings
        const jobSelectors = [
            '.job-item',
            '.job-row', 
            '.JobListItem',
            '.JobListRow',
            '[data-job]',
            '.job-card',
            '.position',
            '.vacancy',
            'article',
            '.search-result'
        ];
        
        let jobElements = [];
        for (const selector of jobSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
                jobElements = elements;
                break;
            } else {
                console.log(`❌ No elements found for selector: ${selector}`);
            }
        }
        
        if (jobElements.length === 0) {
            console.log('🔍 No job elements found with standard selectors. Checking page content...');
            
            // Get page title and some content info
            const title = await page.title();
            const bodyText = await page.evaluate(() => document.body.innerText);
            
            console.log('📄 Page title:', title);
            console.log('📊 Body text length:', bodyText.length);
            console.log('📝 First 500 chars:', bodyText.substring(0, 500));
            
            // Look for any elements that might contain jobs
            const allElementsCount = await page.evaluate(() => {
                return {
                    divs: document.querySelectorAll('div').length,
                    articles: document.querySelectorAll('article').length,
                    sections: document.querySelectorAll('section').length,
                    links: document.querySelectorAll('a[href]').length,
                    jobRelated: document.querySelectorAll('[class*="job" i], [id*="job" i]').length
                };
            });
            
            console.log('📊 Element counts:', allElementsCount);
            
            // Check if there are any search results or loading indicators
            const searchInfo = await page.evaluate(() => {
                const searchResults = document.querySelector('#search-results, .search-results, .results, .jobs-list');
                const loading = document.querySelector('.loading, .spinner, [class*="load"]');
                const noResults = document.querySelector('.no-results, .empty, [class*="empty"]');
                
                return {
                    hasSearchResults: !!searchResults,
                    hasLoading: !!loading,
                    hasNoResults: !!noResults,
                    searchResultsText: searchResults ? searchResults.innerText.substring(0, 200) : null
                };
            });
            
            console.log('🔍 Search state:', searchInfo);
        } else {
            // Extract job information
            console.log(`🎯 Extracting job data from ${jobElements.length} elements...`);
            
            const jobs = await page.evaluate(() => {
                const articles = document.querySelectorAll('article');
                const jobData = [];
                
                console.log(`Found ${articles.length} article elements`);
                
                articles.forEach((element, index) => {
                    console.log(`Article ${index}:`, element.outerHTML.substring(0, 300));
                    
                    // Try multiple ways to extract job info
                    const allText = element.innerText.trim();
                    const hasJobKeywords = /job|position|developer|engineer|משרה|עבודה/i.test(allText);
                    
                    jobData.push({
                        index,
                        hasJobKeywords,
                        text: allText.substring(0, 200),
                        className: element.className,
                        innerHTML: element.innerHTML.substring(0, 200) + '...'
                    });
                });
                
                return jobData;
            });
            
            console.log('📋 Extracted jobs:', jobs);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

// Run the test
testPuppeteerAllJobs();