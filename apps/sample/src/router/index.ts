import { Request, Response, Router } from 'express';

const router = Router();

router.get('/user', (req: Request, res: Response) => {
  try {
    res.send({ status: 'success' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// router.get('/err', Treblle.errorHandler(errorRoute));

async function errorRoute(req: Request, res: Response) {
  throw new Error('Error route was called now');
  res.send({ message: 'Success message' });
}

export default router;
