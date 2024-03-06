import MyLayout from './components/MyLayout.jsx'
import { Routes, Route } from 'react-router-dom'

import Workbench from './pages/workbench.jsx'
import TalentStatistics from './pages/talentStatistics.jsx'
import UserList from './pages/userList.jsx'
import ChanceList from './pages/chanceList.jsx'
import TalentList from './pages/talentList.jsx'
import TalentDetail from './pages/talentDetail.jsx'
import TalentBlockList from './pages/talentBlockList.jsx'
import LiveList from './pages/liveList.jsx'
import MiddlemanList from './pages/middlemanList.jsx'
import KeywordList from './pages/keywordList.jsx'
import PointList from './pages/pointList.jsx'

function App() {
    return (
        <MyLayout>
            <Routes>
                <Route path='/workbench' element={<Workbench />} />
                <Route path='/user' element={<UserList />} />
                <Route path='/talent/statistics' element={<TalentStatistics />} />
                <Route path='/talent/chance_list' element={<ChanceList />} />
                <Route path='/talent/talent_list' element={<TalentList />} />
                <Route path='/talent/talent_list/talent_detail' element={<TalentDetail />} />
                <Route path='/talent/talent_block_list' element={<TalentBlockList />} />
                <Route path='/talent/live_list' element={<LiveList />} />
                <Route path='/talent/middleman_list' element={<MiddlemanList />} />
                <Route path='/point/keyword_list' element={<KeywordList />} />
                <Route path='/point/point_list' element={<PointList />} />
            </Routes>
        </MyLayout>
    )
}

export default App
