KIVORA ENERGY WEBSITE — plain HTML, CSS and JavaScript (no frameworks, no build step)

HOW TO OPEN
  Double-click index.html. It opens in any modern browser (Chrome, Edge, Safari, Firefox).
  An internet connection is only needed for the Google web fonts; without it the site
  falls back to system fonts and still works.

FOLDER CONTENTS
  index.html          All page content and markup
  css/styles.css      All styling (colours, typography and layout tokens are at the top)
  js/script.js        Interactions, contact-form validation and SITE_CONFIG
  images/founder.jpg  Founder image (replace with an approved photo, same file name)

BEFORE PUBLISHING — edit SITE_CONFIG at the top of js/script.js
  showSetupNotes      set to false to hide the yellow "SETUP" reminders
  legalName, companyNumber, registeredOffice, jurisdiction   once registration is confirmed
  contactEmail, phone, officeLocation, linkedinUrl            public contact details
  privacyUrl, termsUrl, cookiesUrl                            legal pages
  formEndpoint        HTTPS endpoint that receives the contact form as JSON.
                      Until it is set, the form validates but tells visitors nothing was sent.

To change wording, edit index.html directly. To publish, upload the whole folder to any web host.
