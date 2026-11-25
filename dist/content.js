// ~ if profile link appears, logged in else no ~

function isUserLoggedIn(){
  const profileLink = document.querySelector('#header .lang-chooser a[href*="/profile/"]');
  return !!profileLink;
}

// ~ rating: number, tags: string[] ~
// ~ if absent null ~

function getCurrentProblemDetails(){
    
    let rating = null;
    const ratingSpan = document.querySelector('span[title="Difficulty"]');

    if(ratingSpan){
        rating = parseInt(ratingSpan.innerText.replace('*', ''), 10);
    }

    const tags = Array.from(document.querySelectorAll('span.tag-box')).map(span => span.innerText.trim());

    if((rating === null) && (tags.length === 0)){
        return { error: "Could not find rating or tags for this problem." };
    }

    return { rating, tags };
}

// ~ if found then it's innerText, not innerHTML cause more size and trash ~

function getProblemContent(){
    const problemStatement = document.querySelector('.problem-statement');
    if(problemStatement){
        return { content: problemStatement.innerText };
    }
    return { error: "Could not find the problem statement on this page." };
}

// ~ returns promise, if found then content string else error string ~

async function checkEditorialExists(){
    
    try{

        const pathSegments = window.location.pathname.split('/');
        let contestId;

        if(pathSegments.includes('contest')){
            contestId = pathSegments[pathSegments.indexOf('contest') + 1];
        }
        else if(pathSegments.includes('problemset')){
            contestId = pathSegments[pathSegments.indexOf('problem') + 1];
        }

        if(!contestId){
            return { error : "Could not determine the contestId from the URL" };
        }

        const contestUrl = `https://codeforces.com/contest/${contestId}`;
        const response   = await fetch(contestUrl);

        if(!response.ok){
            return { error : "The contest page is not available. The contest might be ongoing." };
        }

        const contestPageText = await response.text();
        const tempDiv         = document.createElement('div');
        tempDiv.innerHTML     = contestPageText;

        const links           = Array.from(tempDiv.querySelectorAll('a'));
        
        const editorialLinkElement = links.find(a => a.textContent.toLowerCase().includes('tutorial') || a.textContent.toLowerCase().includes('editorial'));

        if(!editorialLinkElement){
            return { error: "This feature is disabled until the contest is over and the official editorial is published :)" };
        }

        return { success: true };

    }

    catch(error){
        console.error("Editorial check error:", error);
        return { error: error.message };
    }

}


// ~ returns promise, if found then content string else error string ~

async function getEditorialContent(){
    
    try{

        const pathSegments = window.location.pathname.split('/');
        let contestId, problemId;

        if(pathSegments.includes('contest')){
            contestId = pathSegments[pathSegments.indexOf('contest') + 1];
            problemId = pathSegments[pathSegments.indexOf('problem') + 1];
        }
        else if(pathSegments.includes('problemset')) {
            contestId = pathSegments[pathSegments.indexOf('problem') + 1];
            problemId = pathSegments[pathSegments.indexOf('problem') + 2];
        }

        if(!contestId || !problemId){
            return { error: "Could not determine the contest and problem ID from the URL" };
        }

        // if(pathSegments[pathSegments.length - 1] === 'problems'){
        //     return { error: "Please go to a specific problem page, not the full problemset" };
        // }

        const contestUrl = `https://codeforces.com/contest/${contestId}`;
        const response = await fetch(contestUrl);

        if(!response.ok){
            return { error: "The official editorial for this contest might not be available yet" };
        }

        const contestPageText = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contestPageText;

        const links = Array.from(tempDiv.querySelectorAll('a'));
        const editorialLinkElement = links.find(a => a.textContent.toLowerCase().includes('tutorial') || a.textContent.toLowerCase().includes('editorial'));

        if(!editorialLinkElement){
            return { error: "Could not find the 'Tutorial' or 'Editorial' link. The contest may be ongoing" };
        }

        let relativeUrl = editorialLinkElement.getAttribute('href');
        let fullEditorialUrl = relativeUrl.startsWith('/') ? `https://codeforces.com${relativeUrl}` : relativeUrl;

        const editorialResponse = await fetch(fullEditorialUrl);

        if(!editorialResponse.ok){
            return { error: `Failed to fetch editorial page` };
        }

        const editorialPageText = await editorialResponse.text();

        const editorialDiv = document.createElement('div');
        editorialDiv.innerHTML = editorialPageText;
        const typographyDiv = editorialDiv.querySelector('div.ttypography');

        if(!typographyDiv){
            return { error: "Could not find the content div in the editorial page" };
        }

        const allElements = typographyDiv.children;
        let collectedContent = '';
        let isParsing = false;

        for(const element of allElements){
            
            const linksInElement = element.querySelectorAll('a');
            
            let foundProblemLink = false;
            let foundOtherProblemLink = false;

            for(const link of linksInElement){
                const href = link.getAttribute('href');

                if(href){
                    const match = href.match(/\/contest\/(\d+)\/problem\/([A-Z]\d*)/);
                    if(match){
                        const extractedContestId = match[1];
                        const extractedProblemId = match[2];
                        if(extractedContestId === contestId && extractedProblemId.toUpperCase() === problemId.toUpperCase()){
                            foundProblemLink = true;
                        }
                        else{
                            foundOtherProblemLink = true;
                        }
                    }
                }
                
            }

            if((foundProblemLink) && (!isParsing)){
                isParsing = true;
            }

            if(isParsing){
                if (foundOtherProblemLink && collectedContent) break;
                if (element.className.includes('comments')) break;
                collectedContent += element.outerHTML;
            }
        }

        return { content: collectedContent || typographyDiv.innerText };

    }
    
    catch(error){
        console.error("Scraping error:", error);
        return { error: error.message };
    }

}


function initialize(){

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        // ~ Universal check for all features ~

        // if (pathSegments[pathSegments.length - 1] === 'problems') {
        //     sendResponse({ error: "Please go to a specific problem page, not the full problemset." });
        //     return false; // Return false to indicate you are done and closing the port.
        // }

        // const path = window.location.pathname;
        // const pathSegments = window.location.pathname.split('/');
        
        // if (!path.includes('/problem/')) {
        //     sendResponse({ error: "It looks like you're not on a specific problem page. Please navigate to a problem to use this feature." });
        //     return;
        // }

        // else if(!isUserLoggedIn()){
        //      
        // }


        const pathSegments = window.location.pathname.split('/');

        if(pathSegments[pathSegments.length - 1] === 'problems'){
            sendResponse({ error: "It looks like you've opened the entire problemset. Please navigate to the specific problem you'd like assistance with :)" });
            return; // synchronous response, port will close.
        }

        if(!isUserLoggedIn()){
            sendResponse({ error: "Please log in to Codeforces to use Codeforces Ally :)" });
            return; // similar synchronous response, the port will close.
        }
        
        if(!window.location.pathname.includes('/problem/')){
            sendResponse({ error: "It looks like you're not on a specific problem page. Please navigate to the specific problem you'd like assistance with :)" });
            return;
        }

        if(request.action === "getProblem"){
            sendResponse(getProblemContent());
        }
        else if(request.action === "getProblemDetails"){
            sendResponse(getCurrentProblemDetails());
        }
        else if (request.action === "getHints"){
            getEditorialContent().then(sendResponse);
            return true; // Imp: we return true for async response to keep the port open.
        }
        else if(request.action === "checkEditorial"){
            checkEditorialExists().then(sendResponse);
            return true;
        }


    });

    console.log("Codeforces Ally content script initialized.");

}


// ~ I realized that there is no pageContent in problemset and only problem-statement, also no problem-statement in other pages.. ~
// ~ considering both are imp even for a fail check, cause if not even initialized, how will the error even caught then ~

const readyCheck = setInterval(() => {
    if (document.querySelector('.problem-statement') || document.querySelector('#pageContent')) {
        clearInterval(readyCheck);
        initialize();
    }
}, 100);

