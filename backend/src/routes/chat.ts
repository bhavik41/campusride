import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper: get or create a conversation between two users for a ride
async function getOrCreateConversation(rideId: string, userA: string, userB: string) {
  // Ensure consistent ordering so the unique constraint works
  const [participantA, participantB] = [userA, userB].sort();

  let conversation = await prisma.conversation.findUnique({
    where: { rideId_participantA_participantB: { rideId, participantA, participantB } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { rideId, participantA, participantB },
    });
  }

  return conversation;
}

// GET /api/chat/conversations - list all conversations for current user
router.get('/conversations', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantA: userId }, { participantB: userId }],
      },
      include: {
        ride: {
          select: { id: true, fromCity: true, toCity: true, departureDate: true, status: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Attach the "other" participant's info
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.participantA === userId ? conv.participantB : conv.participantA;
        const other = await prisma.user.findUnique({
          where: { id: otherId },
          select: { id: true, name: true, avatar: true, isStudent: true },
        });

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            readAt: null,
          },
        });

        return { ...conv, otherUser: other, unreadCount };
      })
    );

    res.json({ conversations: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/conversations - start or get a conversation with a user about a ride
router.post('/conversations', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId, otherUserId } = req.body;

    if (!rideId || !otherUserId) {
      res.status(400).json({ error: 'rideId and otherUserId are required' });
      return;
    }

    if (otherUserId === req.user!.id) {
      res.status(400).json({ error: 'Cannot start a conversation with yourself' });
      return;
    }

    // Verify ride exists
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    // Verify other user exists
    const other = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, avatar: true, isStudent: true },
    });
    if (!other) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const conversation = await getOrCreateConversation(rideId, req.user!.id, otherUserId);

    res.json({ conversation: { ...conversation, otherUser: other } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/chat/conversations/:id/messages - get messages for a conversation
router.get('/conversations/:id/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Only participants can read messages
    if (conversation.participantA !== userId && conversation.participantB !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: req.params.id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/chat/conversations/:id/messages - send a message (REST fallback)
router.post('/conversations/:id/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { body } = req.body;

    if (!body?.trim()) {
      res.status(400).json({ error: 'Message body is required' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    if (conversation.participantA !== userId && conversation.participantB !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: userId,
        body: body.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/chat/unread-count - total unread messages for current user
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ participantA: userId }, { participantB: userId }] },
      select: { id: true },
    });

    const convIds = conversations.map((c) => c.id);

    const count = await prisma.message.count({
      where: {
        conversationId: { in: convIds },
        senderId: { not: userId },
        readAt: null,
      },
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
