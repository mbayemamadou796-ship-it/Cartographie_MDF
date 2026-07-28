export const db = {
  connectionString: process.env.DATABASE_URL || 'postgresql://mdf:mdf_secret@localhost:5432/cartographie_mdf',
  status: 'connected'
};
