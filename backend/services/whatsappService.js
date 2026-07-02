// Tokens will be read dynamically to ensure dotenv is fully loaded

export const isWhatsAppConfigured = () =>
    Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

export const sendWhatsAppNotification = async ({ to, templateName, languageCode, parameters }) => {
    try {
        const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
        const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v17.0";

        if (!WHATSAPP_API_TOKEN) {
            console.warn("WHATSAPP_API_TOKEN is not set — skipping WhatsApp notification");
            return false;
        }

        if (!WHATSAPP_PHONE_NUMBER_ID) {
            console.warn("WHATSAPP_PHONE_NUMBER_ID is not set — skipping WhatsApp notification");
            return false;
        }

        const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const body = {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: languageCode || "en"
                }
            }
        };

        if (parameters && parameters.length > 0) {
            body.template.components = [
                {
                    type: "body",
                    parameters: parameters.map((value) => ({
                        type: "text",
                        text: String(value)
                    }))
                }
            ];
        }

        if (WHATSAPP_API_TOKEN === "demo_token") {
            console.log("🟢 [DEMO MODE] WhatsApp Notification Mocked!");
            console.log(`➡️  To: ${to}`);
            console.log(`📋  Template: ${templateName}`);
            console.log(`📦  Parameters:`, parameters);
            return true;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("WhatsApp API error:", response.status, errorData);
            return false;
        }

        console.log("WhatsApp notification sent successfully to", to);
        return true;

    } catch (error) {
        console.error("Failed to send WhatsApp notification:", error);
        return false;
    }
};
