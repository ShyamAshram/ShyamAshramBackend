const twilio = require('twilio');

const sendWhatsApp = async (to, message) => {
  const accountSid = 'AC9ddfce04639962927bcde648aada6d5d';
  const authToken = '5171fe202823e09064574fb7ed079b8a';
  const client = twilio(accountSid, authToken);

  const formattedTo = `whatsapp:${to.replace(/\s+/g, '')}`;

  try {
    await client.messages.create({
      body: message,
      from:'whatsapp:+14155238886', 
      to: formattedTo,
    });
    console.log(`Mensaje de WhatsApp enviado a ${to}`);
  } catch (error) {
    console.error(`Error al enviar WhatsApp a ${to}:`, error);
  }
};

module.exports = sendWhatsApp;
