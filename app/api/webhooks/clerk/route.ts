import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';

export async function POST(req: Request) {
  // 1. Hole das geheime Siegel aus dem Tresor
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // 2. Hole die Sicherheits-Header vom Anruf
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Fehler: Fehlende Svix Header', { status: 400 });
  }

  // 3. Lese die Nachricht
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Überprüfe das Siegel (Ist es wirklich Clerk?)
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err) {
    console.error('Fehler bei der Webhook-Verifizierung:', err);
    return new Response('Fehlerhafte Signatur', { status: 400 });
  }

  // 5. Trage den neuen Nutzer in die Neon-Datenbank ein
  if (evt.type === 'user.created') {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses[0].email_address;

    await db.insert(users).values({
      id: id,
      email: primaryEmail,
    });
    
    console.log(`Erfolg: Nutzer ${id} wurde in die Datenbank eingetragen.`);
  }

  return new Response('Webhook erfolgreich verarbeitet', { status: 200 });
}