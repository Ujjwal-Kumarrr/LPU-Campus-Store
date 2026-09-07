import express from 'express';
import { getDb, saveDb } from '../db.js';

const router = express.Router();

// Register new LPU student
router.post('/register', (req, res) => {
  const { name, regNo, email, phone, hostel, room, password } = req.body;

  if (!name || !regNo || !phone || !hostel || !password) {
    return res.status(400).json({ error: 'Please provide all required fields (Name, Reg No, Phone, Hostel, Password).' });
  }

  // Basic LPU validation
  const cleanRegNo = String(regNo).trim();
  const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanRegNo}@lpu.in`;

  const db = getDb();
  const existingUser = db.users.find(
    u => u.regNo === cleanRegNo || (email && u.email.toLowerCase() === cleanEmail)
  );

  if (existingUser) {
    return res.status(409).json({ error: 'A student with this Registration Number or Email is already registered.' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name: name.trim(),
    regNo: cleanRegNo,
    email: cleanEmail,
    phone: phone.trim(),
    hostel: hostel.trim(),
    room: room ? room.trim() : '',
    password: password,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ message: 'Registration successful!', user: safeUser });
});

// Login
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Registration Number/Email and password are required.' });
  }

  const db = getDb();
  const cleanId = String(identifier).trim().toLowerCase();

  const user = db.users.find(
    u => u.regNo.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid LPU Registration Number/Email or password.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ message: 'Logged in successfully', user: safeUser });
});

// Get demo test users for instant test sign-in
router.get('/demo-users', (req, res) => {
  const db = getDb();
  const demoUsers = db.users.map(({ password, ...u }) => u);
  res.json(demoUsers);
});

// Get user profile
router.get('/profile/:id', (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Student not found' });
  }
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
