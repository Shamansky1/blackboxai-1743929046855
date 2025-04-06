// Main application script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize system metrics display
    updateSystemMetrics();
    
    // Update metrics every second
    setInterval(updateSystemMetrics, 1000);

    // Initialize charts if on system dashboard
    if (document.getElementById('cpuChart')) {
        initCharts();
    }

    // Initialize music player if on main page
    if (document.getElementById('playBtn')) {
        initMusicPlayer();
    }
});

// Update all system metric displays
function updateSystemMetrics() {
    try {
        // CPU
        const cpuPercent = systemData.cpu.usage;
        document.getElementById('cpu-usage')?.textContent = `${cpuPercent}%`;
        document.getElementById('cpu-bar')?.style.width = `${cpuPercent}%`;
        document.getElementById('cpu-percent')?.textContent = `${cpuPercent}%`;

        // RAM
        const ramPercent = systemData.ram.usage;
        document.getElementById('ram-usage')?.textContent = `${ramPercent}%`;
        document.getElementById('ram-bar')?.style.width = `${ramPercent}%`;
        document.getElementById('ram-percent')?.textContent = `${ramPercent}%`;

        // Storage
        const storagePercent = systemData.storage.usage;
        document.getElementById('storage-usage')?.textContent = `${storagePercent}%`;
        document.getElementById('storage-bar')?.style.width = `${storagePercent}%`;
        document.getElementById('storage-percent')?.textContent = `${storagePercent}%`;

        // Temperature
        const tempValue = systemData.temperature.cpu;
        document.getElementById('temp-usage')?.textContent = `${tempValue}°C`;
        document.getElementById('temp-bar')?.style.width = `${tempValue}%`;
        document.getElementById('cpu-temp')?.textContent = `${tempValue}°C`;
        document.getElementById('cpu-temp-value')?.textContent = `${tempValue}°C`;

    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

// Initialize system dashboard charts
function initCharts() {
    try {
        // CPU Chart
        const cpuCtx = document.getElementById('cpuChart').getContext('2d');
        const cpuChart = new Chart(cpuCtx, {
            type: 'line',
            data: {
                labels: Array(10).fill('').map((_, i) => `${i+1}s`),
                datasets: [{
                    label: 'CPU Usage',
                    data: Array(10).fill(systemData.cpu.usage),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { min: 0, max: 100 } }
            }
        });

        // RAM Chart
        const ramCtx = document.getElementById('ramChart').getContext('2d');
        const ramChart = new Chart(ramCtx, {
            type: 'line',
            data: {
                labels: Array(10).fill('').map((_, i) => `${i+1}s`),
                datasets: [{
                    label: 'RAM Usage',
                    data: Array(10).fill(systemData.ram.usage),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { min: 0, max: 100 } }
            }
        });

        // Storage Chart
        const storageCtx = document.getElementById('storageChart').getContext('2d');
        const storageChart = new Chart(storageCtx, {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Free'],
                datasets: [{
                    data: [systemData.storage.usage, 100 - systemData.storage.usage],
                    backgroundColor: ['#f59e0b', '#1f2937'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: { legend: { position: 'bottom' } }
            }
        });

        // Temperature Chart
        const tempCtx = document.getElementById('tempChart').getContext('2d');
        const tempChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: Array(10).fill('').map((_, i) => `${i+1}s`),
                datasets: [{
                    label: 'CPU Temp',
                    data: Array(10).fill(systemData.temperature.cpu),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { min: 30, max: 100 } }
            }
        });

        // Update charts periodically
        setInterval(() => {
            updateChartData(cpuChart, systemData.cpu.usage);
            updateChartData(ramChart, systemData.ram.usage);
            updateChartData(tempChart, systemData.temperature.cpu);
            storageChart.data.datasets[0].data = [
                systemData.storage.usage, 
                100 - systemData.storage.usage
            ];
            storageChart.update();
        }, 2000);

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Update chart data
function updateChartData(chart, newValue) {
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(newValue);
    chart.update();
}

// Initialize music player
function initMusicPlayer() {
    try {
        const bgMusic = new Audio('Chill Music — Deep Focus & Inspiring Mix-yt.savetube.me.mp3');
        bgMusic.loop = true;
        
        const playBtn = document.getElementById('playBtn');
        const volumeControl = document.getElementById('volumeControl');
        const volumeIcon = document.getElementById('volumeIcon');

        // Restore state from localStorage
        const savedVolume = localStorage.getItem('musicVolume');
        const savedState = localStorage.getItem('musicPlaying');
        
        if (savedVolume) {
            bgMusic.volume = parseFloat(savedVolume);
            volumeControl.value = savedVolume;
            updateVolumeIcon();
        }

        if (savedState === 'true') {
            bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }

        // Play/pause toggle
        playBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                localStorage.setItem('musicPlaying', 'true');
            } else {
                bgMusic.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                localStorage.setItem('musicPlaying', 'false');
            }
        });

        // Volume control
        volumeControl.addEventListener('input', () => {
            bgMusic.volume = volumeControl.value;
            localStorage.setItem('musicVolume', volumeControl.value);
            updateVolumeIcon();
        });

        function updateVolumeIcon() {
            if (volumeControl.value == 0) {
                volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else if (volumeControl.value < 0.5) {
                volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        }

    } catch (error) {
        console.error('Error initializing music player:', error);
    }
}
