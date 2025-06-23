/**
 * Express App - Main application file
 * Tích hợp VNPay cho hệ thống TMDT
 */

import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (for VNPay demo pages)
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'jade');

// Routes
import vnpayRoutes from './routes/vnpayRoutes.js';

// API Routes
app.use('/api/vnpay', vnpayRoutes);

// Legacy VNPay routes (for backward compatibility)
app.use('/order', vnpayRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TMDT VNPay Integration Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

export default app;