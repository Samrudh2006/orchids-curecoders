
async function testAuth() {
    console.log("Testing registration...");
    const email = 'user_' + Date.now() + '@example.com';
    const password = 'password123';
    
    try {
        const res = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const text = await res.text();
        console.log("Register response status:", res.status);
        console.log("Register response body:", text);

        console.log("Testing login...");
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginText = await loginRes.text();
        console.log("Login response status:", loginRes.status);
        console.log("Login response body:", loginText);

    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testAuth();
