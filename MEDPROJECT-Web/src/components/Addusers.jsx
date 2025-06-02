import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import UsersContract from '../build/Users.json';
import { Input } from "@material-tailwind/react";
import { CheckCircle, ChevronRight, Trash2 } from 'lucide-react';

function Addusers() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [userAccount, setUserAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [userList, setUserList] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [userCount, setUserCount] = useState(0);

  const [user, setUser] = useState({ address: '', name: '', role: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1️⃣ Initialize web3, contract, accounts & initial admin check
  useEffect(() => {
    const initWeb3 = async () => {
      if (!window.ethereum) {
        console.error("MetaMask not detected");
        return;
      }
      const web3Instance = new Web3(window.ethereum);
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const netId = await web3Instance.eth.net.getId();
      const deployed = UsersContract.networks[netId];
      const contractInstance = new web3Instance.eth.Contract(
        UsersContract.abi,
        deployed && deployed.address
      );

      setWeb3(web3Instance);
      setAccounts(accs);
      setUserAccount(accs[0]);
      setContract(contractInstance);

      verifyAdmin(contractInstance, accs[0]);
      loadUsers(contractInstance);
    };

    initWeb3();
  }, []);

  // 2️⃣ Listen & react to account changes in MetaMask
  useEffect(() => {
    if (!window.ethereum || !contract) return;

    const handleAccountsChanged = (accs) => {
      if (accs.length === 0) {
        setIsAuthorized(false);
        return;
      }
      setAccounts(accs);
      setUserAccount(accs[0]);
      verifyAdmin(contract, accs[0]);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [contract]);

  // Admin‑check: calls your `isUser(address)` on the contract
  const verifyAdmin = async (contractInstance, address) => {
    try {
      if (await contractInstance.methods.doesUserExist(address).call()) {
        const userData = await contractInstance.methods.getUser(address).call();
        const isAdmin = userData.role.toLowerCase() === "admin";
        setIsAuthorized(isAdmin);
    } else {
        setIsAuthorized(false);
    }
    } catch (err) {
      console.error("Admin verification failed:", err);
      setIsAuthorized(false);
    }
  };

  // Load & count users
  const loadUsers = async (contractInstance) => {
    try {
      const addrs = await contractInstance.methods.getAllUserAddresses().call();
      const users = await Promise.all(
        addrs.map(async (addr) => {
          const u = await contractInstance.methods.getUser(addr).call();
          return { address: addr, name: u[0], role: u[1] };
        })
      );
      setUserList(users);
      setFilteredUserList(users);
      setUserCount(users.length);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  // Add user
  const addUser = async () => {
    if (!user.address || !user.name || !user.role) return;
    try {
      await contract.methods
        .addUser(user.address, user.name, user.role)
        .send({ from: accounts[0] });
      setSuccessMessage(`User ${user.name} added`);
      setUser({ address: '', name: '', role: '' });
      loadUsers(contract);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Add user error:", err);
    }
  };

  // Delete user
  const deleteUser = async (address) => {
    try {
      await contract.methods.deleteUser(address).send({ from: accounts[0] });
      loadUsers(contract);
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  // Search filter
  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);
    setFilteredUserList(userList.filter(u => u.address.toLowerCase().includes(q)));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  // 🚫 Block non‑admins instantly
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-xl font-semibold text-gray-800 mb-2">
            Admin Access Required
          </p>
          <p className="text-gray-600">
            Connect MetaMask with an admin account to use this page.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Authorized: show Add‑User UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200">
      <div className="flex flex-col items-center w-full">
        <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add User
        </h2>

        <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-200 w-4/5 max-w-6xl flex flex-col md:flex-row">
          {/* Form */}
          <div className="w-full md:w-1/2 border-r pr-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Register New User</h3>
            {successMessage && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-green-700 flex items-center space-x-2 animate-pulse">
                <CheckCircle className="h-5 w-5" />
                <span>{successMessage}</span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">User Address</label>
              <Input name="address" value={user.address} onChange={handleChange} placeholder="0x..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input name="name" value={user.name} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                value={user.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md shadow-sm"
              >
                <option value="">Select Role</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <button
              onClick={addUser}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-medium hover:scale-105 transition"
            >
              <span>Add User</span>
              <ChevronRight className="ml-2 h-5 w-5 inline" />
            </button>
          </div>

          {/* List */}
          <div className="w-full md:w-1/2 pl-8 mt-10 md:mt-0 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">User List ({userCount})</h3>
              <input
                type="text"
                placeholder="Search by address"
                className="px-3 py-2 border rounded-md text-sm w-48"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <ul className="space-y-3 overflow-auto max-h-96 pr-2">
              {filteredUserList.map((u, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.address}</p>
                    <p className="text-xs text-blue-500">{u.role}</p>
                  </div>
                  <button
                    onClick={() => deleteUser(u.address)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
              {filteredUserList.length === 0 && (
                <p className="text-sm text-gray-500">No users found.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Addusers;
