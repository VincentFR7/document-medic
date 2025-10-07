import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // ⚠️ clé secrète !
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }

  try {
    const { email, supervisorGrade, supervisorId } = JSON.parse(event.body);

    // Vérification de la permission
    if (supervisorGrade !== 'Superviseur de l\'ordre médical') {
      return { statusCode: 403, body: 'Accès refusé : grade insuffisant.' };
    }

    // Génération d’un mot de passe temporaire fort
    const tempPassword = Math.random().toString(36).slice(-10) + '!' + Math.floor(Math.random() * 100);

    // Mise à jour du mot de passe utilisateur via Supabase Admin API
    const { data: user, error } = await supabase.auth.admin.updateUserByEmail(email, {
      password: tempPassword,
    });

    if (error) {
      console.error(error);
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }

    // Envoi d’un mail au membre (facultatif)
    const { error: mailError } = await supabase.functions.invoke('send_reset_notice', {
      body: {
        to: email,
        tempPassword,
        supervisorId,
      },
    });

    if (mailError) console.warn('⚠️ Mail non envoyé, vérifier la function send_reset_notice.');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Mot de passe temporaire généré avec succès.',
        tempPassword,
      }),
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: 'Erreur serveur interne.' };
  }
}
