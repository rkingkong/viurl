// Add this to your server.js file in the CORS configuration section
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://viurl.com',
    'http://viurl.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
