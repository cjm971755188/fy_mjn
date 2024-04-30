import MyLayout from './components/MyLayout.jsx'
import { Routes, Route } from 'react-router-dom'

import TalentStatistics from './pages/talentStatistics.jsx'
import ChanceList from './pages/chanceList.jsx'
import TalentList from './pages/talentList.jsx'
import TalentDetail from './pages/talentDetail.jsx'
import TalentBlackList from './pages/talentBlackList.jsx'
import LiveCalendar from './pages/liveCalendar.jsx'
import LiveList from './pages/liveList.jsx'
import MiddlemanList from './pages/middlemanList.jsx'
import UserList from './pages/userList.jsx'
import SetList from './pages/setList.jsx'

function App() {
    return (
        <MyLayout>
            <Routes>
                <Route path='/talent/statistics' element={<TalentStatistics />} />
                <Route path='/talent/chance_list' element={<ChanceList />} />
                <Route path='/talent/talent_list' element={<TalentList />} />
                <Route path='/talent/talent_list/talent_detail' element={<TalentDetail />} />
                <Route path='/talent/talent_black_list' element={<TalentBlackList />} />
                <Route path='/talent/live_calendar' element={<LiveCalendar />} />
                <Route path='/talent/live_list' element={<LiveList />} />
                <Route path='/talent/middleman_list' element={<MiddlemanList />} />
                <Route path='/user' element={<UserList />} />
                <Route path='/set/project' element={<SetList />} />
                <Route path='/set/company' element={<SetList />} />
                <Route path='/set/platform' element={<SetList />} />
                <Route path='/set/store' element={<SetList />} />
                <Route path='/set/liveroom' element={<SetList />} />
                <Route path='/set/liaison' element={<SetList />} />
                <Route path='/set/account' element={<SetList />} />
            </Routes>
        </MyLayout>
    )
}

export default App
