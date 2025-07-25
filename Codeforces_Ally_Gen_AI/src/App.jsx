import React, { useState, useEffect, useRef } from 'react';
import './App.css';

//  ~ SpoilerHint Component (for collapsible hints) ~
const SpoilerHint = ({ hint, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="spoiler-container">
            <button className="spoiler-header" onClick={() => setIsOpen(!isOpen)}>
                <span className={`spoiler-arrow ${isOpen ? 'open' : ''}`}></span>
                <span> Hint {index + 1} </span>
            </button>
            {isOpen && (
                <div className="spoiler-content">
                    <p>{hint}</p>
                </div>
            )}
        </div>
    );
};

// ~ SpoilerProblem Component (for collapsible recommendations) ~
const SpoilerProblem = ({ problem, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const problemUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;

    return (
        <div className="spoiler-container">
            
            <button className="spoiler-header" onClick={() => setIsOpen(!isOpen)}>
                <span className={`spoiler-arrow ${isOpen ? 'open' : ''}`}></span>
                <span>Problem {index + 1} ({problem.rating})</span>
            </button>

            {isOpen && (
                <div className="spoiler-content">
                    <a href={problemUrl} target="_blank" rel="noopener noreferrer">
                        {problem.name}
                    </a>
                </div>
            )}

        </div>
    );
};


function App(){

    const [messages, setMessages] = useState([
        { from: 'bot', type: 'text', text: 'How can I help you today?' }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [showLanguageOptions, setShowLanguageOptions] = useState(false);
    const messagesEndRef = useRef(null);


    // ~ Auto-scrolling effect to reach bottom during new requests ~
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages, isLoading]);


    // ~ Markdown trimming for a better view ~
    const trimCodeFences = (text = '') => {

        const lines = text.split('\n');
        if( (lines.length > 1 && lines[0].trim().startsWith('```')) && (lines[lines.length - 1].trim() === '```') ){
            return lines.slice(1, -1).join('\n');
        }

        return text;

    };


    // ~ Responses from Bot ~
    const addBotMessage = (text, type = 'text', data = {}) => {
        const message = { from: 'bot', type, text, ...data };
        if(type === 'text'){
            message.text = trimCodeFences(text);
        }
        setMessages(prev => [...prev, message]);
    };


    // ~ User I/P Display ~
    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { from: 'user', type: 'text', text }]);
    };


    // ~ Feature Handlers ~
    const handleRephraseClick = () => {

        addUserMessage('Rephrase the problem');
        setIsLoading(true);
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getProblem" }, (response) => {
                
                if((chrome.runtime.lastError) || (response?.error)){
                    addBotMessage(response?.error || "chrome runtime eroror");
                    setIsLoading(false);
                    return;
                }

                fetch('https://codeforces-ally.onrender.com/api/rephrase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ problemText: response.content }),
                })

                .then(res   => res.json())
                .then(data  => addBotMessage(data.rephrasedText || "Sorry, I couldn't rephrase that."))
                .catch(()   => addBotMessage("Sorry, something went wrong while contacting the AI."))
                .finally(() => setIsLoading(false));

            });
        });

    };



    const fetchEditorialAndPrompt = (userMessage, endpoint, dataKey, requestBody = {}) => {
        
        addUserMessage(userMessage);
        setIsLoading(true);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getHints" }, (response) => {
              
                if((chrome.runtime.lastError) || (response?.error)){
                    addBotMessage(response?.error || "An error occurred.");
                    setIsLoading(false);
                    return;
                }

                const body = { editorialText: response.content, ...requestBody };

                fetch(`https://codeforces-ally.onrender.com${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                .then(res => res.json())
              
                .then(data => {

                    if(data[dataKey]){
                        if(dataKey === 'hints'){
                            setMessages(prev => [...prev, { from: 'bot', type: 'hints', hints: data.hints }]);
                        }
                        else{
                            addBotMessage(data[dataKey]);
                        }
                    }
                  
                    else{
                        addBotMessage(`Sorry, I couldn't get the ${dataKey}.`);
                    }

                })

                .catch(() => addBotMessage("Sorry, something went wrong."))
                .finally(() => setIsLoading(false));

            });
        });

    };

    const handleRecommendClick = () => {

        addUserMessage("Recommend similar problems");
        setIsLoading(true);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getProblemDetails" }, async (details) => {

                if((chrome.runtime.lastError) || (details?.error)){
                    addBotMessage(details?.error || "Could not get problem details.");
                    setIsLoading(false);
                    return;
                }

                if( (!details.rating) && ((!details.tags) || (details.tags.length === 0)) ){
                    addBotMessage("Could not recommend problems as this one lacks a rating or topic tags.");
                    setIsLoading(false);
                    return;
                }

                try{
                    
                    const fiveDays = 5 * 24 * 60 * 60 * 1000;
                    const cache = await chrome.storage.local.get(['problemset', 'timestamp']);
                    let problemset = cache.problemset;

                    if((!problemset) || (!cache.timestamp) || (Date.now() - cache.timestamp > fiveDays)){

                        addBotMessage("Fetching new problemset data... ( this happens just once in 5 days if you don't clear your browser cookies :) )");
                        const res = await fetch('https://codeforces.com/api/problemset.problems');
                        const data = await res.json();
                        if (data.status !== "OK") throw new Error("Failed to fetch from Codeforces API");
                        problemset = data.result.problems;
                        await chrome.storage.local.set({ problemset, timestamp: Date.now() });

                    }
                    
                    const recommendations = findSimilarProblems(problemset, details.rating, details.tags);
                    addBotMessage(null, 'recommendations', { recommendations });

                }
                
                catch (error){
                    console.error("Recommendation error:", error);
                    addBotMessage("Failed to fetch or process the problemset. Please try again later.");
                }
                
                finally{
                    setIsLoading(false);
                }

            });
        });

    };

    const FisherYateShuffle = (arr) => {
        for(let i = arr.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };

    const findSimilarProblems = (problemset, rating, tags) => {

        const targetRatings = [
            Math.max(800, rating - 100),
            rating,
            Math.min(3500, rating + 100)
        ];

        const recommendations = [];
        const usedIndices = new Set();
        const taggedProblems = problemset.filter(p => p.rating && p.tags.some(tag => tags.includes(tag)));

        FisherYateShuffle(taggedProblems);

        for(const target of targetRatings){
            let bestMatch = null;
            let minDiff = Infinity;
            for(let i = 0; i < taggedProblems.length; i++){
                if(usedIndices.has(i)) continue;
                const p = taggedProblems[i];
                const diff = Math.abs(p.rating - target);
                if(diff < minDiff){
                    minDiff = diff;
                    bestMatch = { problem: p, index: i };
                    // should I break? No cause a better match might be present next
                }
            }
            if(bestMatch){
                recommendations.push(bestMatch.problem);
                usedIndices.add(bestMatch.index);
            }
        }

        return recommendations;

    };

    // ~ UI Rendering ~
    const renderActions = () => {
      
        if(showLanguageOptions){
            const languages = ['C', 'C++', 'Python', 'Java', 'JavaScript', 'C#', 'Go', 'Rust', 'Kotlin', 'Haskell', 'PHP', 'Ruby', 'Perl'];
            return(
                <>
                    {languages.map(lang => (
                        <button key={lang} className="action-button" onClick={() => {setShowLanguageOptions(false); fetchEditorialAndPrompt(`Translate the official solution to ${lang}`, '/api/translate-code', 'translatedCode', { targetLanguage: lang })}}>
                            {lang}
                        </button>
                    ))}
                    <button className="action-button" onClick={() => setShowLanguageOptions(false)}>Back</button>
                </>
            );
        }

        return (
            <>
                <button className="action-button" onClick={handleRephraseClick} disabled={isLoading}>Rephrase the problem</button>
                <button className="action-button" onClick={() => fetchEditorialAndPrompt('Hints for this problem?', '/api/get-hints', 'hints')} disabled={isLoading}>Hints for this problem?</button>
                <button className="action-button" onClick={() => fetchEditorialAndPrompt('Idea Walkthrough', '/api/get-idea-walkthrough', 'ideaWalkthrough')} disabled={isLoading}>Idea Walkthrough</button>
                <button className="action-button" onClick={() => fetchEditorialAndPrompt('Editorial Explanation', '/api/get-editorial-explanation', 'editorialExplanation')} disabled={isLoading}>Editorial Explanation</button>
                <button className="action-button" onClick={() => setShowLanguageOptions(true)} disabled={isLoading}>Translate Code</button>
                <button className="action-button" onClick={handleRecommendClick} disabled={isLoading}>Recommend Similar Problems</button>
            </>
        );

    };

    return (

        <div className="app-container">
            <div className="messages-container">

                {messages.map((msg, index) => {

                    if(msg.type === 'hints'){
                        return <div key={index} className="message bot-message">{msg.hints.map((h, i) => <SpoilerHint key={i} hint={h} index={i} />)}</div>;
                    }

                    if(msg.type === 'recommendations'){
                        return <div key={index} className="message bot-message">
                            <p className="message-text">Here are some similar problems you might like:</p>
                            {msg.recommendations.map((p, i) => <SpoilerProblem key={i} problem={p} index={i} />)}
                        </div>
                    }

                    return (
                        <div key={index} className={`message ${msg.from}-message`}>
                            <pre className="message-text">{msg.text}</pre>
                        </div>
                    );

                })}

                {isLoading && <div className="message bot-message"><p><i>Thinking...</i></p></div>}
                <div ref={messagesEndRef} />

            </div>
            <div className="actions-container">
                {renderActions()}
            </div>

        </div>

    );

}

export default App;
