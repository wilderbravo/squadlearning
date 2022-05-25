import { Router } from 'express';
var router = Router();
import DB from '../services/DB';

/* GET users listing. */
router.get('/', async function (req, res, next) {
  const accounts = await DB('accounts').select(['username', 'email']);
  return res.json(accounts);
});

export default router;