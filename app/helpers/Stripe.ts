const stripe = require('stripe');

export class Stripe {

    static init(apiKey: string) {
        global["stripeClient"] = stripe(apiKey)
    }

    static getClient() {
        return global["stripeClient"]
    }

    static async generateIntentResponse(intent) {
        // Note that if your API version is before 2019-02-11, 'requires_action'
        // appears as 'requires_source_action'.
        if (
          intent.status === 'requires_action' &&
          intent.next_action.type === 'use_stripe_sdk'
        ) {
          // Tell the client to handle the action
          return {
            requires_action: true,
            payment_intent_client_secret: intent.client_secret
          };
        } else if (intent.status === 'succeeded') {
          // The payment didn’t need any additional actions and completed!
          // Handle post-payment fulfillment
          return {
            success: true,
            intentId: intent.id
          };
        } else {
          // Invalid status
          return {
            error: 'Invalid PaymentIntent status'
          }
        }
    }

    static async createPaymentHold(amount: number, customerId: string, paymentMethodId: string) {
        try {
            return await Stripe.getClient().paymentIntents.create({
                amount: amount,
                currency: 'usd',
                customer: customerId,
                payment_method: paymentMethodId,
                payment_method_types: ['card'],
                capture_method: 'manual',
                error_on_requires_action: true,
                confirm: true,
            });
        } catch (err) {
            return err
        }
    }

    static async createPaymentIntent(paymentMethodId: string, customerId: string, amount: number) {
        try {
            const res = await Stripe.getClient().paymentIntents.create({
                payment_method: paymentMethodId,
                customer: customerId,
                amount,
                currency: 'usd',
                confirmation_method: 'manual',
                confirm: true
            });

            return Stripe.generateIntentResponse(res)
        } catch (error) {
            console.log(error)
            return { error }
        }
    }

    static async confirmPaymentIntent(paymentIntent: string) {
        try {
            const intent = await Stripe.getClient().paymentIntents.confirm(paymentIntent);
            return Stripe.generateIntentResponse(intent)
        } catch (error) {
            console.log(error)
            return { error }
        }
    }

    static async captureTheFunds(amount: number, intentId: string) {
        return await Stripe.getClient().paymentIntents.capture(intentId, {
            amount_to_capture: amount,
        })
    }

    static async cancelPaymentIntent(intentId: string) {
        return await Stripe.getClient().paymentIntents.cancel(intentId, {
            cancellation_reason: 'requested_by_customer'
        })
    }

    static async createCustomer(paymentMethodId: string) {
        return await Stripe.getClient().customers.create({
            payment_method: paymentMethodId,
        })
    }

    static async updateCustomer(paymentMethodId: string, customerId: string) {
        return await Stripe.getClient().paymentMethods.attach(
            paymentMethodId,
            {
              customer: customerId,
            }
        )
    }

    static async retrievePaymentMethod(paymentMethodId: string,) {
        return await Stripe.getClient().paymentMethods.retrieve(paymentMethodId)
    }
}
