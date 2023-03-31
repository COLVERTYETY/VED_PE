const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

startBtn.addEventListener('click', async () => {
    const response = await fetch('/start', {
        method: 'POST'
    });

    if (response.ok) {
        console.log('Record started');
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
    } else {
        console.error('Failed to stop record');
    }
});