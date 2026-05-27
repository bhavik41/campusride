import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/my-rides
router.get('/my-rides', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rides = await prisma.ride.findMany({
      where: { driverId: req.user!.id },
      include: {
        bookings: {
          where: { status: { not: 'CANCELLED' } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isStudent: true,
              },
            },
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { departureDate: 'desc' },
    });

    res.json({ rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

// GET /api/dashboard/my-bookings
router.get('/my-bookings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                isStudent: true,
                university: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;
