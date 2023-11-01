import MyLayout from './components/MyLayout.jsx'
import { Routes, Route } from 'react-router-dom'

import Workbench from './pages/workbench.jsx'
import UserList from './pages/userList.jsx'
import ChanceList from './pages/chanceList.jsx'
import TalentList from './pages/talentList.jsx'
import LiveList from './pages/liveList.jsx'
import PalletList from './pages/palletList.jsx'
import ProductList from './pages/productList.jsx'
import ContractList from './pages/contractList.jsx'

function App() {
    return (
        <MyLayout>
            <Routes>
                <Route path='/workbench' element={<Workbench />} />
                <Route path='/user' element={<UserList />} />
                <Route path='/talent/chance_list' element={<ChanceList />} />
                <Route path='/talent/talent_list' element={<TalentList />} />
                <Route path='/live/live_list' element={<LiveList />} />
                <Route path='/pallet/pallet_list' element={<PalletList />} />
                <Route path='/pallet/product_list' element={<ProductList />} />
                <Route path='/contract/contract_list' element={<ContractList />} />
            </Routes>
        </MyLayout>
    )
}

export default App
