import { useEffect, useMemo, useState } from "react";
import Login from "./Login";
import "./index.css"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Receipt,
  Plus,
  MoreHorizontal,
  X,
  Search,
  Pencil,
  Trash2,
  LayoutDashboard,
  Tags,
  BarChart3,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Save,
  LogOut,
} from "lucide-react";

import {
  getTransactions,
  getCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./api";


// ============================================================
// CURRENCY CONFIGURATION
// ============================================================
// INR is the backend/base currency.
// All transaction amounts are stored in INR.
// Other currencies are only used for display/input conversion.
//
// Fixed built-in rates:
// 1 INR = 1 INR
// 1 INR = 0.0117 USD
// 1 INR = 0.0100 EUR
// 1 INR = 0.0086 GBP
// ============================================================

const CURRENCY_CONFIG = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    rate: 1,
    locale: "en-IN",
  },

  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rate: 0.0117,
    locale: "en-US",
  },

  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    rate: 0.0100,
    locale: "de-DE",
  },

  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    rate: 0.0086,
    locale: "en-GB",
  },
};


// ============================================================
// HELPERS
// ============================================================

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};


const getCurrencyConfig = (currency) => {
  return (
    CURRENCY_CONFIG[currency] ||
    CURRENCY_CONFIG.INR
  );
};


// Convert backend INR amount into selected currency.
const convertFromINR = (
  amount,
  currency = "INR"
) => {
  const number = Number(amount || 0);
  const config = getCurrencyConfig(currency);

  return number * config.rate;
};


// Convert selected currency amount back to backend INR.
const convertToINR = (
  amount,
  currency = "INR"
) => {
  const number = Number(amount || 0);
  const config = getCurrencyConfig(currency);

  if (!config.rate) {
    return number;
  }

  return number / config.rate;
};


// Format an amount according to selected currency.
const formatAmount = (
  amount,
  currency = "INR"
) => {
  const config = getCurrencyConfig(currency);
  const converted = convertFromINR(
    amount,
    currency
  );

  return converted.toLocaleString(
    config.locale,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};


// Currency symbol helper.
const getCurrencySymbol = (
  currency = "INR"
) => {
  return getCurrencyConfig(currency).symbol;
};


// Full formatted currency amount.
const formatCurrency = (
  amount,
  currency = "INR"
) => {
  return `${getCurrencySymbol(currency)}${formatAmount(
    amount,
    currency
  )}`;
};


const getCategoryNameFromList = (
  categories,
  categoryId
) => {
  const category = categories.find(
    (item) =>
      Number(item.id) ===
      Number(categoryId)
  );

  return category
    ? category.name
    : "Uncategorized";
};


// ============================================================
// TRANSACTION FORM
// IMPORTANT:
// This component MUST stay outside App()
// so typing does not cause focus loss.
// ============================================================

function TransactionForm({
  categories,
  formData,
  setFormData,
  editingTransaction,
  saving,
  onSubmit,
  onCancel,
  currency,
}) {
  const currencySymbol =
    getCurrencySymbol(currency);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <section className="transaction-form-panel">

      <div className="form-header">

        <div>

          <span className="page-eyebrow">
            {editingTransaction
              ? "EDIT TRANSACTION"
              : "NEW TRANSACTION"}
          </span>

          <h3>
            {editingTransaction
              ? "Edit Transaction"
              : "Add New Transaction"}
          </h3>

          <p>
            {editingTransaction
              ? "Update your transaction details."
              : "Enter the details of your income or expense."}
          </p>

        </div>

      </div>


      <form onSubmit={onSubmit}>

        <div className="form-grid">

          {/* TITLE */}

          <div className="form-group">

            <label htmlFor="title">
              Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Grocery Shopping"
              value={formData.title}
              onChange={handleInputChange}
              autoComplete="off"
              required
            />

          </div>


          {/* AMOUNT */}

          <div className="form-group">

            <label htmlFor="amount">
              Amount ({currencySymbol})
            </label>

            <input
              id="amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 500"
              value={formData.amount}
              onChange={handleInputChange}
              autoComplete="off"
              required
            />

            <small className="form-help-text">
              Enter the amount in {currency}.
            </small>

          </div>


          {/* TYPE */}

          <div className="form-group">

            <label htmlFor="type">
              Type
            </label>

            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >

              <option value="expense">
                Expense
              </option>

              <option value="income">
                Income
              </option>

            </select>

          </div>


          {/* CATEGORY */}

          <div className="form-group">

            <label htmlFor="category_id">
              Category
            </label>

            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
            >

              <option value="">
                Select category
              </option>

              {categories.map((category) => (

                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>

              ))}

            </select>

          </div>


          {/* DATE */}

          <div className="form-group">

            <label htmlFor="date">
              Date
            </label>

            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group form-group-full">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Add some notes about this transaction..."
              value={formData.description}
              onChange={handleInputChange}
            />

          </div>

        </div>


        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingTransaction
              ? "Update Transaction"
              : "Save Transaction"}
          </button>

        </div>

      </form>

    </section>
  );
}


// ============================================================
// DASHBOARD
// ============================================================

function Dashboard({
  transactions,
  categories,
  loading,
  showForm,
  setShowForm,
  editingTransaction,
  formData,
  setFormData,
  saving,
  handleSubmit,
  resetForm,
  handleNavigation,
  totalIncome,
  totalExpenses,
  totalBalance,
  currency,
}) {
  const monthlyExpenses = useMemo(() => {

    const grouped = {};

    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {

        const date = new Date(
          transaction.date
        );

        if (isNaN(date.getTime())) {
          return;
        }

        const key =
          `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

        const label =
          date.toLocaleString(
            "en-US",
            {
              month: "short",
              year: "numeric",
            }
          );

        if (!grouped[key]) {
          grouped[key] = {
            month: label,
            amount: 0,
          };
        }

        grouped[key].amount += Number(
          transaction.amount || 0
        );

      });

    return Object.keys(grouped)
      .sort()
      .map((key) => grouped[key]);

  }, [transactions]);


  return (
    <>

      {/* TOPBAR */}

      <header className="topbar">

        <div>

          <span className="page-eyebrow">
            OVERVIEW
          </span>

          <h1>
            Expense Dashboard
          </h1>

          <p>
            Welcome back! Here's your financial overview.
          </p>

        </div>


        <button
          className="add-button"
          onClick={() => {

            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }

          }}
        >

          {showForm ? (
            <X size={18} />
          ) : (
            <Plus size={18} />
          )}

          {showForm
            ? "Close Form"
            : "Add Transaction"}

        </button>

      </header>


      {/* FORM */}

      {showForm && (

        <TransactionForm
          categories={categories}
          formData={formData}
          setFormData={setFormData}
          editingTransaction={
            editingTransaction
          }
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            setShowForm(false);
          }}
          currency={currency}
        />

      )}


      {/* SUMMARY */}

      <section className="summary-grid">

        <div className="summary-card balance-card">

          <div className="card-header">

            <span>
              Total Balance
            </span>

            <Wallet size={20} />

          </div>

          <h2>
            {formatCurrency(
              totalBalance,
              currency
            )}
          </h2>

          <p>
            Your current balance
          </p>

        </div>


        <div className="summary-card">

          <div className="card-header">

            <span>
              Total Income
            </span>

            <ArrowUpRight size={20} />

          </div>

          <h2>
            {formatCurrency(
              totalIncome,
              currency
            )}
          </h2>

          <p>
            Money coming in
          </p>

        </div>


        <div className="summary-card">

          <div className="card-header">

            <span>
              Total Expenses
            </span>

            <ArrowDownRight size={20} />

          </div>

          <h2>
            {formatCurrency(
              totalExpenses,
              currency
            )}
          </h2>

          <p>
            Money going out
          </p>

        </div>


        <div className="summary-card">

          <div className="card-header">

            <span>
              Transactions
            </span>

            <Receipt size={20} />

          </div>

          <h2>
            {transactions.length}
          </h2>

          <p>
            {loading
              ? "Loading..."
              : "Total transactions"}
          </p>

        </div>

      </section>


      {/* CONTENT */}

      <section className="content-grid">

        {/* SPENDING CHART */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Spending Overview
              </h3>

              <p>
                Your expenses over time
              </p>

            </div>

            <button className="icon-button">
              <MoreHorizontal size={20} />
            </button>

          </div>


          <div className="chart-container">

            {loading ? (

              <div className="chart-message">
                Loading expense data...
              </div>

            ) : monthlyExpenses.length === 0 ? (

              <div className="chart-message">

                <span>
                  No expense data yet
                </span>

                <p>
                  Add your first expense to see your spending.
                </p>

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={270}
              >

                <AreaChart
                  data={monthlyExpenses}
                >

                  <defs>

                    <linearGradient
                      id="expenseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopOpacity={0.2}
                      />

                      <stop
                        offset="95%"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                    }}
                  />


                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                    }}
                    tickFormatter={(value) =>
                      `${getCurrencySymbol(
                        currency
                      )}${Number(
                        convertFromINR(
                          value,
                          currency
                        )
                      ).toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}`
                    }
                  />


                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(
                        value,
                        currency
                      ),
                      "Expenses",
                    ]}
                  />


                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#171923"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* RECENT TRANSACTIONS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Recent Transactions
              </h3>

              <p>
                Your latest activity
              </p>

            </div>


            <button
              className="view-button"
              onClick={() =>
                handleNavigation(
                  "transactions"
                )
              }
            >
              View all
            </button>

          </div>


          {loading ? (

            <div className="empty-state">

              <Receipt size={36} />

              <h4>
                Loading transactions...
              </h4>

              <p>
                Please wait while we fetch your latest activity.
              </p>

            </div>

          ) : transactions.length === 0 ? (

            <div className="empty-state">

              <Receipt size={36} />

              <h4>
                No transactions yet
              </h4>

              <p>
                Your recent expenses and income will appear here.
              </p>

            </div>

          ) : (

            <div className="transaction-list">

              {[...transactions]
                .sort(
                  (a, b) =>
                    Number(b.id || 0) -
                    Number(a.id || 0)
                )
                .slice(0, 5)
                .map((transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >

                    <div
                      className={`transaction-icon ${transaction.type}`}
                    >

                      {transaction.type ===
                      "income" ? (
                        <ArrowUpRight
                          size={18}
                        />
                      ) : (
                        <ArrowDownRight
                          size={18}
                        />
                      )}

                    </div>


                    <div className="transaction-info">

                      <strong>
                        {transaction.title}
                      </strong>

                      <span>
                        {transaction.date} •{" "}
                        {transaction.type}
                      </span>

                    </div>


                    <div
                      className={`transaction-amount ${transaction.type}`}
                    >

                      {transaction.type ===
                      "income"
                        ? "+"
                        : "-"}

                      {formatCurrency(
                        transaction.amount,
                        currency
                      )}

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

      </section>

    </>
  );
}


// ============================================================
// TRANSACTIONS PAGE
// ============================================================

function TransactionsPage({
  transactions,
  categories,
  loading,
  totalIncome,
  totalExpenses,
  totalBalance,
  onEdit,
  onDelete,
  currency,
}) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");


  const getCategoryName = (categoryId) =>
    getCategoryNameFromList(
      categories,
      categoryId
    );


  const filteredTransactions =
    useMemo(() => {

      return transactions.filter(
        (transaction) => {

          const search =
            searchTerm.toLowerCase();

          const title =
            transaction.title?.toLowerCase() ||
            "";

          const description =
            transaction.description?.toLowerCase() ||
            "";

          const categoryName =
            getCategoryName(
              transaction.category_id
            ).toLowerCase();


          const matchesSearch =
            title.includes(search) ||
            description.includes(search) ||
            categoryName.includes(search);


          const matchesType =
            typeFilter === "all" ||
            transaction.type ===
              typeFilter;


          const matchesCategory =
            categoryFilter === "all" ||
            Number(
              transaction.category_id
            ) ===
              Number(categoryFilter);


          return (
            matchesSearch &&
            matchesType &&
            matchesCategory
          );

        }
      );

    }, [
      transactions,
      categories,
      searchTerm,
      typeFilter,
      categoryFilter,
    ]);


  const incomeCount =
    transactions.filter(
      (transaction) =>
        transaction.type === "income"
    ).length;


  const expenseCount =
    transactions.filter(
      (transaction) =>
        transaction.type === "expense"
    ).length;


  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("all");
  };


  return (
    <div className="page-container">

      <div className="page-title-section">

        <div>

          <span className="page-eyebrow">
            FINANCIAL ACTIVITY
          </span>

          <h1>
            Transactions
          </h1>

          <p>
            Track and manage all your income and expenses.
          </p>

        </div>


        <div className="transaction-count-badge">
          {transactions.length} transactions
        </div>

      </div>


      <div className="transaction-stats">

        <div className="transaction-stat-card">

          <div className="stat-icon neutral">
            <Receipt size={20} />
          </div>

          <div>

            <span>
              Total Transactions
            </span>

            <strong>
              {transactions.length}
            </strong>

          </div>

        </div>


        <div className="transaction-stat-card">

          <div className="stat-icon income">
            <ArrowUpRight size={20} />
          </div>

          <div>

            <span>
              Income
            </span>

            <strong>
              {incomeCount}
            </strong>

            <small>
              {formatCurrency(
                totalIncome,
                currency
              )}
            </small>

          </div>

        </div>


        <div className="transaction-stat-card">

          <div className="stat-icon expense">
            <ArrowDownRight size={20} />
          </div>

          <div>

            <span>
              Expenses
            </span>

            <strong>
              {expenseCount}
            </strong>

            <small>
              {formatCurrency(
                totalExpenses,
                currency
              )}
            </small>

          </div>

        </div>


        <div className="transaction-stat-card">

          <div className="stat-icon balance">
            <Wallet size={20} />
          </div>

          <div>

            <span>
              Net Balance
            </span>

            <strong>
              {formatCurrency(
                totalBalance,
                currency
              )}
            </strong>

          </div>

        </div>

      </div>


      <div className="transactions-card">

        <div className="transactions-toolbar">

          <div className="transaction-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

            {searchTerm && (

              <button
                className="clear-search"
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ×
              </button>

            )}

          </div>


          <div className="transaction-filters">

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Types
              </option>

              <option value="income">
                Income
              </option>

              <option value="expense">
                Expense
              </option>

            </select>


            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Categories
              </option>

              {categories.map(
                (category) => (

                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {loading ? (

          <div className="transactions-loading">

            <div className="loading-spinner"></div>

            <h3>
              Loading transactions...
            </h3>

            <p>
              Fetching your latest financial activity.
            </p>

          </div>

        ) : filteredTransactions.length === 0 ? (

          <div className="transactions-empty">

            <div className="empty-icon">
              <Receipt size={28} />
            </div>

            <h3>
              {transactions.length === 0
                ? "No transactions yet"
                : "No matching transactions"}
            </h3>

            <p>
              {transactions.length === 0
                ? "Your transactions will appear here once you add them."
                : "Try changing your search or filters."}
            </p>


            {(searchTerm ||
              typeFilter !== "all" ||
              categoryFilter !== "all") && (

              <button
                className="reset-filters-button"
                onClick={clearFilters}
              >
                Reset Filters
              </button>

            )}

          </div>

        ) : (

          <div className="transactions-table-wrapper">

            <table className="transactions-table">

              <thead>

                <tr>

                  <th>
                    Transaction
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th></th>

                </tr>

              </thead>


              <tbody>

                {[...filteredTransactions]
                  .sort(
                    (a, b) =>
                      Number(b.id || 0) -
                      Number(a.id || 0)
                  )
                  .map((transaction) => (

                    <tr
                      key={transaction.id}
                    >

                      <td>

                        <div className="table-transaction">

                          <div
                            className={`table-transaction-icon ${transaction.type}`}
                          >

                            {transaction.type ===
                            "income" ? (
                              <ArrowUpRight
                                size={18}
                              />
                            ) : (
                              <ArrowDownRight
                                size={18}
                              />
                            )}

                          </div>


                          <div>

                            <strong>
                              {
                                transaction.title
                              }
                            </strong>

                            {transaction.description && (

                              <span>
                                {
                                  transaction.description
                                }
                              </span>

                            )}

                          </div>

                        </div>

                      </td>


                      <td>

                        <span className="category-pill">

                          {getCategoryName(
                            transaction.category_id
                          )}

                        </span>

                      </td>


                      <td>

                        <span className="transaction-date">
                          {transaction.date}
                        </span>

                      </td>


                      <td>

                        <span
                          className={`type-pill ${transaction.type}`}
                        >

                          {transaction.type ===
                          "income" ? (
                            <>
                              <ArrowUpRight
                                size={13}
                              />
                              Income
                            </>
                          ) : (
                            <>
                              <ArrowDownRight
                                size={13}
                              />
                              Expense
                            </>
                          )}

                        </span>

                      </td>


                      <td>

                        <strong
                          className={`table-amount ${transaction.type}`}
                        >

                          {transaction.type ===
                          "income"
                            ? "+"
                            : "-"}

                          {formatCurrency(
                            transaction.amount,
                            currency
                          )}

                        </strong>

                      </td>


                      <td>

                        <div className="transaction-actions">

                          <button
                            className="action-button edit"
                            title="Edit transaction"
                            onClick={() =>
                              onEdit(transaction)
                            }
                          >
                            <Pencil size={14} />
                          </button>


                          <button
                            className="action-button delete"
                            title="Delete transaction"
                            onClick={() =>
                              onDelete(
                                transaction.id
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}


        {!loading &&
          filteredTransactions.length > 0 && (

            <div className="transactions-footer">

              <span>

                Showing{" "}

                <strong>
                  {filteredTransactions.length}
                </strong>{" "}

                of{" "}

                <strong>
                  {transactions.length}
                </strong>{" "}

                transactions

              </span>


              {(searchTerm ||
                typeFilter !== "all" ||
                categoryFilter !== "all") && (

                <button
                  onClick={clearFilters}
                >
                  Clear filters
                </button>

              )}

            </div>

          )}

      </div>

    </div>
  );
}


// ============================================================
// CATEGORIES PAGE
// ============================================================

function CategoriesPage({
  categories,
  transactions,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [name, setName] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  const getTransactionCount = (
    categoryId
  ) => {
    return transactions.filter(
      (transaction) =>
        Number(
          transaction.category_id
        ) === Number(categoryId)
    ).length;
  };


  const openCreate = () => {
    setEditingCategory(null);
    setName("");
    setShowForm(true);
  };


  const openEdit = (category) => {
    setEditingCategory(category);
    setName(category.name || "");
    setShowForm(true);
  };


  const closeForm = () => {
    setEditingCategory(null);
    setName("");
    setShowForm(false);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      alert(
        "Please enter a category name."
      );
      return;
    }

    try {

      setSaving(true);

      if (editingCategory) {

        await onUpdate(
          editingCategory.id,
          {
            user_id:
              editingCategory.user_id || 1,

            name:
              name.trim(),

            type:
              editingCategory.type ||
              "expense",
          }
        );

      } else {

        await onCreate({
          user_id: 1,
          name: name.trim(),
          type: "expense",
        });

      }

      closeForm();

    } catch (error) {

      console.error(error);

      alert(
        error?.response?.data
          ? JSON.stringify(
              error.response.data
            )
          : "Failed to save category."
      );

    } finally {

      setSaving(false);

    }
  };


  return (
    <div className="page-container">

      <div className="page-title-section">

        <div>

          <span className="page-eyebrow">
            ORGANIZATION
          </span>

          <h1>
            Categories
          </h1>

          <p>
            Organize your transactions by category.
          </p>

        </div>


        <button
          className="add-button"
          onClick={openCreate}
        >
          <Plus size={18} />
          Add Category
        </button>

      </div>


      {showForm && (

        <section className="transaction-form-panel">

          <div className="form-header">

            <div>

              <span className="page-eyebrow">

                {editingCategory
                  ? "EDIT CATEGORY"
                  : "NEW CATEGORY"}

              </span>

              <h3>

                {editingCategory
                  ? "Edit Category"
                  : "Create Category"}

              </h3>

              <p>
                Add a category for organizing transactions.
              </p>

            </div>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="category-name">
                Category Name
              </label>

              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="e.g. Food"
                autoComplete="off"
                required
              />

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Create Category"}

              </button>

            </div>

          </form>

        </section>

      )}


      <div className="transactions-card">

        {categories.length === 0 ? (

          <div className="transactions-empty">

            <div className="empty-icon">
              <Tags size={28} />
            </div>

            <h3>
              No categories yet
            </h3>

            <p>
              Create your first category to organize your transactions.
            </p>

            <button
              className="reset-filters-button"
              onClick={openCreate}
            >
              Create Category
            </button>

          </div>

        ) : (

          <div className="category-grid">

            {categories.map(
              (category) => (

                <div
                  className="category-card"
                  key={category.id}
                >

                  <div className="category-card-icon">
                    <Tags size={22} />
                  </div>


                  <div className="category-card-content">

                    <h3>
                      {category.name}
                    </h3>

                    <p>

                      {getTransactionCount(
                        category.id
                      )}{" "}

                      transaction

                      {getTransactionCount(
                        category.id
                      ) !== 1
                        ? "s"
                        : ""}

                    </p>

                  </div>


                  <div className="category-card-actions">

                    <button
                      className="action-button edit"
                      title="Edit category"
                      onClick={() =>
                        openEdit(category)
                      }
                    >
                      <Pencil size={14} />
                    </button>


                    <button
                      className="action-button delete"
                      title="Delete category"
                      onClick={() =>
                        onDelete(
                          category.id
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}


// ============================================================
// REPORTS PAGE
// ============================================================

function ReportsPage({
  transactions,
  categories,
  totalIncome,
  totalExpenses,
  totalBalance,
  currency,
}) {
  const categoryData = useMemo(() => {

    const result = {};

    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {

        const category =
          getCategoryNameFromList(
            categories,
            transaction.category_id
          );

        if (!result[category]) {
          result[category] = 0;
        }

        result[category] += Number(
          transaction.amount || 0
        );

      });


    return Object.entries(result)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );

  }, [transactions, categories]);


  const monthlyData = useMemo(() => {

    const result = {};

    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {

        const date = new Date(
          transaction.date
        );

        if (isNaN(date.getTime())) {
          return;
        }

        const key =
          `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

        const label =
          date.toLocaleString(
            "en-US",
            {
              month: "short",
            }
          );

        if (!result[key]) {

          result[key] = {
            month: label,
            expenses: 0,
          };

        }

        result[key].expenses +=
          Number(
            transaction.amount || 0
          );

      });


    return Object.keys(result)
      .sort()
      .map(
        (key) => result[key]
      );

  }, [transactions]);


  const savingsRate =
    totalIncome > 0
      ? ((totalIncome -
          totalExpenses) /
          totalIncome) *
        100
      : 0;


  return (
    <div className="page-container">

      <div className="page-title-section">

        <div>

          <span className="page-eyebrow">
            ANALYTICS
          </span>

          <h1>
            Reports
          </h1>

          <p>
            Analyze your financial activity and spending patterns.
          </p>

        </div>

      </div>


      {/* REPORT SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">

          <div className="card-header">

            <span>
              Income
            </span>

            <TrendingUp size={20} />

          </div>

          <h2>
            {formatCurrency(
              totalIncome,
              currency
            )}
          </h2>

          <p>
            Total money received
          </p>

        </div>


        <div className="summary-card">

          <div className="card-header">

            <span>
              Expenses
            </span>

            <TrendingDown size={20} />

          </div>

          <h2>
            {formatCurrency(
              totalExpenses,
              currency
            )}
          </h2>

          <p>
            Total money spent
          </p>

        </div>


        <div className="summary-card balance-card">

          <div className="card-header">

            <span>
              Net Balance
            </span>

            <Wallet size={20} />

          </div>

          <h2>
            {formatCurrency(
              totalBalance,
              currency
            )}
          </h2>

          <p>
            Income minus expenses
          </p>

        </div>


        <div className="summary-card">

          <div className="card-header">

            <span>
              Savings Rate
            </span>

            <DollarSign size={20} />

          </div>

          <h2>
            {savingsRate.toFixed(1)}%
          </h2>

          <p>
            Based on total income
          </p>

        </div>

      </div>


      {/* CHARTS */}

      <section className="content-grid">

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Expenses by Category
              </h3>

              <p>
                Where your money is going
              </p>

            </div>

          </div>


          <div className="chart-container">

            {categoryData.length === 0 ? (

              <div className="chart-message">
                No expense data available yet.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >

                    {categoryData.map(
                      (_, index) => (

                        <Cell
                          key={`cell-${index}`}
                        />

                      )
                    )}

                  </Pie>


                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        value,
                        currency
                      )
                    }
                  />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Monthly Spending
              </h3>

              <p>
                Expense trend over time
              </p>

            </div>

          </div>


          <div className="chart-container">

            {monthlyData.length === 0 ? (

              <div className="chart-message">
                No monthly expense data yet.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={monthlyData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `${getCurrencySymbol(
                        currency
                      )}${Number(
                        convertFromINR(
                          value,
                          currency
                        )
                      ).toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 0,
                        }
                      )}`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        value,
                        currency
                      )
                    }
                  />

                  <Bar
                    dataKey="expenses"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </section>


      {/* CATEGORY TABLE */}

      <div className="transactions-card">

        <div className="panel-header">

          <div>

            <h3>
              Category Breakdown
            </h3>

            <p>
              Detailed expense distribution
            </p>

          </div>

        </div>


        {categoryData.length === 0 ? (

          <div className="transactions-empty">

            <Receipt size={28} />

            <h3>
              No report data
            </h3>

            <p>
              Add some expenses to generate reports.
            </p>

          </div>

        ) : (

          <div className="transactions-table-wrapper">

            <table className="transactions-table">

              <thead>

                <tr>

                  <th>
                    Category
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Percentage
                  </th>

                </tr>

              </thead>


              <tbody>

                {categoryData.map(
                  (item) => {

                    const percentage =
                      totalExpenses > 0
                        ? (item.value /
                            totalExpenses) *
                          100
                        : 0;

                    return (

                      <tr
                        key={item.name}
                      >

                        <td>

                          <span className="category-pill">
                            {item.name}
                          </span>

                        </td>


                        <td>

                          <strong>
                            {formatCurrency(
                              item.value,
                              currency
                            )}
                          </strong>

                        </td>


                        <td>

                          {percentage.toFixed(
                            1
                          )}
                          %

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}


// ============================================================
// SETTINGS PAGE
// ============================================================

function SettingsPage({
  currency,
  theme,
  onSaveSettings,
}) {
  const [selectedCurrency, setSelectedCurrency] =
    useState(currency);

  const [selectedTheme, setSelectedTheme] =
    useState(theme);

  const [saved, setSaved] =
    useState(false);


  // Keep settings page synchronized with
  // the global App settings.
  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);


  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);


  const handleSave = () => {

    onSaveSettings(
      selectedCurrency,
      selectedTheme
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };


  return (
    <div className="page-container">

      <div className="page-title-section">

        <div>

          <span className="page-eyebrow">
            PREFERENCES
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your ExpenseFlow preferences.
          </p>

        </div>

      </div>


      <div className="transactions-card">

        <div className="form-header">

          <div>

            <span className="page-eyebrow">
              GENERAL
            </span>

            <h3>
              Application Settings
            </h3>

            <p>
              Customize how ExpenseFlow behaves.
            </p>

          </div>

        </div>


        <div className="settings-list">

          {/* CURRENCY */}

          <div className="settings-row">

            <div>

              <strong>
                Currency
              </strong>

              <p>
                Choose the currency displayed throughout the dashboard.
              </p>

            </div>


            <select
              value={selectedCurrency}
              onChange={(event) =>
                setSelectedCurrency(
                  event.target.value
                )
              }
            >

              <option value="INR">
                Indian Rupee (₹)
              </option>

              <option value="USD">
                US Dollar ($)
              </option>

              <option value="EUR">
                Euro (€)
              </option>

              <option value="GBP">
                British Pound (£)
              </option>

            </select>

          </div>


          {/* THEME */}

          <div className="settings-row">

            <div>

              <strong>
                Theme
              </strong>

              <p>
                Choose your preferred appearance.
              </p>

            </div>


            <select
              value={selectedTheme}
              onChange={(event) =>
                setSelectedTheme(
                  event.target.value
                )
              }
            >

              <option value="light">
                Light
              </option>

              <option value="dark">
                Dark
              </option>

            </select>

          </div>


          {/* EXCHANGE RATE INFORMATION */}

          <div className="settings-row">

            <div>

              <strong>
                Exchange Rates
              </strong>

              <p>
                Currency conversion uses fixed built-in exchange rates.
              </p>

            </div>

            <span className="category-pill">
              Fixed Rates
            </span>

          </div>


          {/* ACCOUNT */}

          <div className="settings-row">

            <div>

              <strong>
                Account
              </strong>

              <p>
                Personal ExpenseFlow account.
              </p>

            </div>

            <span className="category-pill">
              Personal
            </span>

          </div>

        </div>


        <div className="form-actions">

          {saved && (
            <span>
              ✓ Settings saved
            </span>
          )}


          <button
            className="save-button"
            onClick={handleSave}
          >

            <Save size={16} />

            Save Settings

          </button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// SIDEBAR
// ============================================================

function Sidebar({
  activePage,
  handleNavigation,
  user,
  onLogout,
  currency,
}) {
  const userEmail =
    typeof user === "string"
      ? user
      : user?.email ||
        "Personal Account";

  const avatarLetter =
    userEmail.charAt(0).toUpperCase() ||
    "U";


  return (
    <aside className="sidebar">

      <div className="logo">

        <div className="logo-icon">
          <Wallet size={22} />
        </div>

        <span>
          ExpenseFlow
        </span>

      </div>


      <nav className="navigation">

        <button
          className={`nav-item ${
            activePage === "dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation(
              "dashboard"
            )
          }
        >
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </button>


        <button
          className={`nav-item ${
            activePage === "transactions"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation(
              "transactions"
            )
          }
        >
          <Receipt size={17} />
          <span>Transactions</span>
        </button>


        <button
          className={`nav-item ${
            activePage === "categories"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation(
              "categories"
            )
          }
        >
          <Tags size={17} />
          <span>Categories</span>
        </button>


        <button
          className={`nav-item ${
            activePage === "reports"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation(
              "reports"
            )
          }
        >
          <BarChart3 size={17} />
          <span>Reports</span>
        </button>


        <button
          className={`nav-item ${
            activePage === "settings"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation(
              "settings"
            )
          }
        >
          <Settings size={17} />
          <span>Settings</span>
        </button>

      </nav>


      <div className="sidebar-bottom">

        <div className="profile">

          <div className="avatar">
            {avatarLetter}
          </div>

          <div className="profile-info">

            <strong>
              {userEmail}
            </strong>

            <span>
              {getCurrencySymbol(
                currency
              )}{" "}
              Personal Account
            </span>

          </div>

        </div>


        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
          title="Logout"
        >

          <LogOut size={16} />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}


// ============================================================
// MAIN APP
// ============================================================

function App() {

  // ==========================================================
  // AUTHENTICATION / PERSISTENT LOGIN
  // ==========================================================

  const [user, setUser] = useState(() => {

    try {

      const savedUser =
        localStorage.getItem(
          "expenseflow_user"
        );

      return savedUser
        ? JSON.parse(savedUser)
        : null;

    } catch (error) {

      console.error(
        "Failed to restore user session:",
        error
      );

      return null;
    }

  });


  const [isLoggedIn, setIsLoggedIn] =
    useState(() => {

      return (
        localStorage.getItem(
          "expenseflow_logged_in"
        ) === "true"
      );

    });


  // ==========================================================
  // GLOBAL SETTINGS
  // ==========================================================

  const [currency, setCurrency] =
    useState(() => {

      return (
        localStorage.getItem(
          "expenseflow_currency"
        ) || "INR"
      );

    });


  const [theme, setTheme] =
    useState(() => {

      return (
        localStorage.getItem(
          "expenseflow_theme"
        ) || "light"
      );

    });


  // ==========================================================
  // APPLY THEME GLOBALLY
  // ==========================================================

  useEffect(() => {

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    document.body.setAttribute(
      "data-theme",
      theme
    );

  }, [theme]);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = (
    loggedInUser
  ) => {

    const normalizedUser =
      typeof loggedInUser === "string"
        ? {
            email: loggedInUser,
          }
        : loggedInUser?.email
        ? loggedInUser
        : {
            email:
              "Personal Account",
          };


    setUser(normalizedUser);
    setIsLoggedIn(true);


    localStorage.setItem(
      "expenseflow_user",
      JSON.stringify(
        normalizedUser
      )
    );


    localStorage.setItem(
      "expenseflow_logged_in",
      "true"
    );

  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    setUser(null);
    setIsLoggedIn(false);
    setActivePage("dashboard");
    setShowForm(false);
    setEditingTransaction(null);

    localStorage.removeItem(
      "expenseflow_user"
    );

    localStorage.removeItem(
      "expenseflow_logged_in"
    );

  };


  // ==========================================================
  // SAVE GLOBAL SETTINGS
  // ==========================================================

  const handleSaveSettings = (
    newCurrency,
    newTheme
  ) => {

    setCurrency(newCurrency);
    setTheme(newTheme);


    localStorage.setItem(
      "expenseflow_currency",
      newCurrency
    );


    localStorage.setItem(
      "expenseflow_theme",
      newTheme
    );

  };


  // ==========================================================
  // DATA STATE
  // ==========================================================

  const [transactions, setTransactions] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [activePage, setActivePage] =
    useState("dashboard");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState(null);


  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] =
    useState({
      user_id: 1,
      category_id: "",
      title: "",
      amount: "",
      type: "expense",
      description: "",
      date: getToday(),
    });


  // ==========================================================
  // LOAD TRANSACTIONS
  // ==========================================================

  const loadTransactions =
    async () => {

      try {

        const data =
          await getTransactions();

        setTransactions(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Failed to load transactions:",
          error
        );

      }

    };


  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  const loadCategories =
    async () => {

      try {

        const data =
          await getCategories();

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Failed to load categories:",
          error
        );

      }

    };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    const loadData =
      async () => {

        setLoading(true);

        await Promise.all([
          loadTransactions(),
          loadCategories(),
        ]);

        setLoading(false);

      };


    loadData();

  }, []);


  // ==========================================================
  // CALCULATIONS
  // ==========================================================

  // IMPORTANT:
  // These calculations stay in INR/base currency.
  // Display conversion happens only when rendering.

  const totalIncome =
    transactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (
          total,
          transaction
        ) =>
          total +
          Number(
            transaction.amount || 0
          ),
        0
      );


  const totalExpenses =
    transactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (
          total,
          transaction
        ) =>
          total +
          Number(
            transaction.amount || 0
          ),
        0
      );


  const totalBalance =
    totalIncome -
    totalExpenses;


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {

    setFormData({
      user_id: 1,
      category_id: "",
      title: "",
      amount: "",
      type: "expense",
      description: "",
      date: getToday(),
    });

    setEditingTransaction(
      null
    );

  };


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNavigation = (
    page
  ) => {

    setActivePage(page);


    if (page !== "dashboard") {
      setShowForm(false);
    }


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // ==========================================================
  // SUBMIT TRANSACTION
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (!formData.title.trim()) {

      alert(
        "Please enter a transaction title."
      );

      return;
    }


    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {

      alert(
        "Please enter a valid amount."
      );

      return;
    }


    if (!formData.category_id) {

      alert(
        "Please select a category."
      );

      return;
    }


    if (!formData.date) {

      alert(
        "Please select a date."
      );

      return;
    }


    try {

      setSaving(true);


      // ------------------------------------------------------
      // IMPORTANT:
      // User enters amount in selected currency.
      // Backend always receives INR.
      // ------------------------------------------------------

      const amountInINR =
        convertToINR(
          formData.amount,
          currency
        );


      const transactionData = {

        user_id:
          Number(
            formData.user_id || 1
          ),

        category_id:
          Number(
            formData.category_id
          ),

        title:
          formData.title.trim(),

        amount:
          Number(
            amountInINR.toFixed(2)
          ),

        type:
          formData.type,

        description:
          formData.description.trim() ||
          null,

        date:
          formData.date,

      };


      if (editingTransaction) {

        await updateTransaction(
          editingTransaction.id,
          transactionData
        );

      } else {

        await createTransaction(
          transactionData
        );

      }


      await loadTransactions();


      resetForm();

      setShowForm(false);

      setActivePage("dashboard");


    } catch (error) {

      console.error(
        "Transaction operation failed:",
        error
      );

      console.error(
        "Backend response:",
        error?.response?.data
      );


      alert(
        error?.response?.data
          ? JSON.stringify(
              error.response.data
            )
          : "Failed to save transaction."
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================================
  // EDIT TRANSACTION
  // ==========================================================

  const handleEdit = (
    transaction
  ) => {

    setEditingTransaction(
      transaction
    );


    // Backend amount is INR.
    // Show the equivalent amount in
    // currently selected currency.

    const displayAmount =
      convertFromINR(
        transaction.amount,
        currency
      );


    setFormData({

      user_id:
        transaction.user_id ||
        1,

      category_id:
        transaction.category_id ||
        "",

      title:
        transaction.title ||
        "",

      amount:
        Number(
          displayAmount.toFixed(2)
        ).toString(),

      type:
        transaction.type ||
        "expense",

      description:
        transaction.description ||
        "",

      date:
        transaction.date ||
        getToday(),

    });


    setShowForm(true);

    setActivePage("dashboard");


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // ==========================================================
  // DELETE TRANSACTION
  // ==========================================================

  const handleDelete =
    async (id) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this transaction?"
        );


      if (!confirmed) {
        return;
      }


      try {

        await deleteTransaction(id);

        await loadTransactions();

      } catch (error) {

        console.error(
          "Failed to delete transaction:",
          error
        );


        alert(
          error?.response?.data
            ? JSON.stringify(
                error.response.data
              )
            : "Failed to delete transaction."
        );

      }

    };


  // ==========================================================
  // CREATE CATEGORY
  // ==========================================================

  const handleCreateCategory =
    async (
      categoryData
    ) => {

      await createCategory(
        categoryData
      );

      await loadCategories();

    };


  // ==========================================================
  // UPDATE CATEGORY
  // ==========================================================

  const handleUpdateCategory =
    async (
      id,
      categoryData
    ) => {

      await updateCategory(
        id,
        categoryData
      );

      await loadCategories();

    };


  // ==========================================================
  // DELETE CATEGORY
  // ==========================================================

  const handleDeleteCategory =
    async (id) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this category?"
        );


      if (!confirmed) {
        return;
      }


      try {

        await deleteCategory(id);

        await loadCategories();

        await loadTransactions();

      } catch (error) {

        console.error(
          "Failed to delete category:",
          error
        );


        alert(
          error?.response?.data
            ? JSON.stringify(
                error.response.data
              )
            : "Failed to delete category. It may be used by existing transactions."
        );

      }

    };


  // ==========================================================
  // LOGIN SCREEN
  // ==========================================================

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  // ==========================================================
  // MAIN APPLICATION
  // ==========================================================

  return (
    <div
      className={`app ${
        theme === "dark"
          ? "theme-dark"
          : "theme-light"
      }`}
      data-theme={theme}
    >

      <Sidebar
        activePage={activePage}
        handleNavigation={
          handleNavigation
        }
        user={user}
        onLogout={handleLogout}
        currency={currency}
      />


      <main className="main-content">

        {/* DASHBOARD */}

        {activePage ===
          "dashboard" && (

          <Dashboard
            transactions={
              transactions
            }

            categories={
              categories
            }

            loading={
              loading
            }

            showForm={
              showForm
            }

            setShowForm={
              setShowForm
            }

            editingTransaction={
              editingTransaction
            }

            formData={
              formData
            }

            setFormData={
              setFormData
            }

            saving={
              saving
            }

            handleSubmit={
              handleSubmit
            }

            resetForm={
              resetForm
            }

            handleNavigation={
              handleNavigation
            }

            totalIncome={
              totalIncome
            }

            totalExpenses={
              totalExpenses
            }

            totalBalance={
              totalBalance
            }

            currency={
              currency
            }
          />

        )}


        {/* TRANSACTIONS */}

        {activePage ===
          "transactions" && (

          <TransactionsPage
            transactions={
              transactions
            }

            categories={
              categories
            }

            loading={
              loading
            }

            totalIncome={
              totalIncome
            }

            totalExpenses={
              totalExpenses
            }

            totalBalance={
              totalBalance
            }

            onEdit={
              handleEdit
            }

            onDelete={
              handleDelete
            }

            currency={
              currency
            }
          />

        )}


        {/* CATEGORIES */}

        {activePage ===
          "categories" && (

          <CategoriesPage
            categories={
              categories
            }

            transactions={
              transactions
            }

            onCreate={
              handleCreateCategory
            }

            onUpdate={
              handleUpdateCategory
            }

            onDelete={
              handleDeleteCategory
            }
          />

        )}


        {/* REPORTS */}

        {activePage ===
          "reports" && (

          <ReportsPage
            transactions={
              transactions
            }

            categories={
              categories
            }

            totalIncome={
              totalIncome
            }

            totalExpenses={
              totalExpenses
            }

            totalBalance={
              totalBalance
            }

            currency={
              currency
            }
          />

        )}


        {/* SETTINGS */}

        {activePage ===
          "settings" && (

          <SettingsPage
            currency={
              currency
            }

            theme={
              theme
            }

            onSaveSettings={
              handleSaveSettings
            }
          />

        )}

      </main>

    </div>
  );
}


export default App;