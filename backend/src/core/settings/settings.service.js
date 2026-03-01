const { query } = require('../db/pool');
const logger = require('../utils/logger');

let SETTINGS_CACHE = {};

let IS_LOADED = false;

// Callbacks to run when settings are reloaded (e.g. reset email transporter cache)
const onReloadCallbacks = [];

function onSettingsReload(fn) {
    onReloadCallbacks.push(fn);
}

async function loadSettings() {
    try {
        const res = await query(`SELECT key,value FROM app_settings`);

        SETTINGS_CACHE = {};
        res.rows.forEach(r => {
            SETTINGS_CACHE[r.key] = r.value;
        });

        IS_LOADED = true;

        // Notify subscribers that settings changed (e.g. reset cached transporters)
        onReloadCallbacks.forEach(fn => { try { fn(); } catch { /* ignore */ } });

        logger.info('Settings loaded');
    } catch (err) {
        // If the settings table doesn't exist yet (migrations not run) or DB is unavailable,
        // do not crash the application — keep an empty settings cache and log a warning.
        logger.warn('Could not load settings (table may be missing or DB down)', err);
        SETTINGS_CACHE = {};
    }
}

function isLoaded() {
    return IS_LOADED;
}

function getSetting(key) {
    if (!IS_LOADED) {
        throw new Error('Settings not loaded yet');
    }
    return SETTINGS_CACHE[key] || null;
}

function getAllSettings() {
    return SETTINGS_CACHE;
}

module.exports = {
    loadSettings,
    getSetting,
    isLoaded,
    getAllSettings,
    onSettingsReload
};
