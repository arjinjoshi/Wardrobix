import { AppError } from "./AppError";

function checkEnv(name: string, fallback?: string): string {
  const extractValue = process.env[name] || fallback;

  if (!extractValue) {
    throw new Error(`Missing env: ${name}`);
  }

  return extractValue;
}

export const getKhaltiConfig = () => {
  return {
    secretKey: checkEnv("KHALTI_SECRET_KEY", "test_public_key_dc74e545625d481292ba4034a1628303"),
  };
};

export const toSubUnits = (amount: number) => {
  return Math.round(amount * 100);
};

export type KhaltiInitiatePayload = {
  return_url: string;
  website_url: string;
  amount: number; // in paisa
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name: string;
    email: string;
    phone?: string;
  };
};

export type KhaltiInitiateResponse = {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
};

export const initiateKhaltiPayment = async (payload: KhaltiInitiatePayload): Promise<KhaltiInitiateResponse> => {
  const { secretKey } = getKhaltiConfig();

  const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Khalti Initiate Error:", errorData);
    throw new AppError(500, "Failed to initiate Khalti payment");
  }

  return (await response.json()) as KhaltiInitiateResponse;
};

export type KhaltiVerifyResponse = {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled";
  transaction_id: string;
  fee: number;
  refunded: boolean;
};

export const verifyKhaltiPayment = async (pidx: string): Promise<KhaltiVerifyResponse> => {
  const { secretKey } = getKhaltiConfig();

  const response = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Khalti Verify Error:", errorData);
    throw new AppError(500, "Failed to verify Khalti payment");
  }

  return (await response.json()) as KhaltiVerifyResponse;
};
