document.getElementById('create-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const creatorName = document.getElementById('creatorName').value.trim();
    if (!creatorName) return alert('Please enter your name');

    try {
        const res = await fetch('/api/create-prank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creatorName })
        });
        const data = await res.json();

        if (data.success) {
            const prankUrl = `${window.location.origin}/prank.html?id=${data.prankId}`;
            const dashboardUrl = `${window.location.origin}/dashboard.html?id=${data.prankId}`;

            document.getElementById('create-form').classList.add('hidden');
            document.getElementById('result').classList.remove('hidden');

            const linkBox = document.getElementById('prank-link');
            linkBox.textContent = prankUrl;

            document.getElementById('dashboard-link').href = dashboardUrl;
            document.getElementById('dashboard-link').textContent = `View Dashboard (Keep Secret!)`;

            document.getElementById('copy-btn').onclick = () => {
                navigator.clipboard.writeText(prankUrl);
                alert('Copied to clipboard!');
            };
        } else {
            alert(data.message || 'Error creating prank');
        }
    } catch (err) {
        console.error(err);
        alert('Server connection error');
    }
});
