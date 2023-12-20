import MyLayout from './components/MyLayout.jsx'
import { Routes, Route } from 'react-router-dom'

import Workbench from './pages/workbench.jsx'
import TalentStatistics from './pages/talentStatistics.jsx'
import UserList from './pages/userList.jsx'
import ChanceList from './pages/chanceList.jsx'
import TalentList from './pages/talentList.jsx'
import TalentDetail from './pages/talentDetail.jsx'
import LiveCalendar from './pages/liveCalendar.jsx'
import LiveList from './pages/liveList.jsx'
import KeywordList from './pages/keywordList.jsx'
import PointList from './pages/pointList.jsx'
import MiddlemanList from './pages/middlemanList.jsx'

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
                <Route path='/live/live_calendar' element={<LiveCalendar />} />
                <Route path='/live/live_list' element={<LiveList />} />
                <Route path='/point/keyword_list' element={<KeywordList />} />
                <Route path='/point/point_list' element={<PointList />} />
                <Route path='/middleman' element={<MiddlemanList />} />
            </Routes>
        </MyLayout>
    )
}

export default App
