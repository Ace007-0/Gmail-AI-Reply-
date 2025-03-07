console.log("Email Writer Extension - Content Script Loaded");

// Function to create AI Button and Dropdown
function createAIButtonWithDropdown() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '6px';

    // Create the dropdown
    const toneSelector = document.createElement('select');
    toneSelector.className = 'ai-tone-selector';
    toneSelector.style.padding = '4px';
    toneSelector.style.border = '1px solid #ccc';
    toneSelector.style.borderRadius = '4px';
    toneSelector.style.fontSize = '14px';

    const toneOptions = ['Professional', 'Friendly', 'Casual'];
    toneOptions.forEach(tone => {
        const option = document.createElement('option');
        option.value = tone.toLowerCase();
        option.innerText = tone;
        toneSelector.appendChild(option);
    });

    // Create the AI button
    const button = document.createElement('div');
    button.className = 'T-J J-J5-Ji aoO v7 T-I-atl L3 custom-ai-reply-button';
    button.style.marginRight = '8px';
    button.style.backgroundColor = 'blue'; // Initial color set to blue
    button.style.color = 'white';
    button.style.padding = '8px 12px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.innerHTML = "AI Buddy";
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');

    button.addEventListener('click', async () => {
        button.innerText = 'Generating...';
        button.style.opacity = '0.6';
        button.disabled = true;
        button.style.backgroundColor = 'red'; // Change to red when clicked

        try {
            const emailContent = getEmailContent();
            const selectedTone = toneSelector.value;

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailContent: emailContent, tone: selectedTone })
            });

            if (!response.ok) throw new Error('API Request Failed');

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerText = 'AI Buddy';
            button.style.opacity = '1';
            button.disabled = false;
            button.style.backgroundColor = 'blue'; // Revert to blue after response
        }
    });

    // Append dropdown and button
    container.appendChild(toneSelector);
    container.appendChild(button);

    return container;
}

// Function to get email content
function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '.gU.Up', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

// Function to find toolbar
function findComposeToolbar() {
    const selectors = ['.btc', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

// Function to inject the AI button with dropdown
function injectButton() {
    document.querySelectorAll('.custom-ai-reply-button, .ai-tone-selector').forEach(el => el.remove());

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, injecting AI button with dropdown");
    const aiButtonWithDropdown = createAIButtonWithDropdown();
    toolbar.insertBefore(aiButtonWithDropdown, toolbar.firstChild);
}

// Monitor Gmail's compose window
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh,.btc, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

console.log("Mutation observer set up.");
