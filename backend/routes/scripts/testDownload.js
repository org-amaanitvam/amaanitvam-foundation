import http from 'http';

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/admin/certificates/6a4130d4aa02dcd815727d77/download',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer mock' // I'll just check if it returns 200 or 401. If 401, I'll bypass requireAdmin temporarily.
  }
};

const req = http.request(options, res => {
  console.log('Status:', res.statusCode);
  let size = 0;
  res.on('data', d => { size += d.length; });
  res.on('end', () => {
    console.log('Total bytes received:', size);
  });
});
req.end();
