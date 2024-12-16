import { useState } from 'react';

function App() {
    const [prompts, setPrompts] = useState(['']);
    const [collageUrl, setCollageUrl] = useState(null);

    const handlePromptChange = (index , value) => {
        const newPrompts = [...prompts];        
        if(value !== '') {
          newPrompts[index] = value;
          setPrompts(newPrompts); 
        }
               
    };

    const addPrompt = () => {
      setPrompts([...prompts, '']);      
    }

    const generateCollage = async () => {
        try {
            const validPrompts = prompts.filter(prompt => prompt !== undefined && prompt.trim() !== '');
            const response = await fetch('http://localhost:3000/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompts: validPrompts }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate collage');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setCollageUrl(url);
        } catch (error) {
            console.error(error);
            alert('Error generating collage');
        }
    };

    return (
        <div>
            <h1>AI-Powered Collage Generator</h1>
            {prompts.map((prompt, index) => (
                <div key={index}>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => handlePromptChange(index, e.target.value)}
                        placeholder={`Prompt ${index + 1}`}
                    />
                </div>
            ))}
            <button onClick={addPrompt}>Add Another Prompt</button>
            <button onClick={generateCollage}>Generate Collage</button>
            {collageUrl && (
                <div>
                    <h2>Generated Collage:</h2>
                    <img src={collageUrl} alt="Generated Collage" style={{ width: '100%' }} />
                    <a href={collageUrl} download="collage.png">
                        <button>Download Collage</button>
                    </a>
                </div>
            )}
        </div>
    );
};

export default App
