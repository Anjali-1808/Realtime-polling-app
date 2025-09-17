const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');

const router = express.Router();

// ✅ Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    // Don’t return passwordHash
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'email already exists' });
    }
    res.status(500).json({ error: 'internal error' });
  }
});

// ✅ Get all users (optional, useful for debugging)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

// ✅ Get user by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;
