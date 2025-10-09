const axios = require('axios');
const cheerio = require('cheerio');

async function testAllJobs() {
    // Test multiple URL formats to find the correct one
    const urlsToTest = [
        'https://www.alljobs.co.il/Jobs/SearchJobs.aspx?FreeText=developer&page=1',
        'https://www.alljobs.co.il/searchjobs.aspx?q=developer',
        'https://www.alljobs.co.il/search?q=developer',
        'https://www.alljobs.co.il/?q=developer',
        'https://www.alljobs.co.il/jobs?search=developer',
        'https://www.alljobs.co.il/jobs/search/?q=developer'
    ];

    for (let searchUrl of urlsToTest) {
        console.log('\n=== Testing URL:', searchUrl, '===');
        try {
        console.log('Testing URL:', searchUrl);
        
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
        
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers['content-type']);
        console.log('Content Length:', response.data.length);
        
        // Save first 2000 chars to see structure
        console.log('\n--- First 2000 characters of HTML ---');
        console.log(response.data.substring(0, 2000));
        
        const $ = cheerio.load(response.data);
        
        // Test various selectors
        console.log('\n--- Selector Tests ---');
        console.log('Title:', $('title').text());
        console.log('.JobListRow count:', $('.JobListRow').length);
        console.log('.JobListItem count:', $('.JobListItem').length);
        console.log('.job-row count:', $('.job-row').length);
        console.log('.job-item count:', $('.job-item').length);
        console.log('a[href] count:', $('a[href]').length);
        console.log('div count:', $('div').length);
        
        // Look for any elements that might contain job listings
        console.log('\n--- Looking for job-related classes ---');
        const jobClasses = [];
        $('[class*="job" i], [class*="Job" i], [id*="job" i], [id*="Job" i]').each((i, elem) => {
            const className = $(elem).attr('class');
            const id = $(elem).attr('id');
            if (className) jobClasses.push(className);
            if (id) jobClasses.push(`#${id}`);
        });
        
        const uniqueJobClasses = [...new Set(jobClasses)];
        console.log('Found job-related classes/IDs:', uniqueJobClasses.slice(0, 10));
        
        } catch (error) {
            console.error('Error for URL:', searchUrl);
            console.error('Error message:', error.message);
            if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response headers:', error.response.headers);
            }
        }
    }
}

testAllJobs();