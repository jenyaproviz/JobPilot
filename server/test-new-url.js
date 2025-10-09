const axios = require('axios');
const cheerio = require('cheerio');

async function testNewAllJobsUrl() {
    try {
        console.log('🇮🇱 Testing new AllJobs URL format');
        const searchUrl = 'https://www.alljobs.co.il/?q=developer';
        console.log('📡 Requesting URL:', searchUrl);
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        };
        
        const response = await axios.get(searchUrl, { 
            headers,
            timeout: 15000,
            maxRedirects: 5
        });
        
        console.log('📄 Response status:', response.status);
        console.log('📄 Response length:', response.data.length);
        
        const $ = cheerio.load(response.data);
        
        // Check what selectors are available for job listings
        console.log('🔍 Testing CSS selectors:');
        console.log('.JobListRow count:', $('.JobListRow').length);
        console.log('.JobListItem count:', $('.JobListItem').length);
        console.log('.job-row count:', $('.job-row').length);
        console.log('.job-item count:', $('.job-item').length);
        
        // Check job-related elements found in the DOM scan
        console.log('[data-job] count:', $('[data-job]').length);
        console.log('[class*="job"] count:', $('[class*="job" i]').length);
        console.log('[id*="job"] count:', $('[id*="job" i]').length);
        
        // Let's see what actual job-related content might be there
        const jobElements = $('[class*="job" i], [id*="job" i], [data-job]');
        console.log('Found', jobElements.length, 'potential job elements:');
        
        jobElements.slice(0, 10).each((i, elem) => {
            const $elem = $(elem);
            console.log(`  ${i+1}. Tag: ${elem.tagName}, Class: "${$elem.attr('class')}", ID: "${$elem.attr('id')}", Text preview: "${$elem.text().substring(0, 100)}"`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

testNewAllJobsUrl();