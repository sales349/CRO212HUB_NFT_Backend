# CRO212HUB NFT Generator & Launchpad - Backend API

Backend API server for the CRO212HUB NFT Generator and Launchpad platform. Handles project management, trait uploads, image generation, metadata creation, rarity calculations, and smart contract deployment.

## Features

- **Project Management** - Create and manage multiple NFT projects
- **Trait Upload System** - Upload layered trait images organized by type
- **NFT Generator** - Combine trait layers into final NFT images
- **Metadata Generator** - Create ERC-721 compatible JSON metadata
- **Rarity System** - Calculate rarity scores and ranks for each token
- **CSV Export** - Generate rarity reports in CSV format
- **Contract Deployment** - Automated smart contract deployment to Cronos
- **Supabase Integration** - PostgreSQL database for all project data

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Image Processing:** Sharp
- **File Uploads:** Multer
- **Authentication:** Admin secret key (JWT in future)

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase account (free tier works)

## Installation

1. **Clone the repository and navigate to backend folder:**
   ```bash
   cd backend-repo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to finish setting up (2-3 minutes)
   - Go to **Project Settings > API** and copy:
     - Project URL (SUPABASE_URL)
     - anon/public key (SUPABASE_KEY)

4. **Create the database schema:**
   - Go to your Supabase project
   - Click on **SQL Editor** in the sidebar
   - Create a new query
   - Copy the contents of `supabase_schema.sql` and paste it
   - Click **Run** to execute
   - Verify tables were created by running the verification query at the bottom

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your values:
   ```env
   PORT=3002
   NODE_ENV=development
   SUPABASE_URL=your_actual_supabase_url
   SUPABASE_KEY=your_actual_anon_key
   ADMIN_SECRET=create_a_strong_random_secret
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

   You should see:
   ```
   🚀 CRO212HUB Backend API running on port 3002
   📊 Health check: http://localhost:3002/
   📁 Output files: http://localhost:3002/output/
   ✅ Supabase connected successfully
   ```

## Project Structure

```
backend-repo/
├── src/
│   ├── server.js              # Main Express server
│   ├── config/
│   │   └── supabase.js        # Supabase client configuration
│   ├── routes/                # API route handlers
│   │   ├── projects.js        # Project CRUD operations
│   │   ├── generate.js        # Image & metadata generation
│   │   └── rarity.js          # Rarity calculation & CSV export
│   ├── services/              # Business logic
│   │   ├── generator.js       # Image generation service
│   │   ├── metadata.js        # Metadata generation service
│   │   └── rarity.js          # Rarity calculation service
│   └── middleware/            # Express middleware
│       ├── auth.js            # Admin authentication
│       └── validation.js      # Request validation
├── uploads/                   # Uploaded trait images
│   └── traits/
│       └── {projectId}/
│           ├── Background/
│           ├── Body/
│           ├── Eyes/
│           └── ... (other layers)
├── output/                    # Generated files
│   └── {projectId}/
│       ├── images/            # Final NFT images
│       │   ├── 1.png
│       │   ├── 2.png
│       │   └── ...
│       └── metadata/          # JSON metadata
│           ├── 1.json
│           ├── 2.json
│           └── ...
├── supabase_schema.sql        # Database schema
├── .env.example               # Environment variables template
├── .env                       # Your local config (gitignored)
├── .gitignore
├── package.json
└── README.md                  # This file
```

## API Endpoints

### Health Check
```
GET /
Response: { message, version, status }
```

### Projects (Coming in Milestone 2)
```
POST   /api/projects          - Create new project
GET    /api/projects          - List all projects
GET    /api/projects/:id      - Get project details
PUT    /api/projects/:id      - Update project
DELETE /api/projects/:id      - Delete project
GET    /api/projects/:id/public - Get public project info (for mint page)
```

### Traits & Generation (Coming in Milestone 2)
```
POST   /api/projects/:id/traits   - Upload trait images
GET    /api/projects/:id/traits   - List project traits
POST   /api/projects/:id/generate - Generate images & metadata
GET    /api/projects/:id/tokens   - List generated tokens
```

### Rarity (Coming in Milestone 3)
```
POST   /api/projects/:id/calculate-rarity - Calculate rarity scores
GET    /api/projects/:id/export-rarity    - Download CSV report
```

### Contract Deployment (Coming in Milestone 4)
```
POST   /api/projects/:id/deploy-contract - Deploy NFT contract
```

## Database Schema

### Tables

**cro_212hub_projects**
- Stores NFT project configurations
- Fields: id, name, symbol, description, max_supply, mint_price, contract_address, base_uri, status, etc.

**cro_212hub_traits**
- Stores uploaded trait metadata
- Fields: id, project_id, layer_type, trait_name, file_path, etc.

**cro_212hub_generated_tokens**
- Stores generated NFT data
- Fields: id, project_id, token_id, image_path, metadata_path, attributes (JSONB), rarity_score, rarity_rank

See `supabase_schema.sql` for complete schema with indexes and policies.

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing the API
```bash
# Test health endpoint
curl http://localhost:3002/

# Expected response:
{
  "message": "CRO212HUB NFT Generator API - Phase 2 Online",
  "version": "1.0.0",
  "status": "operational"
}
```

### Viewing Generated Files
Generated images and metadata are served statically at:
```
http://localhost:3002/output/{projectId}/images/{tokenId}.png
http://localhost:3002/output/{projectId}/metadata/{tokenId}.json
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3002` |
| `NODE_ENV` | Environment | `development` or `production` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key | `eyJxxx...` |
| `ADMIN_SECRET` | Admin API secret | `random_secure_string` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000,http://localhost:3001` |

## Troubleshooting

### Supabase Connection Issues
```
⚠️ Supabase connection warning: ...
```
**Solution:**
- Verify your SUPABASE_URL and SUPABASE_KEY in `.env`
- Make sure you ran the `supabase_schema.sql` script
- Check that your Supabase project is active

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3002
```
**Solution:**
- Change `PORT` in `.env` to a different port (e.g., 3003)
- Or kill the process using port 3002

### Sharp Installation Issues
```
Error: Could not load the "sharp" module
```
**Solution:**
```bash
npm rebuild sharp
```

## Security Notes

- **Never commit `.env` file** - It contains sensitive credentials
- **Use service_role key** for admin operations (stored server-side only)
- **Validate file uploads** - Check file types and sizes
- **Rate limiting** - Will be added in production
- **Admin endpoints** - Require ADMIN_SECRET header

## Deployment

### Recommended Platforms
- **Railway** - Easy Node.js deployment
- **Render** - Free tier available
- **Heroku** - Classic PaaS option
- **DigitalOcean App Platform** - Reliable and affordable

### Deployment Checklist
- [ ] Set production environment variables
- [ ] Use service_role key for admin operations
- [ ] Enable CORS only for your frontend domain
- [ ] Set strong ADMIN_SECRET
- [ ] Configure Supabase RLS policies for admin operations
- [ ] Set up automatic backups
- [ ] Monitor logs and errors

## Next Steps

- **Milestone 2:** Implement core generator (traits → images + metadata)
- **Milestone 3:** Add rarity system and CSV export
- **Milestone 4:** Integrate contract deployment
- **Milestone 5:** Full admin dashboard integration

## Support

For issues or questions:
1. Check the documentation in `/docs` folder
2. Review `CRO212HUB_NFT_Backend_SECURITY_NOTES.txt`
3. Contact the development team

## License

ISC License - CRO212HUB Platform
