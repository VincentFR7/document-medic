export async function handler(event) {
  const { to, tempPassword, supervisorId } = JSON.parse(event.body);

  // Utilisation d’un service mail type Resend, SendGrid, Mailgun ou EmailJS.
  // Exemple simple avec EmailJS (si activé sur ton Netlify)
  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: {
          to_email: to,
          subject: '🔐 Réinitialisation du mot de passe – DataPad Omega',
          message: `
Bonjour,

Votre mot de passe a été réinitialisé par un Superviseur de l'ordre médical.
Voici votre mot de passe temporaire :

➡️ ${tempPassword}

Merci de vous reconnecter au DataPad et de le modifier immédiatement.

— Direction du Corps Médical OMEGA
          `,
        },
      }),
    });

    return { statusCode: 200, body: 'Email envoyé avec succès.' };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: 'Échec envoi email.' };
  }
}
