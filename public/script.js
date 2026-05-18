// Dynamic Time-Based Prediction Engine
function updateEngine() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // Calculate time left in the current 1-minute block
    const timeLeft = 60 - seconds;
    document.getElementById('lbl-timer').innerText = `00:${timeLeft.toString().padStart(2, '0')}`;

    // Generate specific, unchangeable seed patterns bound to the current absolute minute
    const currentPeriodSeed = (hours * 60) + minutes;
    
    const dateString = now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0');
    
    // Set the live game period number
    document.getElementById('lbl-period').innerText = `${dateString}100${currentPeriodSeed}`;

    // Prediction arrays
    const colors = ["GREEN", "RED", "GREEN", "RED", "RED", "GREEN"];
    const sizes = ["BIG", "SMALL", "SMALL", "BIG", "BIG"];

    const chosenColor = colors[currentPeriodSeed % colors.length];
    const chosenSize = sizes[currentPeriodSeed % sizes.length];

    const colorEl = document.getElementById('lbl-color');
    colorEl.innerText = chosenColor;
    if(chosenColor === "GREEN") {
        colorEl.className = "text-3xl font-black tracking-wide text-emerald-400";
    } else {
        colorEl.className = "text-3xl font-black tracking-wide text-rose-500";
    }
    document.getElementById('lbl-size').innerText = chosenSize;
}

// Real-time synchronization loop
setInterval(updateEngine, 1000);
updateEngine();

// Handle Form Submissions
async function submitUID() {
    const uid = document.getElementById('input-uid').value.trim();
    if (!uid) return alert("Please enter a valid Game UID.");

    document.getElementById('form-container').innerHTML = `
        <div class="text-center p-4 bg-white/5 border border-white/5 rounded-xl">
            <div class="animate-spin inline-block w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full mb-3"></div>
            <p class="text-sm font-semibold text-neutral-200">Verifying UID with Partner Nodes...</p>
            <p class="text-xs text-neutral-400 mt-1">This verification process takes roughly 15-30 minutes. Do not close this browser window.</p>
        </div>
    `;

    // Fire verification notification trigger to backend
    await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
    });

    // Cache the submitted UID locally
    localStorage.setItem('user_uid', uid);

    // Start checking periodically if the admin approved it
    startStatusCheckLoop(uid);
}

function startStatusCheckLoop(uid) {
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`/api/check-status?uid=${uid}`);
            const data = await res.json();

            if (data.status === "approved") {
                clearInterval(interval);
                // Unblur dashboard completely
                document.getElementById('gate-overlay').classList.add('opacity-0', 'pointer-events-none');
                document.getElementById('prediction-panel').classList.remove('blur-xl', 'pointer-events-none', 'select-none');
            }
        } catch (err) {
            console.error("Status polling failed", err);
        }
    }, 10000); // Poll server every 10 seconds
}

// Auto-login configuration check on load
window.onload = () => {
    const savedUID = localStorage.getItem('user_uid');
    if (savedUID) {
        document.getElementById('form-container').innerHTML = `
            <div class="text-center p-4 bg-white/5 border border-white/5 rounded-xl">
                <p class="text-sm font-semibold text-neutral-200">Awaiting Server Whitelist Approval...</p>
                <p class="text-xs text-neutral-400 mt-1">UID: ${savedUID}</p>
            </div>
        `;
        startStatusCheckLoop(savedUID);
    }
};
