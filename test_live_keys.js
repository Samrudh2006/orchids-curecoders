import fs from 'fs';
import path from 'path';

// Parse .env file
const envPath = path.join(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            let value = values.join('=').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[key.trim()] = value;
        }
    }
});

async function testGroq(name, apiKey, baseUrl, model) {
    console.log(`\nTesting ${name} (${model})...`);
    try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Say "Working"' }],
                max_tokens: 10
            })
        });
        if (res.ok) {
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content?.trim();
            console.log(`✅ [WORKING] ${name}: "${reply}"`);
            return { name, status: 'WORKING', reply };
        } else {
            const errText = await res.text();
            console.log(`❌ [FAILED] ${name}: HTTP ${res.status} - ${errText}`);
            return { name, status: 'FAILED', error: `HTTP ${res.status}: ${errText}` };
        }
    } catch (e) {
        console.log(`❌ [ERROR] ${name}: ${e.message}`);
        return { name, status: 'ERROR', error: e.message };
    }
}

async function testMistral(name, apiKey, baseUrl, model) {
    console.log(`\nTesting ${name} (${model})...`);
    try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Say "Working"' }],
                max_tokens: 10
            })
        });
        if (res.ok) {
            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content?.trim();
            console.log(`✅ [WORKING] ${name}: "${reply}"`);
            return { name, status: 'WORKING', reply };
        } else {
            const errText = await res.text();
            console.log(`❌ [FAILED] ${name}: HTTP ${res.status} - ${errText}`);
            return { name, status: 'FAILED', error: `HTTP ${res.status}: ${errText}` };
        }
    } catch (e) {
        console.log(`❌ [ERROR] ${name}: ${e.message}`);
        return { name, status: 'ERROR', error: e.message };
    }
}

async function testSarvam(apiKey) {
    console.log(`\nTesting Sarvam Voice AI...`);
    try {
        const res = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'api-subscription-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: ["Testing voice"],
                target_language_code: "en-IN",
                speaker: "kavya",
                speech_sample_rate: 16000,
                enable_preprocessing: true,
                model: "bulbul:v3"
            })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.audios && data.audios.length > 0) {
                console.log(`✅ [WORKING] Sarvam Voice AI: Audio generated (${data.audios[0].length} chars base64)`);
                return { name: 'Sarvam Voice AI', status: 'WORKING' };
            }
        }
        const errText = await res.text();
        console.log(`❌ [FAILED] Sarvam Voice AI: HTTP ${res.status} - ${errText}`);
        return { name: 'Sarvam Voice AI', status: 'FAILED', error: `HTTP ${res.status}: ${errText}` };
    } catch (e) {
        console.log(`❌ [ERROR] Sarvam Voice AI: ${e.message}`);
        return { name: 'Sarvam Voice AI', status: 'ERROR', error: e.message };
    }
}

async function runTests() {
    console.log("==========================================");
    console.log("  Testing AI API Keys from .env");
    console.log("==========================================");

    await testGroq('Groq / Llama-3.3-70b (Market Data, Patents, Trials, Web Signals)', env.MARKET_DATA_API_KEY, env.MARKET_DATA_BASE_URL, env.MARKET_DATA_MODEL);
    await testMistral('Mistral AI (EXIM Sourcing - open-mistral-nemo)', env.EXIM_SOURCING_API_KEY, env.EXIM_SOURCING_BASE_URL, env.EXIM_SOURCING_MODEL);
    await testMistral('Mistral AI (Internal Docs - mistral-small-latest)', env.INTERNAL_DOCUMENTS_API_KEY, env.INTERNAL_DOCUMENTS_BASE_URL, env.INTERNAL_DOCUMENTS_MODEL);
    await testSarvam(env.SARVAM_API_KEY);

    console.log("\n==========================================");
    console.log("  Test Suite Completed");
    console.log("==========================================");
}

runTests();
