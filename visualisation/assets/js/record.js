const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusBtn = document.getElementById('statusRecord');

window.addEventListener('pageshow', async () => {
    const response = await fetch('/statusrecord', {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        if (data.record) {
            statusBtn.style.backgroundColor = "green";
            statusBtn.innerText = "Recording";
        } else {
            statusBtn.style.backgroundColor = "red";
            statusBtn.innerText = "Not recording";
        }
    } else {
        console.error('Failed to get record status');
    }
})

startBtn.addEventListener('click', async () => {
    const response = await fetch('/start', {
        method: 'POST'
    });

    if (response.ok) {
        console.log('Record started');
        statusBtn.style.backgroundColor = "green";
        statusBtn.innerText = "Recording";
    } else {
        console.error('Failed to start record');
    }
});

stopBtn.addEventListener('click', async () => {
    const response = await fetch('/stop', {
        method: 'POST'
    });

    if (response.ok) {
        console.log('Record stopped');
        statusBtn.style.backgroundColor = "red";
        statusBtn.innerText = "Not recording";
    } else {
        console.error('Failed to stop record');
    }
});