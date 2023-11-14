import MyLayout from './components/MyLayout.jsx'
import { Routes, Route } from 'react-router-dom'

import Workbench from './pages/workbench.jsx'
import UserList from './pages/userList.jsx'
import MiddlemanList from './pages/middlemanList.jsx'
import ChanceList from './pages/chanceList.jsx'
import TalentList from './pages/talentList.jsx'

function App() {
    return (
        <MyLayout>
            <Routes>
                <Route path='/workbench' element={<Workbench />} />
                <Route path='/user' element={<UserList />} />
                <Route path='/talent/middleman_list' element={<MiddlemanList />} />
                <Route path='/talent/chance_list' element={<ChanceList />} />
                <Route path='/talent/talent_list' element={<TalentList />} />
            </Routes>
        </MyLayout>
    )
}

export default App
