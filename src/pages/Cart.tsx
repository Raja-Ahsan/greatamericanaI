import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useStore();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Discover amazing AI agents in our marketplace
          </p>
          <Link
            to="/marketplace"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.agent.id}
                className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4"
              >
                {/* Image */}
                <img
                  src={item.agent.image}
                  alt={item.agent.name}
                  className="w-full sm:w-32 h-32 object-cover rounded-lg"
                />

                {/* Details */}
                <div className="flex-grow">
                  <Link
                    to={`/agent/${item.agent.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                  >
                    {item.agent.name}
                  </Link>
                  <p className="text-gray-600 mt-1 line-clamp-2">
                    {item.agent.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Category: {item.agent.category}
                  </p>
                </div>

                {/* Price and Actions */}
                <div className="flex sm:flex-col justify-between sm:justify-start items-end sm:items-end">
                  <div className="text-right mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ${(item.agent.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${item.agent.price} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 mb-4">
                    <button
                      onClick={() => updateQuantity(item.agent.id, item.quantity - 1)}
                      className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.agent.id, item.quantity + 1)}
                      className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.agent.id)}
                    className="text-red-600 hover:text-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${(getTotalPrice() * 1.1).toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center mb-3"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/marketplace"
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors block text-center"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  🔒 Secure checkout with 256-bit encryption
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ✓ 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
