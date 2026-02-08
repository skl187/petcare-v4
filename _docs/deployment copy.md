Setup Instructions:

- Copy all files to your project structure
- Create .env file from .env.example
- Run npm install
- Run SQL schema file: psql -U user -d pet_care -f sql/schema.sql
- Run seed file: psql -U user -d pet_care -f sql/seed.sql
- Start server: npm run dev