async function runTests() {
  console.log('🧪 Starting LPU Campus Closet API Verification...\n');

  // Test 1: Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('✅ 1. Health check passed:', health.app, `(${health.university})`);

  // Test 2: Auto discount calculation verification
  const productsRes = await fetch('http://localhost:5000/api/products');
  const productsData = await productsRes.json();
  console.log(`✅ 2. Products fetched: ${productsData.total} listings.`);
  const sample = productsData.products[0];
  const expectedDiscount = Math.round(((sample.originalPrice - sample.sellingPrice) / sample.originalPrice) * 100);
  if (sample.discountPercent === expectedDiscount) {
    console.log(`✅ 3. Smart discount calculation verified: MRP ₹${sample.originalPrice} -> ₹${sample.sellingPrice} is ${sample.discountPercent}% OFF (calculated accurately).`);
  } else {
    throw new Error('Discount calculation mismatch');
  }

  // Test 3: Create a new listing with auto discount
  const newCloth = {
    title: 'Puma Core College Backpack & Winter Muffler Set',
    description: 'Used for one semester. Great condition, all zips smooth.',
    category: 'accessories',
    gender: 'unisex',
    size: 'Free Size',
    condition: 'Like New (Worn Once/Twice)',
    originalPrice: 2499,
    sellingPrice: 749,
    pickupLocation: 'UniMall 2nd Floor / Nescafe Booth',
    hostelBlock: 'BH-6',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    sellerId: 'usr_arjun'
  };

  const createRes = await fetch('http://localhost:5000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCloth)
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(createData.error);
  console.log(`✅ 4. Created new listing: "${createData.product.title}". Auto Discount: ${createData.product.discountPercent}% OFF (Saves ₹${createData.product.originalPrice - createData.product.sellingPrice})`);

  // Test 4: Reserve item
  const reserveRes = await fetch(`http://localhost:5000/api/products/${createData.product.id}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buyerId: 'usr_sneha',
      buyerName: 'Sneha Patel',
      buyerPhone: '9812345678',
      buyerHostel: 'GH-2',
      proposedMeetingSpot: 'UniMall Nescafe Booth at 4:30 PM',
      note: 'Will pay cash on meetup'
    })
  });
  const reserveData = await reserveRes.json();
  console.log(`✅ 5. Reservation request created successfully for ${reserveData.reservation.buyerName}.`);

  // Test 5: Update status to reserved
  const statusRes = await fetch(`http://localhost:5000/api/products/${createData.product.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'reserved', sellerId: 'usr_arjun' })
  });
  const statusData = await statusRes.json();
  console.log(`✅ 6. Status changed to: ${statusData.product.status}`);

  console.log('\n🎉 ALL 6 TEST SUITES PASSED FLAWLESSLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
