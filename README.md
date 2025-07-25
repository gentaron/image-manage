# Image Management Tool

A modern, AI-powered image management system with automatic tagging, full-screen viewing, and related image suggestions.

## Features

- **Modern UI**: Dark theme with glass morphism effects and neon accents
- **AI-Powered Tagging**: Automatic image analysis and tagging using Groq's vision model
- **Full-Screen Viewing**: Seamless modal experience with navigation
- **Related Images**: Smart suggestions based on shared tags
- **Search & Filter**: Real-time search across names, descriptions, and tags
- **Drag & Drop Upload**: Easy file management with multiple format support
- **Editable Content**: In-place editing of names, descriptions, and tags

## Setup

### Prerequisites

- Node.js 18+
- Vercel CLI
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gentaron/image-manage.git
cd image-manage
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Add your Groq API key to Vercel
vercel env add GROQ_API_KEY
```

4. Deploy to Vercel:
```bash
vercel --prod
```

### Local Development

1. Start the development server:
```bash
npm run dev
```

2. Open `http://localhost:3000` in your browser

## API Configuration

Update the `VERCEL_API_URL` in `image-manager.html` to point to your deployed Vercel app:

```javascript
const VERCEL_API_URL = 'https://your-deployment-url.vercel.app/api';
```

## Usage

1. **Upload Images**: Drag and drop or click to browse files
2. **AI Analysis**: Images are automatically analyzed for tags and descriptions
3. **View Full-Screen**: Click any image to open in modal view
4. **Navigate**: Use arrow keys or buttons to browse images
5. **Edit Content**: Click on names, descriptions, or tags to edit
6. **Search**: Use the search bar to find images by any metadata
7. **Related Images**: View similar images based on shared tags

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Backend**: Vercel Serverless Functions
- **AI**: Groq LLaMA Vision Model
- **Deployment**: Vercel

## License

MIT License