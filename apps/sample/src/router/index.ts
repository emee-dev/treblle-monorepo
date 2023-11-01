import { Request, Response, Router } from 'express';
import { TreblleExpress } from 'treblle-express';

const router = Router();

// const Treblle = new TreblleExpress(router, { apiKey: process.env.TREBLLE_API_KEY, projectId: process.env.TREBLLE_PROJECT_ID })
//   .config({
//     environment: 'testing',
//     // environment: 'development',
//     debugEndpoints: ['https://webhook.site/e835c526-6b83-4eb2-ae19-e0ba517fc85d'],
//     // debugEndpoints: ['https://debug.treblle.com'],
//     maskValues: ['email', 'name'],
//     logError: true,
//   })
//   .listen()
//   .listen();

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
