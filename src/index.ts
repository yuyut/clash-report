import express from 'express';
import path from 'path';
import { ClashDetectionService } from "./ClashDetectionService";


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
// health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const service = new ClashDetectionService();

app.post('/detect-clashes', async (req, res) =>{
    try {
        const result = await service.detectClashes(req.body);
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