
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscriptionRecord {
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}
