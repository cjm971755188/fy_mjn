import MyLayout from './components/MyLayout.jsx'
import { Routes, Route } from 'react-router-dom'

import Workbench from './pages/workbench.jsx'
import UserList from './pages/userList.jsx'
import ChanceList from './pages/chanceList.jsx'
import TalentDetail from './pages/talentDetail.jsx'
import TalentList from './pages/talentList.jsx'
import MiddlemanList from './pages/middlemanList.jsx'
import YearList from './pages/yearList.jsx'

function App() {
    return (
        <MyLayout>
            <Routes>
                <Route path='/workbench' element={<Workbench />} />
                <Route path='/user' element={<UserList />} />
                <Route path='/talent/chance_list' element={<ChanceList />} />
                <Route path='/talent/talent_list' element={<TalentList />} />
                <Route path='/talent/talent_list/talent_detail' element={<TalentDetail />} />
                <Route path='/middleman' element={<MiddlemanList />} />
                <Route path='/resource/year_list' element={<YearList />} />
            </Routes>
        </MyLayout>
    )
}

export default App
