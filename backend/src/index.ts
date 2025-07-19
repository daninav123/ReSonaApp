import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { DatabaseConfig } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { RoutesConfig } from './config/routes';
import { WebSocketService } from './services/websocket';

dotenv.config();

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('ReSona Events CRM API is up');
});

// Configure routes
app.use(RoutesConfig.getInstance().getRouter());

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database
    await DatabaseConfig.getInstance().initialize();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Initialize WebSocket server
    const wss = WebSocketService.init(server);

    // WebSocket upgrade handling
    server.on('upgrade', (request: http.IncomingMessage, socket: any, head: Buffer) => {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.wss.emit('connection', ws, request);
      });
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  try {
    await DatabaseConfig.getInstance().close();
    console.log('✅ MongoDB connection closed');
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err);
  }
  process.exit(0);
});

startServer();
