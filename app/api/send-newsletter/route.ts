// app/api/send-newsletter/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Resend client එක ඇතුළතට දැමීමෙන් Build time එකේදී error වීම වැළකේ
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { title, slug, excerpt, type, thumbnailUrl } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    // 1. Supabase Database එකෙන් සියලුම Subscribers ලාගේ Emails ලබා ගැනීම
    const { data: subscribers, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('email');

    if (dbError) throw dbError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers found to send' });
    }

    const recipientEmails = subscribers.map((sub: { email: string }) => sub.email);
    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://athalaga.lk'}/posts/${slug}`;

    // 2. සුපිරි Email Template එක (HTML)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
            .badge { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.15); border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #6ee7b7; margin-bottom: 8px; }
            .content { padding: 32px 28px; }
            .thumb { width: 100%; max-height: 280px; object-fit: cover; border-radius: 16px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3; }
            .excerpt { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
            .btn { display: inline-block; background: #047857; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-weight: bold; font-size: 14px; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">Athalaga.lk Updates</span>
              <h1 style="margin: 0; font-size: 24px;">New ${type === 'vlog' ? 'Video Vlog' : 'Article'} Published!</h1>
            </div>
            <div class="content">
              ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${title}" class="thumb" />` : ''}
              <h2 class="title">${title}</h2>
              <p class="excerpt">${excerpt || 'A new story has just been published on Athalaga.lk. Click below to view the full content.'}</p>
              <div style="text-align: center;">
                <a href="${postUrl}" class="btn">Read / Watch Now &rarr;</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 6px 0;">You received this email because you subscribed to <strong>Athalaga.lk</strong>.</p>
              <p style="margin: 0;">&copy; 2026 Athalaga.lk Media Hub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 3. Resend හරහා සියලුම දෙනාට Email යැවීම
    await resend.emails.send({
      from: 'Athalaga.lk <onboarding@resend.dev>',
      to: recipientEmails,
      subject: `New ${type === 'vlog' ? 'Vlog' : 'Article'}: ${title}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, count: recipientEmails.length });
  } catch (error: any) {
    console.error('Newsletter Dispatch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}