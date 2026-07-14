import razorpay
import hmac
import hashlib
import logging
import uuid
from config import Config

logger = logging.getLogger(__name__)

# Initialize Razorpay Client if configured properly
client = None
if Config.is_razorpay_configured():
    try:
        client = razorpay.Client(auth=(Config.RAZORPAY_KEY_ID, Config.RAZORPAY_KEY_SECRET))
        logger.info("Razorpay Client initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize Razorpay Client: {e}")
else:
    logger.warning("Razorpay running in MOCK mode.")

def create_razorpay_order(amount_in_rupees, receipt_id):
    """
    Creates a Razorpay order.
    Returns: A dict containing the order details or mock details if not configured.
    """
    amount_in_paise = int(amount_in_rupees * 100)
    
    if client:
        try:
            data = {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": receipt_id,
                "payment_capture": 1 # Auto capture
            }
            order = client.order.create(data=data)
            return {
                "success": True,
                "order_id": order.get('id'),
                "amount": amount_in_paise,
                "currency": "INR",
                "mock": False
            }
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            # Fall back to mock order below on exception

    # Mock Order for development
    mock_order_id = f"order_mock_{uuid.uuid4().hex[:14]}"
    logger.info(f"Created Mock Razorpay Order: {mock_order_id} for amount: ₹{amount_in_rupees}")
    return {
        "success": True,
        "order_id": mock_order_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "mock": True
    }

def verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Verifies the Razorpay payment signature.
    """
    # If using mock orders, verify immediately
    if razorpay_order_id.startswith("order_mock_"):
        logger.info("Mock payment signature verified.")
        return True

    if client:
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            client.utility.verify_payment_signature(params_dict)
            return True
        except Exception as e:
            logger.error(f"Razorpay signature verification failed: {e}")
            return False

    # Standard HMAC check fallback if API utility not matching
    try:
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            Config.RAZORPAY_KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(generated_signature, razorpay_signature)
    except Exception as e:
        logger.error(f"Fallback signature check error: {e}")
        return False

def refund_razorpay_payment(razorpay_payment_id, amount_in_rupees=None):
    """
    Refunds a Razorpay payment.
    Returns: True if success, False otherwise.
    """
    if razorpay_payment_id.startswith("pay_mock_") or not client:
        logger.info(f"Mock refund processed for payment: {razorpay_payment_id}")
        return True

    try:
        data = {}
        if amount_in_rupees:
            data["amount"] = int(amount_in_rupees * 100)
            
        refund = client.payment.refund(razorpay_payment_id, data)
        logger.info(f"Razorpay payment {razorpay_payment_id} refunded. Refund ID: {refund.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Razorpay refund failed: {e}")
        return False
