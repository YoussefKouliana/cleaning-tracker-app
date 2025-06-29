// src/services/emailJSService.ts - Configured with your EmailJS settings
import emailjs from '@emailjs/browser';

// Your EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_y83gz5l',
  templateId: 'template_wgedjb9',
  publicKey: 'bHsfZWEmD_xSN2Eyc'
};

export class EmailJSService {
  // Initialize EmailJS
  static init() {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }

  // Send cleaning notification email
  static async sendCleaningNotification(
    cleanerName: string,
    machineName: string,
    machineLocation: string,
    paymentRate: number
  ): Promise<void> {
    try {
      const timestamp = new Date().toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Stockholm'
      });

      const templateParams = {
        to_email: 'contact@fluffycandy.se',
        subject: `🧹 Städning Registrerad - ${machineName}`,
        notification_type: 'Städning Registrerad',
        timestamp: timestamp,
        message: `👤 Städare: ${cleanerName}
🏭 Maskin: ${machineName}
📍 Plats: ${machineLocation}
⏰ Tid: ${timestamp}
💰 Betalning: ${paymentRate} SEK`
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('✅ Städning email skickat:', response);
    } catch (error) {
      console.error('❌ Misslyckades att skicka städning email:', error);
      throw error;
    }
  }

  // Send payment notification email
  static async sendPaymentNotification(
    paidBy: string,
    totalAmount: number,
    cleaningCount: number,
    cleaners: string[]
  ): Promise<void> {
    try {
      const timestamp = new Date().toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Stockholm'
      });

      const cleanersList = cleaners.join(', ');

      const templateParams = {
        to_email: 'contact@fluffycandy.se',
        subject: `💰 Betalning Genomförd - ${totalAmount} SEK`,
        notification_type: 'Betalning Genomförd',
        timestamp: timestamp,
        message: `💳 Betalt av: ${paidBy}
💰 Totalt belopp: ${totalAmount} SEK
🧹 Antal städningar: ${cleaningCount}
👥 Städare: ${cleanersList}
⏰ Betalningstid: ${timestamp}`
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('✅ Betalning email skickat:', response);
    } catch (error) {
      console.error('❌ Misslyckades att skicka betalning email:', error);
      throw error;
    }
  }
}

// Updated notification service to use EmailJS
export class FreeNotificationService {
  // Initialize EmailJS on first use
  private static initialized = false;

  private static ensureInitialized() {
    if (!this.initialized) {
      EmailJSService.init();
      this.initialized = true;
    }
  }

  // Send notification when cleaning is logged
  static async notifyCleaningLogged(
    cleanerName: string,
    machineName: string,
    machineLocation: string,
    paymentRate: number
  ): Promise<void> {
    try {
      this.ensureInitialized();
      
      await EmailJSService.sendCleaningNotification(
        cleanerName,
        machineName,
        machineLocation,
        paymentRate
      );
      
      // Optional: Browser notification
      this.showBrowserNotification(
        'Cleaning Logged',
        `${cleanerName} cleaned ${machineName} - Email sent!`
      );
      
    } catch (error) {
      console.error('Error sending cleaning notification:', error);
      throw error;
    }
  }

  // Send notification when payment is processed
  static async notifyPaymentProcessed(
    paidBy: string,
    totalAmount: number,
    cleaningCount: number,
    cleaners: string[]
  ): Promise<void> {
    try {
      this.ensureInitialized();
      
      await EmailJSService.sendPaymentNotification(
        paidBy,
        totalAmount,
        cleaningCount,
        cleaners
      );
      
      // Optional: Browser notification
      this.showBrowserNotification(
        'Payment Processed',
        `${totalAmount} SEK paid by ${paidBy} - Email sent!`
      );
      
    } catch (error) {
      console.error('Error sending payment notification:', error);
      throw error;
    }
  }

  // Show browser notification
  private static showBrowserNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
  }

  // Request notification permission
  static async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
}