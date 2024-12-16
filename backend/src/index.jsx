const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const sharp = require('sharp');

dotenv.config();

const app = express();
const port = 3000;
app.use(express.json());

// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors());
app.use(bodyParser.json());


app.post('/generate-image', async (req, res) => {
    
    const { prompts } = req.body; 
    
    if (!Array.isArray(prompts) || prompts.length === 0) {
        return res.status(400).send({ error: 'An array of prompts is required' });
    }

    try {
        const images = await Promise.all(
            prompts.map(async (prompt) => {                
                if(prompt != '') {
                    // console.log(`Processing prompt = ${prompt}`);
                    const response = await axios.post(
                        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
                        { inputs: prompt },
                        {
                            headers: {
                                Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                                'Content-Type': 'application/json',
                            },
                            responseType: 'arraybuffer', 
                        }
                    );
                    
                    return Buffer.from(response.data); 
                }                
            })
        );

        // Create collage using `sharp`
        const collage = await sharp({
            create: {
                width: 512 * prompts.length, 
                height: 512, 
                channels: 3,
                background: { r: 255, g: 255, b: 255 }, 
            },
        })
            .composite(
                images.map((img, index) => ({
                    input: img,
                    left: index * 512, 
                    top: 0, 
                }))
            )
            .png()
            .toBuffer();

        // Send the generated collage as a response
        res.set('Content-Type', 'image/png');
        res.send(collage); 
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).send({ error: 'Failed to generate collage' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
