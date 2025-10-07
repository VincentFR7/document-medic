import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }
  try {
    const { email, requesterGrade } = JSON.parse(event.body);
    const allowed = ['Superviseur de l\'ordre médical'];
    if (!allowed.includes(requesterGrade)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Accès refusé : grade insuffisant' }) };
    }
    // Récupérer l'utilisateur via l'API Admin et mettre à jour le mot de passe
    // Supabase n'expose pas directement tous les endpoints admin via REST simple;
    // on utilise l'endpoint admin pour modifications via /auth/v1/admin.
    // 1) Rechercher l'utilisateur par email

    const listResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
    });
    const listJson = await listResp.json();
    if (!Array.isArray(listJson) || listJson.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Utilisateur introuvable' }) };
    }
    const user = listJson[0];
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
    // 2) Mettre à jour le mot de passe via PATCH
    const patchResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'PUT',
      headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, password: tempPassword })
    });
    const patchJson = await patchResp.json();
    if (patchJson?.error) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Impossible de mettre à jour le mot de passe' }) };
    }
    // Optionnel : envoyer un email via votre propre système pour communiquer le mot de passe temporaire.
    // Ici on renvoie success au client. On recommande d'utiliser les templates Supabase ou un envoi mail externe.
    return { statusCode: 200, body: JSON.stringify({ success: true, message: 'Mot de passe temporaire défini. Communiquez le mot de passe au membre de façon sécurisée.' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 400, body: JSON.stringify({ error: 'Requête invalide.' }) };
  }
}
