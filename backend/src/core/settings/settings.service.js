const {query} = require("../db/pool"); // pg or sequelize

let SETTINGS_CACHE = {};

async function loadSettings() {
    const res = await query(`SELECT key, value FROM settings`);

    SETTINGS_CACHE = {};
    res.rows.forEach(r => {
        SETTINGS_CACHE[r.key] = r.value;
    });

    console.log("✅ App settings loaded");
}

function getSetting(key) {
    return SETTINGS_CACHE[key] || null;
}

function getAllSettings() {
    return SETTINGS_CACHE;
}

module.exports = {
    loadSettings,
    getSetting,
    getAllSettings
};
