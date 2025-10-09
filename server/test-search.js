const puppeteer = require('puppeteer');

async function testRealJobSearch() {
    let browser = null;
    try {
        console.log('🚀 Launching browser for real job search simulation...');
        
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        const page = await browser.newPage();
        
        // Set realistic browser properties
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        });
        
        console.log('🌐 Navigating to AllJobs homepage...');
        
        // Go to homepage first
        await page.goto('https://www.alljobs.co.il', { 
            waitUntil: 'domcontentloaded', 
            timeout: 15000 
        });
        
        // Handle anti-bot protection
        const pageTitle = await page.title();
        if (pageTitle.includes('Radware')) {
            console.log('🛡️  Handling anti-bot protection...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        console.log('🔍 Looking for search functionality...');
        
        // Look for search input - focusing on Hebrew placeholders and common patterns
        const searchSelectors = [
            'input[placeholder*="חיפוש חופשי"]',  // "Free search" in Hebrew
            'input[placeholder*="חיפוש"]',        // "Search" in Hebrew  
            'input[placeholder*="מילות"]',        // "Keywords" in Hebrew
            'input[name*="search"]',
            'input[name*="keyword"]',
            'input[name*="q"]',
            'input.form-control',
            'input[type="text"]'
        ];
        
        let searchInput = null;
        for (const selector of searchSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                searchInput = await page.$(selector);
                if (searchInput) {
                    console.log(`✅ Found search input: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`❌ No search input found: ${selector}`);
            }
        }
        
        // Debug: Let's examine all inputs on the page
        console.log('🔍 Examining all input elements...');
        const allInputs = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input');
            const inputInfo = [];
            inputs.forEach((input, index) => {
                inputInfo.push({
                    index,
                    type: input.type,
                    name: input.name,
                    id: input.id,
                    className: input.className,
                    placeholder: input.placeholder,
                    value: input.value,
                    outerHTML: input.outerHTML.substring(0, 200)
                });
            });
            return inputInfo;
        });
        
        console.log('📋 All inputs found:', JSON.stringify(allInputs.slice(0, 5), null, 2)); // Show first 5
        
        if (searchInput) {
            console.log('📝 Performing search for "developer"...');
            
            // Clear and type in search box
            await page.focus(searchInput);
            await page.keyboard.selectAll();
            await page.keyboard.type('developer');
            
            // Look for search button
            const searchButtons = [
                'button[type="submit"]',
                'input[type="submit"]',
                '.search-btn',
                '.btn-search',
                'button.btn'
            ];
            
            let searchButton = null;
            for (const selector of searchButtons) {
                try {
                    searchButton = await page.$(selector);
                    if (searchButton) {
                        console.log(`✅ Found search button: ${selector}`);
                        break;
                    }
                } catch (e) {}
            }
            
            if (searchButton) {
                await searchButton.click();
                console.log('🔄 Search submitted, waiting for results...');
                
                // Wait for navigation or results to load
                try {
                    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
                } catch (e) {
                    console.log('⚠️  No navigation detected, checking for AJAX results...');
                }
                
                // Wait for results to load
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Now look for job results
                console.log('🎯 Looking for job results...');
                
                const jobResultSelectors = [
                    '.job-item', '.job-result', '.job-card', '.position',
                    '.search-result', '.result-item', '.job-listing',
                    '[data-job]', '.vacancy', 'tr.job', '.job-row'
                ];
                
                for (const selector of jobResultSelectors) {
                    const elements = await page.$$(selector);
                    if (elements.length > 0) {
                        console.log(`🎉 Found ${elements.length} job results with: ${selector}`);
                        
                        // Extract job data
                        const jobs = await page.evaluate((sel) => {
                            const items = document.querySelectorAll(sel);
                            const results = [];
                            
                            items.forEach((item, index) => {
                                if (index < 3) { // First 3 results
                                    results.push({
                                        text: item.innerText.trim().substring(0, 200),
                                        html: item.outerHTML.substring(0, 300)
                                    });
                                }
                            });
                            
                            return results;
                        }, selector);
                        
                        console.log('📋 Sample jobs:', jobs);
                        return true;
                    }
                }
                
                console.log('❌ No job results found after search');
                
            } else {
                console.log('❌ Could not find search button');
            }
            
        } else {
            console.log('❌ Could not find search input');
        }
        
        // Fallback: check page content
        console.log('🔍 Analyzing page content...');
        const pageAnalysis = await page.evaluate(() => {
            const body = document.body.innerText;
            return {
                title: document.title,
                hasJobs: /job|משרה|positions|דרושים/i.test(body),
                bodyLength: body.length,
                sample: body.substring(0, 500),
                elementCounts: {
                    divs: document.querySelectorAll('div').length,
                    forms: document.querySelectorAll('form').length,
                    inputs: document.querySelectorAll('input').length,
                    buttons: document.querySelectorAll('button').length
                }
            };
        });
        
        console.log('📊 Page analysis:', pageAnalysis);
        
        return false;
        
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

testRealJobSearch();