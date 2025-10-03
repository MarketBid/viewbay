import React from 'react';
import { Order, OrderStatus } from '../types';
import { Users, Lock, Truck, CheckCircle, MoveRight } from 'lucide-react';

interface OrderStatusTrackerProps {
  order: Order;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ order }) => {
  const steps = [
    {
      name: 'Both Parties Joined',
      icon: Users,
      isComplete: () => order.sender_id != null && order.receiver_id != null,
    },
    {
      name: 'Funds in Clarsix Hold',
      icon: Lock,
      isComplete: () => [
        OrderStatus.PAID,
        OrderStatus.IN_TRANSIT,
        OrderStatus.DELIVERED,
        OrderStatus.COMPLETED,
      ].includes(order.status),
    },
    {
      name: 'In Transit',
      icon: MoveRight,
      isComplete: () => [
        OrderStatus.IN_TRANSIT,
        OrderStatus.DELIVERED,
        OrderStatus.COMPLETED,
      ].includes(order.status),
    },
    {
      name: 'Package Delivered',
      icon: Truck,
      isComplete: () => [OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(order.status),
    },
    {
      name: 'Funds Released',
      icon: CheckCircle,
      isComplete: () => order.status === OrderStatus.COMPLETED,
    },
  ];

  const currentStepIndex = steps.findIndex(step => !step.isComplete());

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <nav aria-label="Progress">
        <ol role="list" className="flex items-start justify-between max-w-3xl mx-auto">
          {steps.map((step, stepIdx) => {
            const isComplete = step.isComplete();
            const isCurrent = stepIdx === currentStepIndex;
            
            return (
              <li key={step.name} className="relative flex flex-col items-center flex-1">
                {stepIdx !== 0 && (
                  <div 
                    className={`absolute left-0 right-0 h-[2px] top-5 -translate-y-1/2 w-[calc(100%-2.5rem)] -translate-x-1/2 transition-colors ${
                      isComplete ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 flex items-center justify-center rounded-full transition-all mb-3
                    ${isComplete ? 'bg-blue-600' : isCurrent ? 'bg-white border-2 border-blue-600' : 'bg-gray-100'}
                  `}>
                    <step.icon 
                      className={`w-5 h-5 transition-colors ${
                        isComplete ? 'text-white' : 
                        isCurrent ? 'text-blue-600' : 
                        'text-gray-400'
                      }`} 
                    />
                  </div>
                  <div className="h-12 flex items-start justify-center">
                    <p className={`
                      text-sm font-medium text-center max-w-[120px] transition-colors leading-tight
                      ${isComplete ? 'text-gray-900' : 
                        isCurrent ? 'text-blue-600' : 
                        'text-gray-500'
                      }
                    `}>
                      {step.name}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default OrderStatusTracker;