import 'dotenv/config';
import http from 'node:http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { connectDatabase } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import liftRoutes from './routes/liftRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import { registerLocationSocket } from './sockets/locationSocket.js';

const app = express();
const server = http.createServer(app);
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);
const origins = process.env.NODE_ENV === 'production'
  ? configuredOrigins
  : [...new Set([...configuredOrigins, 'http://localhost:5173', 'http://127.0.0.1:5173'])];
const io = new Server(server, { cors: { origin: origins, credentials: true } });

app.set('io', io);
app.use(helmet());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/lifts', liftRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/salary-slips', salaryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use(notFound);
app.use(errorHandler);

registerLocationSocket(io);

const port = Number(process.env.PORT || 5000);
connectDatabase()
  .then(() => server.listen(port, () => console.info(`Lift Management API listening on ${port}`)))
  .catch((error) => {
    console.error('Could not start API:', error.message);
    process.exit(1);
  });
