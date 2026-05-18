import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: smtpPort,
      secure: smtpPort === 465, // true para port 465 (TLS directo), false para otros (como 587 con STARTTLS)
      requireTLS: true, // Fuerza el uso de TLS/STARTTLS para asegurar cifrado en tránsito
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false, // Permite certificados auto-firmados en desarrollo local si es necesario
      },
    });
  }

  async sendTaskAssignmentNotification(
    email: string,
    projectName: string,
    taskTitle: string,
    estado: string,
  ): Promise<void> {
    try {
      const logoPath = path.join(process.cwd(), 'frontend', 'public', 'brand', 'logo-color.png');

      await this.transporter.sendMail({
        from: `"Task Flow Pro" <${this.configService.get<string>('SMTP_USER')}>`,
        to: email,
        subject: `Nueva Tarea Asignada: ${taskTitle}`,
        text: `Hola,\n\nSe te ha asignado una nueva tarea en el proyecto "${projectName}".\n\nDetalles:\n- Tarea: ${taskTitle}\n- Estado inicial: ${estado}\n\nPor favor, revisa el sistema para más detalles.\n\nSaludos,\nEl equipo de Task Flow Pro`,
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              }
              .header {
                background-color: #2c3e50;
                padding: 30px;
                text-align: center;
              }
              .header img {
                max-width: 150px;
                height: auto;
              }
              .content {
                padding: 40px 30px;
                color: #333333;
              }
              .content h2 {
                color: #2c3e50;
                margin-top: 0;
                font-size: 24px;
              }
              .details-box {
                background-color: #f8f9fa;
                border-left: 4px solid #3498db;
                padding: 20px;
                margin: 25px 0;
                border-radius: 4px;
              }
              .details-box p {
                margin: 10px 0;
                font-size: 16px;
              }
              .details-box strong {
                color: #2c3e50;
                display: inline-block;
                width: 120px;
              }
              .status-badge {
                display: inline-block;
                background-color: #f39c12;
                color: white;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .footer {
                background-color: #ecf0f1;
                text-align: center;
                padding: 20px;
                font-size: 13px;
                color: #7f8c8d;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="cid:logo_brand" alt="Task Flow Pro Logo">
              </div>
              <div class="content">
                <h2>¡Nueva Tarea Asignada!</h2>
                <p>Hola,</p>
                <p>Se te ha asignado una nueva tarea en la plataforma. Por favor, revisa los detalles a continuación para comenzar a trabajar oportunamente.</p>
                
                <div class="details-box">
                  <p><strong>Proyecto:</strong> ${projectName}</p>
                  <p><strong>Tarea:</strong> ${taskTitle}</p>
                  <p><strong>Estado:</strong> <span class="status-badge">${estado}</span></p>
                </div>
                
                <p>Accede al sistema para ver más información y gestionar tu nueva tarea.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Task Flow Pro. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no respondas a esta dirección.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: 'logo-color.png',
            path: logoPath,
            cid: 'logo_brand',
          },
        ],
      });
      this.logger.log(`Correo de notificación enviado exitosamente a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando correo a ${email}: ${error.message}`, error.stack);
    }
  }
}
