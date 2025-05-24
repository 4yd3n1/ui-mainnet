const RandomWordRequester = require('../../hardhat-project/scripts/autoRequestRandomWord.js');

class RandomWordService {
    constructor() {
        this.requester = null;
    }

    start() {
        if (this.requester) {
            console.log('Random word service already running');
            return;
        }

        this.requester = new RandomWordRequester();
        this.requester.start().catch(error => {
            console.error('Failed to start random word service:', error);
            this.requester = null;
        });
    }

    stop() {
        if (!this.requester) {
            console.log('Random word service not running');
            return;
        }

        this.requester.stop();
        this.requester = null;
    }

    isRunning() {
        return this.requester !== null && this.requester.isRunning;
    }
}

// Create singleton instance
const randomWordService = new RandomWordService();

module.exports = randomWordService; 