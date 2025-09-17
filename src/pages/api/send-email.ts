import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { cart, customerInfo } = await request.json();
    
    // Validar datos
    if (!cart || !cart.lines || cart.lines.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Carrito vacío' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.name) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Información del cliente incompleta' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Configurar transporter
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

    // Verificar conexión
    await transporter.verify();

    // Generar HTML del email
    const emailHTML = generateOrderEmailHTML(cart, customerInfo);

    // Configurar el email
    const mailOptions = {
      from: {
        name: 'Dos Palmas Farm',
        address: 'notificaciones.generales00@gmail.com'
      },
      to: [customerInfo.email, 'info@dospalmasfarms.com.co', 'dospalmasfarms@gmail.com'],
      subject: `🌹 Confirmación de Pedido - ${customerInfo.name}`,
      html: emailHTML
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado exitosamente:', info.messageId);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email enviado correctamente',
      messageId: info.messageId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al enviar email:', error);
    
    let errorMessage = 'Error al enviar el email';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
        errorMessage = 'Error de autenticación. Verifica las credenciales del email.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Inténtalo de nuevo.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Error de DNS. Verifica tu conexión a internet.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: errorMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function generateOrderEmailHTML(cart: any, customerInfo: any): string {
  const itemsHTML = cart.lines.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.merchandise.product.featuredImage?.url || '/images/product_image404.jpg'}" 
             alt="${item.merchandise.product.title}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.merchandise.product.title}</strong><br>
        <small>${item.merchandise.title}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${parseFloat(item.cost.totalAmount.amount).toFixed(2)} ${item.cost.totalAmount.currencyCode}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Pedido - Dos Palmas Farm</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 10px; 
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { margin: 0; font-size: 28px; }
        .header h2 { margin: 10px 0 0 0; font-size: 18px; opacity: 0.9; }
        .content { padding: 30px 20px; }
        .customer-info { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 25px; 
          border-left: 4px solid #667eea;
        }
        .order-details { 
          background: #fff; 
          border: 1px solid #e9ecef; 
          border-radius: 8px; 
          padding: 20px; 
          margin-bottom: 25px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px;
        }
        th { 
          background: #f8f9fa; 
          padding: 12px; 
          text-align: left; 
          border-bottom: 2px solid #dee2e6; 
          font-weight: 600;
        }
        td { padding: 12px; border-bottom: 1px solid #dee2e6; }
        .total { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin-top: 20px; 
          border: 1px solid #e9ecef;
        }
        .total h3 { margin-top: 0; color: #495057; }
        .footer { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          border-top: 1px solid #e9ecef;
        }
        .footer p { margin: 5px 0; color: #6c757d; }
        .highlight { color: #667eea; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌹 Dos Palmas Farm</h1>
          <h2>Confirmación de Pedido</h2>
        </div>

        <div class="content">
          <div class="customer-info">
            <h3 style="margin-top: 0; color: #495057;">Información del Cliente</h3>
            <p><strong>Nombre:</strong> <span class="highlight">${customerInfo.name}</span></p>
            <p><strong>Email:</strong> <span class="highlight">${customerInfo.email}</span></p>
            <p><strong>Teléfono:</strong> ${customerInfo.phone || 'No proporcionado'}</p>
            <p><strong>Dirección:</strong> ${customerInfo.address || 'No proporcionada'}</p>
          </div>

          <div class="order-details">
            <h3 style="margin-top: 0; color: #495057;">Detalles del Pedido</h3>
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="total">
              <h3>Resumen del Pedido</h3>
              <p><strong>Subtotal:</strong> $${parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)} ${cart.cost.subtotalAmount.currencyCode}</p>
              <p><strong>Impuestos:</strong> $${parseFloat(cart.cost.totalTaxAmount.amount).toFixed(2)} ${cart.cost.totalTaxAmount.currencyCode}</p>
              <p style="font-size: 18px; margin-bottom: 0;"><strong>Total:</strong> <span class="highlight">$${parseFloat(cart.cost.totalAmount.amount).toFixed(2)} ${cart.cost.totalAmount.currencyCode}</span></p>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>¡Gracias por tu pedido!</strong></p>
          <p>Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
          <p style="margin-top: 15px; font-size: 14px;"><strong>Dos Palmas Farm</strong> - Tu tienda de flores de confianza</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

