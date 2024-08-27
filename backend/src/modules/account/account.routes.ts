import express from 'express';
import * as accountController from './account.controller';
import * as transactionController from '../transaction/transaction.controller';
import { authenticate } from '../../shared/middlewares/auth';
import { validateAccountCreation, validateBalanceUpdate } from './account.validation';

const router = express.Router();

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountType
 *               - accountName
 *               - currency
 *             properties:
 *               accountType:
 *                 type: string
 *               accountName:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validateAccountCreation, accountController.createAccount);

/**
 * @swagger
 * /api/accounts/{accountId}:
 *   get:
 *     summary: Get account details
 *     tags: [Accounts]
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
 *         description: Account details retrieved successfully
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:accountId', authenticate, accountController.getAccount);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get user's accounts
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's accounts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, accountController.getUserAccounts);

/**
 * @swagger
 * /api/accounts/{accountId}/balance:
 *   put:
 *     summary: Update account balance
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Account balance updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:accountId/balance', authenticate, validateBalanceUpdate, accountController.updateBalance);

/**
 * @swagger
 * /api/accounts/{accountId}/transactions:
 *   get:
 *     summary: Get account's transactions
 *     tags: [Accounts]
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
router.get('/:accountId/transactions', authenticate, transactionController.getAccountTransactions);

/**
 * @swagger
 * /api/accounts/{accountId}/deactivate:
 *   put:
 *     summary: Deactivate account
 *     tags: [Accounts]
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
 *         description: Account deactivated successfully
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:accountId/deactivate', authenticate, accountController.deactivateAccount);

export default router;