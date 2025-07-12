import { Appointment, Client, Service } from '@/lib/types/appointment';
import { format, subDays, subHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NotificationConfig {
  enableEmail: boolean;
  enableSMS: boolean;
  reminderDays: number[];
  reminderHours: number[];
  fromEmail: string;
  fromName: string;
}

class NotificationService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  private config: NotificationConfig = {
    enableEmail: true,
    enableSMS: false,
    reminderDays: [2],
    reminderHours: [2],
    fromEmail: 'noreply@leonceouattara.com',
    fromName: 'Leonce Ouattara Studio'
  };

  // Email Templates
  generateConfirmationEmail(
    appointment: Appointment, 
    client: Client, 
    service: Service,
    calendarAttachment?: string
  ): EmailTemplate {
    const appointmentDate = format(appointment.date, 'EEEE d MMMM yyyy', { locale: fr });
    const appointmentTime = appointment.startTime;

    const subject = `Confirmation de votre rendez-vous - ${appointmentDate}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #00F5FF, #9D4EDD); padding: 20px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 20px; }
            .appointment-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #00F5FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rendez-vous confirmé ✓</h1>
          </div>
          
          <div class="content">
            <p>Bonjour ${client.firstName},</p>
            
            <p>Votre rendez-vous a été confirmé avec succès. Voici les détails :</p>
            
            <div class="appointment-details">
              <h3>Détails du rendez-vous</h3>
              <p><strong>Service :</strong> ${service.name}</p>
              <p><strong>Date :</strong> ${appointmentDate}</p>
              <p><strong>Heure :</strong> ${appointmentTime}</p>
              <p><strong>Durée :</strong> ${service.duration} minutes</p>
              <p><strong>Prix :</strong> ${service.price > 0 ? service.price + '€' : 'Gratuit'}</p>
            </div>
            
            <p><strong>Adresse :</strong><br>
            Leonce Ouattara Studio<br>
            Abidjan, Côte d'Ivoire</p>
            
            <p>Un rappel vous sera envoyé 2 jours et 2 heures avant votre rendez-vous.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointment.id}" class="button">
              Gérer mon rendez-vous
            </a>
            
            <p>Si vous avez des questions, n'hésitez pas à me contacter :</p>
            <p>📧 leonce.ouattara@outlook.fr<br>
            📱 +225 05 45 13 07 39</p>
          </div>
          
          <div class="footer">
            <p>Leonce Ouattara Studio - Expert IT & Solutions Digitales</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </body>
      </html>
    `;

    const text = `
Bonjour ${client.firstName},

Votre rendez-vous a été confirmé avec succès.

Détails du rendez-vous :
- Service : ${service.name}
- Date : ${appointmentDate}
- Heure : ${appointmentTime}
- Durée : ${service.duration} minutes
- Prix : ${service.price > 0 ? service.price + '€' : 'Gratuit'}

Adresse :
Leonce Ouattara Studio
Abidjan, Côte d'Ivoire

Un rappel vous sera envoyé 2 jours et 2 heures avant votre rendez-vous.

Pour gérer votre rendez-vous : ${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointment.id}

Contact :
📧 leonce.ouattara@outlook.fr
📱 +225 05 45 13 07 39

Leonce Ouattara Studio - Expert IT & Solutions Digitales
    `;

    return { subject, html, text };
  }

  generateReminderEmail(
    appointment: Appointment, 
    client: Client, 
    service: Service,
    reminderType: 'days' | 'hours'
  ): EmailTemplate {
    const appointmentDate = format(appointment.date, 'EEEE d MMMM yyyy', { locale: fr });
    const appointmentTime = appointment.startTime;
    const timeUntil = reminderType === 'days' ? '2 jours' : '2 heures';

    const subject = `Rappel : Votre rendez-vous dans ${timeUntil}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #9D4EDD, #DA70D6); padding: 20px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 20px; }
            .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .appointment-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #9D4EDD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button.secondary { background: #6c757d; }
            .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⏰ Rappel de rendez-vous</h1>
          </div>
          
          <div class="content">
            <p>Bonjour ${client.firstName},</p>
            
            <div class="reminder-box">
              <p><strong>🔔 Votre rendez-vous approche !</strong></p>
              <p>Vous avez un rendez-vous prévu dans ${timeUntil}.</p>
            </div>
            
            <div class="appointment-details">
              <h3>Détails du rendez-vous</h3>
              <p><strong>Service :</strong> ${service.name}</p>
              <p><strong>Date :</strong> ${appointmentDate}</p>
              <p><strong>Heure :</strong> ${appointmentTime}</p>
              <p><strong>Durée :</strong> ${service.duration} minutes</p>
            </div>
            
            <p><strong>Adresse :</strong><br>
            Leonce Ouattara Studio<br>
            Abidjan, Côte d'Ivoire</p>
            
            <p>Pensez à :</p>
            <ul>
              <li>Arriver 5 minutes en avance</li>
              <li>Apporter les documents nécessaires</li>
              <li>Préparer vos questions</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointment.id}" class="button">
                Voir les détails
              </a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointment.id}/reschedule" class="button secondary">
                Reprogrammer
              </a>
            </div>
            
            <p>En cas d'empêchement, merci de me prévenir au plus tôt.</p>
            <p>📧 leonce.ouattara@outlook.fr<br>
            📱 +225 05 45 13 07 39</p>
          </div>
          
          <div class="footer">
            <p>Leonce Ouattara Studio - Expert IT & Solutions Digitales</p>
          </div>
        </body>
      </html>
    `;

    const text = `
Bonjour ${client.firstName},

🔔 Rappel : Votre rendez-vous approche !

Vous avez un rendez-vous prévu dans ${timeUntil}.

Détails :
- Service : ${service.name}
- Date : ${appointmentDate}
- Heure : ${appointmentTime}
- Durée : ${service.duration} minutes

Adresse :
Leonce Ouattara Studio
Abidjan, Côte d'Ivoire

Pensez à arriver 5 minutes en avance et à apporter les documents nécessaires.

Gérer votre rendez-vous : ${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointment.id}

Contact :
📧 leonce.ouattara@outlook.fr
📱 +225 05 45 13 07 39
    `;

    return { subject, html, text };
  }

  generateCancellationEmail(
    appointment: Appointment, 
    client: Client, 
    service: Service,
    reason?: string
  ): EmailTemplate {
    const appointmentDate = format(appointment.date, 'EEEE d MMMM yyyy', { locale: fr });
    
    const subject = `Annulation de votre rendez-vous du ${appointmentDate}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { padding: 20px; }
            .cancellation-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #00F5FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rendez-vous annulé</h1>
          </div>
          
          <div class="content">
            <p>Bonjour ${client.firstName},</p>
            
            <div class="cancellation-box">
              <p><strong>❌ Votre rendez-vous a été annulé</strong></p>
              <p>Date : ${appointmentDate} à ${appointment.startTime}</p>
              <p>Service : ${service.name}</p>
              ${reason ? `<p>Motif : ${reason}</p>` : ''}
            </div>
            
            <p>Si vous souhaitez reprogrammer ce rendez-vous, n'hésitez pas à prendre un nouveau créneau.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking" class="button">
              Prendre un nouveau rendez-vous
            </a>
            
            <p>Pour toute question, contactez-moi :</p>
            <p>📧 leonce.ouattara@outlook.fr<br>
            📱 +225 05 45 13 07 39</p>
          </div>
          
          <div class="footer">
            <p>Leonce Ouattara Studio - Expert IT & Solutions Digitales</p>
          </div>
        </body>
      </html>
    `;

    const text = `
Bonjour ${client.firstName},

Votre rendez-vous a été annulé.

Détails :
- Date : ${appointmentDate} à ${appointment.startTime}
- Service : ${service.name}
${reason ? `- Motif : ${reason}` : ''}

Pour reprogrammer : ${process.env.NEXT_PUBLIC_APP_URL}/booking

Contact :
📧 leonce.ouattara@outlook.fr
📱 +225 05 45 13 07 39
    `;

    return { subject, html, text };
  }

  // Send Methods
  async sendConfirmationEmail(
    appointment: Appointment, 
    client: Client, 
    service: Service,
    calendarAttachment?: string
  ): Promise<boolean> {
    const template = this.generateConfirmationEmail(appointment, client, service, calendarAttachment);
    return this.sendEmail(client.email, template, calendarAttachment);
  }

  async sendReminderEmail(
    appointment: Appointment, 
    client: Client, 
    service: Service,
    reminderType: 'days' | 'hours'
  ): Promise<boolean> {
    const template = this.generateReminderEmail(appointment, client, service, reminderType);
    return this.sendEmail(client.email, template);
  }

  async sendCancellationEmail(
    appointment: Appointment, 
    client: Client, 
    service: Service,
    reason?: string
  ): Promise<boolean> {
    const template = this.generateCancellationEmail(appointment, client, service, reason);
    return this.sendEmail(client.email, template);
  }

  private async sendEmail(
    to: string, 
    template: EmailTemplate, 
    attachment?: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          from: this.config.fromEmail,
          fromName: this.config.fromName,
          subject: template.subject,
          html: template.html,
          text: template.text,
          attachment
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Reminder Scheduling
  async scheduleReminders(appointment: Appointment): Promise<void> {
    const appointmentDateTime = new Date(`${format(appointment.date, 'yyyy-MM-dd')}T${appointment.startTime}`);
    
    // Schedule day reminders
    for (const days of this.config.reminderDays) {
      const reminderDate = subDays(appointmentDateTime, days);
      await this.scheduleReminder(appointment.id!, reminderDate, 'days');
    }
    
    // Schedule hour reminders
    for (const hours of this.config.reminderHours) {
      const reminderDate = subHours(appointmentDateTime, hours);
      await this.scheduleReminder(appointment.id!, reminderDate, 'hours');
    }
  }

  private async scheduleReminder(
    appointmentId: string, 
    reminderDate: Date, 
    type: 'days' | 'hours'
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/notifications/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          reminderDate: reminderDate.toISOString(),
          type
        })
      });
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  }
}

export const notificationService = new NotificationService();