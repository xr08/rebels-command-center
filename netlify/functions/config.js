exports.handler = async function (event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { password } = JSON.parse(event.body);
        const masterPassword = process.env.VITE_VAULT_PASSWORD;

        if (!masterPassword) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Vault Master Password not configured on the server." })
            };
        }

        if (password !== masterPassword) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Access Denied: Incorrect Master Password" })
            };
        }

        // Determine the environment variables to expose if password is correct
        // We filter the process.env to ONLY expose specific VITE_ keys needed for the Vault
        // Note: NEVER pass back VITE_GEMINI_API_KEY

        // Fallback support if dotenv is used locally versus Netlify deployment
        const exposeKeys = [
            'VITE_ROUTER2_IP', 'VITE_ROUTER2_ADMIN_PASSWORD', 'VITE_ROUTER2_SSID', 'VITE_ROUTER2_WIFI_KEY', 'VITE_ROUTER2_MAC', 'VITE_ROUTER2_SN', 'VITE_ROUTER2_DEVICE_ID',
            'VITE_CLUB_EMAIL', 'VITE_CLUB_PASSWORD', 'VITE_INTERNET_ACCOUNT', 'VITE_SOCIAL_MEDIA_ADMIN',
            'VITE_CAM1_IP', 'VITE_CAM2_IP', 'VITE_CAM3_IP',
            'VITE_MODEM_IP', 'VITE_MODEM_SSID', 'VITE_MODEM_WIFI_KEY', 'VITE_MODEM_MAC', 'VITE_MODEM_IMEI',
            'VITE_ROUTER1_IP', 'VITE_ROUTER1_ADMIN_PASSWORD', 'VITE_ROUTER1_SSID', 'VITE_ROUTER1_WIFI_KEY', 'VITE_ROUTER1_MAC', 'VITE_ROUTER1_SN', 'VITE_ROUTER1_DEVICE_ID'
        ];

        const safeEnv = {};
        exposeKeys.forEach(key => {
            if (process.env[key] !== undefined) {
                safeEnv[key] = process.env[key];
            }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(safeEnv)
        };

    } catch (err) {
        console.error("Config Function Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
};
