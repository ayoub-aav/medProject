import React from 'react'

import Web3 from 'web3';
import { initWeb3 } from '../utils/web3Connection_User';

function Manifactured() {
    const [contractInstance, setcontractInstance] = useState();
    const [contract, setContract] = useState();
    const [webInstance, setWebInstance] = useState();





    useEffect(()=>{
        const load = async ()=>{

        const{ web3Instance, contractInstance, accounts }= await initWeb3();
        setWeb3Instance(web3Instance);
        setContractInstance(contractInstance);
        setAccounts(accounts);
        }

        load();
    }, []);






  return (
    <div>
      
    </div>
  )
}

export default Manifactured
