import express from 'express';
import * as transactionController from './transaction.controller';
import { authenticate } from '../../shared/middlewares/auth';
import { adminAuth } from '../../shared/middlewares/adminAuth';
import { validateTransactionCreation, validateTransactionStatusUpdate } from './transaction.validation';

const router = express.Router();

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - type
 *               - amount
 *               - currency
 *               - description
 *             properties:
 *               accountId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CREDIT, DEBIT]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               description:
 *                 type: string
 *               subType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validateTransactionCreation, transactionController.createTransaction);

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction details
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:transactionId', authenticate, transactionController.getTransaction);

/**
 * @swagger
 * /api/transactions/account/{accountId}:
 *   get:
 *     summary: Get account's transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account's transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/account/:accountId', authenticate, transactionController.getAccountTransactions);

/**
 * @swagger
 * /api/transactions/{transactionId}/status:
 *   put:
 *     summary: Update transaction status (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [COMPLETED, FAILED]
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/:transactionId/status', authenticate, adminAuth, validateTransactionStatusUpdate, transactionController.updateTransactionStatus);

export default router;