# Vinyl Record Cataloging App

This application allows users to catalog their vinyl record collection by capturing photos of record covers and additional images, organizing them into batches, and analyzing them to extract information.

## Features

- Capture photos of vinyl records using device camera
- Organize records into batches
- Store images and metadata in Supabase
- Analyze record covers to extract information (future feature)

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Storage**: Supabase Storage
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (for future integration)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the Photo Capture Component

The `PhotoCapture` component allows users to capture photos of vinyl records using their device's camera. Here's how to use it in your own components:

### Import the Component

```tsx
import PhotoCapture from '@/components/PhotoCapture';
```

### Use the Component

```tsx
const MyComponent = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const handlePhotosCapture = (photos: string[]) => {
    setCapturedPhotos(photos);
    setIsCapturing(false);
    // Do something with the captured photos
  };

  const handleCaptureCancel = () => {
    setIsCapturing(false);
  };

  return (
    <div>
      {isCapturing ? (
        <div className="fixed inset-0 z-50 bg-black">
          <PhotoCapture
            onPhotosCapture={handlePhotosCapture}
            onCancel={handleCaptureCancel}
            maxPhotos={5} // Optional, defaults to 5
          />
        </div>
      ) : (
        <button onClick={() => setIsCapturing(true)}>
          Capture Photos
        </button>
      )}
    </div>
  );
};
```

### Props

- `onPhotosCapture`: Function called when photos are captured, receives an array of base64-encoded images
- `onCancel`: Function called when the user cancels the capture process
- `maxPhotos`: (Optional) Maximum number of photos that can be captured, defaults to 5

### Notes

- The first photo captured is automatically marked as the cover photo
- The component handles camera permissions and errors
- Photos are returned as base64-encoded strings, ready to be uploaded to Supabase Storage

## Future Enhancements

- Integration with Supabase for data storage
- Record analysis using image recognition
- Batch management
- Export functionality
- Offline mode

## License

This project is licensed under the MIT License. 