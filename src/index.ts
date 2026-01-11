import express from 'express';
import path from 'path';
import { ClashDetectionService } from "./ClashDetectionService";
import { BoundsDetector, ProximityDetector, ZoningDetector } from "./detectors/ClashDetector";
import { InputValidator } from "./validators/InputValidator";


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
// health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// inject detectors into service
const service = new ClashDetectionService([
    new BoundsDetector(),
    new ProximityDetector(),
    new ZoningDetector(),
]);

app.post('/detect-clashes', async (req, res) =>{
    try {
        const result = await service.detectClashes(req.body);

        if (result.validationErrors && result.validationErrors.length >0 ){
            return res.status(400).json(result); // Bad Request for validation errors
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



export default app;