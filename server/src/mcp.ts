import dotenv from 'dotenv';
import path from 'path';
import { JobPilotMCPServer } from './services/MCPServer';

dotenv.config({ path: path.join(__dirname, '../.env') });

let mcpServer: JobPilotMCPServer | null = null;

async function startMCPServer() {
  try {
    mcpServer = new JobPilotMCPServer();
    await mcpServer.start();
    console.log('📡 JobPilot MCP server ready on stdio');
  } catch (error) {
    console.error('❌ Failed to start JobPilot MCP server', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  if (mcpServer) {
    await mcpServer.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (mcpServer) {
    await mcpServer.stop();
  }
  process.exit(0);
});

startMCPServer();