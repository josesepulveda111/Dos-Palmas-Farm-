import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let firstName = '';
    let lastName = '';
    let email = '';
    let subject = '';
    let message = '';

    if (isJson) {
      const body = await request.json();
      firstName = body.firstName || '';
      lastName = body.lastName || '';
      email = body.email || '';
      subject = body.subject || '';
      message = body.message || '';
    } else {
      const form = await request.formData();
      firstName = String(form.get('firstName') || '');
      lastName = String(form.get('lastName') || '');
      email = String(form.get('email') || '');
      subject = String(form.get('subject') || '');
      message = String(form.get('message') || '');
    }

    if (!firstName || !email || !subject || !message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Faltan campos obligatorios.'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'notificaciones.generales00@gmail.com',
        pass: 'koem xien tpxt ajeq'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();

    const html = generateContactEmailHTML({ firstName, lastName, email, subject, message });

    const mailOptions = {
      from: {
        name: 'Dos Palmas Farm - Contacto',
        address: 'notificaciones.generales00@gmail.com'
      },
      to: ['info@dospalmasfarms.com.co', 'dospalmasfarms@gmail.com'],
      replyTo: email,
      subject: `📩 Nuevo mensaje de contacto: ${subject}`,
      html
    } as any;

    const info = await transporter.sendMail(mailOptions);

    if (!isJson) {
      // Redirect browser form POSTs to the confirmation page
      return new Response(null, { status: 303, headers: { Location: '/contact/sent' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Mensaje enviado correctamente',
      messageId: info.messageId
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al enviar el mensaje de contacto:', error);
    return new Response(JSON.stringify({ success: false, message: 'No se pudo enviar el mensaje' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

function generateContactEmailHTML({ firstName, lastName, email, subject, message }: { firstName: string; lastName: string; email: string; subject: string; message: string; }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nuevo mensaje de contacto</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #f7f7f7; }
        .card { max-width: 640px; margin: 24px auto; background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
        h1 { margin: 0 0 8px; font-size: 20px; }
        .row { margin: 8px 0; }
        .label { color: #666; font-weight: 600; }
        .value { color: #111; }
        .msg { white-space: pre-wrap; background: #fafafa; border: 1px solid #eee; padding: 12px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Nuevo mensaje de contacto</h1>
        <div class="row"><span class="label">Nombre:</span> <span class="value">${firstName} ${lastName || ''}</span></div>
        <div class="row"><span class="label">Email:</span> <span class="value">${email}</span></div>
        <div class="row"><span class="label">Asunto:</span> <span class="value">${subject}</span></div>
        <div class="row"><span class="label">Mensaje:</span></div>
        <div class="msg">${message}</div>
      </div>
    </body>
    </html>
  `;
}


