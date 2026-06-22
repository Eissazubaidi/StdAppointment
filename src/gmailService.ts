import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';

// Get active Firebase app or initialize
let auth: any;
try {
  const app = getApp();
  auth = getAuth(app);
} catch (e) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly'
];

let cachedAccessToken: string | null = localStorage.getItem('inst_gmail_token');
let connectedEmail: string | null = localStorage.getItem('inst_gmail_email');

export const googleSignIn = async (): Promise<{ email: string; accessToken: string } | null> => {
  try {
    const provider = new GoogleAuthProvider();
    SCOPES.forEach(scope => provider.addScope(scope));
    
    // Force prompt select_account to get a fresh token
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Access Token.');
    }

    cachedAccessToken = credential.accessToken;
    connectedEmail = result.user.email;
    
    localStorage.setItem('inst_gmail_token', cachedAccessToken);
    if (connectedEmail) {
      localStorage.setItem('inst_gmail_email', connectedEmail);
    }
    
    return {
      email: connectedEmail || '',
      accessToken: cachedAccessToken
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const getGmailToken = (): string | null => {
  return cachedAccessToken || localStorage.getItem('inst_gmail_token');
};

export const getConnectedGmailEmail = (): string | null => {
  return connectedEmail || localStorage.getItem('inst_gmail_email');
};

export const logoutGmail = async () => {
  cachedAccessToken = null;
  connectedEmail = null;
  localStorage.removeItem('inst_gmail_token');
  localStorage.removeItem('inst_gmail_email');
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out error:', err);
  }
};

/**
 * Base64 encoding compatible with Arabic UTF-8 characters
 */
const b64EncodeUnicode = (str: string): string => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

/**
 * Sends a real email via Gmail API
 */
export const sendRealGmail = async (to: string, subject: string, body: string): Promise<boolean> => {
  const token = getGmailToken();
  if (!token) {
    console.warn('Gmail sending skipped: No Gmail connection verified.');
    return false;
  }

  try {
    const fromEmail = getConnectedGmailEmail() || 'me';
    
    // Construct email segments
    const subjectEncoded = `=?utf-8?B?${b64EncodeUnicode(subject)}?=`;
    const bodyEncoded = b64EncodeUnicode(body);

    const emailLines = [
      `From: ${fromEmail}`,
      `To: ${to}`,
      `Subject: ${subjectEncoded}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      bodyEncoded
    ];

    const rawMessage = emailLines.join('\r\n');
    
    // Standard Base64Url transformation for URL payloads
    const base64SafeRaw = b64EncodeUnicode(rawMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64SafeRaw
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gmail API payload error:', errText);
      if (response.status === 401) {
        // Expired or revoked credentials
        cachedAccessToken = null;
        localStorage.removeItem('inst_gmail_token');
      }
      return false;
    }

    console.log(`[Gmail Service] Email successfully sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[Gmail Service] Failed sending real email:', error);
    return false;
  }
};
