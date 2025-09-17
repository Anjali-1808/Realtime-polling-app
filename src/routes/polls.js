const express = require('express');
const prisma = require('../prismaClient');

module.exports = (io) => {
  const router = express.Router();

  // Get all polls
  router.get('/', async (req, res) => {
    try {
      const polls = await prisma.poll.findMany({
        include: {
          options: { include: { votes: true } },
          creator: { select: { id: true, name: true, email: true } }
        }
      });

      const formatted = polls.map((poll) => ({
        id: poll.id,
        question: poll.question,
        isPublished: poll.isPublished,
        creator: poll.creator,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
        options: poll.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes.length
        }))
      }));

      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'internal error' });
    }
  });

  // Create a new poll
  router.post('/', async (req, res) => {
    try {
      const { question, creatorId, options } = req.body;
      if (!question || !options || !options.length) return res.status(400).json({ error: 'question and options required' });

      let finalCreatorId = creatorId;
      if (!finalCreatorId) {
        let demoUser = await prisma.user.findUnique({ where: { email: 'demo@polls.com' } });
        if (!demoUser) {
          demoUser = await prisma.user.create({ data: { name: 'Demo User', email: 'demo@polls.com', passwordHash: 'demo' } });
        }
        finalCreatorId = demoUser.id;
      }

      const poll = await prisma.poll.create({
        data: {
          question,
          isPublished: true,
          creator: { connect: { id: finalCreatorId } },
          options: { create: options.map((text) => ({ text })) }
        },
        include: { options: true }
      });

      res.status(201).json(poll);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'internal error' });
    }
  });

  // Get single poll
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const poll = await prisma.poll.findUnique({
        where: { id: parseInt(id) },
        include: { options: { include: { votes: true } }, creator: { select: { id: true, name: true, email: true } } }
      });
      if (!poll) return res.status(404).json({ error: 'not found' });

      const options = poll.options.map(opt => ({ id: opt.id, text: opt.text, votes: opt.votes.length }));
      res.json({ ...poll, options });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'internal error' });
    }
  });

  // Submit a vote (only one vote per poll per user)
  router.post('/:id/vote', async (req, res) => {
    try {
      const pollId = parseInt(req.params.id);
      const { userId, pollOptionId } = req.body;

      if (!userId || !pollOptionId) return res.status(400).json({ error: 'userId and pollOptionId required' });

      // Ensure option belongs to poll
      const option = await prisma.pollOption.findUnique({ where: { id: pollOptionId } });
      if (!option || option.pollId !== pollId) return res.status(400).json({ error: 'option does not belong to poll' });

      // Check if user already voted in this poll
      const existingVote = await prisma.vote.findFirst({ where: { userId, pollOption: { pollId } } });
      if (existingVote) return res.status(400).json({ error: 'You already voted in this poll' });

      await prisma.vote.create({ data: { userId, pollOptionId } });

      const optionsWithCounts = await prisma.pollOption.findMany({ where: { pollId }, include: { votes: true } });
      const payload = optionsWithCounts.map(o => ({ id: o.id, text: o.text, votes: o.votes.length }));

      io.to(`poll_${pollId}`).emit('voteUpdate', { pollId, options: payload });
      res.json({ success: true, updated: payload });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'internal error' });
    }
  });

  return router;
};
