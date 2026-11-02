import { useCallback } from 'react';
import { toast } from 'sonner';

const MESSAGE_KEYS = ['message', 'messages', 'error', 'errors', 'detail'];
const ENVELOPE_KEYS = ['response', 'data', 'result', 'payload', 'pagination', 'meta'];

const extractMessage = (value, seen, allowPrimitive = false) => {
  if (typeof value === 'string') return allowPrimitive ? value.trim() || null : null;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return allowPrimitive ? String(value) : null;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) return null;

  seen.add(value);

  if (Array.isArray(value)) {
    if (!allowPrimitive) return null;
    const messages = value
      .map((item) => extractMessage(item, seen, true))
      .filter(Boolean);
    return messages.length ? messages.join(', ') : null;
  }

  for (const key of MESSAGE_KEYS) {
    if (value[key] != null) {
      const message = extractMessage(value[key], seen, true);
      if (message) return message;
    }
  }

  for (const key of ENVELOPE_KEYS) {
    if (value[key] != null) {
      const message = extractMessage(value[key], seen);
      if (message) return message;
    }
  }

  return null;
};

const getResponseStatus = (payload) => {
  const candidates = [
    payload?.status,
    payload?.response?.status,
    payload?.response?.data?.status,
    payload?.data?.status,
    payload?.result?.status,
    payload?.payload?.status,
  ];

  return candidates.find((status) => status != null);
};

const getToastType = (status) => {
  const normalizedStatus = String(status ?? '').trim().toLowerCase();
  const numericStatus = Number(normalizedStatus);

  if (['success', 'successful', 'ok', 'created', 'completed'].includes(normalizedStatus)) {
    return 'success';
  }
  if (['error', 'failed', 'failure', 'rejected', 'unauthorized'].includes(normalizedStatus)) {
    return 'error';
  }
  if (['warning', 'warn', 'pending'].includes(normalizedStatus)) {
    return 'warning';
  }
  if (['info', 'information'].includes(normalizedStatus)) {
    return 'info';
  }
  if (Number.isFinite(numericStatus) && numericStatus >= 100) {
    if (numericStatus >= 200 && numericStatus < 400) return 'success';
    if (numericStatus >= 400) return 'error';
  }

  return 'info';
};

export const getBackendMessage = (payload) => extractMessage(payload, new Set());

export default function useBackendMessages() {
  const showBackendMessage = useCallback((payload) => {
    const message = getBackendMessage(payload);
    if (!message) return false;

    toast[getToastType(getResponseStatus(payload))](message);
    return true;
  }, []);

  return {
    getBackendMessage,
    showBackendMessage,
  };
}
