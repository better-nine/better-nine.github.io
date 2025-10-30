const API_URL = 'https://curly-haze-9d14.940raphael.workers.dev';
const RECAPTCHA_SITE_KEY = '';

export async function submitScore({ name, score, durationMs }) {
    const payload = { name, score, durationMs };
    if (typeof localStorage !== 'undefined') {
        const key = 'playerId';
        let id = localStorage.getItem(key);
        if (!id) {
            id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
            localStorage.setItem(key, id);
        }
        payload.playerId = id;
    }

    let recaptchaToken = '';
    if (RECAPTCHA_SITE_KEY && typeof grecaptcha !== 'undefined') {
        try {
            recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
        } catch (err) {
            console.warn('[recaptcha] execute failed', err);
        }
    }
    if (recaptchaToken) payload.recaptchaToken = recaptchaToken;

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function fetchLeaderboard({ limit = 50, period = 'all' } = {}) {
    const url = `${API_URL}?action=top&limit=${limit}&period=${period}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const status = res.status;
    const ok = res.ok;
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();

    console.debug('[LB][HTTP]', { url, status, ok, contentType: ct });
    console.debug('[LB][RAW]', text.slice(0, 400));

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`Invalid JSON: ${e.message}`);
    }

    if (!data || !Array.isArray(data.items)) {
        const err = data && (data.error || data.message);
        throw new Error(`Bad schema: items missing${err ? ` (${err})` : ''}`);
    }
    console.debug('[LB][ITEMS] count', data.items.length, 'sample', data.items.slice(0, 3));
    return data;
}
