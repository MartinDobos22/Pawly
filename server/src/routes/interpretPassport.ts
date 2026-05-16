import { Router, Request, Response, NextFunction } from 'express';
import { interpretHealthPassportWithOpenAI } from '../services/aiService';
import { logger } from '../utils/logger';

const router = Router();

const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 50000;

interface InterpretBody {
  text?: unknown;
}

router.post(
  '/',
  async (req: Request<object, object, InterpretBody>, res: Response, next: NextFunction) => {
    try {
      const text = typeof req.body?.text === 'string' ? req.body.text : '';

      if (!text || text.length < MIN_TEXT_LENGTH) {
        res
          .status(400)
          .json({ error: { message: 'Text je príliš krátky na interpretáciu pasu.' } });
        return;
      }

      if (text.length > MAX_TEXT_LENGTH) {
        res.status(400).json({
          error: { message: `Text presahuje povolený limit ${MAX_TEXT_LENGTH} znakov.` },
        });
        return;
      }

      logger.info('Backend prijal interpret-passport požiadavku', { textLength: text.length });

      const result = await interpretHealthPassportWithOpenAI(text);

      if (!result) {
        res.status(502).json({
          error: { message: 'Interpretácia pasu zlyhala. Skús to znova alebo skontroluj text.' },
        });
        return;
      }

      logger.info('Interpretácia pasu dokončená', {
        vaccinationsCount: result.vaccinations?.length ?? 0,
      });

      res.json(result);
    } catch (error) {
      logger.error('Interpretácia pasu zlyhala', {
        message: error instanceof Error ? error.message : String(error),
      });
      next(error);
    }
  }
);

export default router;
