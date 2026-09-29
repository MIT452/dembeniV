/**
 * @desc    Get Welcome Message
 * @route   GET /api/welcome
 * @access  Public
 */
const getWelcomeMessage = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Node.js Express API!',
        data: {
            version: '1.0.0',
            description: 'This is a complete boilerplate setup for your backend.'
        }
    });
};

module.exports = {
    getWelcomeMessage
};
