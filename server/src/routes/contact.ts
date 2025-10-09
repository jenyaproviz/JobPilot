import express from 'express';
import { sendContactEmail } from '../controllers/contact';

const router = express.Router();

// POST /api/contact - Send contact email
router.post('/', sendContactEmail);

export default router;