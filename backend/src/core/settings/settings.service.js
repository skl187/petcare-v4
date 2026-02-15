const {query} = require("../db/pool"); // pg or sequelize

let SETTINGS_CACHE = {};

let IS_LOADED = false;

async function loadSettings(){
    try {
    const res = await query(`SELECT key,value FROM app_settings`);

    SETTINGS_CACHE = {};
    res.rows.forEach(r=>{
        SETTINGS_CACHE[r.key] = r.value;
    });

    IS_LOADED = true;
    console.log("✅ Settings loaded");
    } catch (err) {
        // If the settings table doesn't exist yet (migrations not run) or DB is unavailable,
        // do not crash the application — keep an empty settings cache and log a warning.
        console.warn('⚠️ Could not load settings (table may be missing or DB down):', err.message);
        SETTINGS_CACHE = {};
    }
}

function isLoaded(){
    return IS_LOADED;
}

function getSetting(key){
    if(!IS_LOADED){
        throw new Error("Settings not loaded yet");
    }
    return SETTINGS_CACHE[key] || null;
}

// 👇 ADD THIS
function getAllSettings(){
    return SETTINGS_CACHE;
}

module.exports = {
    loadSettings,
    getSetting,
    isLoaded,
    getAllSettings
};
