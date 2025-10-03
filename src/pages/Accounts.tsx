import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { Account, AccountType } from '../types';
import { apiClient } from '../utils/api';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await apiClient.get<Account[]>('/accounts/');
      setAccounts(response.data);
    } catch (error) {
      // fallback mock data
      setAccounts([
        { id: 1, user_id: 1, type: AccountType.BANK, name: 'Stanbic Bank', number: '1234567890', service_provider: 'Stanbic', created_at: '', updated_at: '' },
        { id: 2, user_id: 1, type: AccountType.MOMO, name: 'MTN Mobile Money', number: '0244000000', service_provider: 'MTN', created_at: '', updated_at: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Accounts</h1>
          <p className="mt-1 text-gray-600">Manage your bank and mobile money accounts.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${account.type === AccountType.BANK ? 'bg-blue-50' : 'bg-green-50'}`}>
                {account.type === AccountType.BANK ? (
                  <Banknote className="h-6 w-6 text-blue-600" />
                ) : (
                  <CreditCard className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{account.name}</div>
                <div className="text-gray-500 text-sm">{account.type === AccountType.BANK ? 'Bank Account' : 'Mobile Money'}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-gray-500 text-xs">Account Number</div>
              <div className="text-gray-900 font-medium text-base">{account.number}</div>
              <div className="text-gray-500 text-xs">Provider</div>
              <div className="text-gray-900 font-medium text-base">{account.service_provider}</div>
            </div>
            <div className="flex justify-end">
              <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                Manage <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {accounts.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600 mb-4">Add your first account to get started.</p>
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;