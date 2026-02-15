const urlParams = new URLSearchParams(window.location.search);
let prankId = urlParams.get('id');

if (!prankId) {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2 && (pathParts[1] === 'prank' || pathParts[1] === 'dashboard')) {
        prankId = pathParts[2];
    }
}

// Elements
const step1 = document.getElementById('step-1'); // Phone + Consent
const step2 = document.getElementById('step-2'); // OTP
const step3 = document.getElementById('step-3'); // Names
const step4 = document.getElementById('step-4'); // Loading
const step5 = document.getElementById('step-5'); // Result

const phoneForm = document.getElementById('phone-form');
const otpForm = document.getElementById('otp-form');
const namesForm = document.getElementById('names-form');
const backBtn = document.getElementById('back-btn');

let phoneNumber = '';
let creatorName = '';

// Check if prankId exists
if (!prankId) {
    alert('Invalid Prank Link! Redirecting to home...');
    window.location.href = '/';
}

// Fetch prank creator name (optional, maybe frontend wants to show "calculator created by X" or hide it?)
// Actually we only need creator name for the reveal at the END. 
// But let's check if the prank is valid first.
fetch(`/api/prank/${prankId}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert('Prank not found!');
            window.location.href = '/';
        }
        creatorName = data.creatorName;
        // Optimization: Could cache creatorName here.
    });


// STEP 1: Phone + Consent
phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    phoneNumber = document.getElementById('phoneNumber').value.trim();
    const consent = document.getElementById('consent').checked;

    if (!consent) return alert("You must agree to the terms.");

    try {
        const res = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });
        const data = await res.json();

        if (data.success) {
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Error sending OTP');
    }
});


// STEP 2: Verify OTP
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('otp').value.trim();

    try {
        const res = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, otp })
        });
        const data = await res.json();

        if (data.success) {
            step2.classList.add('hidden');
            step3.classList.remove('hidden');
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Error verifying OTP');
    }
});

backBtn.addEventListener('click', () => {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
});


// STEP 3: Submit Names & Get Pranked
namesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const victimName = document.getElementById('victimName').value.trim();
    const crushName = document.getElementById('crushName').value.trim();

    // Show loading immediately
    step3.classList.add('hidden');
    step4.classList.remove('hidden');

    try {
        // Send data to backend
        const res = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prankId,
                phoneNumber,
                victimName,
                crushName
            })
        });
        const data = await res.json();

        // Simulate "Love Calculation" loading
        let progress = 0;
        const bar = document.getElementById('progress-bar');
        const loadingText = document.getElementById('loading-text');

        const interval = setInterval(() => {
            progress += 5;
            bar.style.width = `${progress}%`;

            if (progress < 30) loadingText.textContent = "Scanning DNA...";
            else if (progress < 60) loadingText.textContent = "Analyzing Compatibility...";
            else if (progress < 90) loadingText.textContent = "Checking Astrology...";

            if (progress >= 100) {
                clearInterval(interval);
                showResult(data);
            }
        }, 100);

    } catch (err) {
        console.error(err);
        alert('Error calculating results (or server error)');
        step4.classList.add('hidden');
        step3.classList.remove('hidden');
    }
});


function showResult(data) {
    step4.classList.add('hidden');
    step5.classList.remove('hidden');

    const scoreEl = document.getElementById('score');
    const resultText = document.getElementById('result-text');
    const reveal = document.getElementById('prank-reveal');
    const pranksterName = document.getElementById('prankster-name');
    const crushReveal = document.getElementById('crush-reveal');

    // Counts up to actual score
    let currentScore = 0;
    const targetScore = data.lovePercentage || 69; // fallback

    const scoreInterval = setInterval(() => {
        currentScore++;
        scoreEl.textContent = `${currentScore}%`;
        if (currentScore >= targetScore) {
            clearInterval(scoreInterval);

            // Show Reveal
            setTimeout(() => {
                reveal.classList.remove('hidden');
                pranksterName.textContent = data.creatorName || "Anonymous";
                crushReveal.textContent = document.getElementById('crushName').value; // from input closure or fetch
                scoreEl.style.color = "#ff4757"; // final color

                // Confetti or shake effect here if we had library
                document.getElementById('main-card').style.animation = "shake 0.5s";
            }, 1000);
        }
    }, 20);

    if (targetScore > 80) resultText.textContent = "Calculated Soulmates! ❤️";
    else if (targetScore > 50) resultText.textContent = "Good Potential! 💕";
    else resultText.textContent = "Maybe try someone else? 😅";
}
