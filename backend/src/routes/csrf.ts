import { Router } from 'express';

const router = Router();

router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

export default router;
