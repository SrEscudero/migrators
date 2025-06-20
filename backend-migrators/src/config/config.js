export const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Lipa.15250821',
  server: process.env.DB_SERVER || 'DESKTOP-V97JSO9',
  database: process.env.DB_NAME || 'MIGRATORS',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://192.168.56.1:5173',
    'http://192.168.3.30:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};

export const uploadConfig = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileTypes: /jpeg|jpg|png|gif/
};