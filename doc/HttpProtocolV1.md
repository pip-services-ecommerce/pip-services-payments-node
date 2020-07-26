# HTTP Protocol (version 1) <br/> Payments Microservice

Payments microservice implements a HTTP compatible API, that can be accessed on configured port.
All input and output data is serialized in JSON format. Errors are returned in [standard format]().

* [POST /v1/payments/make_payment](#operation1)
* [POST /v1/payments/submit_payment](#operation2)
* [POST /v1/payments/authorize_payment](#operation3)
* [POST /v1/payments/check_payment](#operation4)
* [POST /v1/payments/refund_payment](#operation5)
* [POST /v1/payments/make_payout](#operation6)
* [POST /v1/payments/check_payout](#operation7)
* [POST /v1/payments/cancel_payout](#operation8)

## Operations

### <a name="operation1"></a> Method: 'POST', route '/v1/payments/make_payment'

Makes a payment using the specified payment system and payment method

**Request body:**
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- buyer: BuyerV1 - buyer information
- order: OrderV1 - (optional) order parameters
- paymentMethod: PaymentMethodV1 - payment method used
- amount: number - purchase amount
- currencyCode: string - three-letter ISO currency code, in lowercase. 

**Response body:**
- payment: PaymentV1 - Information about the made payment

### <a name="operation2"></a> Method: 'POST', route '/v1/payments/submit_payment'

Submits payment for processing

**Request body:**
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- buyer: BuyerV1 - buyer information
- order: OrderV1 - (optional) order parameters
- paymentMethod: PaymentMethodV1 - payment method used
- amount: number - purchase amount
- currencyCode: string - three-letter ISO currency code, in lowercase. 

**Response body:**
- payment: PaymentV1 - submitted payment 

### <a name="operation3"></a> Method: 'POST', route '/v1/payments/authorize_payment'

Performs authorization of the payment sent for processing

**Request body:** 
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- payment: PaymentV1 - submitted payment

**Response body:**
- payment: PaymentV1 - authorized payment

### <a name="operation4"></a> Method: 'POST', route '/v1/payments/check_payment'

Get information about payment

**Request body:**
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- payment: PaymentV1 - payment

**Response body:**
- payment: PaymentV1 - finded payment

### <a name="operation5"></a> Method: 'POST', route '/v1/payments/refund_payment'

Make a refund

**Request body:**
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- payment: PaymentV1 - payment

**Response body:**
- payment: PaymentV1 - refunded payment 

### <a name="operation6"></a> Method: 'POST', route '/v1/payments/make_payout'

Make a payout

**Request body:**
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- seller: SellerV1 - seller information
- description: string - (optional) description of payout
- amount: number - payout amount
- currencyCode: string - three-letter ISO currency code, in lowercase. 

**Response body:**
- payout: PayoutV1 - maked payout 

### <a name="operation7"></a> Method: 'POST', route '/v1/payments/check_payout'

Get information about payout

**Request body:**
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- payout: PayoutV1 - payout

**Response body:**
- payout: PayoutV1 - finded payout

### <a name="operation8"></a> Method: 'POST', route '/v1/payments/cancel_payout'

Cancel a refund

**Request body:**
- system: string - the name of the payment system specified in PaymentSystemV1
- account: PaymentSystemAccountV1 - parameters for connecting to the payment system
- payout: PayoutV1 - payout

**Response body:**
- payout: PayoutV1 - canceled payout 