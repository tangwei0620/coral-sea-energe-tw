// 珊瑚海能碳管家 — 预约表单 API
// Cloudflare Pages Functions
// 通过 Resend API 发送邮件通知

export async function onRequest(context) {
  const { request, env } = context;

  // 仅接受 POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // 解析表单数据
    const contentType = request.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData);
    }

    // 基础校验
    if (!data.name || !data.phone) {
      return new Response(JSON.stringify({ success: false, error: '请填写姓名和联系电话' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 关注方向中文名映射
    const interestMap = {
      monitoring: '绿电监测',
      efficiency: '能效分析',
      carbon: '碳核算',
      all: '整体方案',
    };

    const interestLabel = interestMap[data.interest] || data.interest || '未选择';

    // 构建邮件 HTML
    const emailHtml = `
      <div style="font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0A2E5C, #144272); padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #FF6B35; margin: 0; font-size: 22px;">🐚 珊瑚海能碳管家</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">新的预约咨询</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #E8ECF1; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 16px; background: #F5F7FA; font-weight: 600; color: #0A2E5C; width: 100px; border-bottom: 1px solid #E8ECF1;">姓名</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #E8ECF1;">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background: #F5F7FA; font-weight: 600; color: #0A2E5C; border-bottom: 1px solid #E8ECF1;">公司/单位</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #E8ECF1;">${escapeHtml(data.company || '未填写')}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background: #F5F7FA; font-weight: 600; color: #0A2E5C; border-bottom: 1px solid #E8ECF1;">联系电话</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #E8ECF1;">${escapeHtml(data.phone)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background: #F5F7FA; font-weight: 600; color: #0A2E5C; border-bottom: 1px solid #E8ECF1;">关注方向</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #E8ECF1;">${escapeHtml(interestLabel)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; background: #F5F7FA; font-weight: 600; color: #0A2E5C; border-bottom: 1px solid #E8ECF1;">补充说明</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid #E8ECF1;">${escapeHtml(data.message || '无')}</td>
            </tr>
          </table>
          <p style="color: #8395A7; font-size: 12px; margin-top: 24px; text-align: center;">
            提交时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
          </p>
        </div>
      </div>
    `;

    // 通过 Resend API 发送邮件
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '珊瑚海能碳管家 <onboarding@resend.dev>',
        to: ['41398385@qq.com'],
        subject: `📮 新预约咨询 - ${data.name}${data.company ? ' (' + data.company + ')' : ''}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error('Resend API error:', resendResponse.status, errText);
      return new Response(JSON.stringify({
        success: false,
        error: '邮件发送失败，请稍后再试',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Submit error:', e);
    return new Response(JSON.stringify({ success: false, error: '服务器内部错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 防 XSS 转义
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
