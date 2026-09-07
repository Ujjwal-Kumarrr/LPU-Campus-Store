import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, saveDb } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lpu-cloth-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Image Upload Endpoint
router.post('/upload', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Get all products with filtering, search & sorting
router.get('/', (req, res) => {
  const db = getDb();
  let items = [...db.products];

  const { search, category, gender, hostel, size, minDiscount, maxPrice, sellerId, status, sort } = req.query;

  // Filter by search query
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.hostelBlock.toLowerCase().includes(q) ||
      p.pickupLocation.toLowerCase().includes(q)
    );
  }

  // Filter by category
  if (category && category !== 'all') {
    items = items.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by gender
  if (gender && gender !== 'all') {
    items = items.filter(p => p.gender === gender || p.gender === 'unisex');
  }

  // Filter by hostel
  if (hostel && hostel !== 'all') {
    items = items.filter(p => p.hostelBlock === hostel);
  }

  // Filter by size
  if (size && size !== 'all') {
    items = items.filter(p => p.size === size);
  }

  // Filter by minimum discount percentage
  if (minDiscount) {
    const minD = Number(minDiscount);
    if (!isNaN(minD)) {
      items = items.filter(p => p.discountPercent >= minD);
    }
  }

  // Filter by max selling price
  if (maxPrice) {
    const maxP = Number(maxPrice);
    if (!isNaN(maxP)) {
      items = items.filter(p => p.sellingPrice <= maxP);
    }
  }

  // Filter by seller ID
  if (sellerId) {
    items = items.filter(p => p.sellerId === sellerId);
  }

  // Filter by status
  if (status && status !== 'all') {
    items = items.filter(p => p.status === status);
  }

  // Sorting
  if (sort === 'price-low') {
    items.sort((a, b) => a.sellingPrice - b.sellingPrice);
  } else if (sort === 'price-high') {
    items.sort((a, b) => b.sellingPrice - a.sellingPrice);
  } else if (sort === 'discount-high') {
    items.sort((a, b) => b.discountPercent - a.discountPercent);
  } else if (sort === 'popular') {
    items.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    // Default newest first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({
    total: items.length,
    products: items
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const db = getDb();
  const index = db.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Increment views
  db.products[index].views = (db.products[index].views || 0) + 1;
  saveDb(db);

  // Return product with seller contact info
  const product = db.products[index];
  const seller = db.users.find(u => u.id === product.sellerId);

  res.json({
    ...product,
    sellerContact: {
      phone: seller?.phone || product.sellerPhone,
      email: seller?.email,
      room: seller?.room,
      hostel: seller?.hostel || product.hostelBlock
    }
  });
});

// Create product listing
router.post('/', (req, res) => {
  const {
    title,
    description,
    category,
    gender,
    size,
    condition,
    originalPrice,
    sellingPrice,
    pickupLocation,
    hostelBlock,
    images,
    sellerId
  } = req.body;

  if (!title || !category || !size || !originalPrice || !sellingPrice || !pickupLocation || !hostelBlock || !sellerId) {
    return res.status(400).json({ error: 'Please fill in all mandatory fields.' });
  }

  const origPrice = Number(originalPrice);
  const sellPrice = Number(sellingPrice);

  if (isNaN(origPrice) || isNaN(sellPrice) || sellPrice <= 0 || origPrice <= 0) {
    return res.status(400).json({ error: 'Prices must be valid numbers greater than 0.' });
  }

  if (sellPrice > origPrice) {
    return res.status(400).json({ error: 'Selling price cannot be higher than original MRP!' });
  }

  const discountPercent = Math.round(((origPrice - sellPrice) / origPrice) * 100);

  const db = getDb();
  const seller = db.users.find(u => u.id === sellerId);

  const newProduct = {
    id: 'prod_' + Date.now(),
    title: title.trim(),
    description: description ? description.trim() : 'No extra description provided.',
    category: category.toLowerCase(),
    gender: gender || 'unisex',
    size: size,
    condition: condition || 'Gently Used',
    originalPrice: origPrice,
    sellingPrice: sellPrice,
    discountPercent: discountPercent,
    pickupLocation: pickupLocation.trim(),
    hostelBlock: hostelBlock,
    images: Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: sellerId,
    sellerName: seller ? seller.name : 'LPU Student',
    sellerPhone: seller ? seller.phone : '',
    sellerRegNo: seller ? seller.regNo : '',
    status: 'available',
    views: 1,
    createdAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDb(db);

  res.status(201).json({ message: 'Product listed successfully!', product: newProduct });
});

// Update product status (available, reserved, sold)
router.patch('/:id/status', (req, res) => {
  const { status, sellerId } = req.body;
  if (!['available', 'reserved', 'sold'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = getDb();
  const product = db.products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Verify ownership
  if (sellerId && product.sellerId !== sellerId) {
    return res.status(403).json({ error: 'You are not authorized to update this listing.' });
  }

  product.status = status;
  saveDb(db);

  res.json({ message: `Status updated to ${status}`, product });
});

// Delete product
router.delete('/:id', (req, res) => {
  const { sellerId } = req.query;
  const db = getDb();
  const index = db.products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (sellerId && db.products[index].sellerId !== sellerId) {
    return res.status(403).json({ error: 'You are not authorized to delete this listing.' });
  }

  const [deleted] = db.products.splice(index, 1);
  saveDb(db);

  res.json({ message: 'Product deleted successfully', product: deleted });
});

// Buyer creates a reservation / deal request
router.post('/:id/reserve', (req, res) => {
  const { buyerId, buyerName, buyerPhone, buyerHostel, proposedMeetingSpot, note } = req.body;

  if (!buyerId || !buyerName || !buyerPhone) {
    return res.status(400).json({ error: 'Buyer name, phone, and ID are required to reserve.' });
  }

  const db = getDb();
  const product = db.products.find(p => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.status === 'sold') {
    return res.status(400).json({ error: 'This item is already sold.' });
  }

  const reservation = {
    id: 'res_' + Date.now(),
    productId: product.id,
    productTitle: product.title,
    sellerId: product.sellerId,
    buyerId,
    buyerName,
    buyerPhone,
    buyerHostel: buyerHostel || 'LPU Campus',
    proposedMeetingSpot: proposedMeetingSpot || product.pickupLocation,
    note: note || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.reservations.push(reservation);
  saveDb(db);

  res.status(201).json({
    message: 'Hold request sent to seller! You can also WhatsApp them directly for quick meetup.',
    reservation
  });
});

// Get reservations for a product or seller
router.get('/seller/reservations/:sellerId', (req, res) => {
  const db = getDb();
  const sellerReservations = db.reservations.filter(r => r.sellerId === req.params.sellerId);
  res.json(sellerReservations);
});

export default router;
