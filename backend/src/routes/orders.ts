import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// 🔒 PRODUCTION-READY SECURITY FEATURES

// 1. Rate Limiting - Prevent brute force attacks
const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: 'Too many order creation attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyPaymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 verification attempts per IP
  message: 'Too many verification attempts. Please contact support.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Lazy init Razorpay with validation
let razorpay: Razorpay | null = null;
function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured in .env file');
    }
    
    // Validate key format
    if (!process.env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
      throw new Error('Invalid Razorpay Key ID format');
    }
    
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// 3. In-memory storage with TTL (replace with database in production)
const orders = new Map();
const ORDER_TTL = 60 * 60 * 1000; // 1 hour

// Auto-cleanup expired orders
setInterval(() => {
  const now = Date.now();
  for (const [orderId, order] of orders.entries()) {
    if (now - new Date(order.createdAt).getTime() > ORDER_TTL) {
      orders.delete(orderId);
      console.log(`🗑️ Cleaned up expired order: ${orderId}`);
    }
  }
}, 10 * 60 * 1000); // Every 10 minutes

// 4. Template pricing with exact user spec
const TEMPLATES = {
  'template1free': { id: 'template1free', name: 'Professional Classic (Free)', price: 0 },
  'classic': { id: 'classic', name: 'Classic Resume', price: 49 },
  'modern': { id: 'modern', name: 'Modern Tech Resume', price: 99 },
  'minimal': { id: 'minimal', name: 'Minimal Resume', price: 149 },
};

// 5. Input validation helper
function validateOrderRequest(body: any): { valid: boolean; error?: string } {
  if (!body.templateId || typeof body.templateId !== 'string') {
    return { valid: false, error: 'Invalid template ID' };
  }
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    return { valid: false, error: 'Invalid session ID' };
  }
  if (body.templateId.length > 50) {
    return { valid: false, error: 'Template ID too long' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(body.templateId)) {
    return { valid: false, error: 'Invalid template ID format' };
  }
  return { valid: true };
}

function validateVerifyRequest(body: any): { valid: boolean; error?: string } {
  const requiredFields = ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature', 'sessionId'];
  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== 'string') {
      return { valid: false, error: `Missing or invalid ${field}` };
    }
  }
  // Validate Razorpay ID formats
  if (!body.razorpay_payment_id.startsWith('pay_')) {
    return { valid: false, error: 'Invalid payment ID format' };
  }
  if (!body.razorpay_order_id.startsWith('order_')) {
    return { valid: false, error: 'Invalid order ID format' };
  }
  if (body.razorpay_signature.length !== 64) { // SHA256 hex
    return { valid: false, error: 'Invalid signature format' };
  }
  return { valid: true };
}

// 6. Audit logging
function logAudit(action: string, orderId: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    action,
    orderId,
    ...details,
  }));
}

// POST /api/orders/create - Create Razorpay order (PRODUCTION-READY)
router.post('/create', createOrderLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { templateId, sessionId } = req.body;

    // 1. Input validation
    const validation = validateOrderRequest(req.body);
    if (!validation.valid) {
      logAudit('order_create_failed', 'N/A', { reason: validation.error, ip: req.ip });
      return res.status(400).json({ error: validation.error });
    }

    // 2. Get template details
    const template = TEMPLATES[templateId as keyof typeof TEMPLATES];

    if (!template) {
      logAudit('order_create_failed', 'N/A', { reason: 'invalid_template', templateId, ip: req.ip });
      return res.status(404).json({ 
        error: 'INVALID_TEMPLATE',
        message: 'Template not found' 
      });
    }

    if (template.price === 0) {
      logAudit('order_create_failed', 'N/A', { reason: 'free_template', templateId, ip: req.ip });
      return res.status(400).json({ 
        error: 'FREE_TEMPLATE',
        message: 'This template is free, no payment required' 
      });
    }

    // 3. Generate secure receipt
    const receipt = `resume_${templateId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const amount = template.price * 100; // Convert to paise

    // 4. Create Razorpay order with timeout
    const razorpayOrder = await Promise.race([
      getRazorpay().orders.create({
        amount,
        currency: 'INR',
        receipt,
        notes: {
          templateId,
          sessionId,
          timestamp: new Date().toISOString(),
          ip: req.ip || 'unknown'
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Razorpay API timeout')), 10000)
      )
    ]) as any;

    // 5. Store order securely
    const orderData = {
      orderId: razorpayOrder.id,
      sessionId,
      templateId,
      amount,
      currency: 'INR',
      status: 'pending',
      createdAt: new Date().toISOString(),
      ip: req.ip,
      attempts: 0 // Track verification attempts
    };
    orders.set(razorpayOrder.id, orderData);

    const duration = Date.now() - startTime;
    logAudit('order_created', razorpayOrder.id, { 
      templateId, 
      amount, 
      duration: `${duration}ms`,
      ip: req.ip 
    });

    res.json({
      orderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      templateName: template.name
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logAudit('order_create_error', 'N/A', { 
      error: error.message, 
      duration: `${duration}ms`,
      ip: req.ip 
    });
    
    console.error('Error creating order:', error);
    
    if (error.message === 'Razorpay API timeout') {
      return res.status(504).json({ error: 'Payment gateway timeout. Please try again.' });
    }
    
    res.status(500).json({ error: 'Failed to create order. Please try again.' });
  }
});

// POST /api/orders/verify - Verify Razorpay payment signature (PRODUCTION-READY)
router.post('/verify', verifyPaymentLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, sessionId } = req.body;

    // 1. Input validation
    const validation = validateVerifyRequest(req.body);
    if (!validation.valid) {
      logAudit('verify_failed', razorpay_order_id || 'N/A', { reason: validation.error, ip: req.ip });
      return res.status(400).json({ error: validation.error });
    }

    // 2. Fetch order from memory
    const order = orders.get(razorpay_order_id);

    if (!order) {
      logAudit('verify_failed', razorpay_order_id, { reason: 'order_not_found', ip: req.ip });
      return res.status(404).json({ 
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: 'Order not found or expired' 
      });
    }

    // 3. Check session ID match (prevent CSRF)
    if (order.sessionId !== sessionId) {
      logAudit('verify_failed', razorpay_order_id, { reason: 'session_mismatch', ip: req.ip });
      return res.status(403).json({
        success: false,
        error: 'SESSION_MISMATCH',
        message: 'Invalid session'
      });
    }

    // 4. Check IP match (optional security layer)
    if (process.env.NODE_ENV === 'production' && order.ip && order.ip !== req.ip) {
      logAudit('verify_warning', razorpay_order_id, { reason: 'ip_mismatch', orderIp: order.ip, requestIp: req.ip });
      // Log but don't block (users might change networks)
    }

    // 5. Check if already verified (idempotency)
    if (order.status === 'verified') {
      logAudit('verify_duplicate', razorpay_order_id, { ip: req.ip });
      return res.json({
        success: true,
        templateId: order.templateId,
        message: 'Payment already verified'
      });
    }

    // 6. Track verification attempts (prevent brute force)
    order.attempts = (order.attempts || 0) + 1;
    if (order.attempts > 5) {
      order.status = 'blocked';
      orders.set(razorpay_order_id, order);
      logAudit('verify_blocked', razorpay_order_id, { reason: 'too_many_attempts', ip: req.ip });
      return res.status(429).json({
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: 'Too many verification attempts. Please contact support.'
      });
    }

    // 7. Verify HMAC signature (CRITICAL SECURITY CHECK)
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // 8. Constant-time comparison to prevent timing attacks
    const signatureMatch = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (!signatureMatch) {
      // Mark as failed
      order.status = 'failed';
      order.paymentId = razorpay_payment_id;
      order.signature = razorpay_signature;
      order.failedAt = new Date().toISOString();
      orders.set(razorpay_order_id, order);

      const duration = Date.now() - startTime;
      logAudit('verify_failed', razorpay_order_id, { 
        reason: 'signature_mismatch',
        attempts: order.attempts,
        duration: `${duration}ms`,
        ip: req.ip 
      });

      return res.json({
        success: false,
        error: 'SIGNATURE_MISMATCH',
        message: 'Payment verification failed'
      });
    }

    // 9. Signature valid - mark order as verified
    order.status = 'verified';
    order.paymentId = razorpay_payment_id;
    order.signature = razorpay_signature;
    order.verifiedAt = new Date().toISOString();
    orders.set(razorpay_order_id, order);

    const duration = Date.now() - startTime;
    logAudit('verify_success', razorpay_order_id, { 
      templateId: order.templateId,
      amount: order.amount,
      duration: `${duration}ms`,
      ip: req.ip 
    });

    res.json({
      success: true,
      templateId: order.templateId,
      message: 'Payment verified successfully'
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logAudit('verify_error', req.body.razorpay_order_id || 'N/A', { 
      error: error.message,
      duration: `${duration}ms`,
      ip: req.ip 
    });
    
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'VERIFICATION_ERROR',
      message: 'Failed to verify payment. Please contact support.' 
    });
  }
});

export default router;
