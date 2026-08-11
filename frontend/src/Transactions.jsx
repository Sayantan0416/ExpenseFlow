import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  X,
} from "lucide-react";

import {
  getTransactions,
  getCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./api";

function Transactions({ onBackToDashboard }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [transactionData, categoryData] =
        await Promise.all([
          getTransactions(),
          getCategories(),
        ]);

      setTransactions(transactionData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === Number(categoryId)
    );

    return category ? category.name : "Uncategorized";
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        transaction.title
          ?.toLowerCase()
          .includes(searchText) ||
        transaction.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesType =
        typeFilter === "all" ||
        transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        Number(transaction.category_id) ===
          Number(categoryFilter);

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    });
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
  ]);

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      title: "",
      amount: "",
      type: "expense",
      category_id: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });

    setShowForm(true);
  };

  const openEditForm = (transaction) => {
    setEditingId(transaction.id);

    setFormData({
      title: transaction.title || "",
      amount: transaction.amount || "",
      type: transaction.type || "expense",
      category_id: transaction.category_id || "",
      date: transaction.date || "",
      description: transaction.description || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a transaction title.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!formData.category_id) {
      alert("Please select a category.");
      return;
    }

    if (!formData.date) {
      alert("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      const transactionData = {
        user_id: 1,
        category_id: Number(formData.category_id),
        title: formData.title,
        amount: Number(formData.amount),
        type: formData.type,
        description: formData.description || null,
        date: formData.date,
      };

      if (editingId) {
        await updateTransaction(
          editingId,
          transactionData
        );
      } else {
        await createTransaction(transactionData);
      }

      await loadData();

      closeForm();
    } catch (error) {
      console.error(
        "Failed to save transaction:",
        error
      );

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to save transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTransaction(id);

      setTransactions((previous) =>
        previous.filter(
          (transaction) => transaction.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete transaction:",
        error
      );

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to delete transaction."
      );
    }
  };

  return (
    <div className="transactions-page">
      {/* Header */}

      <div className="transactions-header">
        <div>
          <button
            className="back-button"
            onClick={onBackToDashboard}
          >
            ← Dashboard
          </button>

          <h1>Transactions</h1>

          <p>
            Manage and track all your financial activity.
          </p>
        </div>

        <button
          className="add-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {/* Form */}

      {showForm && (
        <section className="transaction-form-panel">
          <div className="form-header">
            <div>
              <h3>
                {editingId
                  ? "Edit Transaction"
                  : "Add New Transaction"}
              </h3>

              <p>
                {editingId
                  ? "Update your transaction details."
                  : "Enter the details of your transaction."}
              </p>
            </div>

            <button
              className="icon-button"
              onClick={closeForm}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title</label>

                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Grocery Shopping"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount</label>

                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type</label>

                <select
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

              <div className="form-group">
                <label>Category</label>

                <select
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

              <div className="form-group">
                <label>Date</label>

                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label>Description</label>

                <textarea
                  name="description"
                  rows="3"
                  placeholder="Add some notes..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
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
                  : editingId
                  ? "Update Transaction"
                  : "Save Transaction"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Filters */}

      <section className="transactions-toolbar">
        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value)
          }
        >
          <option value="all">
            All Categories
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
      </section>

      {/* Table */}

      <section className="transactions-table-card">
        <div className="table-top">
          <div>
            <h3>All Transactions</h3>

            <p>
              {filteredTransactions.length} transaction
              {filteredTransactions.length === 1
                ? ""
                : "s"} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="transactions-empty">
            <Receipt size={40} />

            <h3>Loading transactions...</h3>

            <p>
              Please wait while we load your data.
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="transactions-empty">
            <Receipt size={40} />

            <h3>No transactions found</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map(
                  (transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <div className="table-transaction">
                          <div className="table-icon">
                            {transaction.type ===
                            "income" ? (
                              <ArrowUpRight
                                size={17}
                              />
                            ) : (
                              <ArrowDownRight
                                size={17}
                              />
                            )}
                          </div>

                          <div>
                            <strong>
                              {transaction.title}
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
                        <span className="category-badge">
                          {getCategoryName(
                            transaction.category_id
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="date-text">
                          {transaction.date}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`type-badge ${transaction.type}`}
                        >
                          {transaction.type}
                        </span>
                      </td>

                      <td>
                        <strong
                          className={`amount-text ${transaction.type}`}
                        >
                          {transaction.type ===
                          "income"
                            ? "+"
                            : "-"}
                          ₹
                          {formatAmount(
                            transaction.amount
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="table-action edit"
                            onClick={() =>
                              openEditForm(
                                transaction
                              )
                            }
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className="table-action delete"
                            onClick={() =>
                              handleDelete(
                                transaction.id
                              )
                            }
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Transactions;