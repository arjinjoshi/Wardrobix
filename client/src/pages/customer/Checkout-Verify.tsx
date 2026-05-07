import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomerCartAndCheckoutStore } from "@/features/customer/cart-and-checkout/store";
import { Loader2 } from "lucide-react";

export default function CheckoutVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const confirmKhaltiPayment = useCustomerCartAndCheckoutStore(
    (state) => state.confirmKhaltiPayment,
  );
  const verifyStarted = useRef(false);

  const pidx = searchParams.get("pidx");

  useEffect(() => {
    if (!pidx || verifyStarted.current) return;

    verifyStarted.current = true;

    void confirmKhaltiPayment({
      pidx,
      onSuccess: () => navigate("/order-success"),
    });
  }, [pidx, confirmKhaltiPayment, navigate]);

  if (!pidx) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-xl font-semibold text-destructive">
          Invalid Payment Session
        </h1>
        <p className="text-muted-foreground">
          No payment identifier found in the URL.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <h1 className="text-2xl font-bold">Verifying Payment</h1>
      <p className="max-w-md text-muted-foreground">
        Please wait while we confirm your payment with Khalti. This should only
        take a moment.
      </p>
    </div>
  );
}
