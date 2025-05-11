// Basic Vercel serverless function
module.exports = (req, res) => {
  console.log('API Index called!');
  res.status(200).json({
    body: req.body,
    query: req.query,
    cookies: req.cookies,
    message: 'This is the API index route'
  });
}; 