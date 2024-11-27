let mockProgress = {
    percentage: 0,
    speed: '0 KB/s',
    peers: 0,
    status: 'stopped',
};

const simulateProgress = () => {
    if (mockProgress.percentage >= 100) {
        mockProgress.status = 'completed';
        return;
    }
    mockProgress.percentage += Math.floor(Math.random() * 10) + 1;
    mockProgress.percentage = Math.min(mockProgress.percentage, 100);
    mockProgress.speed = `${(Math.random() * 5 + 1).toFixed(2)} MB/s`;
    mockProgress.peers = Math.floor(Math.random() * 50) + 1;
    mockProgress.status = 'downloading';
};

module.exports = { simulateProgress, mockProgress };
