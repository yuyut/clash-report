# Clash Detection

Detects building clashes, boundary violations, and proximity issues using r-tree spatial indexing.

### **Code Organization** 
```
src/
├── models/          
├── validators/       
├── detectors/        
│   ├── BoundsDetector
│   ├── ProximityDetector
│   └── ZoningDetector
└── ClashDetectionService  # Main 
```

## Getting Started

Install dependencies:
```bash
npm install
```

Start the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and upload a JSON file with your building data.

## API Usage

Send a POST request to detect clashes:
```bash
Invoke-RestMethod -Uri http://localhost:3000/detect-clashes -Method POST -ContentType "application/json" -Body (Get-Content -Path "data/data.json" -Raw)
```

Response format:
```json
{
    "summary": {
        "totalClashes": 1,
        "byType": {
        "OutOfBounds": 1
        }
    },
    "clashes": [
        {
        "type": "OutOfBounds",
        "severity": "error",
        "description": "Building \"Pulse\" extends beyond site boundaries",
        "buildings": ["Pulse"]
        }
    ]
}
```

## How It Works

The clash detector uses an R-tree spatial index instead of brute force checking (which would be O(n²)).

Main implementation is in [ClashDetector.ts](src/detectors/ClashDetector.ts) - it queries the R-tree for overlapping bounding boxes, then validates actual geometry intersections and checks clearance distances.

## Tests

Running the test suite:
```bash
npm test
```

Covers proximity detection (overlaps, clearance violations, deduplication), boundary checks, and zoning validation with various edge cases.
