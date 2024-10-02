const mongoose = require('mongoose');
const config = require('../config.json');

const editorSessionSchema = new mongoose.Schema({
    _id: String,
    user_id: String,
    created_at: { type: Date, default: Date.now },
    rankCardData: {
        xp: Number,
        level: Number,
        rank: Number,
        avatarURL: String,
        progressBarColor: String,
        unlockedBackgrounds: Array,
        background: String,
        candyColor: String
    }
});

module.exports = mongoose.model('EditorSession', editorSessionSchema, config.mongoDB.editorSessionsCollectionName);