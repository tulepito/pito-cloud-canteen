import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const fallbackName = 'đối tác';

const baseStyles = {
  body: `width:100%;font-family:arial,'helvetica neue',helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;background-color:#FAFAFA`,
  container: `mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:600px;background-color:#FFFFFF`,
  paragraph: `Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial,'helvetica neue',helvetica,sans-serif;line-height:21px;color:#262626;font-size:14px`,
  h1: `Margin:0;line-height:26px;mso-line-height-rule:exactly;font-family:arial,'helvetica neue',helvetica,sans-serif;font-size:22px;font-style:normal;font-weight:bold;color:#262626`,
  button: `mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:15px;padding:12px 28px;display:inline-block;background:#ef3d2a;border-radius:8px;font-family:arial,'helvetica neue',helvetica,sans-serif;font-weight:bold;font-style:normal;line-height:18px;width:auto;text-align:center;border:0`,
};

const logoUrl =
  'https://vpldml.stripocdn.email/content/guids/CABINET_23e66d80fca50b235d174a5c6d0d104be04bb3f03081b7b1a2b28dadda4e9913/images/logo_pito_cloud_canteen.png';

export const partnerMenuApprovedSubject = (menuName: string) =>
  `[PITO] Menu "${menuName}" đã được duyệt`;

export const partnerMenuRejectedSubject = (menuName: string) =>
  `[PITO] Menu "${menuName}" cần được chỉnh sửa`;

const buildEmailShell = ({
  title,
  greeting,
  bodyLines,
  actionLink,
  actionText = 'Xem menu',
}: {
  title: string;
  greeting: string;
  bodyLines: string[];
  actionLink: string;
  actionText?: string;
}) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial,'helvetica neue',helvetica,sans-serif">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>${title}</title>
</head>
<body style="${baseStyles.body}">
  <div class="es-wrapper-color" style="background-color:#FAFAFA">
    <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
      <tr>
        <td valign="top" style="padding:0;Margin:0">
          <table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table
                  class="es-header-body"
                  cellspacing="0"
                  cellpadding="0"
                  bgcolor="#ffffff"
                  align="center"
                  style="${baseStyles.container}">
                  <tr>
                    <td align="left" style="padding:20px 20px 10px 20px;Margin:0">
                      <a target="_blank" href="https://cloudcanteen.pito.vn/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#666666;font-size:14px">
                        <img src="${logoUrl}" alt="PITO" title="PITO" width="78" height="52" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic">
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table
                  class="es-content-body"
                  cellspacing="0"
                  cellpadding="0"
                  bgcolor="#ffffff"
                  align="center"
                  style="${baseStyles.container}">
                  <tr>
                    <td align="left" style="padding:20px 40px 10px 40px;Margin:0">
                      <h1 style="${baseStyles.h1}">${title}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="padding:0 40px 20px 40px;Margin:0">
                      <p style="${baseStyles.paragraph}">${greeting}</p>
                      ${bodyLines
                        .map(
                          (line) =>
                            `<p style="${baseStyles.paragraph}">${line}</p>`,
                        )
                        .join('')}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 40px 30px 40px;Margin:0">
                      <a
                        href="${actionLink}"
                        target="_blank"
                        style="${baseStyles.button}">${actionText}</a>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="padding:0 40px 25px 40px;Margin:0">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;height:1px;width:100%"></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="padding:0 40px 30px 40px;Margin:0">
                      <p style="${
                        baseStyles.paragraph
                      }">Nếu cần hỗ trợ, vui lòng liên hệ Hotline <strong>1900 25 25 30</strong>.</p>
                      <p style="${
                        baseStyles.paragraph
                      }"><strong>PITO Cloud Canteen</strong></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

const formatRejectedReason = (reason?: string) => {
  if (!reason) return '';

  const html = marked.parse(reason);
  const sanitized = sanitizeHtml(html, {
    allowedTags: [
      'p',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'a',
      'br',
      'span',
      'div',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  });

  return `
    <div>Lý do:</div>
    <div style="margin-top:4px">${sanitized}</div>
  `;
};

export const partnerMenuApprovedTemplate = ({
  partnerName,
  menuName,
  menuLink,
}: {
  partnerName?: string;
  menuName: string;
  menuLink: string;
}) =>
  buildEmailShell({
    title: 'Menu đã được duyệt',
    greeting: `Chào ${partnerName || fallbackName},`,
    bodyLines: [`Menu <strong>${menuName}</strong> đã được admin phê duyệt.`],
    actionLink: menuLink,
    actionText: 'Xem menu',
  }).trim();

export const partnerMenuRejectedTemplate = ({
  partnerName,
  menuName,
  menuLink,
  rejectedReason,
}: {
  partnerName?: string;
  menuName: string;
  menuLink: string;
  rejectedReason?: string;
}) =>
  buildEmailShell({
    title: 'Menu cần được chỉnh sửa',
    greeting: `Chào ${partnerName || fallbackName},`,
    bodyLines: [
      `Menu <strong>${menuName}</strong> chưa được admin phê duyệt.`,
      formatRejectedReason(rejectedReason),
      'Vui lòng rà soát và chỉnh sửa menu, sau đó gửi lại để được duyệt.',
    ].filter(Boolean),
    actionLink: menuLink,
    actionText: 'Xem menu',
  }).trim();
