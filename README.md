<div>
  <h1>Codeforces Ally <img src="https://github.com/evuedeveloper/Codeforces-Ally/blob/main/Codeforces_Ally_Gen_AI/public/icon128.png" alt="Codeforces Ally Logo" width="48" height="48" style="vertical-align: middle;"></h1>
  <p>This is a Gen AI Integrated browser extension which currently works on all Chromium Browsers (Google Chrome, Microsoft Edge, Brave, Opera) etc. The extension currently leverages API from multiple gemini models for the generating useful responses.</p>
</div>

<hr>

<h2>Key Note & Motivation</h2>
<blockquote>
  <p>All features of the extension are available only after the contest has ended and the official editorial is published and linked with the contest. The official editorial(s) serve as the sole source of information; the AI strictly adheres to and interprets content solely from the editorial using its own reasoning. These features will not function during live contests or if the editorial has not yet been published or linked.
</p>
</blockquote>
<p>When upsolving problems after a contest, many users prefer not to read the editorial immediately, hoping instead to solve the problem independently or deduce critical insights on their own. Experienced community members often advise reading the editorial step-by-step, rather than all at once, and reflecting on each part before revealing the complete solution.</p>
<p>However, this process can be difficult, as many editorials lack spoiler-friendly formatting or do not highlight the key ideas before presenting the full solution. This makes it challenging to focus on the most important aspects without prematurely revealing everything.</p>
<p>This is where <strong>Codeforces Ally</strong> comes in. It acts as an intelligent study partner, interpreting the official editorial to nudge you in the right direction by asking critical questions, allowing you to make the final logical leap on your own.</p>

<div style="height: 20px;"></div>

<h2>Features</h2>
<ul>
  <li><strong>Progressive Hints:</strong> Get up to three distinct, non-spoiler hints for a problem. Each hint is presented in a collapsible "spoiler" UI, allowing you to reveal only what you need.</li>
  <li><strong>Editorial Idea Walkthrough:</strong> If you're still stuck after the hints, you can get a high-level, conceptual overview of the solution's logic without seeing any code.</li>
  <li><strong>Editorial Code Translation:</strong> Translate the official solution code into multiple popular languages (C++, Java, Python, etc.) for better understanding.</li>
  <li><strong>Similar Problem Recommendations:</strong> Get recommendations for three similar problems based on topic tags and difficulty rating (±100) to solidify your learning. This feature uses the official Codeforces API and a client-side caching strategy to minimize network requests.</li>
  <li><strong>Robust Context-Awareness:</strong> The extension intelligently checks if you are logged in and on a specific problem page before enabling features, providing helpful guidance if the context is incorrect.</li>
</ul>

<div style="height: 20px;"></div>

<h2>Installation</h2>
<h3>For Chrome & Chromium-based Browsers</h3>
<ul>
  <li>Download the latest release from the <a href="https://github.com/evuedeveloper/Codeforces-Ally/releases" target="_blank" rel="noopener noreferrer">releases page</a>.</li>
  <li>Extract the ZIP file.</li>
  <li>Open your browser and go to the extensions page by navigating to <code>chrome://extensions/</code>.</li>
  <li>In the top-right corner of the extensions page, enable the <strong>"Developer mode"</strong> toggle.</li>
  <li>Click on the <strong>"Load unpacked"</strong> button and select the folder you just extracted.</li>
  <li>Codeforces Ally will now be installed and should appear in your extensions list and toolbar!</li>
</ul>

<h2>Tech Stack</h2>
<ul>
  <li><strong>Backend:</strong> Node.js, Express.js (acts as a secure proxy for the Gemini API).</li>
  <li><strong>Frontend:</strong> React.js (Vite), CSS3 for the interactive side panel UI.</li>
  <li><strong>AI Integration:</strong> Google Gemini API with a resilient, multi-model fallback system.</li>
  <li><strong>Extension APIs:</strong> Chrome Extension Manifest V3 (Side Panel, Storage, Messaging).</li>
</ul>

<div style="height: 20px;"></div>

<hr>

<div>
  <p><strong>&copy; 2025 Codeforces Ally</strong></p>
</div>
