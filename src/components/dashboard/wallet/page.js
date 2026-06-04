"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/shared/Navbar";
import { 
  Wallet, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard,
  TrendingUp,
  Download,
  Plus,
  History,
  Shield
} from "lucide-react";

export default function WalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const walletData = {
    balance: 12500,
    escrow: 3500,
    savingsJar: 1850,
    earningsThisMonth: 8250,
    totalWithdrawn: 28000
  };

  // Move fetchTransactions function above useEffect
  const fetchTransactions = async () => {
    // Mock transactions for now
    const mockTransactions = [
      { id: 1, type: "credit", amount: 2500, description: "Job Completion", date: "2024-01-15", status: "completed" },
      { id: 2, type: "debit", amount: 500, description: "Savings Jar", date: "2024-01-15", status: "completed" },
      { id: 3, type: "credit", amount: 1800, description: "Job Completion", date: "2024-01-14", status: "completed" },
      { id: 4, type: "debit", amount: 360, description: "Savings Jar", date: "2024-01-14", status: "completed" },
      { id: 5, type: "debit", amount: 2000, description: "Withdrawal", date: "2024-01-13", status: "completed" },
      { id: 6, type: "credit", amount: 3200, description: "Job Completion", date: "2024-01-12", status: "completed" },
      { id: 7, type: "debit", amount: 640, description: "Savings Jar", date: "2024-01-12", status: "completed" },
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTransactions(mockTransactions);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      await fetchTransactions();
    };
    
    if (mounted) {
      init();
    }
    
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto pt-24 px-4 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet & Earnings</h1>
          <p className="text-gray-500 mt-2">Manage your earnings, savings, and withdrawals</p>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <WalletCard
            title="Available Balance"
            amount={walletData.balance}
            icon={<Wallet className="text-emerald-600" size={24} />}
            color="emerald"
            action={{ label: "Withdraw", onClick: () => setActiveTab("withdraw") }}
          />
          <WalletCard
            title="In Escrow"
            amount={walletData.escrow}
            icon={<Shield className="text-orange-600" size={24} />}
            color="orange"
            description="Secured for active jobs"
          />
          <WalletCard
            title="Savings Jar"
            amount={walletData.savingsJar}
            icon={<TrendingUp className="text-blue-600" size={24} />}
            color="blue"
            description="5% auto-save • 5.2% interest"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border mb-8">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
            <Wallet size={18} />
            Overview
          </TabButton>
          <TabButton active={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>
            <History size={18} />
            Transactions
          </TabButton>
          <TabButton active={activeTab === "withdraw"} onClick={() => setActiveTab("withdraw")}>
            <Download size={18} />
            Withdraw
          </TabButton>
          <TabButton active={activeTab === "savings"} onClick={() => setActiveTab("savings")}>
            <TrendingUp size={18} />
            Savings
          </TabButton>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Monthly Stats */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="This Month" value={`₹${walletData.earningsThisMonth}`} />
                  <StatCard label="Jobs Completed" value="8" />
                  <StatCard label="Avg. per Job" value="₹1,031" />
                  <StatCard label="Savings Added" value="₹412" />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ActionCard
                    icon={<Download className="text-emerald-600" />}
                    title="Withdraw Funds"
                    description="Transfer to your bank account"
                    onClick={() => setActiveTab("withdraw")}
                  />
                  <ActionCard
                    icon={<Plus className="text-blue-600" />}
                    title="Add to Savings"
                    description="Boost your savings jar"
                    onClick={() => setActiveTab("savings")}
                  />
                  <ActionCard
                    icon={<CreditCard className="text-purple-600" />}
                    title="Bank Details"
                    description="Manage linked accounts"
                    onClick={() => alert("Manage bank details")}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6">Transaction History</h3>
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading transactions...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "withdraw" && (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Withdraw Funds</h3>
              
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-900">₹{walletData.balance}</div>
                  <p className="text-emerald-700 mt-1">Available for withdrawal</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      max={walletData.balance}
                      placeholder="Enter amount"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Account
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-400 focus:border-transparent">
                    <option>HDFC Bank •••• 5678</option>
                    <option>SBI •••• 1234</option>
                  </select>
                </div>

                <button className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition">
                  Process Withdrawal
                </button>
              </div>
            </div>
          )}

          {activeTab === "savings" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6">Savings Jar Details</h3>
              
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-900">₹{walletData.savingsJar}</div>
                  <p className="text-emerald-700 mt-2">Total in Savings Jar</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">12</div>
                    <div className="text-xs text-gray-500">Months</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">5.2%</div>
                    <div className="text-xs text-gray-500">Interest p.a.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">₹93</div>
                    <div className="text-xs text-gray-500">Interest earned</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Add More to Savings</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[500, 1000, 2000, 5000].map(amount => (
                    <button
                      key={amount}
                      className="p-4 rounded-xl border hover:border-emerald-300 hover:bg-emerald-50 transition text-center"
                    >
                      <div className="text-lg font-bold text-gray-800">₹{amount}</div>
                    </button>
                  ))}
                </div>

                <button className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition">
                  Add to Savings Jar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function WalletCard({ title, amount, icon, color, description, action }) {
  const colorClasses = {
    emerald: "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200",
    orange: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
    blue: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">₹{amount.toLocaleString()}</div>
          {description && <div className="text-xs text-gray-600 mt-2">{description}</div>}
        </div>
        <div className="p-3 bg-white rounded-xl border shadow-sm">
          {icon}
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="w-full py-2 rounded-xl bg-white border text-sm font-medium hover:bg-gray-50 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition ${
        active
          ? "bg-emerald-600 text-white shadow"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl border bg-gray-50">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-bold text-gray-900 mt-2">{value}</div>
    </div>
  );
}

function ActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border hover:border-emerald-300 hover:shadow-md transition text-left"
    >
      <div className="mb-3">{icon}</div>
      <div className="font-medium text-gray-800">{title}</div>
      <div className="text-sm text-gray-500 mt-1">{description}</div>
    </button>
  );
}

function TransactionItem({ transaction }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 transition">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${
          transaction.type === 'credit' 
            ? 'bg-emerald-100 text-emerald-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {transaction.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>
        <div>
          <div className="font-medium text-gray-800">{transaction.description}</div>
          <div className="text-sm text-gray-500 mt-1">{transaction.date}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold ${
          transaction.type === 'credit' ? 'text-emerald-700' : 'text-red-700'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
        </div>
        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
          transaction.status === 'completed' 
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {transaction.status}
        </div>
      </div>
    </div>
  );
}