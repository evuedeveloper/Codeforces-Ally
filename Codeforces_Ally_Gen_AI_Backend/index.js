require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

// ~ Setting up Gemini API ~

if(!process.env.GEMINI_API_KEY){
    console.error("Error: GEMINI_API_KEY seems to be undefined in the .env file");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// app.use(cors());
app.use(cors({ origin: '*' }));
app.use(express.json());

// ~ Routes ~

app.post('/api/rephrase', async (req, res) => {

    console.log("\n Request received for /api/rephrase ");
    
    try{
        const { problemText } = req.body;
        
        if(!problemText){
            return res.status(400).json({ error: 'Problem text is required' });
        }

        const model    =  genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt   = `Rephrase the following competitive programming problem in simple, easy-to-understand terms. Focus on clarifying the core task, input, and expected output. Do not use any markdown formatting like bold or italics; use plain text only.

        Problem Text: "${problemText}"`;

        const result   = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ rephrasedText: response.text() });
    }
  
    catch(error){
        console.error(" Error: Gemini API Error (Rephrase) ", error);
        res.status(500).json({ error: 'Failed to rephrase problem using Gemini API' });
    }

});



app.post('/api/get-hints', async (req, res) => {

    console.log("\n Request Received for /api/get-hints ");

    try{
        const { editorialText } = req.body;
        
        if(!editorialText){
            return res.status(400).json({ error: 'Editorial text is required' });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt   = `From the following editorial, generate exactly 3 distinct, non-spoiler hints. Frame them as questions to guide a student. Return the hints as a JSON array of strings. For example: ["Hint 1?", "Hint 2?", "Hint 3?"]. Do not use markdown.

        Editorial Text: "${editorialText}"`;
        const result   = await model.generateContent(prompt);
        const response = await result.response;
        const hints    = JSON.parse(response.text());
        res.json({ hints });
    }

    catch(error){
        console.error(" Error: Gemini API Error (Hints) ", error);
        res.status(500).json({ error: 'Failed to generate hints from Gemini API' });
    }

});



app.post('/api/get-idea-walkthrough', async (req, res) => {

    console.log("\n Request Received for /api/get-idea-walkthrough ");
    
    try{
        const { editorialText } = req.body;
        
        if(!editorialText){
            return res.status(400).json({ error: 'Editorial text is required.' });
        }

        const model    = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt   = `Based on the following editorial, provide a concise walkthrough of the main idea. Do not include code. Explain the logic in simple terms. Do not use any markdown formatting like bold or italics; use plain text only.

        Editorial Text: "${editorialText}"`;
        const result   = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ ideaWalkthrough: response.text() });
    }

    catch(error){
        console.error(" Error: Gemini API Error (Idea Walkthrough) ", error);
        res.status(500).json({ error: 'Failed to generate idea walkthrough from Gemini API' });
    }

});



app.post('/api/get-editorial-explanation', async (req, res) => {

    console.log("\n Request Received for /api/get-editorial-explanation ");
    
    try{
        const { editorialText } = req.body;
        
        if(!editorialText){
            return res.status(400).json({ error: 'Editorial text is required.' });
        }

        const model    =  genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt   = `You are a helpful programming tutor. Explain the following editorial in a clear and concise way, including the source code from the editorial but do not add comments in the editorial code, paste the code as it is. Format the code properly within markdown code blocks. After writing editorial code, explain the code properly. For the explanatory text, do not use any markdown formatting like bold or italics; use plain text only.

        Editorial Text: "${editorialText}"`;
        const result   = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ editorialExplanation: response.text() });
    }
    
    catch(error){
        console.error(" Error: Gemini API Error (Editorial Explanation) ", error);
        res.status(500).json({ error: 'Failed to generate editorial explanation from Gemini API' });
    }

});



app.post('/api/translate-code', async (req, res) => {

    console.log("\n Request Received for /api/translate-code ");
    
    try{
        const { editorialText, targetLanguage } = req.body;
        
        if(!editorialText || !targetLanguage){
          return res.status(400).json({ error: 'Editorial text and target language are required.' });
        }
        
        const model    =  genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt   = `From the following editorial text, extract only the source code and translate it into ${targetLanguage}. Provide only the translated code in a single markdown block, with no additional explanation.

        Editorial Text: "${editorialText}"
        Target Language: ${targetLanguage}`;
        const result   = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ translatedCode: response.text() });
    }
    
    catch(error){
        console.error(" Error: Gemini API Error (Translate Code) ", error);
        res.status(500).json({ error: 'Failed to translate code from Gemini API' });
    }

});



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

