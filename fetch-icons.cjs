const https = require('https');
const fs = require('fs');

const icons = {
  PhonePe: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-icon.png',
  GPay: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.png',
  Paytm: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/paytm-icon.png',
  UPI: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/upi-icon.png',
  NetBanking: 'https://uxwing.com/wp-content/themes/uxwing/download/banking-finance/online-banking-icon.png',
  Cash: 'https://uxwing.com/wp-content/themes/uxwing/download/banking-finance/cash-icon.png'
};

let output = "import React from 'react';\n\nexport const PaymentIcons = {\n";
let promises = Object.entries(icons).map(([name, url]) => {
  return new Promise(resolve => {
    https.get(url, res => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        let buffer = Buffer.concat(data);
        let b64 = 'data:image/png;base64,' + buffer.toString('base64');
        resolve(`  ${name}: () => (<img src="${b64}" alt="${name}" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />),\n`);
      });
    }).on('error', (err) => {
      console.error(err);
      resolve("");
    });
  });
});

Promise.all(promises).then(res => {
  output += res.join('') + '};\n';
  fs.writeFileSync('src/utils/paymentIcons.jsx', output);
  console.log('paymentIcons.jsx updated with base64');
});
