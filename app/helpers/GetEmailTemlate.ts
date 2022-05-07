import moment from "moment"
import { Car } from "../models/Car"
import convertNumberToCurrency from "../utils/convertNumberToCurrency"

function GetUserVerificationEmailTemplate(href: string, username: string) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0px 15px 45px 15px">
          <table border="0" cellpadding="0" cellspacing="0" width="100%"
            style="max-width:500px;border-top:1px solid #e2e2e2">
            <tbody>
              <tr>
                <td style="padding-top:25px">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center"
                                  style="font-size:22px;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-weight:600;color:#202124">Welcome to HotBids!
                                </td>
                              </tr>
                              <tr>
                                <td align="center"
                                  style="padding:20px 0 0 0;font-size:16px;line-height:24px;font-family:'Open Sans',Helvetica,Arial,sans-serif;color:#202124"
                                  >Thanks for signing up, ${username}! Before you can start participating on the site, we need to verify your email. Please click the button below.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center" style="padding-top:35px">
                                  <table border="0" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td align="center" style="border-radius:6px" bgcolor="#FFDB83">
                                          <a style="font-size:16px;color:black;padding:15px 25px;text-align:center;background:#FFDB83;border-radius:5px;display:inline-block" href="${href}">Verify Email Address</a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}


function GetUserResetingPasswordEmailTemplate(href: string, username: string) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0px 15px 45px 15px">
          <table border="0" cellpadding="0" cellspacing="0" width="100%"
            style="max-width:500px;border-top:1px solid #e2e2e2">
            <tbody>
              <tr>
                <td style="padding-top:25px">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center"
                                  style="padding:20px 0 0 0;font-size:16px;line-height:24px;font-family:'Open Sans',Helvetica,Arial,sans-serif;color:#202124"
                                  >Password reset request for ${username} <br/>
                                  Please click on the button below to reset your password. If you have not requested a password reset, please ignore this email.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center" style="padding-top:35px">
                                  <table border="0" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td align="center" style="border-radius:6px" bgcolor="#FFDB83">
                                          <a style="font-size:16px;color:black;padding:15px 25px;text-align:center;background:#FFDB83;border-radius:5px;display:inline-block" href="${href}">Reset password</a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}

function GetNewBidNotificationEmailTemplate({
  title,
  bidderUsername,
  bid,
  imgUrl,
  carUrl
}: {
  title: string,
  bidderUsername: string,
  bid: number,
  imgUrl: string,
  carUrl: string
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top: 25px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <a
                                href="${carUrl}"
                                target="_blank"
                            >
                                <img
                                    src="${imgUrl}"
                                    width="500"
                                    height="329"
                                    border="0"
                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                    class="m_9199855055071283069img-max CToWUd"
                                />
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    New <span class="il">bid</span> on the ${title}
                                </td>
                                </tr>
                                <tr>
                                <td
                                    align="left"
                                    style="padding: 20px 0 0 0; font-size: 16px; line-height: 24px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; color: #202124;"
                                    class="m_9199855055071283069padding"
                                    >
                                    A new <span class="il">bid</span> for ${convertNumberToCurrency(bid)} was placed by ${bidderUsername}.
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${carUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to Auction
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}



function GetAuctionEdningSoonNotificationEmailTemplate({
  title,
  endDate,
  imgUrl,
  carUrl
}: {
  title: string,
  endDate: string,
  imgUrl: string,
  carUrl: string
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top: 25px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <a
                                href="${carUrl}"
                                target="_blank"
                            >
                                <img
                                    src="${imgUrl}"
                                    width="500"
                                    height="329"
                                    border="0"
                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                    class="m_9199855055071283069img-max CToWUd"
                                />
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    ${title} is ending soon.
                                </td>
                                </tr>
                                <tr>
                                <td
                                    align="left"
                                    style="padding: 20px 0 0 0; font-size: 16px; line-height: 24px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; color: #202124;"
                                    class="m_9199855055071283069padding"
                                    >
                                    The auction is scheduled to close at ${endDate} today.
                                    <br/>
                                    <br/>
                                    Don’t miss your chance to bid and take this ${title} home!.
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${carUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to Auction
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}

function GetAuctionEndedSoonNotificationEmailTemplate({
  title,
  imgUrl,
  carUrl,
  soldText
}: {
  title: string,
  imgUrl: string,
  carUrl: string,
  soldText: string
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top: 25px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <a
                                href="${carUrl}"
                                target="_blank"
                            >
                                <img
                                    src="${imgUrl}"
                                    width="500"
                                    height="329"
                                    border="0"
                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                    class="m_9199855055071283069img-max CToWUd"
                                />
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    Auction ended on the ${title}.
                                </td>
                                </tr>
                                <tr>
                                <td
                                    align="left"
                                    style="padding: 20px 0 0 0; font-size: 16px; line-height: 24px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; color: #202124;"
                                    class="m_9199855055071283069padding"
                                    >
                                    ${soldText}
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${carUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to Auction
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}

function GetNewAuctionNotificationEmailTemplate({
  title,
  imgUrl,
  carUrl,
}: {
  title: string,
  imgUrl: string,
  carUrl: string,
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top: 25px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <a
                                href="${carUrl}"
                                target="_blank"
                            >
                                <img
                                    src="${imgUrl}"
                                    width="500"
                                    height="329"
                                    border="0"
                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                    class="m_9199855055071283069img-max CToWUd"
                                />
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    New auction on the ${title}.
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${carUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to Auction
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}

function GetNewCommentNotificationEmailTemplate({
  title,
  imgUrl,
  carUrl,
  username,
  text
}: {
  title: string,
  imgUrl: string,
  carUrl: string,
  username: string,
  text: string,
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top: 25px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <a
                                href="${carUrl}"
                                target="_blank"
                            >
                                <img
                                    src="${imgUrl}"
                                    width="500"
                                    height="329"
                                    border="0"
                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                    class="m_9199855055071283069img-max CToWUd"
                                />
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    New comment on the ${title}.
                                </td>
                                </tr>
                                <tr>
                                <td
                                    align="left"
                                    style="padding: 20px 0 0 0; font-size: 16px; line-height: 24px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; color: #202124;"
                                    class="m_9199855055071283069padding"
                                    >
                                    <em>@${username}</em> - ${text}
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${carUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to Auction
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}

function GetRepliedCommentNotificationEmailTemplate({
  title,
  imgUrl,
  carUrl,
  username,
  text
}: {
  title: string,
  imgUrl: string,
  carUrl: string,
  username: string,
  text: string,
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top: 25px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <a
                                href="${carUrl}"
                                target="_blank"
                            >
                                <img
                                    src="${imgUrl}"
                                    width="500"
                                    height="329"
                                    border="0"
                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                    class="m_9199855055071283069img-max CToWUd"
                                />
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    ${username} replied you on the ${title}.
                                </td>
                                </tr>
                                <tr>
                                <td
                                    align="left"
                                    style="padding: 20px 0 0 0; font-size: 16px; line-height: 24px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; color: #202124;"
                                    class="m_9199855055071283069padding"
                                    >
                                    <em>@${username}</em> - ${text}
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${carUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to Auction
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}


function GetQuestionAnsweredNotificationEmailTemplate({
  title,
  imgUrl,
  carUrl,
  usernameAnswer,
  usernameQuestion,
  answer,
  question
}: {
  title: string,
  imgUrl: string,
  carUrl: string,
  usernameAnswer: string,
  usernameQuestion: string,
  answer: string,
  question: string,
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top: 25px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <a
                                href="${carUrl}"
                                target="_blank"
                            >
                                <img
                                    src="${imgUrl}"
                                    width="500"
                                    height="329"
                                    border="0"
                                    style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                    class="m_9199855055071283069img-max CToWUd"
                                />
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    A question on the ${title} was answered.
                                </td>
                                </tr>
                                <tr>
                                <td
                                    align="left"
                                    style="padding: 20px 0 0 0; font-size: 16px; line-height: 24px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; color: #202124;"
                                    class="m_9199855055071283069padding"
                                    >
                                    <em>@${usernameQuestion}</em> asked - ${question}

                                    <br/>
                                    <br/>

                                    <em>@${usernameAnswer}</em> answered - ${answer}
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${carUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to Auction
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>
    `.replace(/\n/g, '')
}

function GetDailyEmailTemplate({
  newCars,
  endedCars,
  homepageUrl
}: {
  newCars: Array<any>
  endedCars: Array<any>,
  homepageUrl: string
}) {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
            <tbody>
                <tr>
                <td style="padding-top:25px;padding-bottom:50px">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                        <td>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                    Auctions Closing Today — ${moment().format('MMMM Do')}.
                                    <br/>
                                    <br/>
                                </td>
                                </tr>
                                ${endedCars}


                                <tr>
                                    <td style="padding-top:35px;border-top:1px solid #e2e2e2">
                                    </td>
                                </tr>

                                ${newCars.length > 0 ?
      `<tr>
                                    <td style="line-height:22px;font-size:22px;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-weight:600;color:#202124;padding-bottom:30px" align="left">Newly Listed Auctions</td>
                                    </tr>` : ''
    }

                                ${newCars}

                            </tbody>
                            </table>
                        </td>
                        </tr>
                        <tr>
                        <td align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                    <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                    <tbody>
                                        <tr>
                                        <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                            <a
                                            href="${homepageUrl}"
                                            style="
                                            font-size: 16px;
                                            font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                            text-decoration: none;
                                            color: #0f2236;
                                            border-radius: 6px;
                                            padding: 15px 25px;
                                            border: 1px solid #FFDB83;
                                            display: inline-block;
                                            "
                                            class="m_9199855055071283069mobile-button"
                                            target="_blank"
                                            >
                                            Go to HotBids
                                            </a>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                </tr>
            </tbody>
            </table>
        </td>
    </tr>
    </tbody>
  </table>`.replace(/\n/g, '')
}

function GetNewCarPendingApprovalNotificationEmailTemplate({
  title,
  imgUrl,
  carUrl,
}: {
  title: string,
  imgUrl: string,
  carUrl: string,
}) {
  return `
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tbody>
    <tr>
      <td bgcolor="#ffffff" align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
          <tbody>
            <tr>
              <td align="center" valign="top" style="padding:30px 0 20px 0">
                <a href="https://hotbids.online/" target="_blank">
                  <img alt=""
                    src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                    height="100"
                    style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                    border="0">
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 15px 45px 15px;" class="m_9199855055071283069section-padding">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; border-top: 1px solid #e2e2e2;" class="m_9199855055071283069responsive-table">
          <tbody>
              <tr>
              <td style="padding-top: 25px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tbody>
                      <tr>
                      <td align="center" style="padding-bottom: 20px;">
                          <a
                              href="${carUrl}"
                              target="_blank"
                          >
                              <img
                                  src="${imgUrl}"
                                  width="500"
                                  height="329"
                                  border="0"
                                  style="display: block; padding: 0; color: #666666; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px; border-radius: 3px;"
                                  class="m_9199855055071283069img-max CToWUd"
                              />
                          </a>
                      </td>
                      </tr>
                      <tr>
                      <td>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tbody>
                              <tr>
                              <td align="left" style="font-size: 22px; font-family: 'Open Sans', Helvetica, Arial, sans-serif; font-weight: 600; color: #202124;" class="m_9199855055071283069padding">
                                New car ${title} is awaiting approval.
                              </td>
                              </tr>
                          </tbody>
                          </table>
                      </td>
                      </tr>
                      <tr>
                      <td align="center">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tbody>
                              <tr>
                              <td align="center" style="padding-top: 35px;" class="m_9199855055071283069padding">
                                  <table border="0" cellspacing="0" cellpadding="0" class="m_9199855055071283069mobile-button-container">
                                  <tbody>
                                      <tr>
                                      <td align="center" style="border-radius: 6px;" bgcolor="#FFDB83">
                                          <a
                                          href="${carUrl}"
                                          style="
                                          font-size: 16px;
                                          font-family: 'Open Sans', Helvetica, Arial, sans-serif;
                                          text-decoration: none;
                                          color: #0f2236;
                                          border-radius: 6px;
                                          padding: 15px 25px;
                                          border: 1px solid #FFDB83;
                                          display: inline-block;
                                          "
                                          class="m_9199855055071283069mobile-button"
                                          target="_blank"
                                          >
                                          Go to Auction
                                          </a>
                                      </td>
                                      </tr>
                                  </tbody>
                                  </table>
                              </td>
                              </tr>
                          </tbody>
                          </table>
                      </td>
                      </tr>
                  </tbody>
                  </table>
              </td>
              </tr>
          </tbody>
          </table>
      </td>
  </tr>
  </tbody>
</table>
  `.replace(/\n/g, '')
}

function GetNewSupportMessageEmailTemplate(message: string, href: string) {
  return `
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tbody>
      <tr>
        <td bgcolor="#ffffff" align="center">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px">
            <tbody>
              <tr>
                <td align="center" valign="top" style="padding:30px 0 20px 0">
                  <a href="https://hotbids.online/" target="_blank">
                    <img alt=""
                      src="https://i.ibb.co/37QnGfD/2021-10-19-113348.png"
                      height="100"
                      style="display:block;font-family:Helvetica,Arial,sans-serif;color:#ffffff;font-size:16px"
                      border="0">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:0px 15px 45px 15px">
          <table border="0" cellpadding="0" cellspacing="0" width="100%"
            style="max-width:500px;border-top:1px solid #e2e2e2">
            <tbody>
              <tr>
                <td style="padding-top:25px">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td>
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center"
                                  style="font-size:22px;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-weight:600;color:#202124">New message from support
                                </td>
                              </tr>
                              <tr>
                                <td align="left"
                                  style="padding:20px 0 0 0;font-size:16px;line-height:24px;font-family:'Open Sans',Helvetica,Arial,sans-serif;color:#202124"
                                  >${message}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center" style="padding-top:35px">
                                  <table border="0" cellspacing="0" cellpadding="0">
                                    <tbody>
                                      <tr>
                                        <td align="center" style="border-radius:6px" bgcolor="#FFDB83">
                                          <a style="font-size:16px;color:black;padding:15px 25px;text-align:center;background:#FFDB83;border-radius:5px;display:inline-block" href="${href}">View</a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  `.replace(/\n/g, '')
}

export {
  GetUserVerificationEmailTemplate,
  GetUserResetingPasswordEmailTemplate,
  GetNewBidNotificationEmailTemplate,
  GetAuctionEdningSoonNotificationEmailTemplate,
  GetAuctionEndedSoonNotificationEmailTemplate,
  GetNewAuctionNotificationEmailTemplate,
  GetNewCommentNotificationEmailTemplate,
  GetRepliedCommentNotificationEmailTemplate,
  GetQuestionAnsweredNotificationEmailTemplate,
  GetDailyEmailTemplate,
  GetNewCarPendingApprovalNotificationEmailTemplate,
  GetNewSupportMessageEmailTemplate
}
