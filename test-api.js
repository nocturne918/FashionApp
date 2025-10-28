// Quick test script to verify API endpoint
fetch('http://localhost:3000/api/test')
  .then(res => res.json())
  .then(data => console.log('✅ API Response:', data))
  .catch(err => console.error('❌ Error:', err.message));
