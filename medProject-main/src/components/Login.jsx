import React, { useEffect, useState } from 'react';
import networks from "../utils/networks";
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Web3 from 'web3';
import { initWeb3 } from '../utils/web3Connection_User';


function Login() {
  const[web3Instance, setWeb3Instance]= useState();
  const[contractInstance, setContractInstance]= useState();
  const[accounts, setAccounts]= useState();


  const [isNetwork, setNetwork] = useState(false);
  const [isInstalled, setInstalled] = useState(false);
  const [userAccount, setUserAccount] = useState("");
  const [error, setError] = useState("");
  const [allConditionsMet, setAllConditionsMet] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isUser, setIsUser] = useState(false);


  
  
  const checkUser = async () => {
    if (window.ethereum && contractInstance && userAccount) {
      try {
        const userAddresses = await contractInstance.methods.getAllUserAddresses().call();
        if (userAddresses.some(addr => addr.toLowerCase() === userAccount.toLowerCase())) {
          setIsUser(true);
          console.log(await contractInstance.methods.getUser(userAccount).call())
          const userData = await contractInstance.methods.getUser(userAccount).call();
          setUserName(userData.name);
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    }
  };



  const checkNetwork = async (NetworkName) => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const targetnetwork = networks[NetworkName]?.chainId;
      
      if(!targetnetwork){
        console.error(`network"${NetworkName}"is not defined in the config`);
        return false;
      }
      return chainId.toLowerCase() === targetnetwork.toLowerCase();
    }
    return false;
  };

  const changeNetwork = async ({ networkName, setError }) => {
    try {      
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...networks[networkName]
          }
        ]
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNetworkSwitch = async (networkName) => {
    setError();
    await changeNetwork({ networkName, setError });

    window.location.reload();

  };

  const networkChanged = (chainId) => {
    console.log({ chainId });
  };


  const navigateTo = () => {
    const link = `/${userRole}`;
    window.location.href = link;
  };

  

  useEffect(()=>{
    const load = async ()=>{
      const{ web3Instance, contractInstance, accounts }= await initWeb3();
      setWeb3Instance(web3Instance);
      setContractInstance(contractInstance);
      setAccounts(accounts);
    }

    load();
  }, [])

  useEffect(() => {
    if (contractInstance && userAccount) {
      checkUser();
    }
  }, [contractInstance, userAccount]);

  useEffect(() => {
    const verifyNetwork = async () => {
      const result = await checkNetwork("ganache");
      setNetwork(result);
    };
  
    verifyNetwork();
  }, []);

  useEffect(() => {
    if(window.ethereum && window.ethereum.isMetaMask){
        setInstalled(true);

        const getAccount = async () => {
            try{
                const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
                setUserAccount(accounts[0]);
            }catch(error){
                console.error("error: ", error);
            }
        };
        getAccount();
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", networkChanged);
  
      return () => {
        window.ethereum.removeListener("chainChanged", networkChanged);
      };
    }
  }, []);

  // Check if all conditions are met
  useEffect(() => {
    setAllConditionsMet(isInstalled && isNetwork && userAccount && isUser);
  }, [isInstalled, isNetwork, userAccount, isUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-100 to-orange-200">
      <div className="flex flex-col items-center w-full">
        <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Login
        </h2>
        
        <div 
          className={`transition-all duration-700 ease-in-out bg-white rounded-xl shadow-lg p-10 border border-gray-200 
            ${allConditionsMet 
              ? 'w-4/5 max-w-6xl flex flex-row' 
              : 'w-3/4 max-w-2xl'}`}
          style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.15)', minHeight: '500px' }}
        >
          {allConditionsMet && (
            <div className="w-1/2 flex items-center justify-center border-r border-gray-200 pr-10 animate-fade-in">
              <div className="text-center">
                <h1 className="text-5xl font-bold text-gray-800 mb-1">Welcome</h1>
                <div className="relative mb-6">
                  <h2 className="text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent animate-pulse py-2">
                    {userName}
                  </h2>
                </div>
                <p className="text-lg text-gray-600 mb-6">You're successfully authenticated!</p>
                <button 
                  onClick={navigateTo}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-lg font-medium transition-all hover:shadow-lg hover:scale-105">
                  <span>Continue</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          
          <div className={`${allConditionsMet ? 'w-1/2 pl-10' : 'w-full'} flex flex-col justify-center`}>
            <div className="space-y-8 text-lg">
              <div className="flex items-center space-x-5">
                {isInstalled ? (
                  <CheckCircle className="text-green-500 h-8 w-8 animate-pulse" />
                ) : (
                  <XCircle className="text-red-500 h-8 w-8" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Metamask Installation</p>
                  {!isInstalled && (
                    <p className="text-base text-gray-600 mt-2">
                      Please install Metamask 
                      <a
                        href="https://metamask.io/download" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 underline ml-1"
                      >
                        from here
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-5">
                {isNetwork ? (
                  <CheckCircle className="text-green-500 h-8 w-8 animate-pulse" />
                ) : (
                  <XCircle className="text-red-500 h-8 w-8" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Ganache Network</p>
                  {!isNetwork && isInstalled && (
                    <button 
                      onClick={() => handleNetworkSwitch("ganache")}
                      className="mt-2 text-base bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      Switch to Ganache
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-5">
                {userAccount ? (
                  <CheckCircle className="text-green-500 h-8 w-8 animate-pulse" />
                ) : (
                  <XCircle className="text-red-500 h-8 w-8" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Wallet Address</p>
                  {userAccount ? (
                    <p className="text-base font-mono bg-gray-100 p-3 rounded mt-2 truncate">
                      {userAccount.slice(0,8)}...
                    </p>
                  ) : (
                    <p className="text-base text-gray-600 mt-2">Not connected</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-5">
                {isUser ? (
                  <CheckCircle className="text-green-500 h-8 w-8 animate-pulse" />
                ) : (
                  <XCircle className="text-red-500 h-8 w-8" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{userRole} Status</p>
                  <p className="text-base text-gray-600 mt-2">
                    {isUser ? `${userRole} - Access Granted` : "Regular User"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;