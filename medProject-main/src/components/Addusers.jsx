import React, { useState, useEffect } from 'react';
import { Input, Select, Option } from "@material-tailwind/react";
import { IconButton } from "@material-tailwind/react";

import Web3 from 'web3';
import UsersContract from '../build/Users.json';
import { CheckCircle, ChevronRight } from 'lucide-react';

function Addusers() {
  const [user, setUser] = useState({
    address: '',
    name: '',
    role: ''
  });
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [userList, setUserList] = useState([]);
  const [filteredUserList, setFilteredUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize Web3 and contract
  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = UsersContract.networks[networkId];
      
      const contractInstance = new web3Instance.eth.Contract(
        UsersContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      setWeb3(web3Instance);
      setContract(contractInstance);
      setAccounts(accounts);
      return true;
    }
    return false;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Check if contract is initialized
      if (!contract) {
        const initialized = await initWeb3();
        if (!initialized) {
          setLoading(false);
          return;
        }
      }
      
      // Use the initialized contract
      const userAddresses = await contract.methods.getAllUserAddresses().call();
      
      const users = await Promise.all(
        userAddresses.map(async (address) => {
          try {
            // Handle different possible return formats from getUser
            const userData = await contract.methods.getUser(address).call();
            
            // Check if userData is an array or an object with properties
            if (Array.isArray(userData)) {
              return { 
                address, 
                name: userData[0], 
                role: userData[1] 
              };
            } else if (typeof userData === 'object') {
              // If it's an object with properties
              return {
                address,
                name: userData.name || userData[0] || '',
                role: userData.role || userData[1] || ''
              };
            } else {
              console.error("Unexpected format for user data:", userData);
              return { address, name: '', role: '' };
            }
          } catch (error) {
            console.error(`Error fetching data for user ${address}:`, error);
            return { address, name: 'Error loading', role: 'Error loading' };
          }
        })
      );

      setUserList(users);
      setFilteredUserList(users);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error:', error);
    }
  };

  const adduser = async () => {
    try {
      if (!contract || !accounts.length) {
        await initWeb3();
      }

      // Ensure all fields are filled
      if (!user.address || !user.name || !user.role) {
        console.error("All fields are required");
        return;
      }

      // Call the smart contract's addUser function
      await contract.methods
        .addUser(user.address, user.name, user.role)
        .send({ from: accounts[0] });

      setSuccessMessage(`User ${user.name} added successfully`);
      
      // Reset form
      setUser({
        address: '',
        name: '',
        role: ''
      });
      
      // Reload user list
      loadUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle role selection
  const handleRoleChange = (value) => {
    setUser(prev => ({
      ...prev,
      role: value
    }));
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredUserList(userList);
    } else {
      const filtered = userList.filter(user => 
        user.address.toLowerCase().includes(query)
      );
      setFilteredUserList(filtered);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await initWeb3();
      loadUsers();
    };
    
    initialize();
  }, []);

  useEffect(() => {
    if (contract) {
      loadUsers();
    }
  }, [contract, accounts]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200">
      <div className="flex flex-col items-center w-full">
        <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Add User
        </h2>
        
        <div 
          className="transition-all duration-700 ease-in-out bg-white rounded-xl shadow-lg p-10 border border-gray-200 w-4/5 max-w-6xl flex flex-col md:flex-row"
          style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)', minHeight: '500px' }}
        >
          {/* Form Section */}
          <div className="w-full md:w-1/2 md:border-r md:border-gray-200 md:pr-10 flex flex-col justify-center">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Register New User</h3>
              
              {successMessage && (
                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg border border-green-100 text-green-700 animate-pulse">
                  <CheckCircle className="h-5 w-5" />
                  <span>{successMessage}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Address</label>
                  <Input 
                    size="lg"
                    name="address"
                    value={user.address}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="0x..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input 
                    size="lg"
                    name="name"
                    value={user.name}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="w-full">
                    <select 
                      name="role"
                      value={user.role}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full px-3 py-2 border border-black-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled>Select Role</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Distributor">Distributor</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={adduser}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                >
                  <span>Add User</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* User List Section */}
          <div className="w-full md:w-1/2 md:pl-10 flex flex-col mt-10 md:mt-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">User List</h3>
              <div className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute w-5 h-5 top-2.5 left-2.5 text-slate-600">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                </svg>
                <input
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 pr-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Search by address"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredUserList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="text-lg">No users found</p>
                <p className="text-sm">{searchQuery ? "Try a different search term" : "Add a user to get started"}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredUserList.map((user, index) => (
                  <div key={user.address} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                      <IconButton>
                        <i className="fas fa-heart" />
                      </IconButton>
                    </div>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-2 truncate">
                      {user.address.slice(0, 10)}...{user.address.slice(-8)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Addusers;