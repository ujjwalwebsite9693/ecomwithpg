/**
 * YOUPI PG V2 Universal One-Script Frontend SDK Wrapper
 * Compliant with AGENTS.md standards
 */

const YOUPI_HOST = import.meta.env.VITE_YOUPI_HOST || 'http://localhost:7000';
const YOUPI_KEY = import.meta.env.VITE_YOUPI_KEY || '00000000-0000-0000-0000-000000000001';

/**
 * Ensures the YOUPI one-script is loaded and ready on the page
 */
export function loadYoupiScript() {
  return new Promise((resolve, reject) => {
    if (window.Youpi && typeof window.Youpi.pay === 'function') {
      return resolve(window.Youpi);
    }

    const existingScript = document.getElementById('youpi-sdk');
    if (existingScript) {
      existingScript.onload = () => resolve(window.Youpi);
      existingScript.onerror = () => reject(new Error('Failed to load YOUPI Payment SDK'));
      return;
    }

    const script = document.createElement('script');
    script.id = 'youpi-sdk';
    script.src = `${YOUPI_HOST}/youpi.js`;
    script.setAttribute('data-youpi-key', YOUPI_KEY);
    script.async = true;

    script.onload = () => {
      console.log('[YOUPI PG] SDK script loaded successfully.');
      resolve(window.Youpi);
    };

    script.onerror = () => {
      console.error(`[YOUPI PG] Failed to load SDK from ${YOUPI_HOST}/youpi.js`);
      reject(new Error(`Failed to load YOUPI checkout from ${YOUPI_HOST}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Programmatic invocation of YOUPI PG V2 modal checkout
 * 
 * @param {Object} options
 * @param {string} options.orderId - Merchant order ID
 * @param {number} options.amount - Total amount in INR
 * @param {Object} options.customer - Customer details { name, email, phone }
 * @param {Object} [options.metadata] - Extra metadata { items, order_id }
 * @param {Function} [options.onSuccess] - Callback when payment is confirmed
 * @param {Function} [options.onClose] - Callback when modal is dismissed
 */
export async function openYoupiPayment({
  orderId,
  amount,
  customer,
  metadata = {},
  onSuccess,
  onClose
}) {
  await loadYoupiScript();

  if (!window.Youpi || typeof window.Youpi.pay !== 'function') {
    throw new Error('YOUPI Gateway SDK is not ready.');
  }

  return new Promise((resolve) => {
    window.Youpi.pay({
      order_id: orderId,
      amount: Number(amount),
      currency: 'INR',
      customer: {
        name: customer.name || 'Valued Customer',
        email: customer.email || 'customer@example.com',
        phone: customer.phone || '9876543210'
      },
      metadata: {
        ...metadata,
        platform: 'YOUPI_MERN_V2'
      },
      handler: function(response) {
        console.log('[YOUPI Payment Success]:', response);
        if (onSuccess) onSuccess(response);
        resolve({ status: 'SUCCESS', response });
      },
      onClose: function() {
        console.log('[YOUPI Modal Closed]');
        if (onClose) onClose();
        resolve({ status: 'CLOSED' });
      }
    });
  });
}
