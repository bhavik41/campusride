import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const createRideSchema = z.object({
  fromCity: z.string().min(1, 'From city is required'),
  toCity: z.string().min(1, 'To city is required'),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
  departureDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  seats: z.number().int().min(1).max(8),
  pricePerSeat: z.number().min(0),
  rideType: z.enum(['SHORT_DISTANCE', 'LONG_DISTANCE']).default('LONG_DISTANCE'),
  description: z.string().optional(),
});

// GET /api/rides - list rides with optional filters
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { from, to, date, rideType } = req.query;

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      seatsLeft: { gt: 0 },
    };

    if (from) where.fromCity = { contains: String(from) };
    if (to) where.toCity = { contains: String(to) };
    if (rideType) where.rideType = String(rideType);
    if (date) {
      const searchDate = new Date(String(date));
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.departureDate = { gte: searchDate, lt: nextDay };
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        driver: {
          select: { id: true, name: true, email: true, isStudent: true, university: true, avatar: true },
        },
      },
      orderBy: { departureDate: 'asc' },
    });

    res.json({ rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

// POST /api/rides - create ride
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createRideSchema.parse(req.body);

    const ride = await prisma.ride.create({
      data: {
        driverId: req.user!.id,
        fromCity: data.fromCity,
        toCity: data.toCity,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        departureDate: new Date(data.departureDate),
        seats: data.seats,
        seatsLeft: data.seats,
        pricePerSeat: data.pricePerSeat,
        rideType: data.rideType,
        description: data.description,
      },
      include: {
        driver: {
          select: { id: true, name: true, email: true, isStudent: true, university: true, avatar: true },
        },
      },
    });

    res.status(201).json({ ride });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create ride' });
  }
});

// POST /api/rides/:id/book - book a seat (decrements seatsLeft atomically)
// GET /api/rides/:id - get ride details
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id },
      include: {
        driver: {
          select: { id: true, name: true, email: true, phone: true, isStudent: true, university: true, avatar: true, bio: true },
        },
      },
    });

    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    res.json({ ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ride' });
  }
});

export default router;
