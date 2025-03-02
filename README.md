# StudyNotes - University Notes Sharing Platform

A modern web application for university students to upload, organize, and share their lecture notes. Built with React, TypeScript, Tailwind CSS, and Supabase.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

## Features

- 📚 Upload and organize lecture notes by university, course, and professor
- 🔍 Powerful search functionality for easy note retrieval
- 👥 Collaboration tools for shared study materials
- 🔒 Private and public sharing options
- 📱 Mobile-friendly responsive design
- 🎓 University and course management
- 👤 User profiles and authentication
- 📊 Analytics and trending notes
- 🏷️ Tag-based organization
- 💬 Comments and discussions
- ⭐ Rating system for quality content

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- Vite
- React Router
- Lucide Icons

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Pshyco-c/University-note-sharing-platform.git
   cd university-note-sharing-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Deploying to Vercel

This project is configured for seamless deployment on Vercel. Here's how to deploy:

#### Option 1: Using Vercel Dashboard (Recommended)

1. Push your code to a GitHub repository
2. Visit [Vercel](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add environment variables:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_APP_NAME=StudyNotes
   VITE_APP_DESCRIPTION="Share and discover university lecture notes"
   ```
7. Click "Deploy"

#### Option 2: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

### Post-Deployment Configuration

1. Configure Supabase:
   - Go to your Supabase dashboard
   - Navigate to Authentication → URL Configuration
   - Add your Vercel domain (e.g., `https://your-app.vercel.app`) to:
     - Site URL
     - Additional Redirect URLs

2. Test your deployment:
   - Verify authentication flows
   - Test file uploads
   - Check environment variables
   - Confirm routing works correctly

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/      # React context providers
├── lib/           # Utility functions and configurations
├── pages/         # Main application pages
└── types/         # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

If you find this project helpful, please consider giving it a ⭐️ on GitHub!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/Pshyco-c/University-note-sharing-platform](https://github.com/Pshyco-c/University-note-sharing-platform)