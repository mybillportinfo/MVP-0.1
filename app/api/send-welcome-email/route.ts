import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function buildWelcomeEmail(name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px; font-weight: bold;">M</span>
        </div>
        <h1 style="margin: 0; font-size: 28px;">Welcome to MyBillPort!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your personal bill management assistant</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}! 👋</h2>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Thank you for joining MyBillPort! We're excited to help you take control of your bills and never miss a payment again.
        </p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h3 style="margin: 0 0 15px 0; color: #065f46;">Here's what you can do:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">📋 Track all your recurring bills in one place</li>
            <li style="margin-bottom: 8px;">🔔 Get reminders before bills are due</li>
            <li style="margin-bottom: 8px;">📊 See your bill overview at a glance</li>
            <li style="margin-bottom: 8px;">✅ Mark bills as paid to stay organized</li>
            <li style="margin-bottom: 8px;">📸 Scan bills with AI to add them instantly</li>
          </ul>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://mybillport.com/app" style="background: #0d9488; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
            Start Managing Your Bills
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
          If you have any questions, feel free to reach out through our feedback page. We're here to help!
        </p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p style="margin: 0 0 10px 0;">MyBillPort - Never miss a bill payment</p>
        <p style="margin: 0;">
          <a href="https://mybillport.com" style="color: #0d9488; text-decoration: none;">mybillport.com</a>
        </p>
      </div>
    </div>
  `;

  const text = `Welcome to MyBillPort!\n\nHi ${name}!\n\nThank you for joining MyBillPort! We're excited to help you take control of your bills.\n\nHere's what you can do:\n- Track all your recurring bills in one place\n- Get reminders before bills are due\n- See your bill overview at a glance\n- Mark bills as paid to stay organized\n- Scan bills with AI to add them instantly\n\nStart managing your bills: https://mybillport.com/app\n\nMyBillPort - Never miss a bill payment\nhttps://mybillport.com`;

  return { html, text };
}

async function sendViaMailerSend(email: string, name: string, html: string, text: string): Promise<boolean> {
  const apiKey = process.env.MAILERSEND_API_KEY?.trim() || '';
  let cleanKey = apiKey;
  if (cleanKey.includes('mlsn.')) {
    const idx = cleanKey.indexOf('mlsn.');
    if (idx > 0) cleanKey = cleanKey.substring(idx);
  }

  if (!cleanKey || !cleanKey.startsWith('mlsn.')) {
    return false;
  }

  const { MailerSend, EmailParams, Sender, Recipient } = await import('mailersend');
  const mailerSend = new MailerSend({ apiKey: cleanKey });
  const sentFrom = new Sender('mybillport@test-nrw7gymn9wng2k8e.mlsender.net', 'MyBillPort');
  const recipients = [new Recipient(email, name)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Welcome to MyBillPort! 🎉')
    .setHtml(html)
    .setText(text);

  await mailerSend.email.send(emailParams);
  console.log(`✅ Welcome email sent via MailerSend to ${email}`);
  return true;
}

async function sendViaGmail(email: string, html: string, text: string): Promise<boolean> {
  const { sendEmailViaGmail } = await import('../../lib/gmailClient');
  await sendEmailViaGmail(email, 'Welcome to MyBillPort! 🎉', html, text);
  console.log(`✅ Welcome email sent via Gmail to ${email}`);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const name = displayName || 'there';
    const { html, text } = buildWelcomeEmail(name);

    try {
      await sendViaMailerSend(email, name, html, text);
      return NextResponse.json({ success: true, provider: 'mailersend' });
    } catch (msError: any) {
      console.warn(`MailerSend failed: ${msError?.body?.message || msError?.message || msError}`);
    }

    try {
      await sendViaGmail(email, html, text);
      return NextResponse.json({ success: true, provider: 'gmail' });
    } catch (gmailError: any) {
      console.warn(`Gmail failed: ${gmailError?.message || gmailError}`);
    }

    console.warn(`⚠️ All email providers failed for ${email} - skipping welcome email`);
    return NextResponse.json({ success: false, skipped: true, reason: 'all_providers_failed' });

  } catch (error: any) {
    console.error('Welcome email error:', error?.message || error);
    return NextResponse.json({ success: false, error: 'Email delivery failed' });
  }
}
