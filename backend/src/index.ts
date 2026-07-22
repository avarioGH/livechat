import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { initSocket } from './services/socketService';
import authRoutes from './routes/auth';
import billingRoutes from './routes/billing';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for the widget
    methods: ['GET', 'POST']
  }
});

// Init Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Live Chat API is running' });
});

// Init WebSocket Service
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
