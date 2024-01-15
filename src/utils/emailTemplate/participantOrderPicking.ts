import { formatTimestamp } from '../dates';

const BASE_URL = process.env.NEXT_PUBLIC_CANONICAL_URL;

type ParticipantOrderPickingParams = {
  bookerUser: any;
  companyUser: any;
  orderListing: any;
  participantUser: any;
  bookerNote: string;
};

export const participantOrderPickingSubject = (orderName: string) =>
  `Chọn món cho Tuần ăn ${orderName}`;

const participantOrderPicking = ({
  bookerUser,
  companyUser,
  orderListing,
  participantUser,
  bookerNote,
}: ParticipantOrderPickingParams) => {
  const { displayName: bookerName } = bookerUser.getProfile();
  const { displayName: participantName } = participantUser.getProfile();
  const orderId = orderListing.getId();
  const { orderName } = orderListing.getPublicData();
  const { startDate, endDate, deliveryHour, deadlineHour, deadlineDate } =
    orderListing.getMetadata();
  const { companyLocation } = companyUser.getPublicData();
  const { address: companyAddress } = companyLocation;

  const formattedStartDate = formatTimestamp(startDate);
  const formattedEndDate = formatTimestamp(endDate);
  const orderPickingUrl = `${BASE_URL}/participant/order/${orderId}`;
  const formattedOrderDeadline = `${deadlineHour}, ${formatTimestamp(
    deadlineDate,
  )}`;

  const bookerNoteSection = bookerNote
    ? `
  <table cellpadding="0" cellspacing="0" class="es-content" align="center"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                  <tr>
                    <td class="es-m-p15r es-m-p15l" align="left"
                      style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:40px;padding-right:40px">
                      <table width="100%" cellspacing="0" cellpadding="0"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td valign="top" align="center" style="padding:0;Margin:0;width:520px">
                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="left" style="padding:0;Margin:0;padding-bottom:15px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif, arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                    <strong>Lời nhắn của Người đại diện</strong></p>
                                </td>
                              </tr>
                              <tr>
                                <td align="left" style="padding:0;Margin:0;font-size:0px"><img
                                    src="https://vpldml.stripocdn.email/content/guids/CABINET_c8c5e967be8b9e42652722095c5779440d2108d77669ed5cc76af4b7d3323178/images/image.png"
                                    alt="Ella Becker" title="Ella Becker"
                                    style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                    width="10" height="8"></td>
                              </tr>
                              <tr>
                                <td align="left" style="padding:0;Margin:0;padding-left:15px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif, arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                    ${bookerNote}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td align="right" style="padding:0;Margin:0;padding-bottom:5px;font-size:0px"><img
                                    src="https://vpldml.stripocdn.email/content/guids/CABINET_c8c5e967be8b9e42652722095c5779440d2108d77669ed5cc76af4b7d3323178/images/quote.png"
                                    alt="Ella Becker" title="Ella Becker"
                                    style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                    width="10" height="8"></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
  `
    : '';

  return `
  <!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"
  style="font-family:arial, 'helvetica neue', helvetica, sans-serif">

<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Participant - Order picking</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG></o:AllowPNG>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<![endif]--><!--[if !mso]><!-- -->
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!--<![endif]-->
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .es-button {
      mso-style-priority: 100 !important;
      text-decoration: none !important;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    .es-desk-hidden {
      display: none;
      float: left;
      overflow: hidden;
      width: 0;
      max-height: 0;
      line-height: 0;
      mso-hide: all;
    }

    [data-ogsb] .es-button.es-button-1 {
      padding: 12px 80px !important;
    }

    @media only screen and (max-width:600px) {

      p,
      ul li,
      ol li,
      a {
        line-height: 150% !important
      }

      h1,
      h2,
      h3,
      h1 a,
      h2 a,
      h3 a {
        line-height: 120% !important
      }

      h1 {
        font-size: 36px !important;
        text-align: left
      }

      h2 {
        font-size: 26px !important;
        text-align: left
      }

      h3 {
        font-size: 20px !important;
        text-align: left
      }

      .es-header-body h1 a,
      .es-content-body h1 a,
      .es-footer-body h1 a {
        font-size: 36px !important;
        text-align: left
      }

      .es-header-body h2 a,
      .es-content-body h2 a,
      .es-footer-body h2 a {
        font-size: 26px !important;
        text-align: left
      }

      .es-header-body h3 a,
      .es-content-body h3 a,
      .es-footer-body h3 a {
        font-size: 20px !important;
        text-align: left
      }

      .es-menu td a {
        font-size: 12px !important
      }

      .es-header-body p,
      .es-header-body ul li,
      .es-header-body ol li,
      .es-header-body a {
        font-size: 14px !important
      }

      .es-content-body p,
      .es-content-body ul li,
      .es-content-body ol li,
      .es-content-body a {
        font-size: 14px !important
      }

      .es-footer-body p,
      .es-footer-body ul li,
      .es-footer-body ol li,
      .es-footer-body a {
        font-size: 14px !important
      }

      .es-infoblock p,
      .es-infoblock ul li,
      .es-infoblock ol li,
      .es-infoblock a {
        font-size: 12px !important
      }

      *[class="gmail-fix"] {
        display: none !important
      }

      .es-m-txt-c,
      .es-m-txt-c h1,
      .es-m-txt-c h2,
      .es-m-txt-c h3 {
        text-align: center !important
      }

      .es-m-txt-r,
      .es-m-txt-r h1,
      .es-m-txt-r h2,
      .es-m-txt-r h3 {
        text-align: right !important
      }

      .es-m-txt-l,
      .es-m-txt-l h1,
      .es-m-txt-l h2,
      .es-m-txt-l h3 {
        text-align: left !important
      }

      .es-m-txt-r img,
      .es-m-txt-c img,
      .es-m-txt-l img {
        display: inline !important
      }

      .es-button-border {
        display: inline-block !important
      }

      a.es-button,
      button.es-button {
        font-size: 14px !important;
        display: inline-block !important
      }

      .es-adaptive table,
      .es-left,
      .es-right {
        width: 100% !important
      }

      .es-content table,
      .es-header table,
      .es-footer table,
      .es-content,
      .es-footer,
      .es-header {
        width: 100% !important;
        max-width: 600px !important
      }

      .es-adapt-td {
        display: block !important;
        width: 100% !important
      }

      .adapt-img {
        width: 100% !important;
        height: auto !important
      }

      .remove-width-mobile {
        width: auto !important
      }

      .remove-width-mobile td.cell-1 {
        width: 28% !important
      }

      .remove-width-mobile td.cell-2 {
        width: 30% !important
      }

      .remove-width-mobile td.cell-3 {
        width: 28% !important
      }

      .es-m-p0 {
        padding: 0 !important
      }

      .es-m-p0r {
        padding-right: 0 !important
      }

      .es-m-p0l {
        padding-left: 0 !important
      }

      .es-m-p0t {
        padding-top: 0 !important
      }

      .es-m-p0b {
        padding-bottom: 0 !important
      }

      .es-m-p20b {
        padding-bottom: 20px !important
      }

      .es-mobile-hidden,
      .es-hidden {
        display: none !important
      }

      tr.es-desk-hidden,
      td.es-desk-hidden,
      table.es-desk-hidden {
        width: auto !important;
        overflow: visible !important;
        float: none !important;
        max-height: inherit !important;
        line-height: inherit !important
      }

      tr.es-desk-hidden {
        display: table-row !important
      }

      table.es-desk-hidden {
        display: table !important
      }

      td.es-desk-menu-hidden {
        display: table-cell !important
      }

      .es-menu td {
        width: 1% !important
      }

      table.es-table-not-adapt,
      .esd-block-html table {
        width: auto !important
      }

      table.es-social {
        display: inline-block !important
      }

      table.es-social td {
        display: inline-block !important
      }

      .es-m-p5 {
        padding: 5px !important
      }

      .es-m-p5t {
        padding-top: 5px !important
      }

      .es-m-p5b {
        padding-bottom: 5px !important
      }

      .es-m-p5r {
        padding-right: 5px !important
      }

      .es-m-p5l {
        padding-left: 5px !important
      }

      .es-m-p10 {
        padding: 10px !important
      }

      .es-m-p10t {
        padding-top: 10px !important
      }

      .es-m-p10b {
        padding-bottom: 10px !important
      }

      .es-m-p10r {
        padding-right: 10px !important
      }

      .es-m-p10l {
        padding-left: 10px !important
      }

      .es-m-p15 {
        padding: 15px !important
      }

      .es-m-p15t {
        padding-top: 15px !important
      }

      .es-m-p15b {
        padding-bottom: 15px !important
      }

      .es-m-p15r {
        padding-right: 15px !important
      }

      .es-m-p15l {
        padding-left: 15px !important
      }

      .es-m-p20 {
        padding: 20px !important
      }

      .es-m-p20t {
        padding-top: 20px !important
      }

      .es-m-p20r {
        padding-right: 20px !important
      }

      .es-m-p20l {
        padding-left: 20px !important
      }

      .es-m-p25 {
        padding: 25px !important
      }

      .es-m-p25t {
        padding-top: 25px !important
      }

      .es-m-p25b {
        padding-bottom: 25px !important
      }

      .es-m-p25r {
        padding-right: 25px !important
      }

      .es-m-p25l {
        padding-left: 25px !important
      }

      .es-m-p30 {
        padding: 30px !important
      }

      .es-m-p30t {
        padding-top: 30px !important
      }

      .es-m-p30b {
        padding-bottom: 30px !important
      }

      .es-m-p30r {
        padding-right: 30px !important
      }

      .es-m-p30l {
        padding-left: 30px !important
      }

      .es-m-p35 {
        padding: 35px !important
      }

      .es-m-p35t {
        padding-top: 35px !important
      }

      .es-m-p35b {
        padding-bottom: 35px !important
      }

      .es-m-p35r {
        padding-right: 35px !important
      }

      .es-m-p35l {
        padding-left: 35px !important
      }

      .es-m-p40 {
        padding: 40px !important
      }

      .es-m-p40t {
        padding-top: 40px !important
      }

      .es-m-p40b {
        padding-bottom: 40px !important
      }

      .es-m-p40r {
        padding-right: 40px !important
      }

      .es-m-p40l {
        padding-left: 40px !important
      }

      button.es-button {
        width: 100%
      }

      .es-desk-hidden {
        display: table-row !important;
        width: auto !important;
        overflow: visible !important;
        max-height: inherit !important
      }

      .h-auto {
        height: auto !important
      }
    }
  </style>
</head>

<body
  style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div class="es-wrapper-color" style="background-color:#FAFAFA"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#fafafa"></v:fill>
			</v:background>
		<![endif]-->
    <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"
      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA">
      <tr>
        <td valign="top" style="padding:0;Margin:0">
          <table class="es-header" cellspacing="0" cellpadding="0" align="center"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                  <tr>
                    <td align="left" style="padding:0;Margin:0">
                      <table width="100%" cellspacing="0" cellpadding="0"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:600px">
                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px;font-size:0px"
                                  align="left"><a target="_blank" href="https://cloudcanteen.pito.vn/"
                                    style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#666666;font-size:14px"><img
                                      src="https://vpldml.stripocdn.email/content/guids/CABINET_23e66d80fca50b235d174a5c6d0d104be04bb3f03081b7b1a2b28dadda4e9913/images/logo_pito_cloud_canteen.png"
                                      alt="Logo"
                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                      title="Logo" width="78" height="52"></a></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table class="es-content" cellspacing="0" cellpadding="0" align="center"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                  <tr>
                    <td class="es-m-p15r es-m-p15l" align="left"
                      style="padding:0;Margin:0;padding-top:20px;padding-right:20px;padding-left:40px">
                      <table width="100%" cellspacing="0" cellpadding="0"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="left" style="padding:0;Margin:0;width:540px">
                            <table width="100%" cellspacing="0" cellpadding="0" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td class="es-m-txt-l" align="left"
                                  style="padding:0;Margin:0;padding-bottom:10px;padding-top:20px">
                                  <h1
                                    style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:24px;font-style:normal;font-weight:bold;color:#262626">
                                    Mời bạn chọn món!</h1>
                                </td>
                              </tr>
                              <tr>
                                <td align="left" style="padding:0;Margin:0">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                    Xin chào, <strong>${participantName}</strong></p>
                                </td>
                              </tr>
                              <tr>
                                <td align="left" style="padding:0;Margin:0;padding-top:10px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                    Tuần ăn <strong>${orderName}</strong> đã sẵn sàng, mời bạn ${participantName} tiến
                                    hành chọn món để thưởng thức những bữa cơm văn phòng ngon miệng và chất lượng.&nbsp;
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" class="es-content" align="center"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                  <tr>
                    <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                      <table cellpadding="0" cellspacing="0" width="100%"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="center" class="es-m-txt-c" style="padding:0;Margin:0"><!--[if mso]><a href="${orderPickingUrl}" target="_blank" hidden>
	<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="${orderPickingUrl}" 
                style="height:43px; v-text-anchor:middle; width:236px" arcsize="19%" stroke="f"  fillcolor="#ef3d2a">
		<w:anchorlock></w:anchorlock>
		<center style='color:#ffffff; font-family:arial, 'helvetica neue', helvetica, sans-serif; font-size:15px; font-weight:400; line-height:15px;  mso-text-raise:1px'>Chọn món</center>
	</v:roundrect></a>
<![endif]--><!--[if !mso]><!-- --><span class="msohide es-button-border"
                                    style="border-style:solid;border-color:#2CB543;background:#ef3d2a;border-width:0px;display:inline-block;border-radius:8px;width:auto;mso-border-alt:10px;mso-hide:all"><a
                                      href="${orderPickingUrl}"
                                      class="es-button msohide es-button-1" target="_blank"
                                      style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:16px;padding:12px 80px;display:inline-block;background:#ef3d2a;border-radius:8px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:19px;width:auto;text-align:center;mso-hide:all;border-color:#ef3d2a">Chọn
                                      món</a></span><!--<![endif]--></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table class="es-content" cellspacing="0" cellpadding="0" align="center"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                  <tr>
                    <td class="es-m-p15r es-m-p15l esdev-adapt-off" align="left"
                      style="Margin:0;padding-bottom:20px;padding-right:20px;padding-top:25px;padding-left:40px">
                      <table cellpadding="0" cellspacing="0" class="esdev-mso-table"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:540px">
                        <tr>
                          <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                            <table class="es-left" cellspacing="0" cellpadding="0" align="left"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                              <tr>
                                <td align="left" style="padding:0;Margin:0;width:243px">
                                  <table width="100%" cellspacing="0" cellpadding="0" role="presentation"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#8c8c8c;font-size:14px">
                                          Người đại diện</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                          <strong>${bookerName}</strong></p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0;padding-top:10px">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#8c8c8c;font-size:14px">
                                          Địa điểm</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                          <strong>${companyAddress}</strong></p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style="padding:0;Margin:0;width:5px"></td>
                          <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                            <table class="es-right" cellspacing="0" cellpadding="0" align="right"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                              <tr>
                                <td align="left" style="padding:0;Margin:0;width:292px">
                                  <table width="100%" cellspacing="0" cellpadding="0" role="presentation"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#8c8c8c;font-size:14px">
                                          Ngày triển khai</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                          <strong>${deliveryHour}, ${formattedStartDate} - ${formattedEndDate}</strong></p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0;padding-top:10px">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#8c8c8c;font-size:14px">
                                          Hạn chọn món</p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td align="left" style="padding:0;Margin:0">
                                        <p
                                          style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                          <strong>${formattedOrderDeadline}</strong></p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          ${bookerNoteSection || ''}
          <table cellpadding="0" cellspacing="0" class="es-content" align="center"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                  <tr>
                    <td class="es-m-p15r es-m-p15l" align="left"
                      style="padding:0;Margin:0;padding-bottom:25px;padding-left:40px;padding-right:40px">
                      <table cellpadding="0" cellspacing="0" width="100%"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:520px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="center"
                                  style="padding:0;Margin:0;padding-top:20px;padding-bottom:20px;font-size:0">
                                  <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0"
                                    role="presentation"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                    <tr>
                                      <td
                                        style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:unset;height:1px;width:100%;margin:0px">
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td align="left" style="padding:0;Margin:0">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                    Nếu có bất cứ yêu cầu nào, vui lòng liên hệ Hotline <strong>1900 25 25 30</strong> của PITO để được hỗ trợ sớm nhất.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:520px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="left" style="padding:0;Margin:0;padding-top:15px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                    <strong>Customer Success Team</strong></p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;width:520px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="left" style="padding:0;Margin:0;padding-top:5px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#262626;font-size:14px">
                                    <strong>PITO CLOUD CANTEEN</strong></p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table class="es-footer" cellspacing="0" cellpadding="0" align="center"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table class="es-footer-body"
                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                  cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td class="es-m-p0r" align="left" style="padding:0;Margin:0;padding-top:20px;padding-right:20px">
                      <!--[if mso]><table style="width:580px" cellpadding="0" cellspacing="0"><tr><td style="width:312px" valign="top"><![endif]-->
                      <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                        <tr>
                          <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:312px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <!--[if !mso]><!-- -->
                              <tr class="es-desk-hidden"
                                style="display:none;float:left;overflow:hidden;width:0;max-height:0;line-height:0;mso-hide:all">
                                <td style="padding:0;Margin:0;font-size:0" align="left">
                                  <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0"
                                    role="presentation"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                    <tr>
                                      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:5px"><a
                                          target="_blank" href="https://www.facebook.com/PITO.vn/"
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#262626;font-size:12px"><img
                                            title="Facebook"
                                            src="https://vpldml.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png"
                                            alt="Fb" width="32" height="32"
                                            style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                      </td>
                                      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:5px"><a
                                          target="_blank" href="https://www.instagram.com/pito.vn/"
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#262626;font-size:12px"><img
                                            title="Instagram"
                                            src="https://vpldml.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png"
                                            alt="Inst" width="32" height="32"
                                            style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                      </td>
                                      <td valign="top" align="center" style="padding:0;Margin:0"><a target="_blank"
                                          href="https://www.linkedin.com/company/pito-vn/"
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#262626;font-size:12px"><img
                                            title="Linkedin"
                                            src="https://vpldml.stripocdn.email/content/assets/img/social-icons/logo-black/linkedin-logo-black.png"
                                            alt="In" width="32" height="32"
                                            style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr><!--<![endif]-->
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:300px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr>
                                <td align="left" style="padding:0;Margin:0;padding-bottom:35px">
                                  <p
                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;color:#8c8c8c;font-size:12px">
                                    Ⓒ 2024 PITO Cloud Canteen<br>A New Way To Order Lunch At Work. All rights reserved
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <!--[if mso]></td><td style="width:20px"></td><td style="width:248px" valign="top"><![endif]-->
                      <table cellpadding="0" cellspacing="0" class="es-right" align="right"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                        <tr>
                          <td align="left" style="padding:0;Margin:0;width:248px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation"
                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                              <tr class="es-mobile-hidden">
                                <td style="padding:0;Margin:0;font-size:0" align="right">
                                  <table class="es-table-not-adapt es-social" cellspacing="0" cellpadding="0"
                                    role="presentation"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                    <tr>
                                      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:5px"><a
                                          target="_blank" href="https://www.facebook.com/PITO.vn/"
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#262626;font-size:12px"><img
                                            title="Facebook"
                                            src="https://vpldml.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png"
                                            alt="Fb" width="32" height="32"
                                            style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                      </td>
                                      <td valign="top" align="center" style="padding:0;Margin:0;padding-right:5px"><a
                                          target="_blank" href="https://www.instagram.com/pito.vn/"
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#262626;font-size:12px"><img
                                            title="Instagram"
                                            src="https://vpldml.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png"
                                            alt="Inst" width="32" height="32"
                                            style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                      </td>
                                      <td valign="top" align="center" style="padding:0;Margin:0"><a target="_blank"
                                          href="https://www.linkedin.com/company/pito-vn/"
                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#262626;font-size:12px"><img
                                            title="Linkedin"
                                            src="https://vpldml.stripocdn.email/content/assets/img/social-icons/logo-black/linkedin-logo-black.png"
                                            alt="In" width="32" height="32"
                                            style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table><!--[if mso]></td></tr></table><![endif]-->
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
};

export default participantOrderPicking;
