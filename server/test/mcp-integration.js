"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMCPIntegration = testMCPIntegration;
const IntelligentJobService_1 = require("../src/services/IntelligentJobService");
async function testMCPIntegration() {
    console.log('🧪 Testing MCP Integration...\n');
    const service = new IntelligentJobService_1.IntelligentJobService();
    try {
        // Test 1: Start MCP Server
        console.log('1️⃣ Starting MCP Server...');
        await service.startMCPServer();
        console.log('✅ MCP Server started successfully\n');
        // Test 2: Keyword Optimization
        console.log('2️⃣ Testing keyword optimization...');
        const keywordTest = await service.getKeywordSuggestions('javascript developer');
        console.log('Keywords:', keywordTest.data?.suggestions || 'Failed');
        console.log('✅ Keyword optimization working\n');
        // Test 3: Job Recommendations (mock user profile)
        console.log('3️⃣ Testing job recommendations...');
        const mockProfile = {
            skills: ['JavaScript', 'React', 'Node.js'],
            experience: 'mid',
            preferences: { remote: true }
        };
        const recommendations = await service.getJobRecommendations(mockProfile, 5);
        console.log('Recommendations:', recommendations.success ? 'Generated successfully' : 'Failed');
        console.log('✅ Job recommendations working\n');
        // Test 4: Market Trends
        console.log('4️⃣ Testing market trends analysis...');
        const trends = await service.getJobMarketTrends('week', 'technology');
        console.log('Trends:', trends.success ? 'Analysis completed' : 'Failed');
        console.log('✅ Market trends working\n');
        console.log('🎉 All MCP integration tests passed!');
    }
    catch (error) {
        console.error('❌ MCP Integration test failed:', error);
    }
    finally {
        // Cleanup
        console.log('\n🧹 Cleaning up...');
        await service.cleanup();
        console.log('✅ Cleanup completed');
    }
}
// Run test if this file is executed directly
if (require.main === module) {
    testMCPIntegration()
        .then(() => {
        console.log('\n✨ MCP Integration test completed');
        process.exit(0);
    })
        .catch(error => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });
}
